var React = require('react');
var Slider = require('../../components/range/range.jsx');
var Color = require('color');

var HSV = React.createClass({
  getBackgroundColor: function () {
    //This works around a bug with Color.clone() not creating an exact match
    var color = new Color().hsl(this.props.color.hsl());
    color.hsl(color.hue(), 100, 50);
    return color.rgbaString();
  },
  getSaturationValuePosition: function () {
    var hsv = this.props.color.hsv();
    //This will always jump to the left when the value hits zero, but preventing that would require managing the previous color state
    return {
      top: `${100 - hsv.v}%`,
      left: `${hsv.s}%`
    };
  },
  changeHue: function (e) {
    var color = this.props.color;
    color.hue(e.target.value);
    this.props.onChange(color);
  },
  changeSaturationValue: function (e) {
    var color = this.props.color;

    var x = e.touches[0].clientX - this.bounding.left;
    var y = e.touches[0].clientY - this.bounding.top;

    color.hsv(color.hue(), 100 * x / this.bounding.width, 100 - (100 * y / this.bounding.height));
    this.props.onChange(color);
  },
  onTouchStart: function(e) {
    e.preventDefault();
    this.bounding = this.refs.saturationValue.getBoundingClientRect();
    this.changeSaturationValue(e);
  },
  onTouchMove: function (e) {
    this.changeSaturationValue(e);
  },
  render: function () {

    return (<div className="spectrum-container">
      <div className="spectrum-left">
        <div ref="saturationValue" className="saturation" style={{backgroundColor: this.getBackgroundColor()}} onTouchStart={this.onTouchStart} onTouchMove={this.onTouchMove}>
          <div className="saturation-white" />
          <div className="saturation-black" />
          <div ref="marker" className="sl-marker" style={this.getSaturationValuePosition()}/>
        </div>
        <input value={this.props.color.hue()} min={0} max={359} className="hue" type="range" orient="vertical" onChange={this.changeHue} />
      </div>
      <div className="spectrum-right" />
    </div>);
  }
});

var Alpha = React.createClass({
  onChangeAlpha: function (alpha) {
    var color = this.props.color;
    color.alpha(alpha);
    this.props.onChange(color);
  },
  render: function () {
    return (<div>
      <Slider value={this.props.color.alpha()} max={1} step={0.01} onChange={this.onChangeAlpha} />
    </div>);
  }
});

var RGB = React.createClass({
  mixins: [require('react-intl').IntlMixin],
  generateOnChangeCallback: function (label) {
    return (value) => {
      var color = this.props.color;
      color[label](value);
      this.props.onChange(color);
    };
  },
  render: function () {
    return (<div>
      {['Red', 'Green', 'Blue'].map((label, i) => {
        var lowercaseLabel = label.toLowerCase();
        var currentValue = this.props.color[lowercaseLabel]();
        return (<div key={label} className="form-group">
          <label>{this.getIntlMessage(label)}</label>
          <Slider value={currentValue} max={255} onChange={this.generateOnChangeCallback(lowercaseLabel)} />
        </div>);
      })}
    </div>);
  }
});

var ColorSpectrum = React.createClass({
  mixins: [require('react-intl').IntlMixin],
  getDefaultProps: function() {
    return {
      defaultColor: 'rgba(0, 0, 0, 0)'
    };
  },
  updateColor: function (color) {
    //This was formally normalized to RGBA, but that caused problems with shades of gray not triggering UI hue updates
    this.props.onChange(color);
  },
  getColor: function(color, defaultColor) {
    // Convert raw color value to a Color instance
    // This way we can convert any format to hsb/rgba as needed
    try {
      return Color(color);
    } catch (e) {
      // Our color was malformed or otherwise unspecified, so
      // fall back to the default color.
      return Color(defaultColor);
    }
  },
  render: function () {
    var color = this.getColor(this.props.color, this.props.defaultColor);

    return (<div>
      <div className="form-group" hidden={!this.props.HSB}>
        <HSV color={color} onChange={this.updateColor} />
      </div>
      <div className="form-group" hidden={!this.props.RGB}>
        <RGB color={color} onChange={this.updateColor} />
      </div>
      <div className="form-group" hidden={!this.props.Alpha}>
        <label>{this.getIntlMessage('Opacity')}</label>
        <Alpha color={color} onChange={this.updateColor} />
      </div>
    </div>);
  }
});

module.exports = ColorSpectrum;
