var React = require('react');
var api = require('../../lib/api');
var reportError = require('../../lib/errors');
var i18n = require('../../lib/i18n');

var render = require('../../lib/render.jsx');
var Card = require('../../components/card/card.jsx');
var Loading = require('../../components/loading/loading.jsx');

var lang = i18n.isSupportedLanguage(i18n.currentLanguage) ? i18n.currentLanguage : i18n.defaultLang;

var Discover = React.createClass({
  mixins: [require('react-intl').IntlMixin],
  getInitialState: function () {
    return {
      projects: [],
      loading: false,
      pagesLoaded: 0,
      allPagesLoaded: false
    };
  },
  load: function () {
    this.setState({loading: true});

    api({
      uri: `/discover/${lang}?page=${this.state.pagesLoaded + 1}&count=5`,
      useCache: true
    }, (err, body) => {
      this.setState({loading: false});

      if (err) {
        reportError(this.getIntlMessage('error_discovery_get'), err);
        return;
      }

      if (!body || !body.projects || !body.projects.length) {
        if (this.state.pagesLoaded === 0) {
          reportError(this.getIntlMessage('error_featured_404'));
        } else {
          this.setState({
            allPagesLoaded: true
          });
        }

        return;
      }

      function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = array[i];
          array[i] = array[j];
          array[j] = temp;
        }

        return array;
      }

      this.setState({
        projects: this.state.projects.concat(shuffleArray(body.projects)),
        pagesLoaded: this.state.pagesLoaded + 1
      });
    });
  },
  componentWillMount: function () {
    this.load();
  },
  componentDidMount: function () {
    // Using window for scrolling because setting overflow:scroll on #discover causes display glitches during scroll
    window.onscroll = function (event) {
      var endThreshold = 500;

      if (
        !this.state.allPagesLoaded &&
        window.scrollY > 0 &&
        document.querySelector('html').scrollHeight - window.scrollY - 480 <= endThreshold) {

        this.load();
      }
    }.bind(this);
  },
  render: function () {
    var cards = this.state.projects.map( project => {
      return (
        <Card
          key={project.id}
          url={"/users/" + project.author.id + "/projects/" + project.id + '/play'}
          href="/pages/project"
          thumbnail={project.thumbnail[320]}
          title={project.title}
          author={project.author.username} />
      );
    });

    return (
      <div id="discover">
        {cards}
        <div hidden={this.state.loading || this.state.projects}>{this.getIntlMessage('no_project_found')}</div>
        <Loading on={this.state.loading} />
      </div>
    );
  }
});

render(Discover);
