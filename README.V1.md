Include Assets extension for the HTML Webpack Plugin
========================================
[![npm version](https://badge.fury.io/js/html-webpack-include-assets-plugin.svg)](https://badge.fury.io/js/html-webpack-include-assets-plugin) [![Build Status](https://travis-ci.org/jharris4/html-webpack-include-assets-plugin.svg?branch=master)](https://travis-ci.org/jharris4/html-webpack-include-assets-plugin) [![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

This is the `README.md` from **version 1.x** which provides support for ** Node < 8.6 **.

This **version is deprecated** in favour of [https://github.com/jharris4/html-webpack-include-assets-plugin](html-webpack-include-assets-plugin version 2).

Enhances [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin)
functionality by allowing you to specify js or css assets to be included.

When using a plugin such as [copy-webpack-plugin](https://github.com/webpack-contrib/copy-webpack-plugin) you may have assets output to your build directory that are not detected/output by the html-webpack-plugin.

This plugin allows you to force some of these assets to be included in the output from html-webpack-plugin.

Installation
------------
You must be running webpack on node 8.x or higher

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

Add the plugin to your webpack config:

```javascript
output: {
  publicPath: '/abc/'
},
plugins: [
  new HtmlWebpackPlugin(),
  new HtmlWebpackIncludeAssetsPlugin({ assets: ['a.js', 'b.css'], append: true })
]
```

Which will generate html like this:

```html
<head>
  <!-- other head content -->
  <link rel="stylesheet" href="/abc/b.css"/>
</head>
<body>
  <!-- other body content -->
  <script type="text/javascript" src="/abc/a.js"></script>
</body>
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

  If the asset path is static and ends in one of the `jsExtensions` or `cssExtensions` values, simply use a string value.

  If the asset is not static or does not have a valid extension, you can instead pass an object with properties `path` (required) and `type` or `glob` or `globPath` or `attributes` (optional). In this case `path` is the asset href/src, `type` is one of `js` or `css`, and `glob` is a wildcard to use to match all files in the path (uses the [glob](https://github.com/isaacs/node-glob) package). The `globPath` can be used to specify the directory from which the `glob` should search for filename matches (the default is to use `path` within webpack's output directory).

  The `attributes` property may be used to add additional attributes to the link or script element that is injected. The keys of this object are attribute names and the values are the attribute values (string or boolean key values are allowed).

  The `assetPath` property may be used to specify the full path to the included asset. This can be useful as it will trigger a recompilation after the assets have changed when using `webpack-dev-server` or `webpack-dev-middleware` in development mode.

- `append`: `boolean`

  Specifying whether the assets should be prepended (`false`) before any existing assets, or appended (`true`) after them.

- `resolvePaths`: `boolean`

  Specifying whether the asset paths should be resolved with `path.resolve` (i.e. made absolute).

- `publicPath`: `boolean` or `string`

  Specifying whether the assets should be prepended with webpack's public path or a custom publicPath (`string`).

  A value of `false` may be used to disable prefixing with webpack's publicPath, or a value like `myPublicPath/` may be used to prefix all assets with the given string. Default is `true`.

- `hash`: `boolean` or `function(assetName, hash)`

  Specifying whether the assets should be appended with webpack's compilation hash. This is useful for cache busting. Default is `false`.

- `files`: `string` or `array`

  Files that the assets will be added to.

  By default the assets will be included in all files. If files are defined, the assets will only be included in specified file globs (uses the [minimatch](https://github.com/isaacs/minimatch) package).

  - `cssAssets`: `array`

  Optional shortcut for adding css assets. An array of css asset objects.

  See the cssAssets example below for the syntax of css asset object.


Example
-------

_____

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

_____

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

_____

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

_____

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

_____

Or to include assets without prepending the `publicPath`:

```javascript
plugins: [
  new HtmlWebpackPlugin(),
  new HtmlWebpackIncludeAssetsPlugin({
    assets: ['css/no-public-path.min.css', 'http://some.domain.com.js'],
    append: false,
    publicPath: false
  })
]
```

_____

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

_____

Adding custom attributes to asset tags :

The bootstrap-theme link tag will be given an id="bootstrapTheme" attribute.

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
      { path: '/css/bootstrap-theme.min.css', attributes: { id: 'bootstrapTheme' } }
    ],
    append: false,
    publicPath: ''
  })
]
```

_____

Using `hash` option :

When the hash option is set to `true`, asset paths will be appended with a hash query parameter (`?hash=<the_hash>`)

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

_____

When the hash option is set to a `function`, asset paths will be replaced with the result of executing that function

```javascript
plugins: [
  new CopyWebpackPlugin([
    { from: 'somepath/somejsfile.js', to: 'js/somejsfile.[hash].js' },
    { from: 'somepath/somecssfile.css', to: 'css/somecssfile.[hash].css' }
  ]),
  new HtmlWebpackPlugin(),
  new HtmlWebpackIncludeAssetsPlugin({
    assets: [{ path: 'js', glob: '*.js', globPath: 'somepath' }],
    assets: [{ path: 'css', glob: '*.css', globPath: 'somepath' }],
    append: false,
    hash: function(assetName, hash) {
      assetName = assetName.replace(/\.js$/, '.' + hash + '.js');
      assetName = assetName.replace(/\.css$/, '.' + hash + '.css');
      return assetName;
    }
  })
]
```

_____

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

_____

Specifying assets usings a `glob`

Note that since `copy-webpack-plugin` does not actually copy the files to webpack's output directory until *after* `html-webpack-plugin` has completed, it is necessary to use the `globPath` to retrieve filename matches relative to the original location of any such files.

```javascript
plugins: [
  new CopyWebpackPlugin([
    { from: 'node_modules/bootstrap/dist/css', to: 'css/'},
    { from: 'node_modules/bootstrap/dist/fonts', to: 'fonts/'}
  ]),
  new HtmlWebpackPlugin(),
  new HtmlWebpackIncludeAssetsPlugin({
    assets: [{ path: 'css', glob: '*.css', globPath: 'node_modules/bootstrap/dist/css/' }],
    append: true
  })
]
```

_____

Specifying `cssAssets` (a shortcut for specifying assets of type css)

```javascript
output: {
  publicPath: '/my-public-path/'
},
plugins: [
  new CopyWebpackPlugin([
    { from: 'node_modules/bootstrap/dist/css', to: 'css/'},
    { from: 'node_modules/bootstrap/dist/fonts', to: 'fonts/'}
  ]),
  new HtmlWebpackPlugin(),
  new HtmlWebpackIncludeAssetsPlugin({
    assets: [],
    append: true,
    cssAssets: [
      {
        href: 'asset/path',
        attributes: {
          rel: 'icon'
        }
      },
      {
        href: '/absolute/asset/path',
        asset: false,
        attributes: {
          rel: 'manifest'
        }
      }
    ]
  })
]
```

Will append the following link elements into the index template html

```html
<head>
  <!-- previous header content -->
  <link rel="icon" href="/my-public-path/asset/path"/>
  <link rel="manifest" href="/absolute/asset/path"/>
</head>
```

Note that the second cssAsset's href was not prefixed with the webpack `publicPath` because `csAsset.asset` was set to `false`.

_____


Caveats
-------

Some users have encountered issues with plugin ordering.

- It is advisable to always place any `HtmlWebpackPlugin` plugins **before** any `HtmlWebpackIncludeAssetsPlugin` plugins in your webpack config.

This plugin has only been tested with **two instances** in one webpack config, where one had `option.append: false` and the other had `option.append: true`.

- It is **not recommended to use more than one instance of this plugin** in one webpack config unless using the above configuration.

Changing `HtmlWebpackPlugin.options.inject` from its **default value** may cause **issues**.

- This plugin **requires** `HtmlWebpackPlugin.options.inject` to be `true` (it defaults to true if undefined) for attribute injection to work.


If you setup your webpack config to have `HtmlWebpackPlugin.options.inject: false` like this:

```javascript
output: {
  publicPath: '/the-public-path/'
},
plugins: [
  new HtmlWebpackPlugin({ inject: false }),
  new HtmlWebpackIncludeAssetsPlugin({
    assets: [{ path: 'css/bootstrap-theme.min.css', attributes: { id: 'bootstrapTheme' } }],
    links: [{ href: 'the-ref', attributes: { rel: 'icon' } }],
    append: true
  })
]
```

You will need to add the following to your *template* `index.html` to get assets to be **generated**:

```html
<head>
  <!-- other head content -->
  <% for (var cssIndex = 0; cssIndex < htmlWebpackPlugin.files.css.length; cssIndex++) { %>
    <link rel="stylesheet" href="<%= htmlWebpackPlugin.files.css[cssIndex] %>">
  <% } %>
</head>
<body>
  <!-- other body content -->
  <% for (var jsIndex = 0; jsIndex < htmlWebpackPlugin.files.js.length; jsIndex++) { %>
    <script src="<%= htmlWebpackPlugin.files.js[jsIndex] %>"></script>
  <% } %>
</body>
```

Using the (lodash) `template syntax` like this for css and js files is necessary when you turn injection off.

But, the `template syntax` does not allow injection of more than `one attribute value`.

This means it will **generate** an `index.html` that looks like this:

```html
<head>
  <link rel="stylesheet" href="/the-public-path/css/bootstrap-theme.min.css">
  <link rel="stylesheet" href="/the-public-path/the-ref">
</head>
```

None of the `link` elements have any of the `attributes` we specified for the `assets` or `links`.

This is because `HtmlWebpackPlugin.options.inject` needs to be set to `true` for `attributes` injection to work.
