var React = require('react');
var assign = require('object-assign');
var Spec = require('../../../lib/spec');
var HELLO_STRINGS = ['Hello', 'Bonjour', 'Halló', 'Hej', 'Olá', '¡Hola!', 'Ciao', 'Halo'];

var spec = new Spec('text', assign({
  innerHTML: {
    category: 'attributes',
    validation: React.PropTypes.string,
    default: function () {
      var randomIndex = Math.floor(Math.random() * HELLO_STRINGS.length);
      return HELLO_STRINGS[randomIndex];
    }
  },
  fontFamily: {
    category: 'styles',
    validation: React.PropTypes.string,
    default: 'Roboto'
  },
  color: {
    category: 'styles',
    validation: React.PropTypes.string,
    default: '#E06A2C',
    editor: 'color'
  },
  backgroundColor: {
    category: 'styles',
    validation: React.PropTypes.string,
    default: 'transparent',
    editor: 'color'
  },
  fontSize: {
    category: 'styles',
    validation: React.PropTypes.number,
    default: 35
  },
  fontStyle: {
    category: 'styles',
    validation: React.PropTypes.string,
    default: 'normal'
  },
  fontWeight: {
    category: 'styles',
    validation: React.PropTypes.string,
    default: 'bold'
  },
  textDecoration: {
    category: 'styles',
    validation: React.PropTypes.string,
    default: 'none'
  },
  textAlign: {
    category: 'styles',
    validation: React.PropTypes.string,
    default: 'center'
  },
  padding: {
    category: 'styles',
    default: '0 10px'
  }
}, Spec.getPositionProps()));

module.exports = React.createClass({
  mixins: [
    require('./textedit')
  ],

  statics: {spec},

  propTypes: spec.getPropTypes(),

  getDefaultProps: function () {
    return spec.getDefaultProps();
  },

  render: function() {
    var props = this.props;
    var style = {};

    [
      'fontFamily',
      'color',
      'fontWeight',
      'fontSize',
      'fontStyle',
      'textDecoration',
      'textAlign',
      'backgroundColor',
      'padding'
    ].forEach(function (prop) {
      style[prop] = props[prop];
    });

    var content = this.makeEditable(props.innerHTML, style);
    var onPClick = this.activate;
    if (this.state.editing) {
      onPClick = false;
    }
    return <p ref="dims" style={style} onClick={onPClick}>{content}</p>;
  }
});
