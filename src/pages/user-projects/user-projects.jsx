var React = require('react');
var router = require('../../lib/router');

var render = require('../../lib/render.jsx');
var ProjectList = require ('../../components/project-list/project-list.jsx');

var UserProjects = React.createClass({
  mixins: [router,require('react-intl').IntlMixin],
  render: function () {
    return (
      <ProjectList author={this.state.params.user} showAuthor={false} setTitle={true}/>
    );
  }
});

render(UserProjects);
