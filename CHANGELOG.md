# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.
https://github.com/jharris4/html-webpack-tags-plugin
<a name="2.0.4"></a>
# [2.0.4](https://github.com/jharris4/html-webpack-tags-plugin/compare/2.0.3...2.0.4) (2019-04-22)

Version `2.0.4` includes adding browser tests to this package, updated documentation and windows bug fixes.

### Bug Fixes

* Fix **windows** `path` formatting issues introduced in the `2.x` version rewrite. [#47](https://github.com/jharris4/html-webpack-tags-plugin/issues/44)

<a name="2.0.3"></a>
# [2.0.3](https://github.com/jharris4/html-webpack-tags-plugin/compare/2.0.2...2.0.3) (2019-04-19)

Version `2.0.3` adds support for new **external** script tag options that can control webpack's external config.

<a name="2.0.2"></a>
# [2.0.2](https://github.com/jharris4/html-webpack-tags-plugin/compare/2.0.1...2.0.2) (2019-04-19)

Version `2.0.2` fixes bugs related to renaming the **assets** option name to **tags**.

<a name="2.0.1"></a>
# [2.0.1](https://github.com/jharris4/html-webpack-tags-plugin/compare/2.0.0...2.0.1) (2019-04-19)

Version `2.0.1` renamed this package from `html-webpack-include-assets-plugin` to `html-webpack-tags-plugin`.

### BREAKING CHANGES

* The **assets** option was renamed to the **tags** option
* The **asset.assetPath** option was renamed to **asset.sourcePath**

<a name="2.0.0"></a>
# [2.0.0](https://github.com/jharris4/html-webpack-tags-plugin/compare/1.0.10...2.0.0) (2019-04-18)

Version `2.0.0` is a full rewrite of this plugin using ES6 instead of ES5 source code.

### Bug Fixes

* More robust logic for separating `script` vs `link` tags compared with version `1.0.x
* More robust logic for injecting attributes into `link` tags
* Fix inconsistencies with the `hash` and `publicPath` options from version `1.0.x`


### Features

* New `links` and `scripts` plugin options added as shortcuts for injecting `assets` without worrying about `type` or `file extension`


### BREAKING CHANGES

* **Node >= 8.6** is now required due to the use of `object spread` syntax in the plugin source code
* **append** option now defaults to **true**


<a name="1.0.10"></a>
# [1.0.10](https://github.com/jharris4/html-webpack-tags-plugin/compare/1.0.9...1.0.10) (2018-04-12)

This is the last `1.0.x` version which supports **Node < 8.6**.

* Rename links to cssAssets and improve test coverage ([7e78bec](https://github.com/jharris4/html-webpack-tags-plugin/commit/7e78bec))
* Add selfClosingTag and voidTag to links ([97ac502](https://github.com/jharris4/html-webpack-tags-plugin/commit/97ac502))
* misc cleanup ([6ca39ac](https://github.com/jharris4/html-webpack-tags-plugin/commit/6ca39ac))

<a name="1.0.9"></a>
# [1.0.9](https://github.com/jharris4/html-webpack-tags-plugin/compare/1.0.8...1.0.9) (2018-04-12)

This version adds support for the `links` option, similar to the option in version `2.x` except `href` is used instead of `path`.
