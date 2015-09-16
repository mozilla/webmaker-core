var React = require('react/addons');

var LinkBlock = require('../../components/basic-element/types/link.jsx');
var ColorGroup = require('../../components/color-group/color-group.jsx');
var Slider = require('../../components/range/range.jsx');
var api = require('../../lib/api');
var platform = require('../../lib/platform');
var types = require('../../components/basic-element/basic-element.jsx').types;

var LinkEditor = React.createClass({
  mixins: [
    React.addons.LinkedStateMixin,
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
  onDestClick: function () {
    var expanded = types.link.spec.expand(this.state);

    var metadata = {
      elementID: this.props.params.element,
      linkState: this.state,
      pageID: this.props.params.page,
      projectID: this.props.params.project,
      userID: this.props.params.user
    };

    var handler = (err, data) => {
      if (err) {
        console.error('There was an error updating the element', err);
      }
      var pickerView = `/users/${this.props.params.user}/projects/${this.props.params.project}/link`;
      platform.changeViewWithRouteData(pickerView, JSON.stringify(metadata));
    };

    var java = platform.getAPI();

    if(java) {
      java.queue("link-element", JSON.stringify({
        data: expanded,
        metadata: metadata
      }));
      handler();
    }

    else {
      api({
        method: 'patch',
        uri: `/users/${metadata.userID}/projects/${metadata.projectID}/pages/${metadata.pageID}/elements/${metadata.elementID}`,
        json: {
          attributes: expanded.attributes,
          styles: expanded.styles
        }
      }, handler);
    }
  },
  render: function () {
    return (
      <div id="editor" onClick={this.stopEditing}>
        <div className="editor-preview">
          <div className="el el-link">
            <LinkBlock {...this.state} ref="element" active={true} updateText={this.updateText} setEditMode={this.setEditing} />
          </div>
        </div>
        <div className="editor-options">
          <div className="form-group">
            <button className="btn btn-block" onClick={this.editText}>{ this.state.editing? this.getIntlMessage('done') : this.getIntlMessage('edit_label')}</button>
          </div>
          <div className="form-group">
            <button onClick={this.onDestClick} className="btn btn-block">
              <img className="icon" src="../../img/flag.svg" /> {this.state.targetPageId ? this.getIntlMessage('change_link_dest') : this.getIntlMessage('set_link_dest')}
            </button>
          </div>
          <div className="form-group">
            <label>{this.getIntlMessage('corner_radius')}</label>
            <Slider id="borderRadius" min={0} value={this.state.borderRadius} max={32} unit="px" linkState={this.linkState} />
          </div>
          <div className="form-group">
            <label>{this.getIntlMessage('Font')}</label>
            { this.generateFontSelector() }
          </div>
          <div className="form-group">
            <label>{this.getIntlMessage('background_color')}</label>
            <ColorGroup id="backgroundColor" linkState={this.linkState} params={this.props.params} onLaunchTinker={this.props.save}/>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = LinkEditor;
