var React = require('react');
var Shim = require('../shim/shim.jsx');
var dispatcher = require('../../lib/dispatcher');

var ModalConfirm = React.createClass({
  getInitialState: function () {
    return {
      header: '',
      body: '',
      attribution: undefined,
      icon: '',
      buttons: [],
      callback: null
    };
  },
  show: function () {
    this.refs.shim.show();
  },
  hide: function () {
    this.refs.shim.hide();
  },
  onConfirmClick: function (button) {
    this.hide();

    if (button.callback) {
      button.callback.call();
    }
  },
  componentDidMount: function () {
    dispatcher.on('modal-confirm:show', (event) => {
      if (event.config.icon) {
        event.config.icon = '../../img/' + event.config.icon;
      }

      this.setState(React.__spread(this.getInitialState(), event.config));
      this.show();
    });

    dispatcher.on('modal-confirm:hide', (event) => {
      this.hide();
    });
  },
  render: function () {
    var buttons = this.state.buttons.map((button, i) => {
      return (
        <button
          key={i}
          onClick={this.onConfirmClick.bind(this, button)}
          className="btn btn-block">
          {button.text}
        </button>);
    });

    return (
      <Shim ref="shim" className="modal-confirm">
        <div className="window">
          <header>
            <div className="text">{this.state.header}</div>
            <div className="icon">
              <img src={this.state.icon}/>
            </div>
          </header>
          <div className="content">
            <p>{this.state.body}</p>
            {buttons}
            <div hidden={!this.state.attribution} className="attribution">
              <img src="../../img/cc.svg"/>
              <span>{this.state.attribution}</span>
            </div>
          </div>
        </div>
      </Shim>
    );
  }
});

module.exports = ModalConfirm;
