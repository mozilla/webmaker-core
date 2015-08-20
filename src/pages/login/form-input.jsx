var React = require('react');
var FormattedHTMLMessage = require('react-intl').FormattedHTMLMessage;
var Link = require('../../components/link/link.jsx');

var FormInput = React.createClass({
  mixins: [require('react-intl').IntlMixin],
  getDefaultProps: function () {
    return {
      type: 'text',
      tabIndex: 0
    };
  },
  checkForReturn: function (e) {
    if (e.keyCode === 13) {
      if (typeof this.props.onReturn === 'function') {
        this.props.onReturn();
      }
    }
  },
  render: function () {
    var helpText;
    if(this.props.helpText) {
      helpText = (<Link external="https://id.webmaker.org/reset-password?android=true"><FormattedHTMLMessage message={this.getIntlMessage(this.props.helpText)} /></Link>);
    }
    return (<div className="form-group">
      <label htmlFor={this.props.name}><FormattedHTMLMessage message={this.getIntlMessage(this.props.label)} /></label>
      <input name={this.props.name} type={this.props.type} onFocus={this.props.onFocus} tabIndex={this.props.tabIndex} onKeyDown={this.checkForReturn} valueLink={this.props.valueLink} required={this.props.required} />
      <div className="error" hidden={!this.props.errors}>
        {this.props.errors && this.props.errors.join(' ')}
      </div>
      <p hidden={!this.props.helpText} className="help-text text-right">{helpText}</p>
    </div>);
  }
});

module.exports = FormInput;
