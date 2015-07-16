var React = require('react/addons');

var api = require('../../lib/api');
var render = require('../../lib/render.jsx');
var TextInput = require('../../components/text-input/text-input.jsx');
var Loading = require('../../components/loading/loading.jsx');
var Link = require('../../components/link/link.jsx');
var FormattedMessage = require('react-intl').FormattedMessage;

var ProjectSettings = React.createClass({

  mixins: [
    React.addons.LinkedStateMixin,
    require('../../lib/router'),
    require('react-intl').IntlMixin
  ],

  getInitialState: function () {
    return {
      title: '',
      loading: false
    };
  },

  uri: function () {
    return '/users/' + this.state.params.user + '/projects/' + this.state.params.project;
  },

  componentWillMount: function () {

    this.load();

    // Set up the save method when we press the back button
    this.props.update({
      onBackPressed: () => {
        this.save(() => window.Platform.goBack());
      }
    });

  },

  componentDidUpdate: function (prevProps) {
    if (this.props.isVisible && !prevProps.isVisible) {
      this.load();
    }
  },

  render: function () {
    var creativeCommon = (<Link external="https://creativecommons.org/licenses/by-sa/3.0/">{this.getIntlMessage('ccAttribution')}</Link>);
    return (
      <div id="projectSettings">
        <div>
          <TextInput id="title" ref="title" label={this.getIntlMessage('title')} maxlength={25} minlength={4} linkState={this.linkState} />
          <button hidden={window.Platform} onClick={this.save}>DEBUG:Save</button>
        </div>

        <div className="cc">
          <p className="mark">
            <img src="../../img/cc.svg"/>
            <span>{this.getIntlMessage("cc")}</span>
          </p>
          <p>
            <FormattedMessage message={this.getIntlMessage('ccLicenseSection')} creativecommonsLink={creativeCommon} />
            <span className="explanation"> {this.getIntlMessage('ccLicenseSectionSub')}</span>
          </p>
        </div>

        <Loading on={this.state.loading} />
      </div>
    );
  },

  /**
   * Fetches a fresh copy of project's metadata.
   */
  load: function () {
    this.setState({loading: true});
    api({
      uri: this.uri()
    }, (err, body) => {
      this.setState({loading: false});
      if (err) {
        // @todo Handle error state (GH-1922)
      }

      this.setState({
        title: body.project.title
      });

      this.refs.title.setState({
        inputLength: body.project.title.length
      });
    });
  },

  /**
   * Persists changes to project settings.
   */
  save: function (onSaveComplete) {

    // @todo Client-side validation
    // console.log(_this.refs.title.validate());

    // Update project settings via the API
    this.setState({loading: true});
    api({
      method: 'PATCH',
      uri: this.uri(),
      json: {
        title: this.state.title
      }
    }, (err, body) => {
      this.setState({loading: false});
      if (err) {
        // @todo Handle error state (GH-1922)
        console.error('Could not update project settings.');
      }
      if (typeof onSaveComplete === 'function') {
        onSaveComplete();
      }
    });
  }
});

render(ProjectSettings);
