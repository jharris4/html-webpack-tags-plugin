Include Assets extension for the HTML Webpack Plugin
========================================
[![npm version](https://badge.fury.io/js/html-webpack-include-assets-plugin.svg)](https://badge.fury.io/js/html-webpack-include-assets-plugin) [![Build Status](https://travis-ci.org/jharris4/html-webpack-include-assets-plugin.svg?branch=master)](https://travis-ci.org/jharris4/html-webpack-include-assets-plugin) [![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

Enhances [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin)
functionality by allowing you to specify js or css assets to be included.

When using a plugin such as [copy-webpack-plugin](https://github.com/kevlened/copy-webpack-plugin) you may have assets output to your build directory that are not detected/output by the html-webpack-plugin.

This plugin allows you to force some of these assets to be included in the output from html-webpack-plugin.

Installation
------------
You must be running webpack on node 4.x or higher

Install the plugin with npm:
```shell
$ npm install --save-dev html-webpack-include-assets-plugin
```


Basic Usage
-----------
Require the plugin in your webpack config:

```javascript
var HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
```

Add the plugin to your webpack config as follows:

```javascript
plugins: [
  new HtmlWebpackPlugin(),
  new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: true })
]  
```

Options
-------
The available options are:

- `jsExtensions`: `string` or `array`

  Specifies the file extensions to use to determine if assets are script assets. Default is `['.js']`.

- `cssExtensions`: `string` or `array`

  Specifies the file extensions to use to determine if assets are style assets. Default is `['.css']`.

- `assets`: `string` or `array` or `object`

  Assets that will be output into your html-webpack-plugin template.

  To specify just one asset, simply pass a string or object. To specify multiple, pass an array of strings or objects.

  If the asset path ends in one of the `jsExtensions` or `cssExtensions` values, simply use a string value.

  If the asset does not have a valid extension, you can instead pass an object with properties `path` and `type`, where `path` is the asset href/src and `type` is one of `js` or `css`.

- `append`: `boolean`

  Specifying whether the assets should be prepended (`false`) before any existing assets, or appended (`true`) after them.

- `publicPath`: `boolean` or `string`

  Specifying whether the assets should be prepended with webpack's public path or a custom publicPath (`string`).

  A value of `false` may be used to disable prefixing with webpack's publicPath, or a value like `myPublicPath/` may be used to prefix all assets with the given string. Default is `true`.

- `hash`: `boolean`

  Specifying whether the assets should be appended with webpack's compilation hash. This is useful for cache busting. Default is `false`.

- `files`: `string` or `array`

  Files that the assets will be added to.

  By default the assets will be included in all files. If files are defined, the assets will only be included in specified file globs.

Example
-------
Using `HtmlWebpackIncludeAssetsPlugin` and `CopyWebpackPlugin` to include assets to `html-webpack-plugin` template :

```javascript
plugins: [
  new CopyWebpackPlugin([
    { from: 'node_modules/bootstrap/dist/css', to: 'css/'},
    { from: 'node_modules/bootstrap/dist/fonts', to: 'fonts/'}
  ]),
  new HtmlWebpackPlugin(),
  new HtmlWebpackIncludeAssetsPlugin({
    assets: ['css/bootstrap.min.css', 'css/bootstrap-theme.min.css'],
    append: false
  })
]  
```

Appending and prepending at the same time :

```javascript
plugins: [
  new CopyWebpackPlugin([
    { from: 'node_modules/bootstrap/dist/css', to: 'css/'},
    { from: 'node_modules/bootstrap/dist/fonts', to: 'fonts/'}
  ]),
  new HtmlWebpackPlugin(),
  new HtmlWebpackIncludeAssetsPlugin({
    assets: ['css/bootstrap.min.css', 'css/bootstrap-theme.min.css'],
    append: false
  }),
  new HtmlWebpackIncludeAssetsPlugin({
    assets: ['css/custom.css'],
    append: true
  })
]
```

Using custom `jsExtensions` :

```javascript
plugins: [
  new HtmlWebpackPlugin(),
  new HtmlWebpackIncludeAssetsPlugin({
    assets: ['dist/output.js', 'lib/content.jsx'],
    append: false,
    jsExtensions: ['.js', '.jsx']
  })
]
```

Using custom `publicPath` :

```javascript
plugins: [
  new CopyWebpackPlugin([
    { from: 'node_modules/bootstrap/dist/css', to: 'css/'},
    { from: 'node_modules/bootstrap/dist/fonts', to: 'fonts/'}
  ]),
  new HtmlWebpackPlugin(),
  new HtmlWebpackIncludeAssetsPlugin({
    assets: ['css/bootstrap.min.css', 'css/bootstrap-theme.min.css'],
    append: false,
    publicPath: 'myPublicPath/'
  })
]
```

Manually specifying asset types :

```javascript
plugins: [
  new CopyWebpackPlugin([
    { from: 'node_modules/bootstrap/dist/css', to: 'css/'},
    { from: 'node_modules/bootstrap/dist/fonts', to: 'fonts/'}
  ]),
  new HtmlWebpackPlugin(),
  new HtmlWebpackIncludeAssetsPlugin({
    assets: [
      '/css/bootstrap.min.css',
      '/css/bootstrap-theme.min.css',
      { path: 'https://fonts.googleapis.com/css?family=Material+Icons', type: 'css' }
    ],
    append: false,
    publicPath: ''
  })
]
```

Using `hash` option :

```javascript
plugins: [
  new CopyWebpackPlugin([
    { from: 'node_modules/bootstrap/dist/css', to: 'css/'},
    { from: 'node_modules/bootstrap/dist/fonts', to: 'fonts/'}
  ]),
  new HtmlWebpackPlugin(),
  new HtmlWebpackIncludeAssetsPlugin({
    assets: ['css/bootstrap.min.css', 'css/bootstrap-theme.min.css'],
    append: false,
    hash: true
  })
]
```

Specifying specific `files`

```javascript
plugins: [
  new CopyWebpackPlugin([
    { from: 'node_modules/bootstrap/dist/css', to: 'css/'},
    { from: 'node_modules/bootstrap/dist/fonts', to: 'fonts/'}
  ]),
  new HtmlWebpackPlugin({
    filename: 'a/index.html'
  }),
  new HtmlWebpackPlugin({
    filename: 'b/index.html'
  }),
  new HtmlWebpackIncludeAssetsPlugin({
    files: ['a/**/*.html'],
    assets: ['css/a.css'],
    append: true
  }),
  new HtmlWebpackIncludeAssetsPlugin({
    files: ['b/**/*.html'],
    assets: ['css/b.css'],
    append: true
  })
]
```
