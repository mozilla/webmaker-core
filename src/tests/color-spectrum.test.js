var should = require('should');
var React = require('react');

// Polyfill Intl for node -- some versions (>=10) don't support the Intl API
var areIntlLocalesSupported = require('intl-locales-supported');
var localesMyAppSupports = ['en-US'];
if (global.Intl) {
  if (!areIntlLocalesSupported(localesMyAppSupports)) {
    require('intl');
    Intl.NumberFormat   = IntlPolyfill.NumberFormat;
    Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;
  }
} else {
  global.Intl = require('intl');
}

var ColorSpectrum = require('../components/color-spectrum/color-spectrum.jsx');

describe('ColorSpectrum', function() {
  describe("getColor()", function() {
    var getColor = ColorSpectrum.prototype.getColor;

    it('returns color if it is well-formed', function() {
      getColor('rgba(255, 0, 0, 0)', 'rgba(0, 0, 0, 0)').rgbaString()
        .should.eql('rgba(255, 0, 0, 0)');
    });

    it('returns default color if color is malformed', function() {
      getColor('aweg', 'rgba(0, 0, 0, 0)').rgbaString()
        .should.eql('rgba(0, 0, 0, 0)');
    });
  });
});
