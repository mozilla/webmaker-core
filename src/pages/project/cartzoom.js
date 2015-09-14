var Cartesian = require('../../lib/cartesian');

var DEFAULT_ZOOM = 0.5;

module.exports = {
  statics: {
    DEFAULT_ZOOM: DEFAULT_ZOOM
  },

  getInitialState: function () {
    return {
      isBoundingBoxAnimating: false
    };
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
    var elWrapper = this.refs.map.getDOMNode();

    var MARGIN = 60; // Gutter around pages

    var w = elWrapper.clientWidth - MARGIN;
    var h = elWrapper.clientHeight - MARGIN;

    var scale;

    if (w / h <= this.cartesian.width/this.cartesian.height) {
      scale = w/this.cartesian.width;
    } else {
      scale = h/this.cartesian.height;
    }

    return scale;
  },

  zoomToPage: function (coords) {

    // Validate `coords`
    if (!coords || typeof coords.x !== 'number' && typeof coords.y !== 'number' ) {
      console.error('Malformed argument `coords`');
      return;
    }

    // Cancel method if an animation is already in progress
    if (this.state.isBoundingBoxAnimating) {
      return;
    }

    this.setState({
      isBoundingBoxAnimating: true
    });

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
  },

  // Get the bounding rect for the currently visible page area
  getPageBoundingRect: function () {
    // Calculate how the current page is situated in the map container
    var scale = this.getMaxPageSize();
    var tileWidth = this.cartesian.width * scale;
    var tileHeight = this.cartesian.height * scale;
    var elMap = document.querySelector('#map');
    var mapHeight = elMap.clientHeight;
    var mapWidth = elMap.clientWidth;

    // Use the same schema as `getBoundingClientRect`,
    //  but compute from internal positioning system (cartesian) instead of
    //  rendered DOM for better accuracy and to avoid race conditions due
    //  to animation and unpredictable render completion times.
    return {
      bottom: mapHeight - ((mapHeight - tileHeight) / 2),
      height: tileHeight,
      left: (mapWidth - tileWidth) / 2,
      right: mapWidth - ((mapWidth - tileWidth) / 2),
      top: (mapHeight - tileHeight) / 2,
      width: tileWidth
    };
  },

  setZoomOutButtonPosition: function () {
    var boundingBox = this.getPageBoundingRect();

    if (this.refs.btnZoomOut) {
      var btnZoomOut = this.refs.btnZoomOut.getDOMNode();

      btnZoomOut.style.top = (boundingBox.top - (btnZoomOut.clientHeight / 2)) + 'px';
      btnZoomOut.style.left = (boundingBox.left - (btnZoomOut.clientWidth / 2)) + 'px';
    }
  },

  componentDidMount: function () {
    if (window) {
      window.addEventListener('resize', (event) => {
        this.setZoomOutButtonPosition();

        // Resize zoomed page
        if (this.state.isPageZoomed) {
          this.zoomToPage(this.state.zoomedPageCoords);
        }
      });
    }

    var elBounding = this.refs.bounding.getDOMNode();

    // Turn off animation flag (used to block interactions)
    elBounding.addEventListener('transitionend', (event) => {
      if (event.propertyName === 'transform') {
        this.setState({
          isBoundingBoxAnimating: false
        });
      }
    });
  },

  componentDidUpdate: function () {
    this.setZoomOutButtonPosition();
  }
};
