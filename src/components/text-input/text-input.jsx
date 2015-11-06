var React = require('react');
var LinkedStateMixin = require('react-addons-linked-state-mixin');

var TextInput = React.createClass({
  mixins: [LinkedStateMixin],
  propTypes: {
    maxlength: React.PropTypes.number.isRequired,
    minlength: React.PropTypes.number,
    onEnterPressed: React.PropTypes.func,
    placeholder: React.PropTypes.string,
    type: React.PropTypes.string
  },
  getInitialState: function () {
    return {
      text: '',
      isTooLong: false
    };
  },
  onChange: function (e) {
    this.valueLink.requestChange(e.target.value);

    this.setState({
      isTooLong: e.target.value.length > this.props.maxlength ? true : false
    });
  },
  validate: function () {
    if ((!this.props.minlength || this.valueLink.value.length > this.props.minlength) &&
      this.valueLink.value.length <= this.props.maxlength) {
      return true;
    } else {
      return false;
    }
  },
  onKeyDown: function (event) {
    // Fire callback (if defined) if enter is pressed
    if (event.keyCode === 13) {
      if (this.props.onEnterPressed) {
        this.props.onEnterPressed.call(this, {
          value: event.target.value
        });
      }
    }
  },
  blur: function () {
    this.refs.input.blur();
  },
  render: function () {
    var linkState = this.props.linkState || this.linkState;
    this.valueLink = linkState(this.props.id);

    return (
      <div className={'text-input' + (this.state.isTooLong ? ' maxed' : '')}>
        <label>{this.props.label}</label>

        <input
          placeholder={this.props.placeholder}
          onKeyDown={this.onKeyDown}
          value={this.valueLink.value}
          ref="input"
          onChange={this.onChange}
          type={this.props.type || "text"}/>

        <div className="indicator">{this.valueLink.value.length} / {this.props.maxlength}</div>
      </div>
    );
  }
});

module.exports = TextInput;
