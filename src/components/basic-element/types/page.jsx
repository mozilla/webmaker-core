var React = require('react');
var Spec = require('../../../lib/spec');
var assign = require('react/lib/Object.assign');

var spec = new Spec('page', {
  backgroundColor: {
    category: 'styles',
    validation: React.PropTypes.string,
    default: '#f2f6fc'
  }
});

var Page = React.createClass({

  statics: {spec},

  propTypes: spec.getPropTypes(),

  getDefaultProps: function () {
    return assign(spec.getDefaultProps(), {
      active: false
    });
  },

  render: function() {
    var style = {
      backgroundColor: this.props.backgroundColor,
      width: "100%",
      height: "100%"
    };

    return (
      <div style={style}></div>
    );
  }
});

module.exports = Page;
