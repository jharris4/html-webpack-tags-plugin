# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.
https://github.com/jharris4/html-webpack-tags-plugin

<a name="3.0.1"></a>
# [3.0.1](https://github.com/jharris4/html-webpack-tags-plugin/compare/3.0.0...3.0.1) (2021-04-07)

### Features

* Added `webpack` & `html-webpack-plugin` to peerDependencies.

<a name="3.0.0"></a>
# [3.0.0](https://github.com/jharris4/html-webpack-tags-plugin/compare/2.0.17...3.0.0) (2021-02-03)

### Features

* Updated to support `webpack` & `html-webpack-plugin` version **`5`**.

### BREAKING CHANGES

* webpack` & `html-webpack-plugin` version **`5`** are now required.
* Node version **`>=10`** is now required.


<a name="2.0.17"></a>
# [2.0.17](https://github.com/jharris4/html-webpack-tags-plugin/compare/2.0.16...2.0.17) (2019-09-23)

### Bug Fixes

* Add typings.d.ts to `files` in `package.json` (oops) [[#52](https://github.com/jharris4/html-webpack-tags-plugin/issues/52)].

<a name="2.0.16"></a>
# [2.0.16](https://github.com/jharris4/html-webpack-tags-plugin/compare/2.0.15...2.0.16) (2019-09-23)

### Features

* Add TypeScript definitions [[#52](https://github.com/jharris4/html-webpack-tags-plugin/issues/52)].

<a name="2.0.15"></a>
# [2.0.15](https://github.com/jharris4/html-webpack-tags-plugin/compare/2.0.14...2.0.15) (2019-08-20)

### Features

* Renamed the meta option to **`metas`**. The plural version is more consistent with the **`tags`**, **`scripts`** and **`links`** options.

<a name="2.0.14"></a>
# [2.0.14](https://github.com/jharris4/html-webpack-tags-plugin/compare/2.0.13...2.0.14) (2019-08-20)

### Features

* Add new **`meta`** option (default **undefined**) that allows `<meta>` tags to be injected.

<a name="2.0.13"></a>
# [2.0.13](https://github.com/jharris4/html-webpack-tags-plugin/compare/2.0.12...2.0.13) (2019-06-18)

### Bug Fixes

* Use `url.resolve` instead of `path.join` to fix a bug when the publicPath contains `//`. [[#47](https://github.com/jharris4/html-webpack-tags-plugin/issues/47)].

### Features

* Update all dependency packages to latest.

<a name="2.0.12"></a>
# [2.0.12](https://github.com/jharris4/html-webpack-tags-plugin/compare/2.0.11...2.0.12) (2019-05-03)

### Features

* Update `slash` package to `3.0.0`.

<a name="2.0.11"></a>
# [2.0.11](https://github.com/jharris4/html-webpack-tags-plugin/compare/2.0.10...2.0.11) (2019-05-03)

### Features

* Add new **`globFlatten`** tag option (default **false**) that allows paths to be stripped from glob matched file paths.

<a name="2.0.10"></a>
# [2.0.10](https://github.com/jharris4/html-webpack-tags-plugin/compare/2.0.9...2.0.10) (2019-04-27)

### Features

* Add new **`prependExternals`** option (default **true**) that auto-prepends (**`append`**: false) any scripts with the **`external`** option specified.

<a name="2.0.9"></a>
# [2.0.9](https://github.com/jharris4/html-webpack-tags-plugin/compare/2.0.8...2.0.9) (2019-04-24)

### Bug Fixes

* More robust validation logic for all options across the board.

### Features

* Adds support for all `top` level options to be specified at the `tag` level.
* `HtmlWebpackTagsPlugin.api` now ready for use by any plugins wanting to extend this plugin's options.

<a name="2.0.8"></a>
# [2.0.8](https://github.com/jharris4/html-webpack-tags-plugin/compare/2.0.7...2.0.8) (2019-04-23)

### Features

* Adds an `api` property to the plugin constructor, allowing reuse of option validation by other plugins.

<a name="2.0.7"></a>
# [2.0.7](https://github.com/jharris4/html-webpack-tags-plugin/compare/2.0.6...2.0.7) (2019-04-23)

### Features

* Adds stricter/better option validation.

<a name="2.0.6"></a>
# [2.0.6](https://github.com/jharris4/html-webpack-tags-plugin/compare/2.0.5...2.0.6) (2019-04-23)

### Bug Fixes

* Fixes use of this plugin with [html-webpack-plugin@4.x](https://github.com/jantimon/html-webpack-plugin). [[#45](https://github.com/jharris4/html-webpack-tags-plugin/issues/45)].

<a name="2.0.5"></a>
# [2.0.5](https://github.com/jharris4/html-webpack-tags-plugin/compare/2.0.4...2.0.5) (2019-04-23)

### Features

* Adds support for specifying the append option at the tag level.

<a name="2.0.4"></a>
# [2.0.4](https://github.com/jharris4/html-webpack-tags-plugin/compare/2.0.3...2.0.4) (2019-04-22)

### Features

* Added browser tests to this package (using [puppeteer](https://github.com/GoogleChrome/puppeteer)).

### Bug Fixes

* Fix **windows** `path` formatting issues introduced in the `2.x` version rewrite. [[#44](https://github.com/jharris4/html-webpack-tags-plugin/issues/44)].

<a name="2.0.3"></a>
# [2.0.3](https://github.com/jharris4/html-webpack-tags-plugin/compare/2.0.2...2.0.3) (2019-04-19)

### Features

* Adds support for new **external** script tag options that can control webpack's external config.

<a name="2.0.2"></a>
# [2.0.2](https://github.com/jharris4/html-webpack-tags-plugin/compare/2.0.1...2.0.2) (2019-04-19)

### Bug Fixes

* Fix bugs related to renaming the **assets** option name to **tags**.

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
