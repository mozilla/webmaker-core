var React = require('react');
var assign = require('object-assign');
var {getContrastingColor, darken} = require('../../../lib/color');
var Spec = require('../../../lib/spec');
var dispatcher = require('../../../lib/dispatcher');
var Color = require("color");

var spec = new Spec('link', assign({
  innerHTML: {
    category: 'attributes',
    validation: React.PropTypes.string,
    default: 'Button link'
  },
  targetPageId: {
    category: 'attributes',
    validation: React.PropTypes.string,
    default: ''
  },
  targetProjectId: {
    category: 'attributes',
    validation: React.PropTypes.string,
    default: ''
  },
  targetUserId: {
    category: 'attributes',
    validation: React.PropTypes.string,
    default: ''
  },
  targetWebURL: {
    category: 'attributes',
    validation: React.PropTypes.string,
    default: ''
  },
  href: {
    category: 'attributes',
    validation: React.PropTypes.string,
    default: ''
  },
  fontFamily: {
    category: 'styles',
    validation: React.PropTypes.string,
    default: 'sans-serif'
  },
  backgroundColor: {
    category: 'styles',
    validation: React.PropTypes.string,
    default: '#69A0FC',
    editor: 'color'
  },
  borderRadius: {
    category: 'styles',
    validation: React.PropTypes.number,
    default: 3
  },
  color: {
    category: 'styles',
    validation: React.PropTypes.string,
    editor: 'color'
  },
  boxShadow: {
    category: 'styles',
    validation: React.PropTypes.string,
    default: 'inset 0px 2px 0px rgba(255, 255, 255, 0.3)'
  }
}, Spec.getPositionProps()));

var Link = React.createClass({

  mixins: [
    require('./textedit')
  ],

  statics: {spec},

  propTypes: spec.getPropTypes(),

  getDefaultProps: function () {
    return assign(spec.getDefaultProps(), {
      active: false
    });
  },

  onClick: function (event) {
    if (this.state.editing) {
      this.activate();
    } else {
      dispatcher.fire('linkClicked', {
        props: this.props,
        originalEvent: event
      });
    }
  },

  render: function() {
    var props = this.props;

    var shadowOpacity = new Color(props.backgroundColor).alpha();
    var style = {
      borderRadius: props.borderRadius,
      backgroundColor: props.backgroundColor,
      border: `1px solid ${darken(props.backgroundColor, 0.4)}`,
      color: props.color || getContrastingColor(props.backgroundColor),
      fontFamily: props.fontFamily,
      whiteSpace: props.whiteSpace,
      boxShadow: `inset 0px 2px 0px rgba(255, 255, 255, ${0.3*shadowOpacity})`
    };

    var Element = this.props.activelink ? 'a' : 'span';
    var content = this.makeEditable(props.innerHTML, style);

    return (
      <Element className="btn" style={ style } onClick={ this.onClick } href={ props.href }>
        { content }
        <span>
          <img hidden={ !this.props.targetWebURL } className="icon" src="../../img/external-url.svg" />
        </span>
      </Element>
    );
  }
});

module.exports = Link;
