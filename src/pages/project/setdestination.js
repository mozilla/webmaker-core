var types = require('../../components/basic-element/basic-element.jsx').types;
var api = require('../../lib/api');
var platform = require('../../lib/platform');
var reportError = require('../../lib/errors');
var dispatcher = require('../../lib/dispatcher');

module.exports = {
  componentDidMount: function () {
    // Handle button actions
    dispatcher.on('linkClicked', (event) => {
      if (event.props.targetPageId && this.state.isPageZoomed) {
        this.zoomToPage( this.pageIdToCoords(event.props.targetPageId) );
      } else {
        this.highlightPage(event.props.targetPageId, 'selected');
      }
    });
  },

  setDestination: function () {
    var cache = platform.getAPI();
    var payloads = cache.getPayloads("link-element");
    cache.clearPayloads("link-element");

    try {
      var list = JSON.parse(payloads);

      var element = types.link.spec.expand(list[0].data);
      element.attributes.targetPageId    = this.state.selectedEl;
      element.attributes.targetProjectId = this.state.params.project;
      element.attributes.targetUserId    = this.state.params.user;

      var serialized = JSON.stringify({ data: element });
      cache.queue("edit-element", serialized);
      platform.goBack();
    }

    catch(e) {
      reportError("Parse error in link-element data");
      platform.goBack();
    }
  }
};
