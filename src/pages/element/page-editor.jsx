var React = require('react');
var LinkedStateMixin = require('react-addons-linked-state-mixin');
var ColorGroup = require('../../components/color-group/color-group.jsx');

var colorChoices = ["#f2f6fc","#484B50","#6D7886","#98CC3B","#E26A1F","#8173E4"];

var PageEditor = React.createClass({
  mixins: [
    LinkedStateMixin,
    require('react-intl').IntlMixin
  ],
  getInitialState: function () {
    return {
      type: "page",
      backgroundColor: this.props.element.styles.backgroundColor || '#f2f6fc'
    };
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
  componentWillMount: function () {
  },
  render: function () {
    return (
      <div id="page-editor" className="editor">
        <div className="editor-preview" style={{backgroundColor: this.state.backgroundColor}}>
        </div>
        <div className="editor-options">
          <div className="editor-scroll">
            <div className="form-group">
              <label>{this.getIntlMessage('background_color')}</label>
              <ColorGroup id="backgroundColor" linkState={this.linkState} colors={colorChoices} params={this.props.params} onLaunchTinker={this.props.save} />
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = PageEditor;
