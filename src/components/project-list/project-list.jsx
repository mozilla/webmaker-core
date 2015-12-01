var React = require('react');
var api = require('../../lib/api');
var reportError = require('../../lib/errors');
var i18n = require('../../lib/i18n');
var router = require('../../lib/router');
var platform = require('../../lib/platform');

var render = require('../../lib/render.jsx');
var Card = require('../../components/card/card.jsx');
var Loading = require('../../components/Loading/loading.jsx');

var lang = i18n.isSupportedLanguage(i18n.currentLanguage) ? i18n.currentLanguage : i18n.defaultLang;

var ProjectList = React.createClass({
  mixins: [router,require('react-intl').IntlMixin],
  propTypes: {
    shuffle: React.PropTypes.bool,
    infiniteScroll: React.PropTypes.bool,
    showAuthor: React.PropTypes.bool,
    setTitle: React.PropTypes.bool,
    showActions: React.PropTypes.bool,
    useCache: React.PropTypes.bool,
    onLoadStart: React.PropTypes.func,
    onLoadEnd: React.PropTypes.func,
    onActionsClick: React.PropTypes.func
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
      shuffle: false,
      infiniteScroll: true,
      showAuthor: true,
      setTitle: false,
      showActions: false,
      useCache: false
    };
  },
  //For updating when new projects are created
  componentDidUpdate: function (prevProps) {
    if (this.props.isVisible && !prevProps.isVisible) {
      this.load();
    }
  },
  load: function () {
    this.setState({loading: true});
    if(this.props.onLoadStart){
      this.props.onLoadStart();
    }

    var apiPath = `/discover/${lang}?page=${this.state.pagesLoaded + 1}&count=5`;

    if(this.props.author){
      apiPath = `/users/${this.props.author}/projects?page=${this.state.pagesLoaded + 1}`;
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
      //Logic for discover mode
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


      var appendProjects = (projects) => {
        if(this.props.shuffle){
          return this.state.projects.concat(shuffleArray(projects));
        } else {
          return this.state.projects.concat(projects);
        }
      };

      this.setState({
        projects: appendProjects(body.projects),
        pagesLoaded: this.state.pagesLoaded + 1
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
          window.scrollY > 0 &&
          document.querySelector('html').scrollHeight - window.scrollY - 480 <= endThreshold) {
          this.load();
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
