//
// WARNING: ********************************************************************
//   Changes to this page may need to be made in webmaker-browser's "player.jsx"
//   Make as few updates to this file as possible!
//   Try to use external shared mixins/components instead.
// *****************************************************************************
//

var React = require('react');

var {parseJSON} = require('../../lib/jsonUtils');
var render = require('../../lib/render.jsx');

var Loading = require('../../components/loading/loading.jsx');
var {Menu, PrimaryButton, SecondaryButton, FullWidthButton} = require('../../components/action-menu/action-menu.jsx');
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
    require('./dpad-logic'),
    require('./form-pages')
  ],

  getInitialState: function () {
    return {
      loading: true,
      selectedEl: '',
      pages: [],
      matrix: [Project.DEFAULT_ZOOM, 0, 0, Project.DEFAULT_ZOOM, 0, 0 ],
      isPageZoomed: false,
      isFirstLoad: true
    };
  },

  componentWillMount: function () {
    this.load();
  },

  componentDidUpdate: function (prevProps) {
    if (this.props.isVisible && !prevProps.isVisible) {
      this.load();
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
            matrix: state.matrix
          });
        }
      }
    }
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
      <div ref="map" id="map" className={this.state.params.mode}>
        <DPad
          ref="dpad"
          onDirectionClick={ this.handleDirectionClick }
          isVisible={ this.state.isPageZoomed }>
        </DPad>

        <button ref="btnZoomOut" className={'btn-zoom-out' + (this.state.isPageZoomed ? '' : ' hidden') } onClick={this.zoomFromPage} />

        <div ref="bounding" className="bounding" style={ this.getBoundingStyle() }>
          <div className="test-container" style={ this.getContainerStyle() }>
          { this.formPages() }
          { this.generateAddContainers(isPlayOnly) }
          </div>
        </div>

        <Menu fullWidth={this.state.params.mode === 'link'}>
          <SecondaryButton side="left" onClick={this.zoomFromPage} off={this.state.params.mode !== 'edit' || !this.state.matrix || this.state.matrix[0] < 1} icon="../../img/zoom-out-blue.svg" />
          <PrimaryButton url={ this.getPageURL(this.state.params, this.state.selectedEl) } off={isPlayOnly || !this.state.selectedEl} href="/pages/page" icon="../../img/pencil.svg" />
          <SecondaryButton side="left" off={isPlayOnly || !this.state.selectedEl || this.state.pages.length <= 1} onClick={this.removePage} icon="../../img/trash.svg" />
          <SecondaryButton side="right" off={isPlayOnly || !this.state.selectedEl } url={ this.getPageURL(this.state.params, this.state.selectedEl) + '/elements/0/editor/page'} icon="../../img/palette-icon.svg" />
          <FullWidthButton onClick={this.setDestination} off={this.state.params.mode !== 'link' || !this.state.selectedEl}>Set Destination</FullWidthButton>
        </Menu>

        <Loading on={this.state.loading} />
      </div>
    );
  }
});

render(Project);
