var xhr = require('xhr');
var defaults = require('lodash.defaults');
var assign = require('object-assign');

var config = require('../config');
var dispatcher = require('./dispatcher');
var platform = require('./platform');
var router = require('./router');
var {jsonToFormEncoded, parseJSON} = require('./jsonUtils');

function api(options, callback) {

  // Set default options
  defaults(options, {
    spinOnLag: true,
    acceptableLag: 1000, // in MS
    method: 'GET',
    useCache: false,
    json: {},
    headers: {},
    timeout: 60000 // 60 seconds
  });

  // ensure user-supplied methods conform to what we need.
  options.method = options.method.toUpperCase();

  if (options.method === 'GET' && !callback) {
    // Signal an error, but don't throw, as that would crash the app:
    console.error('API request for stored data received without a callback handler to forward the data with.');
    console.trace();
    return;
  }

  // Use URI and prepend the API host
  if (typeof options.url !== 'undefined') {
    options.uri = options.url;
    delete options.url;
  }
  options.uri = api.BASE_URI + options.uri;

  // Use a fake token for now
  if (options.method !== 'GET') {
    options.headers.Authorization = 'token ' + router.getUserSession().token;
  }

  // Caching
  var key = 'cache::' + options.method + '::' + options.uri;
  if (options.useCache === true && options.method === 'GET') {
    console.log('Fetching from cache "' + key + '"');
    var hit = platform.getMemStorage(key, true);
    if (typeof hit === 'string') {
      return callback(null, JSON.parse(hit));
    }
  }

  var lagTimer = setTimeout(() => {
    if (options.spinOnLag) {
      dispatcher.fire('apiLagging');
    }
  }, options.acceptableLag);

  // XHR request
  xhr(options, function (err, res, body) {
    clearTimeout(lagTimer);
    dispatcher.fire('apiCallFinished');

    if (err && callback) {
      return callback(err);
    }

    // 'err' is used to signal library errors, not network errors,
    // so we also need ot make sure to check what the network status
    // code was, before we can assume everything worked fine:
    var statusCode = parseInt(res.statusCode, 10);
    if (statusCode >= 400 && callback) {
      try {
        var errorObj = JSON.parse(body);
        return callback(errorObj);
      } catch (e) {
        return callback({
          error: 'A network error occurred',
          statusCode: statusCode
        });
      }
    }

    // Set cache
    platform.setMemStorage(key, JSON.stringify(body), true);

    // If there is a callback, forward the response body
    if (callback) {
      callback(false, body);
    }
  });
}

api.BASE_URI = config.API_URI;
api.BASE_LOGIN_URI = config.LOGIN_URI;

api.AUTHENTICATE_URI = api.BASE_LOGIN_URI + '/login/oauth/access_token';
api.SIGN_UP_URI = api.BASE_LOGIN_URI + '/create-user';
api.USER_URI = api.BASE_LOGIN_URI + '/user';

api.ERROR_MESSAGES = {
  offline_sign_in: 'Please connect to the Internet to sign in.',
  login_cant_connect: 'There was a problem connecting to the login server.',
  wrong_username_password: 'There was a problem with your username or password.',
  login_server_problem: 'Looks like there was a problem with the login server.',
  offline_sign_up: 'We need an Internet connection to create an account.'
};

api.requiredOptions = function (options, requiredFields) {

  requiredFields = requiredFields || [];

  if (!options) {
    throw new Error(`You must supply an options object as the first parameter.`);
  }

  requiredFields.forEach((field) => {
    if (typeof options[field] === 'undefined') {
      throw new Error(`${field} must be included in options`);
    }
  });
};

api.requiredCallback = function (callback) {
  if (typeof callback !== 'function') {
    throw new Error(`You must supply a callback as the second parameter`);
  }
};

api.createErrorResponse = function (err, resp, body) {
  var message = null;
  if (err || resp.statusCode !== 200) {
    message = parseJSON(body);
    message.statusCode = resp.statusCode;
  }
  return message;
};

// #authenticate (object options, function callback)
//
// Given a username and password in options.json,
// calls callback with error if authentication attempt failed, or user data and token if it succeeded
// e.g.
// options.json:
//      uid: 'keito',
//      password: f00123d,
// callback (err, data)
//    err =>
//      null or {message: 'Some error'}
//    data =>
//      token: 'foo123dasd'
//      user: {username: 'keito', ...}
api.authenticate = function (options, callback) {
  if (!options) {
    return callback(new Error('You must supply options.json to login'));
  }

  // Check offline status
  if (!platform.isNetworkAvailable()) {
    return callback({
      statusCode: 0,
      message: api.ERROR_MESSAGES.offline_sign_in
    });
  }

  // Add in other required fields
  var json = assign({
    client_id: config.CLIENT_ID,
    grant_type: 'password',
    scopes: 'user projects'
  }, options.json);

  xhr({
    method: 'POST',
    uri: api.AUTHENTICATE_URI,
    body: jsonToFormEncoded(json),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }, function (err, resp, body) {

    body = parseJSON(body);

    // There was an XMLHTTPRequest error, which could mean:
    // 1. we are offline
    // 2. CORS issues
    // 3. the server is down
    if (err || resp.statusCode === 0) {
      return callback({
        statusCode: resp.statusCode,
        error: err,
        message: api.ERROR_MESSAGES.login_cant_connect
      });
    }

    // 400 errors indicate a problem with credentials,
    // such as a wrong password or username
    else if (resp.statusCode >= 400 && resp.statusCode < 500) {
      return callback({
        statusCode: resp.statusCode,
        message: api.ERROR_MESSAGES.wrong_username_password
      });
    }

    // Any other errors are probably a server problem (i.e. 500)
    // We may get a response that is useful but is more likely
    // not understandable by the user
    else if (resp.statusCode !== 200) {
      return callback({
        statusCode: resp.statusCode,
        message: api.ERROR_MESSAGES.login_server_problem,
        error: body
      });
    }

    var token = body.access_token;

    // If we provided a user object already, just return it with the token
    if (options.user) {
      return callback(null, {token, user: options.user});
    }

    // Assuming the request was successful, get user info
    xhr({
      method: 'GET',
      uri: api.USER_URI,
      headers: {
        Authorization: 'token ' + token
      }
    }, function (err, resp, body) {

      body = parseJSON(body);

      // There was an XMLHTTPRequest error, which could mean:
      // 1. we are offline
      // 2. CORS issues
      // 3. the server is down
      if (err || resp.statusCode === 0) {
        return callback({
          statusCode: resp.statusCode,
          error: err,
          message: api.ERROR_MESSAGES.login_cant_connect
        });
      }

      if (resp.statusCode !== 200) {
        return callback(body);
      }

      callback(null, {token, user: body});
    });
  });

};

// #signUp (object options, function callback)
//
// Given a username, email, password, and feedback options.json,
// attempts to create a user account and get a valid token.
// If the attempt fails, calls callback with an error
// If it succeeds, returns a user session object with token and user data
// e.g.
// options.json:
//      username: 'keito',
//      email: 'keito@blah.com'
//      password: f00123d,
// callback (err, data)
//    err =>
//      null or {message: 'Some error'}
//    data =>
//      token: 'foo123dasd'
//      user: {username: 'keito', ...}
api.signUp = function (options, callback) {
  if (!options) {
    return callback(new Error('You must supply options.json to sign up'));
  }

  // Check offline status
  if (!platform.isNetworkAvailable()) {
    return callback({
      statusCode: 0,
      message: api.ERROR_MESSAGES.offline_sign_up
    });
  }

  var json = assign({
    client_id: config.CLIENT_ID
  }, options.json);

  xhr({
    method: 'POST',
    uri: api.SIGN_UP_URI,
    body: jsonToFormEncoded(json),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }, function (err, resp, body) {

    body = parseJSON(body);

    // There was an XMLHTTPRequest error, which could mean:
    // 1. we are offline
    // 2. CORS issues
    // 3. the server is down
    if (err || resp.statusCode === 0) {
      return callback({
        statusCode: resp.statusCode,
        error: err,
        message: api.ERROR_MESSAGES.login_cant_connect
      });
    }

    // 400 errors should be passed to the user
    else if (resp.statusCode >= 400 && resp.statusCode < 500) {
      return callback(body);
    }

    // 500 responses are probably not the user's fault
    // and likely not user-readable
    else if (resp.statusCode !== 200) {
      return callback({
        statusCode: resp.statusCode,
        message: api.ERROR_MESSAGES.login_server_problem,
        error: body
      });
    }

    // Cool, let's authenticate now
    api.authenticate({
      user: body,
      json: {
        uid: body.username,
        password: json.password
      }
    }, callback);
  });
};

/**
 * [getElement Retrieves an element from the db]
 * @param  {Object}   options  Should include ids for: user, project, page, and element
 * @param  {Function} callback Called with two params, err and data,
 *                             where err.message is a descriptive error message if an error occured,
 *                             or data is an object representing the element.
 */
api.getElement = function (options, callback) {
  api.requiredOptions(options, ['user', 'project', 'page', 'element']);
  api.requiredCallback(callback);
  var uri = `${api.BASE_URI}/users/${options.user}/projects/${options.project}/pages/${options.page}/elements/${options.element}`;
  if(options.element == '0'){
    uri = `${api.BASE_URI}/users/${options.user}/projects/${options.project}/pages/${options.page}`;
  }
  xhr({
    method: 'GET',
    uri
  }, function (err, resp, body) {
    var element = parseJSON(body).element || parseJSON(body).page;
    if(parseJSON(body).page){
      element.type = "page";
    }
    callback(api.createErrorResponse(err, resp, body), element);
  });
};

api.updateElement = function (options, callback) {
  api.requiredOptions(options, ['user', 'project', 'page', 'element', 'json']);
  api.requiredCallback(callback);
  var uri = `${api.BASE_URI}/users/${options.user}/projects/${options.project}/pages/${options.page}/elements/${options.element}`;
  if(options.element == '0'){
    uri = `${api.BASE_URI}/users/${options.user}/projects/${options.project}/pages/${options.page}`;
  }
  xhr({
    method: 'PATCH',
    uri,
    json: options.json,
    headers: {
      Authorization: 'token ' + router.getUserSession().token
    }
  }, function (err, resp, body) {
    callback(api.createErrorResponse(err, resp, body), parseJSON(body).element);
  });
};

module.exports = api;
