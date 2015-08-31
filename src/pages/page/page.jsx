// FIXME: TODO: This component is huge and needs further refactoring

var React = require('react');
var classNames = require('classnames');
var assign = require('react/lib/Object.assign');
var reportError = require('../../lib/errors');
var api = require('../../lib/api');
var platform = require('../../lib/platform');
var dispatcher = require('../../lib/dispatcher');

var render = require('../../lib/render.jsx');
var types = require('../../components/basic-element/basic-element.jsx').types;
var Loading = require('../../components/loading/loading.jsx');
var ElementGroup = require('../../components/element-group/element-group.jsx');
var PageControls = require('./page-controls.jsx');

var GetMedia = require('../../components/get-media/get-media.jsx');

var Page = React.createClass({
  mixins: [
    require('../../lib/router'),
    require('./loader'),
    require('./flattening'),
    require('react-intl').IntlMixin
  ],

  /**
   * URI generator - the app allows for user and project switching, so we cannot
   *                 cache these values.
   * @return {String} the API route URI for this page
   */
  uri: function () {
    var params = this.state.params;
    return `/users/${params.user}/projects/${params.project}/pages/${params.page}`;
  },

  /**
   * Maintain the list of elements that have pending edits, so
   * that they can be synced to the database when we "go back"
   * from this view.
   */
  queueEdit: function(elementId, undoCreate) {
    elementId = parseInt(elementId,10);
    var pos = this.edits.indexOf(elementId);
    if (undoCreate && pos > -1) {
      return this.edits.splice(pos,1);
    }
    if (pos === -1) {
      return this.edits.push(elementId);
    }
  },

  saveBeforeSwitch: function() {
    this.saveEntirePage(function() {
      platform.goBack();
    });
  },

  getInitialState: function() {
    return {
      loading: true,
      elements: {},
      styles: {},
      currentElementId: -1,
      showAddMenu: false,
      dims: {
        width: 0,
        height: 0
      }
    };
  },

  componentWillMount: function() {
    // A list of elements ids for elements with pending edits,
    // used to make sure we only bulk-write changes for those.
    this.edits = [];

    this.props.update({
      onBackPressed: this.saveBeforeSwitch
    });
  },

  componentDidMount: function() {
    var bbox = this.refs.container.getDOMNode().getBoundingClientRect();
    if(bbox) {
      this.setState({
        dims: bbox
      });
    }
    dispatcher.on('linkDestinationClicked', (event) => {
      this.followLinkDestination(this.state.params.project, event.id);
    });
  },

  componentDidUpdate: function (prevProps, prevState) {
    // set parent back button state
    if (this.state.showAddMenu !== prevState.showAddMenu) {
      this.props.update({
        onBackPressed: this.state.showAddMenu ? this.toggleAddMenu : this.saveBeforeSwitch
      });
    }
  },

  /**
   * Follow link destinations tied to a specific parent project
   * @param   {String} parentProjectID
   * @param   {String} elementID
   */
  followLinkDestination: function(parentProjectID, elementID) {
    // Data to pass to the Project Link activity to determine its initial state and where to return its data
    var metadata = {
      elementID: elementID,
      pageID: this.state.params.page,
      projectID: this.state.params.project,
      userID: this.state.params.user
    };

    var java = platform.getAPI();
    if (java) {
      java.queue("link-element", JSON.stringify({
        data: types.link.spec.flatten(this.state.elements[elementID]),
        metadata: metadata
      }));
    }

    platform.setView('/users/' + this.state.params.user + '/projects/' + parentProjectID + '/link', JSON.stringify(metadata));
  },

  /**
   * Helper function for generating the JSX involved in rendering the pages-container
   */
  generatePagesContainer: function() {
    var innerStyle = {
      backgroundColor: this.state.styles.backgroundColor
    };
    return (
      <div className="pages-container">
        <div className="page">
          <div className="inner" style={innerStyle}>
            <ElementGroup
              ref="container"
              interactive={true}
              dims={this.state.dims}
              elements={this.state.elements}
              currentElementId={this.state.currentElementId}
              onTap={this.onTap}
              onTouchEnd={this.onTouchEnd}
              onUpdate={this.onUpdate}
              onDeselect={this.deselectAll} />
          </div>
        </div>
      </div>
    );
  },

  /**
   * Helper function for generating the JSX involved in rendering the page controls
   */
  generateControls: function() {
    // Url for link to element editor
    var elements = this.state.elements,
        currentId = this.state.currentElementId,
        currentElement = elements[currentId],
        type, href, url;
    if (currentElement) {
      type = currentElement.type;
      href = '/pages/element/#' + type;
      url = this.uri() + `/elements/${currentId}/editor/${type}`;
    }
    return (
      <PageControls addImage={this.addImage}
                    addText = {() => this.addElement('text')}
                    addLink = {() => this.addElement('link')}
                    deleteElement={this.deleteElement}
                    toggleAddMenu={this.toggleAddMenu}
                    currentElementId={currentId}
                    showAddMenu={this.state.showAddMenu}
                    currentElement={this.state.elements[this.state.currentElementId]}
                    url={url}
                    href={href} />
    );
  },

  /**
   * Renders this component to the client
   */
  render: function () {
    return (
      <div id="project" className="demo">
        <div className={classNames({overlay: true, active: this.state.showAddMenu})} />
        { this.generatePagesContainer() }
        { this.generateControls() }
        <GetMedia
          show={this.state.showGetMedia}
          onCancel={this.toggleGetMedia}
          onImageReady={this.onImage}
          onStartMedia={this.onStartMedia} />
        <Loading on={this.state.loading} />
      </div>
    );
  },

  /**
   * Show, or hide, the menu for adding new elements to the page,
   * toggling between the two states.
   */
  toggleAddMenu: function () {
    this.setState({
      showAddMenu: !this.state.showAddMenu
    });
  },

  toggleGetMedia: function () {
    this.setState({
      showGetMedia: !this.state.showGetMedia
    });
  },

  /**
   * Deselect the currently selected element(s) if there is/are any.
   */
  deselectAll: function () {
    this.setState({
      currentElementId: -1
    });
  },

  /**
   * Find the highest in-use zindex on the page, so that we can assign
   * elements added to the page a sensible zindex value.
   * @return {int} the highest in-use zindex on the page.
   */
  getHighestIndex: function() {
    return Object.keys(this.state.elements)
                 .map(e => this.state.elements[e].zIndex)
                 .reduce((a,b) => a > b ? a : b, 1);
  },

  /**
   * Elements need to save themselves on a touchend, but depending
   * on whether they were manipulated or not should make sure their
   * z-index is the highest index available for rendering: if an
   * element was only tapped, not manipulated, it should become the
   * highest visible element on the page.
   */
  onTouchEnd: function(elementId) {
    return (modified) => {
      if (modified) {
        this.queueEdit(elementId);
      }
    };
  },

  onTap: function (elementId) {
    return () => {
      var elements = this.state.elements;
      var element = elements[elementId];
      var highestIndex = this.getHighestIndex();
      if (element.zIndex !== highestIndex) {
        element.zIndex = highestIndex + 1;
        this.setState({elements}, function() {
          this.queueEdit(elementId);
        });
      }
    };
  },

  /**
   * Factory function for generating functions that update elements
   * based on a change in their CSS transforms.
   */
  onUpdate: function (elementId) {
    // actual function, bound to a specific elementId:
    return (newProps) => {
      var elements = this.state.elements;
      var element = elements[elementId];
      elements[elementId] = assign(element, newProps);
      this.setState({
        elements: elements,
        currentElementId: elementId
      }, function() {
        this.queueEdit(elementId);
      });
    };
  },

  /**
   * Factory function for adding elements of a particular type
   * to the page.
   */
  addElement: function(type, properties) {
    properties = properties || {};
    var highestIndex = this.getHighestIndex();
    var json = types[type].spec.generate();
    json.styles.zIndex = highestIndex + 1;

    this.setState({loading: true});

    // NOTE: ids 1, 2 and 3 are reserved for test elements
    var temporaryId = 4;
    var keys = Object.keys(this.state.elements);
    if (keys.length > 0) {
      temporaryId = 1 + keys.map(v => parseInt(v,10)).reduce((a,b) => a > b ? a : b);
    }
    json.id = temporaryId;

    var state = {
      elements: this.state.elements,
      currentElementId: temporaryId,
      loading: false,
      showAddMenu: false,
      showGetMedia: false
    };
    state.elements[temporaryId] = assign(this.flatten(json), properties);
    state.elements[temporaryId].newlyCreated = true;

    this.setState(state, function() {
      this.queueEdit(temporaryId);
    });

  },

  addImage: function () {
    this.setState({
      showAddMenu: false,
      showGetMedia: true
    });
  },

  onImage: function (uri) {
    this.addElement('image', {src: uri});
  },

  /**
   * Remove the currently selected element from this page
   */
  deleteElement: function() {
    if (this.state.currentElementId === -1) {
      return;
    }

    var elements = this.state.elements;
    var elementId = this.state.currentElementId;

    // Don't delete test elements.
    if (parseInt(elementId, 10) <= 3) {
      return window.alert('This is a test element and cannot be deleted.');
    }

    var newlyCreated = elements[elementId].newlyCreated;
    delete elements[elementId];

    this.setState({
      elements: elements,
      currentElementId: -1
    }, function() {
      this.queueEdit(elementId, newlyCreated);
    });
  }
});

// Render!
render(Page);
