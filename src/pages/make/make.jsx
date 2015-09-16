var React = require('react');
var api = require('../../lib/api');
var router = require('../../lib/router');
var dispatcher = require('../../lib/dispatcher');
var platform = require('../../lib/platform');
var reportError = require('../../lib/errors');

var render = require('../../lib/render.jsx');
var Card = require('../../components/card/card.jsx');
var Loading = require('../../components/loading/loading.jsx');
var Link = require('../../components/link/link.jsx');

var Make = React.createClass({
  mixins: [router, require('react-intl').IntlMixin],
  getInitialState: function () {
    return {
      projects: [],
      loading: true
    };
  },
  componentDidUpdate: function (prevProps) {
    if (this.props.isVisible && !prevProps.isVisible) {
      this.load();
    }
  },
  componentDidMount: function () {
    this.load();
  },
  onError: function (err) {

    // TODO: Find a better way to create users in the API db if no attempt
    // to create a project has happened yet. See https://github.com/mozilla/webmaker-core/issues/532
    if (err.statusCode !== 404) {
      reportError("Error loading projects", err);
    }

    this.setState({loading: false});
  },
  onEmpty: function () {
    this.setState({loading: false});
  },
  load: function () {
    // No user found, so nothing to load.
    if (!this.state.user) {
      return this.onEmpty();
    }

    this.setState({loading: true});

    api({
      uri: `/users/${this.state.user.id}/projects`
    }, (err, body) => {
      if (err) {
        return this.onError(err);
      }

      if (!body || !body.projects || !body.projects.length) {
        return this.onEmpty();
      }

      this.setState({
        loading: false,
        projects: body.projects
      });
    });
  },
  addProject: function () {
    var defaultTitle = this.getIntlMessage('my_project');
    var user = this.state.user;

    if (!user) {
      return reportError(this.getIntlMessage('error_create_make'));
    }

    this.setState({loading: true});

    // we will be creating a new project
    var createProject = {
      method: "create",
      type: "projects",
      data: {
        title: defaultTitle
      }
    };

    // and for user convenience, new projects should start with an empty page
    var createFirstPage = {
      method: "create",
      type: "pages",
      data: {
        projectId: "$0.id",
        x: 0,
        y: 0,
        styles: {}
      }
    };

    api({
      method: 'post',
      uri: `/users/${user.id}/bulk`,
      json: {
        actions: [
          createProject,
          createFirstPage
        ]
      }
    }, (err, body) => {
      if (err) {
        return this.onError(err);
      }

      // the bulk API sends back results in a number array, where each position
      // in the result set corresponds to the same position in the list of actions
      // that had to be performed "in bulk". As such, the "create project" result
      // will be in body.results[0], and the "create page" result will be in
      // body.results[1]

      if (!body || !body.results || body.results.length === 0) {
        return this.onEmpty();
      }

      var project = body.results[0];
      project.author = project.author || user;

      platform.trackEvent('Make', 'Create a Project', 'New Project Started');

      this.setState({
        loading: false,
        projects: this.state.projects.concat([project])
      }, function() {
        platform.changeViewImmediately('/users/' + user.id + '/projects/' + project.id);
      });
    });

  },

  logout: function () {
    platform.trackEvent('Login', 'Sign Out', 'Sign Out Success');
    platform.clearUserSession();
    platform.changeViewImmediately('/login/sign-in');
  },

  cardActionClick: function (e) {
    dispatcher.fire('modal-switch:show', {
      config: {
        actions: ['Share', 'Delete'],
        callback: (event) => {
          if (event.label === 'Delete') {
            this.setState({loading: true});

            api({
              method: 'DELETE',
              uri: `/users/${this.state.user.id}/projects/${e.projectID}`
            }, (err, body) => {
              this.setState({loading: false});

              if (err) {
                return this.onError(err);
              }

              platform.trackEvent('Make', 'Delete Project', 'Project Deleted');
              console.log('Deleted project: ' + e.projectID);
              this.load();
            });
          } else if (event.label === 'Share') {
            platform.shareProject(this.state.user.id, e.projectID);
          }
        }
      }
    });
  },

  render: function () {

    var cards = this.state.projects.map(project => {
      return (
        <Card
          showButton={true}
          onActionsClick={this.cardActionClick}
          projectID={project.id}
          key={project.id}
          url={"/users/" + project.author.id + "/projects/" + project.id}
          href="/pages/project"
          thumbnail={project.thumbnail[320]}
          title={project.title}
          author={project.author.username} />
      );
    });
    return (
      <div id="make">
        <div className="profile-card">
          <h3>{this.state.user.username}</h3>
          <p><button className="btn" onClick={this.logout}>{this.getIntlMessage('log_out')}</button></p>
        </div>
        <button onClick={this.addProject} className="btn btn-create btn-block btn-teal">
          {this.getIntlMessage('create_a_project')}
        </button>
        {cards}
        <Loading on={this.state.loading} />
        <Link url="/style-guide" hidden={!platform.isDebugBuild()} className="btn btn-create btn-block btn-teal">
           {this.getIntlMessage('open_style_guide')}
        </Link>
        <button hidden={!platform.isDebugBuild()} onClick={platform.resetSharedPreferences()} className="btn btn-create btn-block btn-teal">
          {this.getIntlMessage('reset_share_preferences')}
        </button>
      </div>
    );
  }
});

// Render!
render(Make);
