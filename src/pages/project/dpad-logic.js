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
  componentDidMount: function () {
    if (window) {
      window.addEventListener('resize', (event) => {
        this.setDPadStyle();
      });
    }
  },
  componentDidUpdate: function () {
    this.setDPadStyle();
  },
  setDPadStyle: function () {
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
      this.refs.dpad.positionAroundContainer(this.getPageBoundingRect());
    }
  }
};
