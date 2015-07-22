function getTargetCoords(sourceCoords, direction) {
  var cx = sourceCoords.x,
      cy = sourceCoords.y;

  var panTargets = {
    left:  { x: cx - 1, y: cy     },
    right: { x: cx + 1, y: cy     },
    up:    { x: cx,     y: cy - 1 },
    down:  { x: cx,     y: cy + 1 }
  };

  var target = panTargets[direction];

  return target;
}

function verifyCoordsExist(pages, target) {
  if (pages.some(p => p.coords.x === target.x && p.coords.y === target.y)) {
    return true;
  } else {
    return false;
  }
}

module.exports = {
  handleDirectionClick: function (event) {
    var target = getTargetCoords(this.state.zoomedPageCoords, event);

    if (verifyCoordsExist(this.state.pages, target)) {
      this.zoomToPage(target);
    }
  },
  componentDidUpdate: function () {
    // Check what directions have pages that exist and update the dpad UI accordingly
    if (this.state.isPageZoomed && this.state.pages.length) {
      this.refs.dpad.bulkSetVisibility({
        showUp: verifyCoordsExist(this.state.pages, getTargetCoords(this.state.zoomedPageCoords, 'up')),
        showDown: verifyCoordsExist(this.state.pages, getTargetCoords(this.state.zoomedPageCoords, 'down')),
        showLeft: verifyCoordsExist(this.state.pages, getTargetCoords(this.state.zoomedPageCoords, 'left')),
        showRight: verifyCoordsExist(this.state.pages, getTargetCoords(this.state.zoomedPageCoords, 'right'))
      });
    }

    if (this.state.params.mode === 'play' && this.state.isPageZoomed) {
      // Calculate how tight of a fit the current page is in the map container
      // This affects what style of arrow button is used

      var scale = this.getMaxPageSize();
      var tileWidth = this.cartesian.width * scale;
      var tileHeight = this.cartesian.height * scale;
      var elMap = document.querySelector('#map');
      var mapHeight = elMap.clientHeight;
      var mapWidth = elMap.clientWidth;

      this.refs.dpad.setState({
        constrainedX: ((mapWidth - tileWidth) / 2 < 20),
        constrainedY: ((mapHeight - tileHeight) / 2 < 20)
      });
    }
  }
};
