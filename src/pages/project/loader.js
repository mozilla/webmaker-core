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

  componentWillMount: function() {
    this.loadComponentData();
  },

  componentDidUpdate: function (prevProps, prevState) {
    // The follow code is intended to trigger on a view-resume,
    // to deal with the app being put to sleep and woken up again.
    if (this.props.isVisible && !prevProps.isVisible) {
      // we explicitly check the cache, without database fallback
      this.checkCache();
    }
  },

  loadComponentData: function() {
    this.setState({loading: false});

    if (this.checkCache()) {
      return this.setState({loading: false});
    }

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
  },

  checkCache: function() {
    var java = platform.getAPI();

    if (java) {
      var payloads = java.getPayloads("edited-page");
      if (payloads !== undefined) {
        var list = false;
        try {
          list = JSON.parse(payloads);
        } catch (e) {
          console.error("malformed page payload:", payloads);
        }

        java.clearPayloads("edited-page");
        if (list) {
          var entry = list[0];
          var data = entry.data;
          var pageId = data.pageId;

          console.log("finding",pageId,"in",this.state.pages);

          // find the page...
          var page = this.state.pages.filter(p => p.id == pageId)[0];
          if(!page) { return false; }

          var elements = data.elements;
          page.elements = Object.keys(elements).map(id => elements[id]);
          page.styles = data.styles;

          console.log("updated page:",page);

          this.setState({
            loading: false,
            pages: this.state.pages
          });

          return true;
        } else {
          console.log("no JSON error, but no list either...");
        }
      }
    }

    return false;
  },

  // For each page in this project, check if it has pending changes.
  // If so, propagate those as a bulk action.
  save: function(callAfterHandling) {
    // TODO: hook this up as a prenavigation hook for the goBack() operation
    var actions = [];

    this.state.pages.forEach(page => {
      this.compileActions(actions, page);
    });

    this.processBulkOperations(actions, callAfterHandling);
  },

  processBulkOperations: function(actions, callAfterHandling) {
    // TODO: validate this route, with all possible content
    var userId = this.state.params.user;
    api({
      method: 'post',
      uri: `/users/${userId}/bulk`,
      json: { actions: actions }
    }, (err, body) => {
      if (err) {
        return this.onError(err);
      }

      if (callAfterHandling) {
        setTimeout(callAfterHandling, 1);
      }
    });
  },

  // =======================================
  // BORROWED FROM PAGE.JSX's LOADER FOR NOW
  // =======================================

  addSaveActions: function (actions, elementId, newpageId) {
    var pageId = (newpageId ? '$' + newpageId + '.id' : this.state.params.page);

    var element = this.state.elements[elementId];
    element = this.expand(element);

    // new elements require a CREATE action
    if (element.newlyCreated) {
      delete element.newlyCreated;

      actions.push({
        method: "create",
        type: "elements",
        data: {
          pageId: pageId,
          type: element.type,
          styles: element.styles,
          attributes: element.attributes
        }
      });
    }

    // existing elements require a PATCH action
    else {
      actions.push({
        method: "update",
        type: "elements",
        data: {
          id: elementId,
          styles: element.styles,
          attributes: element.attributes
        }
      });
    }
  },

  compileActions: function(actions, page) {
    var projectId = this.state.params.project;
    var newpageId = false;

    // if this is a new page, start with a "create page" action.
    if (page.newlyCreated) {
      delete page.newlyCreated;
      newpageId = actions.length;
      actions.push({
        method: "create",
        type: "pages",
        data: {
          projectId: projectId,
          x: 0,
          y: 0,
          styles: {}
        }
      });
    }

    if (page.edits.length > 0) {
      var elements = page.elements;

      // cascading build function
      var processNext = (ids) => {
        if(ids.length === 0) { return; }

        var id = ids.splice(0,1)[0];

        // If this element is still found in the page elements,
        // then this is a create and/or update operation.
        if (page.elements[id]) {
          this.addSaveActions(actions, id, newpageId);
        }

        // If it is not, then the element was deleted:
        else {
          actions.push({
            method: "remove",
            type: "elements",
            data: {
              id: id
            }
          });
        }

        processNext(ids);
      };

      processNext(page.edits);
    }
    return actions;
  },

};
