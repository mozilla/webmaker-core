var React = require('react');
var api = require('../../lib/api');
var reportError = require('../../lib/errors');
var i18n = require('../../lib/i18n');

var render = require('../../lib/render.jsx');
var Card = require('../../components/card/card.jsx');
var Loading = require('../../components/loading/loading.jsx');
var ProjectList = require ('../../components/project-list/project-list.jsx');

var lang = i18n.isSupportedLanguage(i18n.currentLanguage) ? i18n.currentLanguage : i18n.defaultLang;

var Discover = React.createClass({
  mixins: [require('react-intl').IntlMixin],
  render: function () {
    return (
      <ProjectList shuffle={true} infiniteScroll={true} useCache={true} />
    );
  }
});

render(Discover);
