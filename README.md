Tags Plugin for the HTML Webpack Plugin
========================================
[![npm version](https://badge.fury.io/js/html-webpack-tags-plugin.svg)](https://badge.fury.io/js/html-webpack-tags-plugin) [![Build Status](https://travis-ci.org/jharris4/html-webpack-tags-plugin.svg?branch=master)](https://travis-ci.org/jharris4/html-webpack-tags-plugin) [![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

Enhances [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin)
by letting you specify script or link tags to inject.

Prior Version
------------

- `html-webpack-tags-plugin` requires **Node >= 10** and `webpack` & `html-webpack-plugin` versions **>= 5**.
- For older versions of webpack and node, please use **version 2.x** of this plugin.
- This plugin used to be called `html-webpack-include-assets-plugin`.
- For versions of Node older than `8.6`, please install [html-webpack-include-assets-plugin version 1.x](https://github.com/jharris4/html-webpack-tags-plugin/releases/tag/1.0.10).

Motivation
------------

When using a plugin such as [copy-webpack-plugin](https://github.com/webpack-contrib/copy-webpack-plugin) you may have assets output to your build directory that are not detected/output by the html-webpack-plugin.

This plugin lets you manually resolve such issues, and also lets you inject the webpack `publicPath` or compilation `hash` into your tag paths if you so choose.

Installation
------------
You must be running webpack on node 8.x or higher

Install the plugin with npm:
```shell
$ npm install --save-dev html-webpack-tags-plugin
```

Deployment
----------

[html-webpack-deploy-plugin](https://github.com/jharris4/html-webpack-deploy-plugin) is a plugin that enhances this plugin with capabilities such as:
 - copying your local files and injecting them as html tags with easy to use syntax
 - copying package files from your local node_modules and having them versioned automatically as they are injected as html tags
 - easy configuration to stop webpack from processing certain node_modules packages so you can handle shipping certain package bundles yourself
 - easy to use CDN settings so you can inject package tags that serve from a CDN for optimal performance

Basic Usage
-----------
Require the plugin in your webpack config:

```javascript
var HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
```

Add the plugin to your webpack config:

```javascript
output: {
  publicPath: '/abc/'
},
plugins: [
  new HtmlWebpackPlugin(),
  new HtmlWebpackTagsPlugin({ tags: ['a.js', 'b.css'], append: true })
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

Configuration
-------

### Default Options

This plugin will run and do nothing if no options are provided.

The default options for this plugin are shown below:

```js
const url = require('url');

const DEFAULT_OPTIONS = {
  append: true,
  prependExternals: true,
  jsExtensions: ['.js'],
  cssExtensions: ['.css'],
  useHash: false,
  addHash: (assetPath, hash) => assetPath + '?' + hash,
  hash: undefined,
  usePublicPath: true,
  addPublicPath: (assetPath, publicPath) => url.resolve(publicPath, assetPath),
  publicPath: undefined,
  tags: [],
  links: [],
  scripts: [],
  metas: undefined
};
```

---
### Options

All options for this plugin are validated as soon as the plugin is instantiated.

The available options are:

|Name|Type|Default|Description|
|:--:|:--:|:-----:|:----------|
|**`append`**|`{Boolean}`|`true`|Whether to prepend or append the injected tags relative to any existing or webpack bundle tags (should be set to **false** when using any `script` tag **`external`**) |
|**`prependExternals`**|`{Boolean}`|`true`|Whether to default **`append`** to **false** for any `<script>` `tag` that has an **`external`** option specified|
|**`files`**|`{Array<String>}`|`[]`|If specified this plugin will only inject tags into the html-webpack-plugin instances that are injecting into these files  (uses [minimatch](https://github.com/isaacs/minimatch))|
|**`jsExtensions`**|`{String\|Array<String>}`|`['.js']`|The file extensions to use when determining if a `tag` in the `tags` option is a `script`|
|**`cssExtensions`**|`{String\|Array<String>}`|`['.css']`|The file extensions to use when determining if a `tag` in the `tags` option is a `link`|
|**`useHash`**|`{Boolean}`|`false`|Whether to inject the webpack `compilation.hash` into the tag paths|
|**`addHash`**|`{Function(assetPath:String, hash:String):String}`|`see above`|The function to call when injecting the `hash` into the tag paths|
|**`hash`**|`{Boolean\|String\|Function}`|`undefined`|Shortcut to specifying `useHash` and `addHash`|
|**`usePublicPath`**|`{Boolean}`|`true`|Whether to inject the (webpack) `publicPath` into the tag paths|
|**`addPublicPath`**|`{Function(assetPath:String, publicPath:String):String}`|`see above`|Whether to inject the `publicPath` into the tag paths|
|**`publicPath`**|`{Boolean\|String\|Function}`|`undefined`|Shortcut to specifying `usePublicPath` and `addPublicPath`|
|**`links`**|`{String\|Object\|Array<String\|Object>}`|`[]`|The tags to inject as `<link>` html tags|
|**`scripts`**|`{String\|Object\|Array<String\|Object>}`|`[]`|The tags to inject as `<script>` html tags|
|**`tags`**|`{String\|Object\|Array<String\|Object>}`|`[]`|The tags to inject as `<link>` or `<script>` html tags depending on the tag `type`|
|**`metas`**|`{Object\|Array<Object>}`|`undefined`|The tags to inject as `<meta>` html tags|

---

The **`append`** option controls whether tags are injected before or after `webpack` or `template` tags.

If multiple plugins are used with **`append`** set to **false** then the **tags will be injected in reverse order**.

This option has no effect on **`meta`** tags.

This sample `index.html` template:

```html
<html>
  <head><link href="template-link"></head>
  <body><script src="template-script"></script></body>
</html>
```

And this sample `webpack` config:
```js
{
  entry: {
    'app': 'app.js',
    'style': 'style.css' // also generates style.js
  },
  plugins: [
    new HtmlWebpackTagsPlugin({
      append: false, links: 'plugin-a-link', scripts: 'plugin-a-script'
    }),
    new HtmlWebpackTagsPlugin({
      append: false, links: 'plugin-b-link', scripts: 'plugin-b-script'
    }),
    new HtmlWebpackTagsPlugin({
      append: true, links: 'plugin-c-link', scripts: 'plugin-c-script'
    }),
    new HtmlWebpackTagsPlugin({
      append: true, links: 'plugin-d-link', scripts: 'plugin-d-script'
    })
  ]
}
```

Will generate approximately this html:
```html
<head>
  <link href="plugin-b-link">
  <link href="plugin-a-link">
  <link href="template-link">
  <link href="style.css">
  <link href="plugin-c-link">
  <link href="plugin-d-link">
</head>
<body>
  <script src="plugin-b-script"></script>
  <script src="plugin-a-script"></script>
  <script src="template-script"></script>
  <script src="app.js"></script>
  <script src="style.js"></script>
  <script src="plugin-c-link"></script>
  <script src="plugin-d-link"></script>
</body>
```

---

The **`hash`** option is a shortcut that overrides the **`useHash`** and **`addHash`** options:

```js
const shortcutFunction = {
  hash: (path, hash) => path + '?' + hash
}
const isTheSameAsFunction = {
  useHash: true,
  addHash: (path, hash) => path + '?' + hash
}

const shortcutDisabled = {
  hash: false
}
const isTheSameAsDisabled = {
  useHash: false,
}
```

---

The **`publicPath`** option is a shortcut that overrides the **`usePublicPath`** and **`addPublicPath`** options:

```js
const shortcutFunction = {
  publicPath: (path, publicPath) => publicPath + path
}
const isTheSameAsFunction = {
  usePublicPath: true,
  addPublicPath: (path, publicPath) => publicPath + path
}

const shortcutDisabled = {
  publicPath: false
}
const isTheSameAsDisabled = {
  usePublicPath: false,
}

const shortcutString = {
  publicPath: 'myValue'
}
const isTheSameAsString = {
  usePublicPath: true,
  addPublicPath: (path) => 'myValue' + path
}

```

---

When the **`tags`** option is used the type of the specified tag(s) is inferred either from the file extension or an optional **`type`** option that may be one of: `'js' \| 'css'`|

The inferred type is used to split the **`tags`** option into `tagLinks` and `tagScripts` that are injected **before** any specified **`links`** or **`scripts`** options.

The following are functionally equivalent:

```js
new HtmlWebpackTagsPlugin({
  tags: [
    'style-1.css',
    { path: 'script-2.js' },
    { path: 'script-3-not-js.css', type: 'js' },
    'style-4.css'
  ]
});

new HtmlWebpackTagsPlugin({
  links: [
    'style-1.css',
    'style-4.css'
  ],
  scripts: [
    { path: 'script-2.js' },
    { path: 'script-3-not-js.css' }
  ]
});
```
---

The `value` of the **`tags`**, **`links`** or **`scripts`** options can be specified in several ways:

- as a **String**:

```js
new HtmlWebpackTagsPlugin({ tags: 'style.css' });
```

- as an **Object**:

```js
new HtmlWebpackTagsPlugin({ links: { path: 'style.css' } });
```

- as an **Array** of **String**s or **Object**s:

```js
new HtmlWebpackTagsPlugin({
  scripts: [
    'aScript.js',
    {
      path: 'bScript.js'
    },
    'cScript.js'
  ]
});
```

---

When tags are specified as **Object**s, the following `tag object` options are available:

|Name|Type|Default|Description|
|:--:|:--:|:-----:|:----------|
|**`path`**|`{String}`|**`required*`**|The tag file path (used for `<link href />` or `<script src />` or `<meta content />`) **`(* not required for meta tags)`**|
|**`append`**|`{Boolean}`|`undefined`| This can be used to override the plugin level **`append`** option at a tag level|
|**`type`**|`{'js'\|'css'}`|`undefined`|For **`tags`** assets this may be used to specify whether the tag is a `link` or a `script`|
|**`glob`**, **`globPath`**|`{String, String}`|`undefined`|Together these two options specify a [glob](https://github.com/isaacs/node-glob) to run, inserting a tag with path for each match result|
|**`globFlatten`**|`{Boolean}`|`false`|When used with **`glob`** and **`globPath`** this flag controls whether glob-matched files are output with with full path (`false`) or just the filename (`true`)|
|**`attributes`**|`{Object}`|`undefined`|The attributes to be injected into the html tags. Some attributes are filtered out by `html-webpack-plugin`. **(Recommended:** set `html-webpack-plugin` option: `{ inject: true }`**)**|
|**`sourcePath`**|`{String}`|`undefined`|Specify a source path to be added as an entry to `html-webpack-plugin`. Useful to trigger webpack recompilation after the asset has changed|
|**`hash`**|`{Boolean\|String\|Function}`|`undefined`|Whether & how to inject the the webpack `compilation.hash` into the tag's path|
|**`publicPath`**|`{Boolean\|String\|Function}`|`undefined`|Whether & how to inject the (webpack) `publicPath` into the tag's path|
|**`external`**|`{Object({ packageName: String, variableName: String})}`|`undefined`|When specified for **script** tags causes `{ packageName: variableName }` to be added to the [webpack config's externals](https://webpack.js.org/configuration/externals/)|

---

The `tag object` **`hash`** option may be used to override the main **`hash`** option:

```js
const pluginOptions = {
  hash: true,
  tags: [
    {
      path: 'will-have-hash-injected'
    },
    {
      path: 'will-NOT-have-hash-injected',
      hash: false
    },
    {
      path: 'will-be-sandwhiched-by-hash',
      hash: (path, hash) => hash + path + hash
    }
  ]
}
// or
const pluginOptionsDisabled = {
  hash: false,
  tags: [
    {
      path: 'will-NOT-have-hash-injected'
    },
    {
      path: 'will-have-hash-injected',
      hash: true
    },
  ]
}
```

---

The `tag object` **`publicPath`** option may be used to override the main **`publicPath`** option:

```js
const pluginOptions = {
  publicPath: true,
  tags: [
    {
      path: 'will-have-public-path-injected'
    },
    {
      path: 'will-NOT-have-public-path-injected',
      publicPath: false
    },
    {
      path: 'will-be-sandwhiched-by-public-path',
      publicPath: (path, publicPath) => publicPath + path + publicPath
    }
  ]
}
// or
const pluginOptionsDisabled = {
  publicPath: false,
  tags: [
    {
      path: 'will-NOT-have-public-path-injected'
    },
    {
      path: 'will-have-public-path-injected',
      publicPath: true
    },
  ]
}
```

-----

Examples
-------

_____

Using `HtmlWebpackTagsPlugin` and `CopyWebpackPlugin` to inject copied assets from a `node_modules` package:

```javascript
plugins: [
  new CopyWebpackPlugin([
    { from: 'node_modules/bootstrap/dist/css', to: 'css/'},
    { from: 'node_modules/bootstrap/dist/fonts', to: 'fonts/'}
  ]),
  new HtmlWebpackPlugin(),
  new HtmlWebpackTagsPlugin({
    links: ['css/bootstrap.min.css', 'css/bootstrap-theme.min.css']
  })
]
```

_____

Using the **`append`** option set to **true** and **false** at the same time:

## **Note on Plugin Ordering**

When **`append`** is set to **false** and there are multiple instances of this plugins, the second plugin's tags will be inserted before the first plugin's tags.

```javascript
plugins: [
  new CopyWebpackPlugin([
    { from: 'node_modules/bootstrap/dist/css', to: 'css/'},
    { from: 'node_modules/bootstrap/dist/fonts', to: 'fonts/'}
  ]),
  new HtmlWebpackPlugin(),
  new HtmlWebpackTagsPlugin({
    links: ['css/bootstrap.min.css', 'css/bootstrap-theme.min.css'],
    append: false
  }),
  new HtmlWebpackTagsPlugin({
    links: ['css/custom.css'],
    append: true
  })
]
```

_____

Using custom **`jsExtensions`**:

```javascript
plugins: [
  new HtmlWebpackPlugin(),
  new HtmlWebpackTagsPlugin({
    tags: ['dist/output.js', 'lib/content.jsx'],
    jsExtensions: ['.js', '.jsx']
  })
]
```

_____

Using custom **`publicPath`**:

```javascript
plugins: [
  new CopyWebpackPlugin([
    { from: 'node_modules/bootstrap/dist/css', to: 'css/'},
    { from: 'node_modules/bootstrap/dist/fonts', to: 'fonts/'}
  ]),
  new HtmlWebpackPlugin(),
  new HtmlWebpackTagsPlugin({
    tags: ['css/bootstrap.min.css', 'css/bootstrap-theme.min.css'],
    publicPath: 'myPublicPath/'
  })
]
```

This will override `webpack`'s `publicPath` setting for the purposes of path prefixing.

_____

Or to inject `tag objects` **without** prepending the **`publicPath`**:

```javascript
plugins: [
  new HtmlWebpackPlugin(),
  new HtmlWebpackTagsPlugin({
    tags: ['css/no-public-path.min.css', 'http://some.domain.com.js'],
    publicPath: false
  })
]
```

_____

Manually specifying a tag `tag object` **`type`**:

```javascript
plugins: [
  new CopyWebpackPlugin([
    { from: 'node_modules/bootstrap/dist/js', to: 'js/'},
    { from: 'node_modules/bootstrap/dist/css', to: 'css/'},
    { from: 'node_modules/bootstrap/dist/fonts', to: 'fonts/'}
  ]),
  new HtmlWebpackPlugin(),
  new HtmlWebpackTagsPlugin({
    tags: [
      '/js/bootstrap.min.js',
      '/css/bootstrap.min.css',
      '/css/bootstrap-theme.min.css',
      {
        path: 'https://fonts.googleapis.com/css?family=Material+Icons',
        type: 'css'
      }
    ]
  })
]
```

_____

Adding custom **`attributes`** to `tag objects`:

The bootstrap-theme `<link>` tag will be given an `id="bootstrapTheme"` attribute.

```javascript
plugins: [
  new CopyWebpackPlugin([
    { from: 'node_modules/bootstrap/dist/css', to: 'css/'},
    { from: 'node_modules/bootstrap/dist/fonts', to: 'fonts/'}
  ]),
  new HtmlWebpackPlugin(),
  new HtmlWebpackTagsPlugin({
    tags: [
      '/css/bootstrap.min.css',
      { path: '/css/bootstrap-theme.min.css', attributes: { id: 'bootstrapTheme' } }
    ],
    append: false,
    publicPath: ''
  })
]
```

_____

Using the **`hash`** option to inject the webpack compilation hash:

When the **`hash`** option is set to `true`, tag paths will be injected with a hash value.

The **`addHash`** option can be used to control how the hash is injected.

```javascript
  plugins: [
    new CopyWebpackPlugin([
      { from: 'node_modules/bootstrap/dist/css', to: 'css/'},
      { from: 'node_modules/bootstrap/dist/fonts', to: 'fonts/'}
    ]),
    new HtmlWebpackPlugin(),
    new HtmlWebpackTagsPlugin({
      tags: ['css/bootstrap.min.css', 'css/bootstrap-theme.min.css'],
      append: false,
      hash: true
    })
  ]
```

_____

Using the **`hash`** option to customize the injection of the webpack compilation hash:

When the **`hash`** option is set to a `function`, tag paths will be replaced with the result of executing that function.

```javascript
plugins: [
  new CopyWebpackPlugin([
    { from: 'somepath/somejsfile.js', to: 'js/somejsfile.[hash].js' },
    { from: 'somepath/somecssfile.css', to: 'css/somecssfile.[hash].css' }
  ]),
  new HtmlWebpackPlugin(),
  new HtmlWebpackTagsPlugin({
    tags: [{ path: 'js', glob: '*.js', globPath: 'somepath' }],
    tags: [{ path: 'css', glob: '*.css', globPath: 'somepath' }],
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

Specifying specific `html-webpack-plugin` instances to inject to with the **`files`** option:

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
  new HtmlWebpackTagsPlugin({
    files: ['a/**/*.html'],
    tags: ['css/a.css'],
    append: true
  }),
  new HtmlWebpackTagsPlugin({
    files: ['b/**/*.html'],
    tags: ['css/b.css'],
    append: true
  })
]
```

_____

Specifying `tag object` path searches usings a **`glob`**:

Note that since `copy-webpack-plugin` does not actually copy the files to webpack's output directory until *after* `html-webpack-plugin` has completed, it is necessary to use the **`globPath`** to retrieve filename matches relative to the original location of any such files.

```javascript
plugins: [
  new CopyWebpackPlugin([
    { from: 'node_modules/bootstrap/dist/css', to: 'css/'},
    { from: 'node_modules/bootstrap/dist/fonts', to: 'fonts/'}
  ]),
  new HtmlWebpackPlugin(),
  new HtmlWebpackTagsPlugin({
    tags: [{ path: 'css', glob: '*.css', globPath: 'node_modules/bootstrap/dist/css/' }],
    append: true
  })
]
```

_____

Using the **`links`** option to inject `link` tags:

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
  new HtmlWebpackTagsPlugin({
    tags: [],
    links: [
      {
        path: 'asset/path',
        attributes: {
          rel: 'icon'
        }
      },
      {
        path: '/absolute/asset/path',
        publicPath: false,
        attributes: {
          rel: 'manifest'
        }
      }
    ]
  })
]
```

Will append the following `<link>` elements into the index template html

```html
<head>
  <!-- previous header content -->
  <link rel="icon" href="/my-public-path/asset/path">
  <link rel="manifest" href="/absolute/asset/path">
</head>
```

Note that the second link's href was not prefixed with the webpack `publicPath` because the second link asset's **`publicPath`** was set to `false`.


_____

Using the **`scripts`** option to inject `script` tags:

```javascript
output: {
  publicPath: '/my-public-path/'
},
plugins: [
  new CopyWebpackPlugin([
    { from: 'node_modules/bootstrap/dist/js', to: 'js/'}
  ]),
  new HtmlWebpackPlugin(),
  new HtmlWebpackTagsPlugin({
    tags: [],
    scripts: [
      {
        path: 'asset/path',
        attributes: {
          type: 'text/javascript'
        }
      }
    ]
  })
]
```

Will append the following `<script>` element into the index template html

```html
<body>
  <!-- previous body content -->
  <script src="/my-public-path/asset/path" type="text/javascript"></script>
</body>
```


_____

Specifying **`scripts`** with **`external`** options:

```javascript
output: {
  publicPath: '/my-public-path/'
},
plugins: [
  new CopyWebpackPlugin([
    { from: 'node_modules/bootstrap/dist/js', to: 'js/'}
  ]),
  new HtmlWebpackPlugin(),
  new HtmlWebpackTagsPlugin({
    tags: [],
    scripts: [
      {
        path: 'asset/path',
        external: {
          packageName: 'react',
          variableName: 'React'
        },
        attributes: {
          type: 'text/javascript'
        }
      }
    ]
  })
]
```

Will add the following `properties` to the `webpack.compilation.options.externals`:

```js
const compilationConfig = {
  ...otherProperties,
  externals: {
    "react": "React"
  }
};
```

This can be useful to control which packages webpack is bundling versus ones you can serve from a CDN.

Note that `script` tags with **`external`** specified need to be placed **before** the webpack bundle tags.

This means that you should always set **`append`** to **false** when using the `script` **`external`** option.

The **`prependExternals`** option was added in `2.0.10` to handle this case automatically.


_____

Using the **`metas`** option to inject `meta` tags:

```javascript
output: {
  publicPath: '/my-public-path/'
},
plugins: [
  new CopyWebpackPlugin([
    { from: 'node_modules/bootstrap/dist/js', to: 'js/'}
  ]),
  new HtmlWebpackPlugin(),
  new HtmlWebpackTagsPlugin({
    metas: [
      {
        path: 'asset/path',
        attributes: {
          name: 'the-meta-name'
        }
      }
    ]
  })
]
```

Will inject the following `<meta>` element into the index template html

```html
<head>
  <!-- previous header content -->
  <meta content="/my-public-path/asset/path" name="the-meta-name">
</head>
```

Note that the **`append`** settings has no effect on how the `<meta>` elements are injected.


_____

Caveats
-------

___

#### Plugin Ordering

Some users have encountered issues with plugin ordering.

- It is advisable to always place any `HtmlWebpackPlugin` plugins **before** any `HtmlWebpackTagsPlugin` plugins in your webpack config.

- When **`append`** is **false** tags are injected before any other tags. This means that if you have two instances of this plugin both with append set to false, then the `second` plugin's tags will be injected **before** the `first` plugin's tags.

---

#### Webpack `externals`

Setting the **`external`** option for a `script` `tag object` requires caution to ensure that the scripts are in the correct order.

- It is advisable to always set **`append`** to **false** so that `external` \<script\> tags are always inserted **before** the `webpack` bundle \<script\> tags.

- The order that you use when you specify a list of external links matters. For example, `<script src="react.js"/>` should come before `<script src="react-router.s"/>` if `react-router` has a peer dependency on `react`.

---

#### HtmlWebpackPlugin `inject` option

Changing HtmlWebpackPlugin **`inject`** option from its `default value` of **true** may cause issues.

- This plugin **recommends** that the HtmlWebpackPlugin **`inject`** option to be **true** for attribute injection to work.

**Disabling injection** means that you are agreeing to template how the tags should be generated in your `templates/index.html` file like this:

```html
<html>
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
</html>
```

The default templating engine for `html-webpack-plugin` seems to be based on **`lodash`**.

With the above template we might use the following `webpack` config which **disables** **`inject`**:

```javascript
output: {
  publicPath: '/the-public-path/'
},
plugins: [
  new HtmlWebpackPlugin({ <b>inject: false</b> }),
  new HtmlWebpackTagsPlugin({
    tags: [{ path: 'css/bootstrap-theme.min.css', attributes: { id: 'bootstrapTheme' } }],
    links: [{ href: 'the-ref', attributes: { rel: 'icon' } }],
    append: true
  })
]
```

The problem is that the `template syntax` does not seem to allow injection of more than `one attribute value`, namely the `path` (**`href`** or **`src`**)

This means it will **generate** an `index.html` that is **missing** all of the script **`attributes`** like this:

```html
<head>
  <link href="/the-public-path/css/bootstrap-theme.min.css">
  <link href="/the-public-path/the-ref">
</head>
```

If the templating engine supports injection of **entire tags** instead of just the `href`/`src` attribute value then working with **`inject`** set to **false** may be possible.
