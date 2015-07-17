var api = require('../../lib/api');
var platform = require('../../lib/platform');
var reportError = require('../../lib/errors');

module.exports = {
  componentWillMount: function() {
    this.loadComponentData();
  },

  componentDidUpdate: function (prevProps, prevState) {
    // resume
    if (this.props.isVisible && !prevProps.isVisible) {
      this.checkCache();
    }
  },

  loadComponentData: function() {
    this.setState({loading: false});

    if (this.checkCache()) {
      return this.setState({loading: false});
    }

    api({ uri: this.uri() }, (err, data) => {
      this.setState({loading: false});

      if (err) {
        return reportError(this.getIntlMessage('error_page'), err);
      }

      if (!data || !data.page) {
        return reportError(this.getIntlMessage('error_page_404'));
      }

      var page = data.page;
      var styles = page.styles;
      var elements = {};

      page.elements.forEach(element => {
        element = this.flatten(element);
        if(element) {
          elements[element.id] = element;
        }
      });

      this.setState({
        styles,
        elements
      });
    });
  },

  checkCache: function() {
    var java = platform.getAPI();

    if (java) {
      var elements = this.state.elements;
      var payloads = java.getPayloads("edited-element");
      var failed = 0;

      // TODO: FIXME: DRY this code out, since we're effectively doing
      //              the same thing for keys "edited-element", from the
      //              element editor, and for key "edit-element", from the
      //              projects page (after setting destination)

      if (payloads !== undefined) {
        try {
          payloads = JSON.parse(payloads);
          payloads.forEach(payload => {
            var update = payload.data;
            update = this.flatten(update);
            elements[update.id] = update;
            this.queueEdit(update.id);
          });

          java.clearPayloads("edited-element");
          this.setState({
            loading: false,
            elements: elements
          });
        } catch (e) {
          console.error("malformed payload JSON:", payloads);
        }
      } else { failed++; }

      payloads = java.getPayloads("edit-element");
      if (payloads !== undefined) {
        try {
          payloads = JSON.parse(payloads);
          var update = payloads[0].data;
          update = this.flatten(update);
          elements[update.id] = update;
          this.queueEdit(update.id);

          java.clearPayloads("edit-element");
          this.setState({
            loading: false,
            elements: elements
          });
        } catch (e) {
          console.error("malformed payload JSON after setDestination:", payloads);
        }
      } else { failed++; }

      if (failed < 2) {
        return true;
      }
    }

    return false;
  },

  addSaveActions: function (actions, elementId) {
    var pageId = this.state.params.page;

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

  saveEntirePage: function(callAfterSaving) {
    if (this.edits.length > 0) {

      var actions = [];
      var elements = this.state.elements;

      // cascading build function
      var processNext = (ids) => {
        if(ids.length === 0) {
          return this.processBulkOperations(actions, callAfterSaving);
        }

        var id = ids.splice(0,1)[0];

        // If this element is still found in the page elements,
        // then this is a create and/or update operation.
        if (this.state.elements[id]) {
          this.addSaveActions(actions, id);
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
      // initiate cascade
      processNext(this.edits);
    } else { callAfterSaving(); }
  },

  processBulkOperations: function(actions, callAfterHandling) {
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
  }
};
