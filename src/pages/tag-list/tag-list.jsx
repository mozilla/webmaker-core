var React = require('react');
var api = require('../../lib/api');
var reportError = require('../../lib/errors');
var i18n = require('../../lib/i18n');
var render = require('../../lib/render.jsx');
var platform = require('../../lib/platform');

var ProjectList = require('../../components/project-list/project-list.jsx');

var lang = i18n.isSupportedLanguage(i18n.currentLanguage) ? i18n.currentLanguage : i18n.defaultLang;

var TagList = React.createClass({
  mixins: [
    require('react-intl').IntlMixin,
    require('../../lib/router')
  ],
  goBack: function () {
    platform.goBack();
  },
  render: function () {
    return (
      <div id="tag-list">
        <header>
          <p>{this.getIntlMessage('hashtag')}</p>
          <div className="tag-name">
            <span>#{this.state.params.tag}</span>
            <button ref="close" onClick={this.goBack}></button>
          </div>
        </header>
        <ProjectList useCache={false} showDescriptions={true} tag={this.state.params.tag}/>
      </div>
    );
  }
});

render(TagList);
