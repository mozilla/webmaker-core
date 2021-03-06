var React = require('react');
var reportError = require('../../lib/errors');
var router = require('../../lib/router');
var api = require('../../lib/api');
var platform = require('../../lib/platform');

var Loading = require('../../components/loading/loading.jsx');
var render = require('../../lib/render.jsx');

var editors = {
  image: require('./image-editor.jsx'),
  link: require('./link-editor.jsx'),
  text: require('./text-editor.jsx'),
  page: require('./page-editor.jsx')
};

var types = require('../../components/basic-element/basic-element.jsx').types;

var hash = window.location.hash && window.location.hash.replace('#', '');
var testIds = {
  page: 0,
  image: 1,
  text: 2,
  link: 3
};

render(React.createClass({
  mixins: [router, require('react-intl').IntlMixin],

  uri: function () {
    var params = this.state.params;
    var element = params.element;
    if (hash) {
      element = testIds[hash];
    }
    //Elements can't have an ID of zero because of logic in page.jsx, so if the incoming URL does, we know it's a page
    if(element == '0'){ //For editing pages. Intentionally loose equality because URL parsing
      return `/users/${params.user}/projects/${params.project}/pages/${params.page}`;
    } else {
      return `/users/${params.user}/projects/${params.project}/pages/${params.page}/elements/${element}`;
    }
  },

  saveBeforeSwitch: function() {
    if (!this.edits) {
      return platform.goBack();
    }

    this.save(function() {
      platform.goBack();
    });
  },

  componentWillMount: function() {
    this.loadComponentData();

    this.props.update({
      onBackPressed: this.saveBeforeSwitch
    });
  },

  componentDidMount: function () {
    // FIXME: TODO: This should be handled with a touch preventDefault,
    //              not by reaching into the DOM.
    // Prevent pull to refresh
    document.body.style.overflowY = 'hidden';
  },

  componentDidUpdate: function (prevProps) {
    // resume
    if (this.props.isVisible && !prevProps.isVisible) {
      if (this.state.noDataRefresh) {
        this.setState({noDataRefresh: false});
      } else {
        this.checkCache();
      }
    }
  },

  cacheEdits: function (edits) {
    this.edits = edits;
  },

  /**
   * Hack that allows us to temporarily cancel a new api call
   * after launching the camera activity.
   */
  cancelDataRefresh: function () {
    this.setState({
      noDataRefresh: true
    });
  },

  save: function (onSaveComplete) {
    var edits = this.edits;
    if (!edits) {
      if (typeof onSaveComplete === 'function') {
        onSaveComplete();
      }
      return;
    }

    var json = types[edits.type].spec.expand(edits);

    //Save these styles so the next element of this type in this project looks the same by default
    if (platform) {
      //Pass this to stringify to filter out the styles we don't want to duplicate
      var replacer = function(key, value){
        if(['x','y','angle','scale'].includes(key)){
          return undefined;
        } else {
          return value;
        }
      };
      platform.setSharedPreferences(`${this.state.params.project}-${this.state.element.type}`, JSON.stringify(json.styles, replacer), true);
    }

    this.setState({loading: true});

    // Attempt to track change on the java side
    var java = platform.getAPI();
    if (java && json.type !== 'page') {
      java.queue("edited-element", JSON.stringify({
        element: this.params,
        data: json
      }));

      if (typeof onSaveComplete === 'function') {
        onSaveComplete();
      }
    }

    else {
      api({
        method: 'patch',
        uri: this.uri(),
        json: {
          styles: json.styles,
          attributes: json.attributes
        }
      }, (err, data) => {
        this.setState({loading: false});
        if (err) {
          reportError(this.getIntlMessage('error_update_element'), err);
        }
        this.setState({
          elements: edits
        });
        this.edits = false;
        if (typeof onSaveComplete === 'function') {
          onSaveComplete();
        }
      });
    }
  },

  loadComponentData: function() {
    this.setState({loading: true});

    if (this.checkCache()) {
      return this.setState({loading: false});
    }

    api({ uri: this.uri() }, (err, data) => {
      this.setState({loading: false});

      if (err) {
        return reportError(this.getIntlMessage('error_element'), err);
      }
      if (data.page) {
        data.page.type = 'page';
        this.setState({element: data.page});
        return;
      }
      if (!data || !data.element) {
        return reportError(this.getIntlMessage('error_element_404'));
      }

      this.setState({element: data.element});
    });

  },

  checkCache: function () {
    var java = platform.getAPI();

    if (java) {
      // Clean up possibly outstanding elements due to "back" actions
      java.clearPayloads("link-element");
      var payloads = java.getPayloads("edit-element");
      if (payloads !== undefined) {
        try {
          payloads = JSON.parse(payloads);
          var element = payloads[0].data;
          java.clearPayloads("edit-element");
          this.setState({
            loading: false,
            element: element
          });
          return true;
        } catch (e) {
          console.error("malformed payload JSON for tinker mode:", payloads);
        }
      }
    }

    return false;
  },

  render: function () {
    var Editor;
    var {params, element} = this.state;

    if (typeof element === 'undefined') {
      return (<Loading on={true} />);
    }

    Editor = editors[params.editor] || editors[hash] || editors.link;

    var props = {
      params,
      cacheEdits: this.cacheEdits,
      cancelDataRefresh: this.cancelDataRefresh,
      save: this.save
    };
    if (element) {
      props.element = element;
    }

    return (<div id="editor">
      <Editor {...props} />
      <button style={{position: 'absolute', top: 0}} hidden={window.Platform} onClick={this.save}>DEBUG:SAVE</button>
      <Loading on={this.state.loading}/>
    </div>);
  }
}));
