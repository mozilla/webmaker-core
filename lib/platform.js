/**
 * Device agnostic platform interface.
 *
 * @package core
 * @author Andrew Sliwinski <a@mozillafoundation.org>
 */

var lru = require('lru');
var storage = require('localforage');

/**
 * Constructor
 */
function Platform () {
  // Check to see if window.Platform exists. If it does, return it.
  if (window.Platform) {
    this = window.Platform;
    return;
  }

  // Init storage objects
  this.sharedStorage = storage;
  this.memStorage = lru(50);
  this.sessionKey = 'WEBMAKER_SESSION';
}

// -----------------------------------------------------------------------------
// Persistent storage
// -----------------------------------------------------------------------------

Platform.prototype.getSharedPreferences = function(key) {
  return this.sharedStorage.getItem(key);
};

Platform.prototype.setSharedPreferences = function(key, value) {
  return this.sharedStorage.setItem(key, value);
};

Platform.prototype.resetSharedPreferences = function() {
  return this.sharedStorage.clear();
};

// -----------------------------------------------------------------------------
// Session storage
// -----------------------------------------------------------------------------

Platform.prototype.getUserSession = function() {
  return this.getSharedPreferences(this.sessionKey);
};

Platform.prototype.setUserSession = function(data) {
  return this.setUserSession(this.sessionKey, data);
};

Platform.prototype.clearUserSession = function() {
  return this.setUserSession(this.sessionKey, null);
};

// -----------------------------------------------------------------------------
// Memory (LRU) storage
// -----------------------------------------------------------------------------

Platform.prototype.getMemStorage = function(key) {
  return this.memStorage.get(key);
};

Platform.prototype.setMemStorage = function(key, value) {
  return this.memStorage.set(key, value);
};

module.exports = new Platform();
