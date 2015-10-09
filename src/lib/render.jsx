var React = require('react');
var ReactDOM = require('react-dom');

var Spindicator = require('../components/spindicator/spindicator.jsx');
var ModalConfirm = require('../components/modal-confirm/modal-confirm.jsx');
var ModalSwitch = require('../components/modal-switch/modal-switch.jsx');
var Snackbar = require('../components/snackbar/snackbar.jsx');
var FTU = require('../components/ftu/ftu.jsx');

var platform = require('./platform');
var intlData = require('./i18n').intlData;
var dispatcher = require('./dispatcher');

var Base = React.createClass({
  mixins: [
    require('./router')
  ],
  componentDidMount: function () {
    var showFTU = (message) => {
      this.setState({
        ftuSingleMessage: message,
        ftuRightMessage: null,
        ftuLeftMessage: null
      });

      this.refs.ftu.show();
    };

    dispatcher.on('secondPageCreated', () => {
      showFTU(intlData.messages['ftu-share-project']);
    });

    if (this.props.route.displayName === 'Project' && this.state.params.mode === 'play') {
      var projectsViewed = parseInt(platform.getSharedPreferences('ftu::projects-viewed', true) || 0, 10);

      projectsViewed++;

      // Trigger FTU
      if (projectsViewed === 2) {
        showFTU(intlData.messages['ftu-remix']);
      }

      platform.setSharedPreferences('ftu::projects-viewed', projectsViewed, true);
    }

    if( this.props.route.displayName === 'Discover' && !platform.getSharedPreferences('ftu::seen-primary-ftu', true) ) {
      this.refs.ftu.show();
    }
  },
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
      onBackPressed: false,
      ftuSingleMessage: null,
      ftuRightMessage: intlData.messages['ftu-make-your-own'],
      ftuLeftMessage: intlData.messages['ftu-explore']
    };
  },
  onFTUViewed: function () {
    platform.setSharedPreferences('ftu::seen-primary-ftu', 'true', true);
  },
  update: function (state) {
    this.setState(state);
  },
  render: function () {
    var Route = this.props.route;
    return (<div className="container">
      <FTU
        ref="ftu"
        onViewed={this.onFTUViewed}
        singleMessage={this.state.ftuSingleMessage}
        leftMessage={this.state.ftuLeftMessage}
        rightMessage={this.state.ftuRightMessage} />
      <Snackbar/>
      <Spindicator/>
      <ModalConfirm/>
      <ModalSwitch/>
      <Route {...intlData} isVisible={this.state.isVisible} update={this.update} />
    </div>);
  }
});

module.exports = function (Route) {
  ReactDOM.render(<Base route={Route} />, document.getElementById('app'));
};
