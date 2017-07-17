'use strict';
var assert = require('assert');
var minimatch = require('minimatch');

var defaultOptions = {
  publicPath: true,
  hash: false,
  jsExtensions: ['.js'],
  cssExtensions: ['.css']
};

function isObject (v) {
  return v !== null && v !== undefined && typeof v === 'object' && !isArray(v);
}

function isBoolean (v) {
  return v === true || v === false;
}

function isString (v) {
  return v !== null && v !== undefined && (typeof v === 'string' || v instanceof String);
}

function isArray (v) {
  return Array.isArray(v);
}

function hasExtension (v, ending) {
  if (v.indexOf('?') !== -1) { // Remove anything after `?`
    v = v.substr(0, v.indexOf('?'));
  }
  var lastIndex = v.lastIndexOf(ending);
  return lastIndex !== -1 && lastIndex === v.length - ending.length;
}

function hasExtensions (v, extensions) {
  var found = false;
  var i;
  var count = extensions.length;
  for (i = 0; i < count; i++) {
    found = hasExtension(v, extensions[i]);
    if (found) {
      break;
    }
  }
  return found;
}

function isOneOf (v, values) {
  return values.indexOf(v) !== -1;
}

function HtmlWebpackIncludeAssetsPlugin (options) {
  assert(isObject(options), 'HtmlWebpackIncludeAssetsPlugin options are required');
  var assets;
  if (isString(options.assets) || isObject(options.assets)) {
    assets = [options.assets];
  } else {
    assets = options.assets;
  }
  assert(isArray(assets), 'HtmlWebpackIncludeAssetsPlugin options must have an assets key with an array or string value');
  var jsExtensions;
  if (options.jsExtensions !== undefined) {
    if (isString(options.jsExtensions)) {
      jsExtensions = [options.jsExtensions];
    } else {
      jsExtensions = options.jsExtensions;
      assert(isArray(jsExtensions), 'HtmlWebpackIncludeAssetsPlugin options jsExtensions key should be a string or array of strings (' + jsExtensions + ')');
      var jsExtensionCount = jsExtensions.length;
      var jsExtension;
      for (var j = 0; j < jsExtensionCount; j++) {
        jsExtension = jsExtensions[j];
        assert(isString(jsExtension), 'HtmlWebpackIncludeAssetsPlugin options jsExtensions key array should not contain non-strings (' + jsExtension + ')');
      }
    }
  } else {
    jsExtensions = defaultOptions.jsExtensions;
  }
  var cssExtensions;
  if (options.cssExtensions !== undefined) {
    if (isString(options.cssExtensions)) {
      cssExtensions = [options.cssExtensions];
    } else {
      cssExtensions = options.cssExtensions;
      assert(isArray(cssExtensions), 'HtmlWebpackIncludeAssetsPlugin options cssExtensions key should be a string or array of strings (' + cssExtensions + ')');
      var cssExtensionCount = cssExtensions.length;
      var cssExtension;
      for (var c = 0; c < cssExtensionCount; c++) {
        cssExtension = cssExtensions[c];
        assert(isString(cssExtension), 'HtmlWebpackIncludeAssetsPlugin options cssExtensions key array should not contain non-strings (' + cssExtension + ')');
      }
    }
  } else {
    cssExtensions = defaultOptions.cssExtensions;
  }
  var assetCount = assets.length;
  var asset;
  var assetPath;
  for (var i = 0; i < assetCount; i++) {
    asset = assets[i];
    if (isString(asset) || (isObject(asset) && !asset.type)) {
      assetPath = isString(asset) ? asset : asset.path;
      assert(isString(assetPath),
        'HtmlWebpackIncludeAssetsPlugin options assets key array objects must contain a string path property (' + assetPath + ')');
      assert(hasExtensions(assetPath, jsExtensions) || hasExtensions(assetPath, cssExtensions),
        'HtmlWebpackIncludeAssetsPlugin options assets key array should not contain strings not ending with the js or css extensions (' + asset + ')');
    } else {
      assert(isObject(asset), 'HtmlWebpackIncludeAssetsPlugin options assets key array must contain only strings and objects (' + asset + ')');
      assert(isString(asset.path),
        'HtmlWebpackIncludeAssetsPlugin options assets key array objects must contain a string path property (' + asset.path + ')');
      assert(isOneOf(asset.type, ['js', 'css']),
        'HtmlWebpackIncludeAssetsPlugin options assets key array objects must contain a string type property set to either `js` or `css` (' + asset.type + ')');
    }
  }
  assert(isBoolean(options.append), 'HtmlWebpackIncludeAssetsPlugin options must have an append key with a boolean value');
  var publicPath;
  if (options.publicPath !== undefined) {
    assert(isBoolean(options.publicPath) || isString(options.publicPath),
      'HtmlWebpackIncludeAssetsPlugin options should specify a publicPath that is either a boolean or a string');
    publicPath = options.publicPath;
  } else {
    publicPath = defaultOptions.publicPath;
  }
  var hash;
  if (options.hash !== undefined) {
    assert(isBoolean(options.hash), 'HtmlWebpackIncludeAssetsPlugin options should specify a hash key with a boolean value');
    hash = options.hash;
  } else {
    hash = defaultOptions.hash;
  }
  var files;
  if (isString(options.files)) {
    files = [options.files];
  } else {
    files = options.files;
  }
  this.options = {
    assets: assets,
    jsExtensions: jsExtensions,
    cssExtensions: cssExtensions,
    append: options.append,
    publicPath: publicPath,
    hash: hash,
    files: files
  };
}

HtmlWebpackIncludeAssetsPlugin.prototype.apply = function (compiler) {
  var self = this;

  // Hook into the html-webpack-plugin processing
  compiler.plugin('compilation', function (compilation) {
    compilation.plugin('html-webpack-plugin-before-html-generation', function (htmlPluginData, callback) {
      var files = self.options.files;
      var shouldSkip = files && !files.some(function (file) {
        return minimatch(htmlPluginData.outputName, file);
      });

      if (shouldSkip) {
        return callback(null, htmlPluginData);
      }

      var includeAssets = self.options.assets;
      var jsExtensions = self.options.jsExtensions;
      var cssExtensions = self.options.cssExtensions;
      var appendAssets = self.options.append;
      var publicPath = self.options.publicPath;
      var hash = self.options.hash;
      var assets = htmlPluginData.assets;
      var includeAssetPrefix = publicPath === true ? assets.publicPath : isString(publicPath) ? publicPath : '';
      var includeAssetHash = hash === true ? ('?' + compilation.hash) : '';

      var includeAsset;
      var includeAssetPath;
      var includeAssetType;
      var includeCount = includeAssets.length;
      var jsAssets = [];
      var cssAssets = [];
      for (var i = 0; i < includeCount; i++) {
        includeAssetPath = isString(includeAssets[i]) ? includeAssets[i] : includeAssets[i].path;
        includeAssetType = isObject(includeAssets[i]) ? includeAssets[i].type : null;
        includeAsset = includeAssetPrefix + includeAssetPath + includeAssetHash;
        if ((includeAssetType && includeAssetType === 'js') || hasExtensions(includeAsset, jsExtensions)) {
          if (assets.js.indexOf(includeAsset) === -1 && jsAssets.indexOf(includeAsset) === -1) {
            jsAssets.push(includeAsset);
          }
        } else if ((includeAssetType && includeAssetType === 'css') || hasExtensions(includeAsset, cssExtensions)) {
          if (assets.css.indexOf(includeAsset) === -1 && cssAssets.indexOf(includeAsset) === -1) {
            cssAssets.push(includeAsset);
          }
        }
      }
      if (appendAssets) {
        assets.js = assets.js.concat(jsAssets);
        assets.css = assets.css.concat(cssAssets);
      } else {
        assets.js = jsAssets.concat(assets.js);
        assets.css = cssAssets.concat(assets.css);
      }
      callback(null, htmlPluginData);
    });
  });
};

module.exports = HtmlWebpackIncludeAssetsPlugin;
