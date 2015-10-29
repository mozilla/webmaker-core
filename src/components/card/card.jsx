var React = require('react');
var Link = require('../link/link.jsx');

var Card = React.createClass({
  statics: {
    DEFAULT_THUMBNAIL: '../../img/default.svg'
  },
  getDefaultProps: function(){
    return {
      showAuthor: true
    };
  },
  actionsClicked: function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.onActionsClick.call(this, this.props);
  },
  onImageError: function() {
    var imageEl = this.refs.imageEl;
    imageEl.src = Card.DEFAULT_THUMBNAIL;
    imageEl.onerror = null;
  },
  componentDidMount: function () {
    var imageEl = this.refs.imageEl;
    imageEl.onerror = this.onImageError;
    imageEl.src = this.props.thumbnail || Card.DEFAULT_THUMBNAIL;
  },
  render: function () {
    return (
      <div className="card">
        <Link url={this.props.url} href={this.props.href} >
          <div className="thumbnail">
            <img ref="imageEl" />
          </div>
        </Link>

        <div className="meta">
          <div className="text">
            <div className="title">{this.props.title}</div>
            <div className="author" hidden={!this.props.showAuthor}><Link href={"/pages/user-projects/"} url={`/users/${this.props.author.id}/projects`} className="authorLink">{this.props.author.username}</Link></div>
          </div>
          <div className="action" hidden={!this.props.showButton}>
            <button onClick={this.actionsClicked}>
              <img src="../../img/more-dots.svg"/>
            </button>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Card;
