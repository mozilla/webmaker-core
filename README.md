# webmaker-core

[![Build Status](https://travis-ci.org/mozilla/webmaker-core.svg)](https://travis-ci.org/mozilla/webmaker-core)

`webmaker-core` is the React based core for the Webmaker app. It's a series of webviews that are integrated into the various platforms running Webmaker (currently: [Android](https://github.com/mozilla/webmaker-android), [Browser](https://github.com/mozilla/webmaker-browser)).

## Installation

```bash
git clone https://github.com/mozilla/webmaker-core.git
npm install
```

## Running the core

For local development, you'll begin by running `npm start`, which will compile the core, watch for and recompile changed code, and run a local webserver where you can view changes.

## Usage with a platform

Although `webmaker-core` can run stand-alone, you're typically going to run it as a core dependency of a parent application (aka "platform"). Running stand-alone will have very limited functionality as much of the functionality is delegated to the parent platform (eg: changing views, persistence, device APIs).

### Create a linkage

In order to do local development, you'll need to `npm link` this package so that as you make updates they are reflected in the app you're working on. To do this, run `npm link` in the root of this project. Next, go into the repo for the platform that will consume it (eg: `webmaker-android`) and run `npm link webmaker-core`.

## Adding New Pages or Components

There are a few standards to bear in mind when adding new pages or components to the project.

Components are added to the `src/components` directory. Pages are added to `src/pages`. Each component or page needs its own subdirectory, JSX file, and LESS file. All three should share a common name.

For example:

```
src/components/link/
├── link.jsx
└── link.less
```

*Be sure to add the LESS file as an import in `src/main.less` so that it gets compiled!*

Component markup should contain a top-level class name that corresponds to its filename (eg: `.link` for `link`). Pages should similarly have a top-level ID (eg: `#editor` for `editor`).

File names are hyphenated lowercase. For example: `section-2.jsx`.

Also, if you make a change regarding activities within the native Android wrapper, you will need to update the ```res/xml/app_tracker.xml``` file to create a display name for that new activity, in Google Analytics.

## Using configuration in js

In order to access config values, simply require `config.js` (in the `src/`).

```js
var config = require('../config.js');

console.log(config.CLIENT_ID);

```

## API Requests
The `./lib/api.js` module is the primary way in which you should interact with api.webmaker.org. This module can use the platform's `SharedPreferences` API to cache API requests thus reducing network requests. If you would like to use the cache, you can send `useCache: true` to the module:

```js
var api = require('./lib/api.js');

api({
    uri: '/discover',
    useCache: true
}, function (err, results) {
    // do stuff w/ cached results if found!
});
```

## Loading Images
Any time you are loading images over the network, we recommend that you use the `<ImageLoader>` react component. This gives you access to important events like loading and error states as well as a hook for providing a loading animation. Full documentation can be found here: https://github.com/hzdg/react-imageloader
