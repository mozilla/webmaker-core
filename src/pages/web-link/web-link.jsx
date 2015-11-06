var React = require('react');
var render = require('../../lib/render.jsx');
var TextInput = require('../../components/text-input/text-input.jsx');
var types = require('../../components/basic-element/basic-element.jsx').types;
var Platform = require('../../lib/platform.js');
var LinkedStateMixin = require('react-addons-linked-state-mixin');
var Alert = require('../../components/alert/alert.jsx');

var java = Platform.getAPI();

var WebLink = React.createClass({
  mixins: [
    require('react-intl').IntlMixin,
    LinkedStateMixin
  ],

  getInitialState: function () {
    return {
      webURL: ''
    };
  },

  componentWillMount: function () {
    this.linkElement = types.link.spec.expand(
      (JSON.parse(java.getPayloads(`link-element`)))[0].data
    );

    java.clearPayloads(`link-element`);

    if (this.linkElement.attributes.targetWebURL) {
      this.setState({
        webURL: this.linkElement.attributes.targetWebURL
      });
    }

    // Set up the save method when we press the back button
    this.props.update({
      onBackPressed: () => {
        this.commitURL();
      }
    });
  },

  commitURL: function () {
    /* https://gist.github.com/dperini/729294 */
    var urlRegex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;

    var url = this.refs.url.valueLink.value;

    // Validate input to see if it's a url
    if (url.match(urlRegex)) {
      this.save(url, () => window.Platform.goBack());
    } else if (`http://${url}`.match(urlRegex)) {
      this.save(`http://${url}`, () => window.Platform.goBack());
    } else {
      this.refs.url.blur();
      this.refs.error.show();
    }
  },

  save: function (url, onSaveComplete) {
    // Add target external web URL and remove any Webmaker destinations
    this.linkElement.attributes.targetPageId = ``;
    this.linkElement.attributes.targetProjectId = ``;
    this.linkElement.attributes.targetUserId = ``;
    this.linkElement.attributes.targetWebURL = url;

    // Re-serialize and cache edited link element
    java.queue(`edit-element`, JSON.stringify({
      data: this.linkElement
    }));

    // Run post-save callback
    onSaveComplete();
  },

  render: function () {
    return (
      <div id="webLink">
        <p>{this.getIntlMessage('web_link_intro')}</p>

        <h4 className="title">{this.getIntlMessage('web_link_label')}</h4>

        <div className="content">
          <TextInput
            id="webURL"
            linkState={this.linkState}
            ref="url"
            type="url"
            placeholder="www.wikipedia.org"
            maxlength={2000}
            onEnterPressed={this.commitURL} />

          <Alert ref="error">{this.getIntlMessage('invalid_url')}</Alert>
        </div>
      </div>
    );
  }
});

render(WebLink);
