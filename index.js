'use strict';
var assert = require('assert');

function HtmlWebpackIncludeAssetsPlugin (options) {
  assert(typeof options === 'object', 'HtmlWebpackIncludeAssetsPlugin options are required');
  assert(Array.isArray(options.assets), 'HtmlWebpackIncludeAssetsPlugin options must have an assets key with an array value');
  assert(typeof options.append === 'boolean', 'HtmlWebpackIncludeAssetsPlugin options must have an append key with a boolean value');
  var assets = options.assets;
  var assetsCount = assets.length;
  for (var i = 0; i < assetsCount; i++) {
    this.validateAsset(assets[i]);
  }
  this.options = options;
}

HtmlWebpackIncludeAssetsPlugin.prototype.apply = function (compiler) {
  var self = this;

  // Hook into the html-webpack-plugin processing
  compiler.plugin('compilation', function (compilation) {
    compilation.plugin('html-webpack-plugin-before-html-generation', function (htmlPluginData, callback) {
      var includeAssets = self.options.assets;
      var appendAssets = self.options.append;
      var assets = htmlPluginData.assets;
      // Skip if the plugin configuration didn't set `includeAssets`
      if (!includeAssets) {
        return callback(null);
      }

      if (includeAssets.constructor !== Array) {
        includeAssets = [includeAssets];
      }

      var includeAsset;
      var includeCount = includeAssets.length;
      for (var i = 0; i < includeCount; i++) {
        includeAsset = includeAssets[i];
        self.validateAsset(includeAsset);
        if (self.hasExtension(includeAsset, '.js')) {
          if (assets.js.indexOf(includeAsset) === -1) {
            if (appendAssets) {
              assets.js.push(includeAsset);
            } else {
              assets.js.unshift(includeAsset);
            }
          }
        }
        if (self.hasExtension(includeAsset, '.css')) {
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

HtmlWebpackIncludeAssetsPlugin.prototype.hasExtension = function (asset, extension) {
  var lastIndex = asset.lastIndexOf(extension);
  return lastIndex !== -1 && lastIndex === asset.length - extension.length;
};

HtmlWebpackIncludeAssetsPlugin.prototype.validateAsset = function (asset) {
  assert.equal(typeof asset, 'string', 'The HtmlWebpackIncludeAssetsPlugin requires that all includeAssets be strings (' + asset + ')');
  var hasValidExtension = this.hasExtension(asset, '.js') || this.hasExtension(asset, '.css');
  assert.equal(hasValidExtension, true, 'The HtmlWebpackIncludeAssetsPlugin requires that all includeAssets have a js or css extension (' + asset + ')');
};

module.exports = HtmlWebpackIncludeAssetsPlugin;
