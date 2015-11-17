var React = require('react');
var LinkedStateMixin = require('react-addons-linked-state-mixin');

module.exports = React.createClass({
  mixins: [LinkedStateMixin],
  getDefaultProps: function () {
    return {
      id: 'value',
      max: 100,
      min: 0,
      step: 1,
      unit: '',
      percentage: false
    };
  },
  getInitialState: function () {
    return {
      value: typeof this.props.value !== 'undefined' ? this.props.value : 100
    };
  },
  onChange: function (e) {
    var value = parseFloat(e.target.value);
    this.valueLink.requestChange(value);
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  },
  getDisplayValue: function(){
    if (this.props.percentage) {
      return `${Math.round(this.props.value/this.props.max * 100)}%`;
    } else {
      return `${this.props.value}${this.props.unit}`;
    }
  },
  render: function () {
    var linkState = this.props.linkState || this.linkState;
    var valueLink = this.valueLink = linkState(this.props.id);

    var currentValue = parseFloat(valueLink.value);

    return (
      <div className="range">
        <input value={parseFloat(this.props.value)} min={this.props.min} max={this.props.max} step={this.props.step} type="range" onChange={this.onChange} />
        <div className={'range-summary' + (currentValue === this.props.min ? ' min' : '')}>{this.getDisplayValue()}</div>
      </div>
    );
  }
});
