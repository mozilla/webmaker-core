var React = require('react');
var assign = require('object-assign');

module.exports = {
  getInitialState: function() {
    return {
      initialload: true,
      editing: false,
      focussed: false
    };
  },

  componentWillMount: function() {
    // These are two values that are used to work around Android's
    // remarkable way of handling text resume via the software keyboard.
    // Without these, a first-time-focussed text input will have its
    // content duplicated and it is rather entirely unclear as to why.
    //
    // See https://github.com/mozilla/webmaker-android/issues/2050 for more details.
    this._content = false;
    this._replaced = false;
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (this.refs.input) {
      this.resizeInput();
      var el = this.refs.input;
      el.focus();

      // we only want to put the cursor at the end on the very first
      // editing action.
      if (!this.state.focussed) {
        if (typeof el.selectionStart === "number") {
          el.selectionStart = el.selectionEnd = el.value.length;
        } else if (typeof el.createTextRange !== "undefined") {
          var range = el.createTextRange();
          range.collapse(false);
          range.select();
        }
        this.setState({
          focussed: true
        });
      }

    } else {
      if (this.state.initialload) {
        this.setState({
          initialload: false
        });
      }
    }
  },

  resizeInput: function() {
    if (this.refs.input) {
      var input = this.refs.input;
      var sizer = this.refs.sizer;
      sizer.textContent = input.value;
      setTimeout(function() {
        if (sizer.scrollWidth > 5) {
          input.style.width = sizer.scrollWidth + "px";
        }
      }, 1);
    }
  },

  formInputStyle: function(style) {
    var inputStyle = assign({}, style);
    assign(inputStyle, {
      display: "inline-block",
      background: "transparent",
      border: "none",
      height: "100%",
      whiteSpace: "pre"
    });
    return inputStyle;
  },

  makeEditable: function(content, style) {
    if (!this.state.editing) {
      return content;
    }

    // part of the android keyboard string duplication workaround
    this._content = content;

    var inputStyle = this.formInputStyle(style);
    assign(inputStyle, {
      maxWidth: "100%"
    });

    var sizerstyle = assign({}, inputStyle);
    assign(sizerstyle, {
      opacity: 0,
      visibility: "hidden",
      background: "transparent",
      color: "transparent",
      zIndex: -1,
      width: "auto",
      height: "auto",
      position: "fixed",
      padding: "0"
    });

    if(this.refs.sizer) {
      var sizer = this.refs.sizer;
      inputStyle.width = sizer.scrollWidth;
      inputStyle.padding = 0;
    }

    return [
      this.state.initialload ? false : <input ref="input" style={inputStyle} hidden={this.state.initialload} onClick={this.killEvent} onKeyDown={this.checkForStop} onChange={this.onTextUpdate} value={content} />,
      <span ref="sizer" style={this.state.initialload ? inputStyle : sizerstyle}>{ content }</span>
    ];
  },

  // start editing, but only if we were built with the "activate" property
  activate: function() {
    if (this.props.active) {
      this.startEditing();
    }
  },

  // prevent this click from going up to the owning element(s)
  killEvent: function(evt) {
    evt.stopPropagation();
  },

  // if we see code 13, commit the text (enter code)
  checkForStop: function(evt) {
    if(evt.keyCode===13) {
      this.stopEditing();
    }
  },

  // send our current value up to our parent for handling
  onTextUpdate: function(evt) {
    this.resizeInput();
    var value = evt.target.value;
    //
    // The followin code "solves" a string duplication bug in Android when
    // typing with the cursor placed at the end of an input element.
    //
    // See https://github.com/mozilla/webmaker-android/issues/2050 for more details.
    if(!this._replaced && window.Platform) {
      value = this._content + value.slice(-1);
      this._replaced = true;
    }
    this.props.updateText(value);
  },

  // public API: "flip between editing/not editing"
  toggleEditing: function() {
    this.setState({
      editing: !this.state.editing,
      focussed: (this.state.editing ? false : this.state.focussed)
    }, function() {
      this.props.setEditMode(this.state.editing);
      if(!this.state.editing) {
        this.onTextUpdate({
          target: {
            value: this.props.innerHTML
          }
        });
      }
    });
  },

  // public API: "start editing"
  startEditing: function() {
    if (!this.state.editing) {
      this.toggleEditing();
    }
  },

  // public API: "stop editing"
  stopEditing: function() {
    if (this.state.editing) {
      this.toggleEditing();
    }
  }
};
