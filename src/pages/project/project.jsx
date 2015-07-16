//
// WARNING: ********************************************************************
//   Changes to this page may need to be made in webmaker-browser's "player.jsx"
//   Make as few updates to this file as possible!
//   Try to use external shared mixins/components instead.
// *****************************************************************************
//

var React = require('react/addons');

var {parseJSON} = require('../../lib/jsonUtils');
var render = require('../../lib/render.jsx');
var dispatcher = require('../../lib/dispatcher');

var Loading = require('../../components/loading/loading.jsx');
var {Menu, PrimaryButton, FullWidthButton} = require('../../components/action-menu/action-menu.jsx');
var PageBlock = require("./pageblock.jsx");
var DPad = require('../../components/d-pad/d-pad.jsx');

var Project = React.createClass({
  mixins: [
    require('../../lib/router'),
    require('./transforms'),
    require('./remix'),
    require('./cartzoom'),
    require('./pageadmin'),
    require('./loader'),
    require('./setdestination'),
    require('./renderhelpers'),
    require('react-intl').IntlMixin,
    require('./dpad-logic')
  ],

  getInitialState: function () {
    return {
      loading: true,
      selectedEl: '',
      pages: [],
      camera: {},
      zoom: Project.DEFAULT_ZOOM,
      isPageZoomed: false
    };
  },

  componentWillMount: function () {
    this.load();
  },

  componentDidUpdate: function (prevProps) {
    if (this.props.isVisible && !prevProps.isVisible) {
      this.load();
    }

    if (this.state.isPageZoomed) {
      dispatcher.fire('enableLinks');
    } else {
      dispatcher.fire('disableLinks');
    }

    if (window.Platform) {
      window.Platform.setMemStorage('state', JSON.stringify(this.state));
    }
  },

  componentDidMount: function () {
    if (window.Platform) {
      var state = window.Platform.getMemStorage('state');
      if (this.state.params.mode === 'edit') {
        state = parseJSON(state);
        if (state.params && state.params.project === this.state.params.project) {
          this.setState({
            selectedEl: state.selectedEl,
            camera: state.camera,
            zoom: state.zoom
          });
        }
      }
    }
  },

  formPages: function() {
    return this.state.pages.map((page) => {
      var props = {
        page,
        selected: page.id === this.state.selectedEl,
        source: page.id === this.state.sourcePageID,
        target: page.id === this.state.selectedEl && this.state.params.mode === 'link',
        transform: this.cartesian.getTransform(page.coords),
        interactive: this.state.isPageZoomed,
        onClick: this.onPageClick.bind(this, page)
      };
      return <PageBlock {...props} />;
    });
  },

  render: function () {
    // FIXME: TODO: this should be handled with a touch preventDefault,
    //              not by reaching into a DOM element.
    //
    // Prevent pull to refresh
    // FIXME: TODO: This should be done by preventDefaulting the touch event, not via CSS.
    document.body.style.overflowY = 'hidden';
    var mode = this.state.params.mode;
    var isPlayOnly = (mode === 'play' || mode === 'link');
    return (
      <div id="map" className={this.state.params.mode}>
        <DPad
          ref="dpad"
          onDirectionClick={ this.handleDirectionClick }
          isVisible={ this.state.isPageZoomed }>
        </DPad>

        <div ref="bounding" className="bounding" style={ this.getBoundingStyle() }>
          <div className="test-container" style={ this.getContainerStyle() }>
          { this.formPages() }
          { this.generateAddContainers(isPlayOnly) }
          </div>
        </div>

        <Menu fullWidth={this.state.params.mode === 'link'}>
          { this.getRemovePageButton(isPlayOnly) }
          <PrimaryButton url={ this.getPageURL(this.state.params, this.state.selectedEl) } off={isPlayOnly || !this.state.selectedEl} href="/pages/page" icon="../../img/pencil.svg" />
          <PrimaryButton onClick={this.zoomFromPage} off={!this.state.isPageZoomed} icon="../../img/zoom-out.svg" />
          <FullWidthButton onClick={this.setDestination} off={this.state.params.mode !== 'link' || !this.state.selectedEl}>Set Destination</FullWidthButton>
        </Menu>

        <Loading on={this.state.loading} />
      </div>
    );
  }
});

render(Project);
