var Cartesian = require('../../lib/cartesian');

var DEFAULT_ZOOM = 0.5;

module.exports = {
  statics: {
    DEFAULT_ZOOM: DEFAULT_ZOOM
  },

  componentWillMount: function () {
    var width = 320;
    var height = 440;
    var gutter = 20;

    this.cartesian = new Cartesian({
      allCoords: [],
      width,
      height,
      gutter
    });
  },

  /**
   * Get the coordinates for a particular page ID
   * @param  {String} id Page ID
   * @return {Object}    Coordinate object {x:Number, y:Number}
   */
  pageIdToCoords: function (id) {
    var coords;
    this.state.pages.some(p => {
      if (id === p.id) {
        coords = p.coords;
        return true;
      }
    });
    return coords;
  },

  /**
   * getMaxPageSize
   * Get the scale transform that allows a single page fit in the current viewport
   * @return {int} An integer representing the scale transform
   */
  getMaxPageSize: function () {
    var w = window.innerWidth;
    var h = window.innerHeight;
    var scale;
    if (w / h <= this.cartesian.width/this.cartesian.height) {
      scale = w/this.cartesian.width;
    } else {
      scale = h/this.cartesian.height;
    }
    return scale;
  },

  zoomToPage: function (coords) {

    // TODO: Adjust size when window resizes
    var zoom = this.getMaxPageSize();
    var {x, y} = this.cartesian.getFocusTransform(coords, zoom);

    this.setState({
      matrix: [zoom, 0, 0, zoom, x, y],
      isPageZoomed: true,
      zoomedPageCoords: coords
    });
  },

  zoomFromPage: function () {
    var {x, y} = this.cartesian.getFocusTransform(this.state.zoomedPageCoords, DEFAULT_ZOOM);

    this.setState({
      matrix: [DEFAULT_ZOOM, 0, 0, DEFAULT_ZOOM, x, y],
      isPageZoomed: false
    });
  },

  zoomOut: function () {
    var matrix = this.state.matrix.slice();
    var zoom = this.state.matrix[0] / 2;
    matrix[0] = zoom;
    matrix[3] = zoom;
    this.setState({matrix});
  },

  zoomIn: function () {
    var matrix = this.state.matrix.slice();
    var zoom = this.state.matix[0] * 2;
    matrix[0] = zoom;
    matrix[3] = zoom;
    this.setState({matrix});
  }
};
