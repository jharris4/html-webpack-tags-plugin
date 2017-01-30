'use strict';
var assert = require('assert');

var defaultOptions = {
  publicPath: true,
  hash: false
};

function isObject (v) {
  return v !== null && v !== undefined && typeof v === 'object';
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

function endsWith (v, ending) {
  // Remove anything after `?`
  if (v.indexOf('?') !== -1) v = v.substr(0, v.indexOf('?'));

  var lastIndex = v.lastIndexOf(ending);
  return lastIndex !== -1 && lastIndex === v.length - ending.length;
}

function HtmlWebpackIncludeAssetsPlugin (options) {
  assert(isObject(options), 'HtmlWebpackIncludeAssetsPlugin options are required');
  var assets;
  if (isString(options.assets)) {
    assets = [options.assets];
  } else {
    assets = options.assets;
  }
  assert(isArray(assets), 'HtmlWebpackIncludeAssetsPlugin options must have an assets key with an array or string value');
  var assetCount = assets.length;
  var asset;
  for (var i = 0; i < assetCount; i++) {
    asset = assets[i];
    assert(isString(asset), 'HtmlWebpackIncludeAssetsPlugin options assets key array should not contain non-strings (' + asset + ')');
    assert(endsWith(asset, '.js') || endsWith(asset, '.css'),
      'HtmlWebpackIncludeAssetsPlugin options assets key array should not contain strings not ending in .js or .css (' + asset + ')');
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
    assert(isBoolean(options.hash), 'HtmlWebpackIncludeAssetsPlugin options must have an hash key with a boolean value');
    hash = options.hash;
  } else {
    hash = defaultOptions.hash;
  }
  this.options = {
    assets: assets,
    append: options.append,
    publicPath: publicPath,
    hash: hash
  };
}

HtmlWebpackIncludeAssetsPlugin.prototype.apply = function (compiler) {
  var self = this;

  // Hook into the html-webpack-plugin processing
  compiler.plugin('compilation', function (compilation) {
    compilation.plugin('html-webpack-plugin-before-html-generation', function (htmlPluginData, callback) {
      var includeAssets = self.options.assets;
      var appendAssets = self.options.append;
      var publicPath = self.options.publicPath;
      var hash = self.options.hash;
      var assets = htmlPluginData.assets;
      var includeAssetPrefix = publicPath === true ? assets.publicPath : isString(publicPath) ? publicPath : '';
      var includeAssetHash = hash === true ? '?' + compilation.hash : '';

      if (includeAssets.constructor !== Array) {
        includeAssets = [includeAssets];
      }

      var includeAsset;
      var includeCount = includeAssets.length;
      for (var i = 0; i < includeCount; i++) {
        includeAsset = includeAssetPrefix + includeAssets[i] + includeAssetHash;
        if (endsWith(includeAsset, '.js')) {
          if (assets.js.indexOf(includeAsset) === -1) {
            if (appendAssets) {
              assets.js.push(includeAsset);
            } else {
              assets.js.unshift(includeAsset);
            }
          }
        } else if (endsWith(includeAsset, '.css')) {
          if (assets.css.indexOf(includeAsset) === -1) {
            if (appendAssets) {
              assets.css.push(includeAsset);
            } else {
              assets.css.unshift(includeAsset);
            }
          }
        }
      }
      callback(null);
    });
  });
};

module.exports = HtmlWebpackIncludeAssetsPlugin;
