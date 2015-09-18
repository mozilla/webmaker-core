var React = require('react/addons');
var assign = require('react/lib/Object.assign');
var {SecondaryButton} = require('../../components/action-menu/action-menu.jsx');

module.exports = {
  getContainerStyle: function() {
    return {
      width: this.cartesian.width + 'px',
      height: this.cartesian.height + 'px'
    };
  },

  getBoundingStyle: function() {
    var transformString = `matrix(${this.state.matrix.join(', ')})`;
    return assign({
      transform: transformString,
      WebkitTransform: transformString,
      opacity: this.state.pages.length ? 1 : 0
    }, this.cartesian.getBoundingSize() );
  },

  getPageURL: function(params, selectedEl) {
    return `/users/${params.user}/projects/${params.project}/pages/${selectedEl}`;
  },

  generateAddContainers: function(isPlayOnly) {
    if (isPlayOnly) {
      return false;
    }

    return this.cartesian.edges.map(coords => {
      var transformString = this.cartesian.getTransform(coords);
      return (<div className="page-container add" style={{
        transform: transformString,
        WebkitTransform: transformString
      }} onClick={this.addPage(coords)}>
        <img className="icon" src="../../img/plus.svg" />
      </div>);
    });
  }
};
