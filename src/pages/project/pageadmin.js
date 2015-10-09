var React = require('react');
var update = require('react-addons-update');

var types = require('../../components/basic-element/basic-element.jsx').types;
var api = require('../../lib/api');
var reportError = require('../../lib/errors');
var platform = require('../../lib/platform');
var dispatcher = require('../../lib/dispatcher');

var MAX_ZOOM = 0.5;
var DEFAULT_ZOOM = 0.5;

module.exports = {
  /**
   * Highlight a page in the UI and move camera to center it
   * @param  {Number|String} id ID of page
   * @param  {Number|String} type Type of highlight ("selected", "source")
   */
  highlightPage: function (id, type) {
    if (this.state.sourcePageID !== id) {
      var selectedPage;

      this.state.pages.forEach(function (page) {
        if (parseInt(page.id, 10) === parseInt(id, 10)) {
          selectedPage = page;
        }
      });

      if (!selectedPage) {
        console.warn('Page not found.');
        return;
      }

      var currentZoom = this.state.matrix[0];
      var {x, y} = this.cartesian.getFocusTransform(selectedPage.coords, this.state.matrix[0]);
      var newState = {
        matrix: [currentZoom, 0, 0, currentZoom, x, y]
      };

      if (type === 'selected') {
        newState.selectedEl = id;
      } else if (type === 'source') {
        newState.sourcePageID = id;
      }

      this.setState(newState);
    }
  },

  formatPages: function (pages) {
    return pages.map(page => {

      page.coords = {
        x: page.x,
        y: page.y
      };

      page.elements = page.elements.map(element => {
        if (!types[element.type]) {
          return false;
        }
        return types[element.type].spec.flatten(element);
      }).filter(element => element);

      delete page.x;
      delete page.y;

      return page;
    });
  },

  addPage: function (coords) {
    return () => {
      var pagesAdded = parseInt(platform.getSharedPreferences('ftu::pages-created', true) || 0, 10);

      pagesAdded++;

      // Trigger FTU
      if (pagesAdded === 2) {
        dispatcher.fire('secondPageCreated', {});
      }

      platform.setSharedPreferences('ftu::pages-created', pagesAdded, true);

      var json = {
        x: coords.x,
        y: coords.y,
        styles: {backgroundColor: '#f2f6fc'}
      };
      this.setState({loading: true});
      api({
        method: 'post',
        uri: this.uri(),
        json
      }, (err, data) => {
        this.setState({loading: false});
        if (err) {
          return reportError('Error loading project', err);
        }

        if (!data || !data.page) {
          return reportError('No page id returned');
        }

        json.id = data.page.id;
        json.coords = {x: json.x, y: json.y};
        delete json.x;
        delete json.y;
        this.cartesian.allCoords.push(coords);

        var currentZoom = this.state.matrix[0];
        var {x, y} = this.cartesian.getFocusTransform(coords, currentZoom);
        this.setState({
          pages: update(this.state.pages, {$push: [json]}),
          matrix: [currentZoom, 0, 0, currentZoom, x, y],
          selectedEl: json.id
        });
      });
    };
  },

  removePage: function () {
    var currentId = this.state.selectedEl;
    var index;
    this.state.pages.forEach((el, i) => {
      if (el.id === currentId) {
        index = i;
      }
    });
    if (typeof index === 'undefined') {
      return;
    }

    // Don't delete test elements for real;
    if (parseInt(currentId, 10) === 1) {
      return window.alert('this is a test page, not deleting.');
    }

    this.setState({loading: true});

    api({
      method: 'delete',
      uri: `${this.uri()}/${currentId}`
    }, (err) => {
      this.setState({loading: false});
      if (err) {
        return reportError('There was an error deleting the page', err);
      }

      this.cartesian.allCoords.splice(index, 1);
      var newZoom = this.state.matrix[0] >= MAX_ZOOM ? DEFAULT_ZOOM : this.state.matrix[0];
      var x = this.state.matrix[4];
      var y = this.state.matrix[5];
      this.setState({
        pages: update(this.state.pages, {$splice: [[index, 1]]}),
        matrix: [newZoom, 0, 0, newZoom, x, y],
        selectedEl: ''
      });
    });
  },

  onPageClick: function (page) {
    if (this.state.params.mode === 'play') {
      if (!this.state.isPageZoomed ||
          this.state.zoomedPageCoords.x !== page.coords.x &&
          this.state.zoomedPageCoords.y !== page.coords.y) {
        this.zoomToPage(page.coords);
      }
    } else if (page.id !== this.state.selectedEl) {
      this.highlightPage(page.id, 'selected');
    }
  }
};
