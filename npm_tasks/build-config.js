var habitat = require('habitat');
var path = require('path');
var fs = require('fs');

var defaultPath = path.join(__dirname, '../config/defaults.env');
var prodPath = path.join(__dirname, '../config/production.env');

function fileErrors() {
  process.stderr.write(
    'Looks like there is a problem with your config paths.\n' +
    'See npm_tasks/build-config.js\n'
  );
  process.exit(1);
}

// Check paths to make sure they exist
try {
  if (!fs.statSync(defaultPath).isFile() || !fs.statSync(defaultPath)) {
    fileErrors();
  }
} catch (e) {
  fileErrors();
}

// Local environment in .env overwrites everything else
habitat.load('.env');

var environment = habitat.get('NODE_ENV', '').toLowerCase();


if (environment === 'production') {
  habitat.load(prodPath);
}

habitat.load(defaultPath);

var config = {
  CLIENT_ID: habitat.get('CLIENT_ID'),
  API_URI: habitat.get('API_URI'),
  LOGIN_URI: habitat.get('LOGIN_URI')
};

process.stdout.write(
  '// THIS IS A GENERATED FILE. EDIT npm_tasks/build-config.js INSTEAD\n' +
  'module.exports = ' + JSON.stringify(config) + ';\n'
);
