var React = require('react');
var assign = require('react/lib/Object.assign');
var platform = require('../../lib/platform');

var Link = React.createClass({
  getDefaultProps: function () {
    return {
      tagName: 'a'
    };
  },
  render: function () {
    var className = this.props.className ? (this.props.className + ' link') : 'link';
    var props = assign({}, this.props, {
      className,
      onClick: (e) => {
        e.preventDefault();

        // if there is a pre-navigation handling hook, call that before continuing
        if (this.props.preNavigation && typeof this.props.preNavigation === 'function') {
          this.props.preNavigation();
        }

        if (this.props.external) {
          platform.openExternalUrl(this.props.external);
        } else if (this.props.url) {
          platform.changeViewImmediately(this.props.url);
        }
      }
    });
    if (this.props.external) {
      props.target = '_blank';
      props.href = this.props.href || this.props.external;
    }
    return React.createElement(this.props.tagName, props);
  }
});

module.exports = Link;
