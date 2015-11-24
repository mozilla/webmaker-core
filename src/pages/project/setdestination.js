var types = require('../../components/basic-element/basic-element.jsx').types;
var api = require('../../lib/api');
var platform = require('../../lib/platform');
var reportError = require('../../lib/errors');
var dispatcher = require('../../lib/dispatcher');

module.exports = {
  componentDidMount: function () {
    // Handle button actions
    dispatcher.on('linkClicked', (event) => {
      if (event.props.targetWebURL) {
        if (window.Platform) {
          window.Platform.openExternalUrl(event.props.targetWebURL);
        } else {
          document.location.href = event.props.targetWebURL;
        }
      } else {
        if (event.props.targetPageId && this.state.isPageZoomed) {
          this.zoomToPage( this.pageIdToCoords(event.props.targetPageId) );
        } else {
          this.highlightPage(event.props.targetPageId, 'selected');
        }
      }
    });
  },

  componentWillMount: function () {
    var java = platform.getAPI();

    if (java) {
      this.props.update({
        onBackPressed: () => {
          java.clearPayloads(`link-element`);
          window.Platform.goBack();
        }
      });
    }
  },

  setDestination: function () {
    var java = platform.getAPI();

    // If we have java caching available, there should be a link-element in cache
    if(java) {
      var payloads = java.getPayloads("link-element");
      java.clearPayloads("link-element");

      var list = JSON.parse(payloads);
      var element = types.link.spec.expand(list[0].data);
      element.attributes.targetPageId    = this.state.selectedEl;
      element.attributes.targetProjectId = this.state.params.project;
      element.attributes.targetUserId    = this.state.params.user;
      element.attributes.targetWebURL    = ``; // Remove web url

      var serialized = JSON.stringify({
        data: element
      });
      java.queue("edit-element", serialized);
      platform.goBack();
    } else {
      console.warn(`This feature only works in Android.`);
    }
  }
};
