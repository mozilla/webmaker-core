var React = require('react');
var api = require('../../lib/api');
var reportError = require('../../lib/errors');
var i18n = require('../../lib/i18n');
var router = require('../../lib/router');
var platform = require('../../lib/platform');

var render = require('../../lib/render.jsx');
var Card = require('../../components/card/card.jsx');
var Loading = require('../../components/loading/loading.jsx');

var lang = i18n.isSupportedLanguage(i18n.currentLanguage) ? i18n.currentLanguage : i18n.defaultLang;

var ProjectList = React.createClass({
  mixins: [router,require('react-intl').IntlMixin],
  propTypes: {
    infiniteScroll: React.PropTypes.bool,
    showAuthor: React.PropTypes.bool,
    setTitle: React.PropTypes.bool,
    showActions: React.PropTypes.bool,
    useCache: React.PropTypes.bool,
    onLoadStart: React.PropTypes.func,
    onLoadEnd: React.PropTypes.func,
    onActionsClick: React.PropTypes.func,
    tag: React.PropTypes.string,
    showDescriptions: React.PropTypes.bool
  },
  getInitialState: function () {
    return {
      projects: [],
      loading: false,
      pagesLoaded: 0,
      allPagesLoaded: false
    };
  },
  getDefaultProps: function() {
    //Other passable props: author (id)
    return {
      infiniteScroll: true,
      showAuthor: true,
      setTitle: false,
      showActions: false,
      useCache: false,
      showDescriptions: true
    };
  },
  //For updating when new projects are created
  componentDidUpdate: function (prevProps) {
    if (this.props.isVisible && !prevProps.isVisible) {
      this.load();
    }
  },
  load: function (startFromPage = 1) {
    if(startFromPage <= 1){
      this.setState({allPagesLoaded:false});
    }
    this.setState({loading: true});
    if(this.props.onLoadStart){
      this.props.onLoadStart();
    }

    var apiPath = `/discover/${lang}?page=${startFromPage}&count=5`;

    if (this.props.tag) {
      apiPath = `/projects/tagged/${this.props.tag}?page=${startFromPage}`;
    } else if (this.props.author) {
      apiPath = `/users/${this.props.author}/projects?page=${startFromPage}`;
    }

    api({
      uri: apiPath,
      useCache: this.props.useCache
    }, (err, body) => {

      this.setState({loading:false});

      if(this.props.onLoadEnd){
        this.props.onLoadEnd();
      }

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

      var appendProjects = (projects) => {
        if(startFromPage > 1){
          return this.state.projects.concat(projects);
        } else {
          return body.projects;
        }
      };
      this.setState({
        projects: appendProjects(body.projects),
        pagesLoaded: startFromPage
      });
    });
  },
  componentWillMount: function () {
    this.load();
  },
  componentDidMount: function () {
    // Using window for scrolling because setting overflow:scroll on #discover causes display glitches during scroll
    if(this.props.infiniteScroll){
      window.onscroll = function (event) {
        var endThreshold = 500;
        if (
          !this.state.allPagesLoaded &&
          !this.state.loading &&
          window.scrollY > 0 &&
          document.querySelector('html').scrollHeight - window.scrollY - 480 <= endThreshold) {
          this.load(this.state.pagesLoaded + 1);
        }
      }.bind(this);
    }
  },
  render: function () {

    var cards = this.state.projects.map( project => {
      return (
        <Card
          key={project.id}
          url={"/users/" + project.author.id + "/projects/" + project.id + '/play'}
          href="/pages/project"
          thumbnail={project.thumbnail[320]}
          projectID={project.id}
          title={project.title}
          description={this.props.showDescriptions ? project.description : ''}
          author={project.author}
          showAuthor={this.props.showAuthor}
          showActions={this.props.showActions}
          onActionsClick={this.props.onActionsClick} />
      );
    });


    //This should probably be somewhere other than render where it only gets set once, but I can't seem to pin where.
    //Sets status bar title in Android.
    if (window.Platform && this.props.setTitle && !this.state.loading && this.state.projects.length) {
      platform.setTitle(this.state.projects[0].author.username);
    }

    return (
      <div className="projectList">
        <Loading on={this.state.loading}></Loading>
        {cards}
        <div hidden={this.state.loading || this.state.projects}>{this.getIntlMessage('no_project_found')}</div>
      </div>
    );
  }
});

module.exports = ProjectList;
