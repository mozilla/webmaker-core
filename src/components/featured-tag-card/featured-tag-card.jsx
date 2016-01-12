var React = require('react');
var Link = require('../link/link.jsx');

var FeaturedTagCard = React.createClass({
  mixins: [
    require('react-intl').IntlMixin
  ],
  render: function () {
    return (
      <Link className="featured-tag-card card" href= "/pages/tag-list" url={`/tags/${this.props.tag}`}>
        <div className="featured">{this.getIntlMessage('featured')}</div>
        <div className="tag">#{this.props.tag}</div>
      </Link>
    );
  }
});

module.exports = FeaturedTagCard;
