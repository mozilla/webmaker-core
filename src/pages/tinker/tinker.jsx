var React = require('react');
var assign = require('react/lib/Object.assign');
var FormattedMessage = require('react-intl').FormattedMessage;
var reportError = require('../../lib/errors');
var api = require('../../lib/api');
var platform = require('../../lib/platform');

var render = require('../../lib/render.jsx');
var Tabs = require('../../components/tabs/tabs.jsx');
var ColorSpectrum = require('../../components/color-spectrum/color-spectrum.jsx');
var Loading = require('../../components/loading/loading.jsx');

var elementTypes = require('../../components/basic-element/basic-element.jsx').types;
var Color = require('color');

/**
 * Tinker: Advanced editor for specific element attributes or styles
 *
 * Props
 *   @key {boolean} isVisible Indicates if the Tinker Activity is currently visible (not paused)

 * State
 *   @key {boolean} loading If true, loading spinner is shown and UI is blocked
 *   @key {object} element Represents flattened element data (via spec.flatten)

 *   From router:
 *   @key {object} params Contains params user, project, page, element, propertyName
 */
var Tinker = React.createClass({

  mixins: [require('../../lib/router'), require('react-intl').IntlMixin],

  getInitialState: function () {
    return {
      loading: false,
      element: null
    };
  },

  componentDidMount: function () {
    // FIXME: TODO: This should be handled with a touch preventDefault,
    //              not by reaching into the DOM.
    // Prevent pull to refresh
    document.body.style.overflowY = 'hidden';
    this.loadComponentData();
    this.props.update({
      onBackPressed: () => {
        this.save(() => window.Platform.goBack());
      }
    });
  },

  /**
   * If tinker activity switches from paused to resumed, re-load data from the API
   */
  componentDidUpdate: function (prevProps, prevState) {
    if (this.props.isVisible && !prevProps.isVisible) {
      this.checkCache();
    }
  },

  /**
   * Load data into this component, either from cache, or
   * by retrieving the data from the API database
   */
  loadComponentData: function() {
    this.setState({loading: true});

    if (this.checkCache()) {
      return this.setState({loading: false});
    }

    api.getElement(this.state.params, (err, element) => {
      this.setState({loading: false});
      if (err) {
        return reportError("Error loading element", err);
      }
      var spec = elementTypes[element.type].spec;
      if (!spec.spec[this.state.params.propertyName]) {
        return;
      }

      this.setState({
        element: spec.flatten(element, {defaults: true}),
        editor: spec.spec[this.state.params.propertyName].editor || 'color'
      });
    });
  },

  /**
   * Check the java cache for data that needs to be loaded.
   * If there is any, load it and return true, otherwise return false.
   */
  checkCache: function() {
    var java = platform.getAPI();

    if (java) {
      var payloads = java.getPayloads("edited-element");
      if (payloads !== undefined) {
        try {
          payloads = JSON.parse(payloads);
          var payload = payloads[0].data;
          var spec = elementTypes[payload.type].spec;

          java.clearPayloads("edited-element");

          this.setState({
            loading: false,
            element: spec.flatten(payload, {defaults: true}),
            editor: spec.spec[this.state.params.propertyName].editor || 'color'
          });

          return true;
        }
        catch (e) {
          console.error("malformed payload JSON for tinker mode:", payloads);
        }
      }
    }

    // if we get here, we didn't load anything from cache
    return false;
  },


  /**
   * Save current element state in API
   * Triggered in componentDidUpdate
   */
  save: function (onSaveComplete) {
    var element = this.state.element,
      propertyName = this.state.params.propertyName,
      spec = elementTypes[element.type].spec,
      isStyleOrAttribute = spec.isStyleOrAttribute(propertyName),
      updateObject = {};

    var java = platform.getAPI();

    if (java) {
      var expanded = spec.expand(element);
      var payload = { data: expanded };
      java.queue("edit-element", JSON.stringify(payload));
      onSaveComplete();
    }

    else {
      updateObject[isStyleOrAttribute] = spec.expand(element)[isStyleOrAttribute];
      this.setState({loading: true});
      var options = assign({}, this.state.params, {json: updateObject});
      api.updateElement(options, (err, element) => {
        this.setState({loading: false});
        if (err) {
          reportError("Error updating element", err);
        }
        if (typeof onSaveComplete === 'function') {
          onSaveComplete();
        }
      });
    }
  },

  getEditorValue: function () {
    return this.state.element && this.state.element[this.state.params.propertyName];
  },
  //Added this extra function to handle HSV color picker not updating UI properly with grey colors
  setEditorValueHSL: function (value) {
    var edits = {};
    edits[this.state.params.propertyName] = value.hslaString();
    this.setState({
      element: assign({}, this.state.element, edits)
    });
  },
  setEditorValue: function (value) {
    var edits = {};
    edits[this.state.params.propertyName] = value.rgbaString();
    this.setState({
      element: assign({}, this.state.element, edits)
    });
  },

  render: function () {
    var contents;
    if (this.state.element) {
      var PreviewComponent = elementTypes[this.state.element.type];
      contents = (
        <div className="editor-flex-container">
          <div className="editor-preview">
            <PreviewComponent {...this.state.element} />
            <button className="debug" onClick={this.save} hidden={window.Platform}>DEBUG:SAVE</button>
          </div>
          <div className="color-preview">
            <code><FormattedMessage message={this.getIntlMessage('color_editor')}
                      rgbaValue={new Color(this.getEditorValue()).rgbString()} /></code>
            <div className="color-preview-right">
              <div className="color-preview-swatch"><div style={{backgroundColor: this.getEditorValue()}} /></div>
            </div>
          </div>
          <Tabs className="editor-options" tabs={[
            {
              title: 'Color Spectrum',
              menu: <img className="icon" src="../../img/pencil.svg" />,
              body: <ColorSpectrum HSB={true} Alpha={true} color={this.getEditorValue()} onChange={this.setEditorValueHSL} />
            },
            {
              title: 'RGBA Picker',
              menu: <img className="icon" src="../../img/settings.svg" />,
              body: <ColorSpectrum RGB={true} Alpha={true} color={this.getEditorValue()} onChange={this.setEditorValue} />
            }
          ]} />
        </div>
      );
    }

    return <div id="tinker">
      {contents}
      <Loading on={this.state.loading} />
    </div>;
  }
});

render(Tinker);
