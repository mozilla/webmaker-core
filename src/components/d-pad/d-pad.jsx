var React = require('react');

module.exports = React.createClass({
  propTypes: {
    onDirectionClick: React.PropTypes.func, // External handler for button clicks
    isVisible: React.PropTypes.bool
  },
  getInitialState: function () {
    return {
      showUp: true,
      showDown: true,
      showLeft: true,
      showRight: true
    };
  },
  onButtonClick: function (direction, event) {
    this.props.onDirectionClick.call(this, direction);
  },
  bulkSetVisibility: function (newState) {
    this.setState(newState);
  },
  positionAroundContainer: function (boundingRect) {
    if (!boundingRect) {
      return;
    }

    this.refs.btnUp.style.bottom = boundingRect.bottom - 3 + 'px';
    this.refs.btnDown.style.top = boundingRect.bottom - 3 + 'px';
    this.refs.btnLeft.style.right = boundingRect.right - 3 + 'px';
    this.refs.btnRight.style.left = boundingRect.right - 3 + 'px';
  },
  render: function () {
    return (
      <div className={'dPad' + (this.props.isVisible ? '' : ' hidden')}>
        <button ref="btnUp" className={'up' + (this.state.constrainedY ? ' moon' : '') + (this.state.showUp ? '' : ' hidden')} onClick={this.onButtonClick.bind(this, 'up')}></button>
        <button ref="btnDown" className={'down' + (this.state.constrainedY ? ' moon' : '') + (this.state.showDown ? '' : ' hidden')} onClick={this.onButtonClick.bind(this, 'down')}></button>
        <button ref="btnLeft" className={'left' + (this.state.constrainedX ? ' moon' : '') + (this.state.showLeft ? '' : ' hidden')} onClick={this.onButtonClick.bind(this, 'left')}></button>
        <button ref="btnRight" className={'right' + (this.state.constrainedX ? ' moon' : '') + (this.state.showRight ? '' : ' hidden')} onClick={this.onButtonClick.bind(this, 'right')}></button>
      </div>
    );
  }
});
