Include Assets extension for the HTML Webpack Plugin
========================================
[![npm version](https://badge.fury.io/js/html-webpack-include-assets-plugin.svg)](https://badge.fury.io/js/html-webpack-include-assets-plugin) [![Build Status](https://travis-ci.org/jharris4/html-webpack-include-assets-plugin.svg?branch=master)](https://travis-ci.org/jharris4/html-webpack-include-assets-plugin) [![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

Enhances [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin)
functionality by adding the `{includeAssets: String | [String]}` option to allow you to include assets.

When using a plugin such as [copy-webpack-plugin](https://github.com/kevlened/copy-webpack-plugin) you may have assets output to your build directory that are not detected/output by the html-webpack-plugin.

This plugin allows you to force some of these assets to be included in the output from html-webpack-plugin.

Installation
------------
You must be running webpack on node 0.12.x or higher

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
  new HtmlWebpackIncludeAssetsPlugin()
]  
```

The above configuration will actually do nothing due to the configuration defaults.

When you set `includeAssets` to an array of strings or a single string, the matched assets will be output into your html-webpack-plugin template.

Only assets ending in `.js` or `.css` are supported. The presence of assets that do not end in these extensions will cause an error.

```javascript
plugins: [
  new CopyWebpackPlugin([
    { from: 'node_modules/bootstrap/dist/css', to: 'css/'},
    { from: 'node_modules/bootstrap/dist/fonts', to: 'fonts/'}
  ]),
  new HtmlWebpackPlugin({
    includeAssets: ['css/bootstrap.min.css', 'css/bootstrap-theme.min.css']
  }),
  new HtmlWebpackIncludeAssetsPlugin()
]  
```
