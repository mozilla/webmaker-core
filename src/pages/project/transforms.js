var Panzoom = require('panzoom');

var MAX_ZOOM = 0.5;
var MIN_ZOOM = 0.18;

module.exports = {
  componentDidMount: function () {
    var pz = new Panzoom(this.refs.bounding, {
      minScale: MIN_ZOOM,
      maxScale: MAX_ZOOM,
      onEnd: (e) => {
        var matrix = pz.getMatrix();
        this.setState({matrix});
      }
    });
    this.panzoom = pz;
    if (this.state.isPageZoomed) {
      pz.disable();
    }
  },
  componentDidUpdate: function (prevProps, prevState) {

    // Disable panzoom if state goes from zoomedIn to not zoomedIn
    if (this.panzoom && this.state.isPageZoomed && !prevState.isPageZoomed) {
      this.panzoom.disable();
    }

    // Disable if state goes from zoomedIn to not zoomedIn
    if (this.panzoom && !this.state.isPageZoomed  && prevState.isPageZoomed) {
      this.panzoom.enable();
    }
  }
};
