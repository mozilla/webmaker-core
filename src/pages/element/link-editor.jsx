var React = require('react');
var LinkedStateMixin = require('react-addons-linked-state-mixin');
var LinkBlock = require('../../components/basic-element/types/link.jsx');
var ColorGroup = require('../../components/color-group/color-group.jsx');
var Slider = require('../../components/range/range.jsx');
var api = require('../../lib/api');
var platform = require('../../lib/platform');
var types = require('../../components/basic-element/basic-element.jsx').types;
var dispatcher = require('../../lib/dispatcher');

// var backgroundColors = ['#9FD0E0', '#99CA47', '#EFC246', '#E06A2C', '#69A0FC', '#8173E4'];
var textColors = ['#FFF', '#99CA47', '#EFC246', '#E06A2C', '#69A0FC', '#8173E4'];

var LinkEditor = React.createClass({
  mixins: [
    LinkedStateMixin,
    require('./witheditable'),
    require('./font-selector'),
    require('react-intl').IntlMixin
  ],
  getInitialState: function () {
    return LinkBlock.spec.flatten(this.props.element, {defaults: true});
  },
  componentDidUpdate: function (prevProps, prevState) {
    var state = this.state;

    // Update state if parent properties change
    if (this.props.element !== prevProps.element) {
      state = this.getInitialState();
      this.setState(state);
    }

    // Cache edits if internal state changes
    if (this.state !== prevState) {
      this.props.cacheEdits(state);
    }

  },
  gotoSetLinkDest: function (type) {
    var expanded = types.link.spec.expand(this.state);

    var metadata = {
      elementID: this.props.params.element,
      linkState: this.state,
      pageID: this.props.params.page,
      projectID: this.props.params.project,
      userID: this.props.params.user
    };

    var java = platform.getAPI();

    if(java) {
      java.queue("link-element", JSON.stringify({
        data: expanded,
        metadata: metadata
      }));

      if (type === `page`) {
        platform.setView(
          `/users/${this.props.params.user}/projects/${this.props.params.project}/link`,
          JSON.stringify(metadata)
        );
      } else if (type === `web-link`) {
        platform.setView(`/web-link`);
      }
    } else {
      console.warn(`This feature only works on Android.`);
    }
  },
  onDestClick: function () {
    dispatcher.fire('modal-confirm:show', {
      config: {
        buttons: [
          {
            text: this.getIntlMessage('dest_btn_page'),
            callback: () => {
              this.gotoSetLinkDest(`page`);
            }
          }, {
            text: this.getIntlMessage('dest_btn_web'),
            callback: () => {
              this.gotoSetLinkDest(`web-link`);
            }
          }
        ],
        header: this.getIntlMessage('link_header'),
        body: this.getIntlMessage('link_editor_help'),
        icon: 'tinker.png'
      }
    });
  },
  render: function () {
    return (
      <div id="link-editor" className="editor" onClick={this.stopEditing}>
        <div className="editor-preview">
          <div className="el el-link">
            <LinkBlock {...this.state} ref="element" active={true} updateText={this.updateText} setEditMode={this.setEditing} />
          </div>
        </div>
        <div className="editor-options">
          <div className="editor-scroll">
            <div className="form-group">
              <button className="btn btn-block" onClick={this.editText}>{ this.state.editing? this.getIntlMessage('done') : this.getIntlMessage('edit_label')}</button>
            </div>
            <div className="form-group">
              <button onClick={this.onDestClick} className="btn btn-block">
                <img className="icon" src="../../img/flag.svg" /> {this.state.targetPageId ? this.getIntlMessage('change_link_dest') : this.getIntlMessage('set_link_dest')}
              </button>
            </div>
            <div className="form-group">
              <label>{this.getIntlMessage('Font')}</label>
              { this.generateFontSelector() }
            </div>
            <div className="form-group">
              <label>{this.getIntlMessage('text_color')}</label>
              <ColorGroup id="color" linkState={this.linkState} colors={textColors} params={this.props.params} onLaunchTinker={this.props.save}/>
            </div>
            <div className="form-group">
              <label>{this.getIntlMessage('background_color')}</label>
              <ColorGroup id="backgroundColor" linkState={this.linkState} params={this.props.params} onLaunchTinker={this.props.save}/>
            </div>
            <div className="form-group">
              <label>{this.getIntlMessage('corner_radius')}</label>
              <Slider id="borderRadius" min={0} value={this.state.borderRadius} max={32} unit="px" linkState={this.linkState} />
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = LinkEditor;
