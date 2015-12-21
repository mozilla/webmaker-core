# Webmaker

Webmaker enables people to discover, create, and share rich content from their mobile device. It brings a few of the web’s best ingredients to a mobile-first content creation platform. Webmaker goes beyond a soundbite or filtered photo to enable truly creative projects. It is free, open-source, and independent.

Webmaker is currently available in the Android Play store. Projects can be shared and viewed from any web browser on mobile or desktop.

![Webmaker Screenshots](https://dl.dropboxusercontent.com/u/43783651/Mozilla/Android/Webmaker%20Intro.png)

If you'd like to become a Beta tester for the Android app, you can [opt in here](https://play.google.com/apps/testing/org.mozilla.webmaker).

## Contribute

This repository contains the core features of Webmaker. We utilize the [wiki](https://github.com/mozilla/webmaker-core/wiki) and [issues](https://github.com/mozilla/webmaker-core/issues) to track the whole project. The Android code resides at [webmaker-android](https://github.com/mozilla/webmaker-android/) and the desktop view at [webmaker-browser](https://github.com/mozilla/webmaker-browser/).

Found a bug? Have an idea? File a [new issues](https://github.com/mozilla/webmaker-core/issues/new).

## Roadmap

The Webmaker team has identified a few areas of focus to advance the project. These frame our features and bug fixes in terms of the needs of our users and help set priorities as we iterate toward a well rounded product experience.

Take a look at our set of [Feature Priorities](https://github.com/mozilla/webmaker-core/wiki/Feature-Priorities)

## Quality Testing

Whenever we release a new version of the app, we always test our release candidates. If you are interested in testing the app, head over to the [Quality Testing](https://github.com/mozilla/webmaker-core/wiki/Webmaker-Quality-Testing) section of the Wiki. You will find instructions to become a Beta tester. You will also find quality testing scripts that make testing a whole lot easier.

## Design

The UI Design Toolkit, which contains the major user interface elements, colours, and patterns used throughout the app can be found on the [Webmaker Wiki](https://github.com/mozilla/webmaker-core/wiki/Design). The toolkit will give you what you need to start contributing Design to this project.

If you have any questions about Design feel free to speak to @ricardo on IRC or email <mailto:ricardo@mozillafoundation.org><ricardo@mozillafoundation.org>

## webmaker-core development

[![Build Status](https://travis-ci.org/mozilla/webmaker-core.svg)](https://travis-ci.org/mozilla/webmaker-core)

`webmaker-core` is the React based core for the Webmaker app. It's a series of webviews that are integrated into the various platforms running Webmaker (currently: [Android](https://github.com/mozilla/webmaker-android), [Browser](https://github.com/mozilla/webmaker-browser)).

If you'd like to become a beta tester for the Android app, you can opt in by opening this URL on your device: [https://play.google.com/apps/testing/org.mozilla.webmaker](https://play.google.com/apps/testing/org.mozilla.webmaker)

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

## Localization

In this project we're using [React-Intl](https://github.com/yahoo/react-intl) to localize our application and YAML for translation.

#### Localize a component or page

To localize a component or page you have to include `IntlMixin` in your class `mixins`, for example:

``` typescript
var React = require('react');

var Example = React.createClass({
  mixins: [require('react-intl').IntlMixin],
  render: function() {
    return (
      <div>
        <h1>{this.getIntlMessage('key_name_here')}
      </div>
    );
  }

});
```

If the strings include HTML, use the `FormattedHTMLMessage` element:

``` typescript
import { FormattedHTMLMessage, IntlMixin } from 'react-intl';

<FormattedHTMLMessage
  message={ this.getIntlMessage("key_name_here") }
/>
```

Once you add the mixin it will expose the `getIntlMessage` method to your component to get the localized message for the given key.

#### Adding locale
Because we are using YAML for our translation and React-Intl expects JSON, we need an extra build step to convert YAML to JSON.
We are using [yaml-intl-xml-json-converter](https://www.npmjs.com/package/yaml-intl-xml-json-converter) to convert from YAML to JSON.

##### config for for YAML to JSON conversion

`intl-config.json`
``` json
{
  "supportedLocales": ["en-US", "de", "fr", "pt-BR", "es"],
  "dest": "locales",
  "src": "locales",
  "type": "json"
}
```

##### YAML template

`en-US.yaml`
``` yaml
---
en-US:
  first: This is your first message
  second: This is your second message
```

You have to make sure you match your language code in your YAML file and the name of the file with what you include in your config file for the converting part otherwise it will fail.

### I18N Methods

`i18n.js` file exposes different methods to help with localization. These are the list of available methods when you required the module.

``` js
{
  intlData: {messages: {}, locales: {}},
  defaultLang: 'en-US',
  currentLanguage: locale,
  isSupportedLanguage: function(lang),
  intlDataFor: function(lang)
}
```

1. `intlData`
  This object consist of two properties. `locales` and `messages`. We use this object to pass it to React-Router in order for `getIntlMessage` to work properly.

2. `defaultLang`
  This will return default language of the application.

3. `currentLanguage`
  This will return current language of the client that visiting our site.

4. `isSupportedLanguage`
  This method expect a valid language code, and it's used to validate if we support that given language or not.
  The return value is boolean.

5. `intlDataFor`
  This method expect a valid language code, and it will return `intlData` for the given language.

## Post localization

To fully localized the app we need to make sure we update the resource file on Transifex.
This step requires that you have the required credential to upload the resource file on the Transifex's Webmaker project.

If you do not have the credential please speak @alicoding on IRC or any of the coordinator of the project for Webmaker on Transifex.

NOTE: There should be a weekly cycle where we upload the file on Transifex to avoid any problem that could occur.
