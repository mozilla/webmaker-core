var React = require('react/addons');
var PageBlock = require("./pageblock.jsx");

module.exports = {
  formPages: function() {
    return this.state.pages.map((page) => {
      var props = {
        page,
        selected: page.id === this.state.selectedEl,
        source: page.id === this.state.sourcePageID,
        target: page.id === this.state.selectedEl && this.state.params.mode === 'link',
        blurred: this.state.isPageZoomed && (page.coords.x !== this.state.zoomedPageCoords.x || page.coords.y !== this.state.zoomedPageCoords.y),
        transform: this.cartesian.getTransform(page.coords),
        interactive: this.state.isPageZoomed,
        onClick: this.onPageClick.bind(this, page)
      };
      return <PageBlock {...props} />;
    });
  }
};
