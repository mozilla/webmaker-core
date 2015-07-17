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
    if (this.state.pages.length) {
      this.refs.dpad.bulkSetVisibility({
        showUp: verifyCoordsExist(this.state.pages, getTargetCoords(this.state.zoomedPageCoords, 'up')),
        showDown: verifyCoordsExist(this.state.pages, getTargetCoords(this.state.zoomedPageCoords, 'down')),
        showLeft: verifyCoordsExist(this.state.pages, getTargetCoords(this.state.zoomedPageCoords, 'left')),
        showRight: verifyCoordsExist(this.state.pages, getTargetCoords(this.state.zoomedPageCoords, 'right'))
      });
    }

    if (this.state.params.mode === 'play' && this.state.isPageZoomed) {
      // Pass bounding box of the currently focused page to the DPad for display logic
      var elFocusedElementGroup = document.querySelector('.page-container:not(.blurred) .element-group');

      if (elFocusedElementGroup) {
        // There is a potential race condition here:
        setTimeout(function () {
          this.refs.dpad.setDisplayState(elFocusedElementGroup.getBoundingClientRect());
        }.bind(this), 500); // 300ms transition on bounding DIV + a bit of extra time
      }
    }

  }
};
