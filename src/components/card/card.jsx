var React = require('react/addons');
var Link = require('../link/link.jsx');

var Card = React.createClass({
  statics: {
    DEFAULT_THUMBNAIL: '../../img/default.svg'
  },
  actionsClicked: function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.onActionsClick.call(this, this.props);
  },
  onImageError: function() {
    var imageEl = this.refs.imageEl.getDOMNode();
    imageEl.src = Card.DEFAULT_THUMBNAIL;
    imageEl.onerror = null;
  },
  componentDidMount: function () {
    var imageEl = this.refs.imageEl.getDOMNode();
    imageEl.onerror = this.onImageError;
    imageEl.src = this.props.thumbnail || Card.DEFAULT_THUMBNAIL;
  },
  render: function () {
    return (
      <Link url={this.props.url} href={this.props.href} className="card">
        <div className="thumbnail">
          <img ref="imageEl" />
        </div>

        <div className="meta">
          <div className="text">
            <div className="title">{this.props.title}</div>
            <div className="author">{this.props.author}</div>
          </div>
          <div className="action" hidden={!this.props.showButton}>
            <button onClick={this.actionsClicked}>
              <img src="../../img/more-dots.svg"/>
            </button>
          </div>
        </div>
      </Link>
    );
  }
});

module.exports = Card;
