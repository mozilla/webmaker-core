var React = require('react');
var LinkedStateMixin = require('react-addons-linked-state-mixin');
var classNames = require('classnames');

// Internal -- just the container
var OptionPanel = React.createClass({
  render: function () {
    return (<div className="option-panel">
      {this.props.children}
    </div>);
  }
});

var Checkbox = React.createClass({
  mixins: [LinkedStateMixin],
  getDefaultProps: function () {
    return {
      linkState: this.linkState,
      checkedLabel: true,
      uncheckedLabel: false
    };
  },
  getInitialState: function(){
    //Takes state passed down from parent and binds the value of the key "this.props.id" to this.valueLink
    var linkState = this.props.linkState;
    this.valueLink = linkState(this.props.id);
    return {
      //Sets checked status the first time based on inherited state (which was passed using linkState)
      checked: this.valueLink.value === this.props.checkedLabel,
      icon: this.getIcon(this.valueLink.value === this.props.checkedLabel)
    };
  },
  getIcon: function(checkStatus){
    //There are probably better ways to implement 'checkedIcon', but this will do for now. Maybe inline SVG and CSS styling later on?
    //This has a param so it can be used for initial state and onChange
    //If there is a checkedIcon and it's checked, use that
    if(this.props.checkedIcon && checkStatus){
      return this.props.checkedIcon;
    } else {
      //Otherwise return default icon
      return this.props.icon;
    }
  },
  onChange: function (e) {
    var val = e.target.checked ? this.props.checkedLabel : this.props.uncheckedLabel;
    this.valueLink.requestChange(val);
    this.setState({checked: e.target.checked});
    this.setState({icon: this.getIcon(e.target.checked)});
  },
  render: function () {
    return (<label className={classNames('label', {selected: this.state.checked})}>
      <input className="sr-only" checked={this.state.checked} onChange={this.onChange} type="checkbox" />
      <img className="icon" src={this.state.icon}/>
    </label>);
  }
});

var CheckboxSet = React.createClass({
  mixins: [LinkedStateMixin],
  getDefaultProps: function () {
    return {
      linkState: this.linkState
    };
  },
  render: function () {
    return (<OptionPanel>
      {this.props.options.map((props, i) => <Checkbox {...props} key={i} linkState={this.props.linkState} />)}
    </OptionPanel>);
  }
});

var Radio = React.createClass({
  mixins: [LinkedStateMixin],
  getDefaultProps: function () {
    return {
      linkState: this.linkState
    };
  },
  onChange: function (e) {
    this.valueLink.requestChange(e.target.value);
  },
  render: function () {
    this.valueLink = this.props.linkState(this.props.id);
    var currentVal = this.valueLink.value;
    return (<OptionPanel>
      {this.props.options.map((item, i) => {
        return (<label key={i} className={classNames('label', {selected: item.value === currentVal})}>
          <input
            className="sr-only"
            name={'radio_' + this.props.id}
            type="radio"
            value={item.value}
            checked={item.value === currentVal}
            onChange={this.onChange} />
          <img className="icon" src={item.icon}/>
        </label>);
      })}
    </OptionPanel>);
  }
});

module.exports = {
  Checkbox,
  CheckboxSet,
  Radio
};
