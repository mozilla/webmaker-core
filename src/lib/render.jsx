var React = require('react');

var Spindicator = require('../components/spindicator/spindicator.jsx');
var ModalConfirm = require('../components/modal-confirm/modal-confirm.jsx');
var ModalSwitch = require('../components/modal-switch/modal-switch.jsx');
var Snackbar = require('../components/snackbar/snackbar.jsx');
var messages = require('./messages');

var locale = navigator.language.split('-')
locale = locale[1] ? `${locale[0]}-${locale[1].toUpperCase()}` : navigator.language

var strings = messages[locale] ? messages[locale] : messages['en-US']

var intlData = {
    locales : ['en-US'],
    messages: strings
};
var platform = require('./platform');

var Base = React.createClass({
  onResume: function () {
    this.setState({isVisible: true});
  },
  onPause: function () {
    this.setState({isVisible: false});
  },
  onBackPressed: function() {
    if (this.state.onBackPressed) {
      return this.state.onBackPressed();
    } else {
      platform.goBack();
    }
  },
  jsComm: function (event) {
    if (this[event]) {
      this[event]();
    }
  },
  getInitialState: function () {
    // Expose to android
    window.jsComm = this.jsComm;
    return {
      isVisible: true,
      onBackPressed: false
    };
  },
  update: function (state) {
    this.setState(state);
  },
  render: function () {
    var Route = this.props.route;
    return (<div className="container">
      <Snackbar/>
      <Spindicator/>
      <ModalConfirm/>
      <ModalSwitch/>
      <Route {...intlData} isVisible={this.state.isVisible} update={this.update} />
    </div>);
  }
});

module.exports = function (Route) {
  React.render(<Base route={Route} />, document.getElementById('app'));
};
