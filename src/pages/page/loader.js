var api = require('../../lib/api');
var platform = require('../../lib/platform');

module.exports = {
  componentWillMount: function() {
    this.load();
  },

  componentDidUpdate: function (prevProps, prevState) {
    // resume
    if (this.props.isVisible && !prevProps.isVisible) {
      this.load();
    }
  },

  load: function() {
    this.setState({loading: true});
    var uri = this.uri();
    var handler = (err, data) => {
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
        loading: false,
        styles,
        elements
      });
    };

    // First, check java, to see if it's tracking our state. If it
    // is, then this is an update and we should bypass the remote DB
    // until the user tries to leave the page (for now. The intention
    // is to keep things in Java cache until the user leaves project)
    var java = platform.getAPI();

    if (java) {
      var payloads = java.getPayloads("elements");
      if (payloads !== undefined) {
        var elements = this.state.elements;
        try {
          payloads = JSON.parse(payloads);
          payloads.forEach(payload => {
            var update = payload.data;
            update = this.flatten(update);
            elements[update.id] = update;
            edits.push(update.id);
            this.queueEdit(update.id);
          });

          java.clearPayloads("elements");
          this.setState({
            loading: false,
            elements: elements
          });
        } catch (e) {
          // malformed payload JSON. Error log, rather than report
          // to the user, and then fall back to plain API loading.
          console.error("malformed payload JSON:", payloads);
          api({ uri: uri }, handler);
        }
      } else {
        // no waiting payloads
        api({ uri: uri }, handler);
      }
    } else {
      // not running in java context
      api({ uri: uri }, handler);
    }
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
