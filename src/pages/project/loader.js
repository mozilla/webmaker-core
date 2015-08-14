var api = require('../../lib/api');
var platform = require('../../lib/platform');
var reportError = require('../../lib/errors');
var types = require('../../components/basic-element/basic-element.jsx').types;

function findLandingPage(pages) {
  var result;
  // ... first, try to select 0, 0
  pages.forEach((page) => {
    if (page.coords.x === 0 && page.coords.y === 0) {
      result = page;
    }
  });
  // ... and if it was deleted, select the first page in the array
  return result || pages[0];
}

module.exports = {
  uri: function () {
    return `/users/${this.state.params.user}/projects/${this.state.params.project}/pages`;
  },

  load: function () {
    this.setState({loading: true});
    api({uri: this.uri()}, (err, data) => {

      this.setState({
        loading: false,
        sourcePageID: false
      });

      if (err) {
        reportError('Error loading project', err);
      } else if (!data || !data.pages) {
        reportError('No project found...');
      } else {
        var state = {
          isFirstLoad: false
        };
        var pages = this.formatPages(data.pages);

        // Set cartesian coordinates
        this.cartesian.allCoords = pages.map(el => el.coords);

        state.pages = pages;

        var landingPage = findLandingPage(pages);
        var {x, y} = this.cartesian.getFocusTransform(landingPage.coords, this.state.matrix[0]);

        if (this.state.params.mode === 'play' && typeof this.state.isFirstLoad) {
          this.zoomToPage(landingPage.coords);
        } else if (this.state.params.mode === 'edit' && !this.state.selectedEl) {
          state.selectedEl = landingPage.id;
          state.matrix = [this.state.matrix[0], 0, 0, this.state.matrix[0], x, y];
        } else if (this.state.isFirstLoad) {
          state.matrix = [this.state.matrix[0], 0, 0, this.state.matrix[0], x, y];
        }

        this.setState(state);

        // Highlight the source page if you're in link destination mode
        var java = platform.getAPI();
        if (java) {
          var payloads = java.getPayloads("link-element");
          if (payloads) {
            // We do not clear the payload, since it is also
            // required later on in setdestination.js
            try {
              var pageId;
              var list = JSON.parse(payloads);
              if (list.length > 0) {
                var entry = list[0];
                if (entry.metadata) {
                  var metadata = entry.metadata;
                  pageId = metadata.pageID;
                  this.highlightPage(pageId, 'source');
                } else {
                  console.error("no entry metadata available...", entry);
                }
                var element = types.link.spec.expand(entry.data);
                pageId = element.attributes.targetPageId;
                if (pageId) {
                  this.highlightPage(pageId, 'selected');
                }
              } else {
                console.error("link-element payloads was an empty array:" + payloads);
              }
            } catch (e) {
              console.error("malformed JSON found while loading in link-element data...");
            }
          }
        }
        else if (this.state.params.mode === 'link') {
          this.highlightPage(this.state.routeData.pageID, 'source');
        }
      }
    });
  }
};
