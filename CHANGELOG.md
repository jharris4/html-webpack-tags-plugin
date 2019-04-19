# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.
https://github.com/jharris4/html-webpack-include-assets-plugin
<a name="2.0.0"></a>
# [2.0.0](https://github.com/jharris4/html-webpack-include-assets-plugin/compare/1.0.10...2.0.0) (2019-04-18)

Version `2.0.0` is a full rewrite of this plugin using ES6 instead of ES5 source code.

### Bug Fixes

* More robust logic for separating `script` vs `link` tags compared with version `1.0.x
* More robust logic for injecting attributes into `link` tags
* Fix inconsistencies with the `hash` and `publicPath` options from version `1.0.x`


### Features

* New `links` and `scripts` plugin options added as shortcuts for injecting `assets` without worrying about `type` or `file extension`


### BREAKING CHANGES

* **Node >= 8.6** is now required due to the use of `object spread` syntax in the plugin source code


<a name="1.0.10"></a>
# [1.0.10](https://github.com/jharris4/html-webpack-include-assets-plugin/compare/1.0.9...1.0.10) (2018-04-12)

This is the last `1.0.x` version which supports **Node < 8.6**.

* Rename links to cssAssets and improve test coverage ([7e78bec](https://github.com/jharris4/html-webpack-include-assets-plugin/commit/7e78bec))
* Add selfClosingTag and voidTag to links ([97ac502](https://github.com/jharris4/html-webpack-include-assets-plugin/commit/97ac502))
* misc cleanup ([6ca39ac](https://github.com/jharris4/html-webpack-include-assets-plugin/commit/6ca39ac))

<a name="1.0.9"></a>
# [1.0.9](https://github.com/jharris4/html-webpack-include-assets-plugin/compare/1.0.8...1.0.9) (2018-04-12)

This version adds support for the `links` option, similar to the option in version `2.x` except `href` is used instead of `path`.