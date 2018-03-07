'use strict';
var assert = require('assert');
var minimatch = require('minimatch');
var glob = require('glob');
var path = require('path');
var slash = require('slash');

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

function forOwn (object, iterator) {
  var properties = Object.keys(object);
  var propertyCount = properties.length;
  var property;

  for (var i = 0; i < propertyCount; i++) {
    property = properties[i];
    iterator(object[property], property, object);
  }
}

function extend (target, source) {
  forOwn(source, function (value, property) {
    target[property] = value;
  });

  return target;
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
  for (var i = 0; i < assetCount; i++) {
    asset = assets[i];
    if (isString(asset)) {
      assert(hasExtensions(asset, jsExtensions) || hasExtensions(asset, cssExtensions),
        'HtmlWebpackIncludeAssetsPlugin options assets key array should only contain strings ending with the js or css extensions (' + asset + ')');
    } else if (isObject(asset)) {
      assert(isString(asset.path),
        'HtmlWebpackIncludeAssetsPlugin options assets key array objects path property must be a string (' + asset.path + ')');
      if (asset.glob !== undefined) {
        assert(isString(asset.glob),
          'HtmlWebpackIncludeAssetsPlugin options assets key array objects glob property should be a string (' + asset.glob + ')');
      }
      if (asset.globPath !== undefined) {
        assert(isString(asset.globPath),
          'HtmlWebpackIncludeAssetsPlugin options assets key array objects globPath property should be a string (' + asset.globPath + ')');
      }
      if (asset.type !== undefined) {
        assert(isOneOf(asset.type, ['js', 'css']),
          'HtmlWebpackIncludeAssetsPlugin options assets key array objects type property should be a string set to either `js` or `css` (' + asset.type + ')');
      } else {
        if (asset.glob !== undefined) {
          assert(hasExtensions(asset.glob, jsExtensions) || hasExtensions(asset.glob, cssExtensions),
            'HtmlWebpackIncludeAssetsPlugin options assets key array objects glob property should only contain strings ending with the js or css extensions if the type property is not set (' + asset + ')');
        } else {
          assert(hasExtensions(asset.path, jsExtensions) || hasExtensions(asset.path, cssExtensions),
            'HtmlWebpackIncludeAssetsPlugin options assets key array objects path property should only contain strings ending with the js or css extensions if the type property is not set (' + asset + ')');
        }
      }
      if (asset.attributes !== undefined) {
        assert(isObject(asset.attributes), 'HtmlWebpackIncludeAssetsPlugin options assets key array objects attributes property should be an object');
        forOwn(asset.attributes, function (value) {
          assert(isString(value), 'HtmlWebpackIncludeAssetsPlugin options assets key array objects attributes property should be an object with string values');
        });
      }
    } else {
      assert(false, 'HtmlWebpackIncludeAssetsPlugin options assets key array must contain only strings and objects (' + asset + ')');
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
  if (files !== undefined) {
    assert(isArray(files), 'HtmlWebpackIncludeAssetsPlugin options should specify a files key with an array or string value');
    var fileCount = files.length;
    var file;
    for (var f = 0; f < fileCount; f++) {
      file = files[f];
      assert(isString(file),
        'HtmlWebpackIncludeAssetsPlugin options files key array must contain only strings (' + file + ')');
    }
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
  function onCompilation (compilation) {
    var shouldSkip = function (htmlPluginData) {
      var files = self.options.files;
      return files !== undefined && !files.some(function (file) {
        return minimatch(htmlPluginData.outputName, file);
      });
    };

    var defaultPublicPath;
    var getAssetPath = function (includeAssetPath) {
      var publicPath = self.options.publicPath;
      var hash = self.options.hash;
      var includeAssetPrefix = publicPath === true ? defaultPublicPath : isString(publicPath) ? publicPath : '';
      var includeAssetHash = hash === true ? ('?' + compilation.hash) : '';
      return includeAssetPrefix + includeAssetPath + includeAssetHash;
    };

    function onBeforeHtmlGeneration (htmlPluginData, callback) {
      if (shouldSkip(htmlPluginData)) {
        if (callback) {
          return callback(null, htmlPluginData);
        } else {
          return Promise.resolve(htmlPluginData);
        }
      }

      var includeAssets = self.options.assets;
      var jsExtensions = self.options.jsExtensions;
      var cssExtensions = self.options.cssExtensions;
      var appendAssets = self.options.append;
      var assets = htmlPluginData.assets;
      defaultPublicPath = assets.publicPath;

      var includeAsset;
      var includeAssetString;
      var includeAssetPaths;
      var includeAssetCount;
      var includeAssetPath;
      var includeAssetType;
      var includeCount = includeAssets.length;
      var jsAssets = [];
      var cssAssets = [];
      for (var i = 0; i < includeCount; i++) {
        includeAsset = includeAssets[i];
        if (isObject(includeAsset)) {
          includeAssetType = includeAsset.type;
          if (includeAsset.glob === undefined) {
            includeAssetPaths = [includeAsset.path];
          } else {
            var cwd = includeAsset.globPath !== undefined ? includeAsset.globPath : path.join(compiler.options.output.path, includeAsset.path);

            var globOptions = {cwd: cwd};

                    // assets will be an array of strings with all matching asset file names
            includeAssetPaths = glob.sync(includeAsset.glob, globOptions).map(
                        function (globAsset) {
                          return slash(path.join(includeAsset.path, globAsset));
                        });
          }
        } else {
          includeAssetType = null;
          includeAssetPaths = [includeAsset];
        }
        includeAssetCount = includeAssetPaths.length;
        for (var a = 0; a < includeAssetCount; a++) {
          includeAssetPath = includeAssetPaths[a];
          includeAssetString = getAssetPath(includeAssetPath);
          if ((includeAssetType && includeAssetType === 'js') || hasExtensions(includeAssetString, jsExtensions)) {
            if (assets.js.indexOf(includeAssetString) === -1 && jsAssets.indexOf(includeAssetString) === -1) {
              jsAssets.push(includeAssetString);
            }
          } else if ((includeAssetType && includeAssetType === 'css') || hasExtensions(includeAssetString, cssExtensions)) {
            if (assets.css.indexOf(includeAssetString) === -1 && cssAssets.indexOf(includeAssetString) === -1) {
              cssAssets.push(includeAssetString);
            }
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

      if (callback) {
        callback(null, htmlPluginData);
      } else {
        return Promise.resolve(htmlPluginData);
      }
    }

    function onAlterAssetTag (htmlPluginData, callback) {
      var tags;
      var tagCount;
      var tag;
      var includeAssets = self.options.assets;
      var assetAttributes;
      var findAttributesForAsset = function (assets, href) {
        var assetCount = assets.length;
        var asset;

        for (var i = 0; i < assetCount; i++) {
          asset = assets[i];
          if (!isString(asset) && asset.attributes && href === getAssetPath(asset.path)) {
            return asset.attributes;
          }
        }
        return null;
      };

      if (shouldSkip(htmlPluginData)) {
        if (callback) {
          return callback(null, htmlPluginData);
        } else {
          return Promise.resolve(htmlPluginData);
        }
      }

      tags = htmlPluginData.head.concat(htmlPluginData.body);
      tagCount = tags.length;
      for (var i = 0; i < tagCount; i++) {
        tag = tags[i];
        assetAttributes = findAttributesForAsset(includeAssets, tag.attributes.href || tag.attributes.src);
        if (assetAttributes) {
          extend(tag.attributes, assetAttributes);
        }
      }

      if (callback) {
        callback(null, htmlPluginData);
      } else {
        return Promise.resolve(htmlPluginData);
      }
    }

    // Webpack 4+
    if (compilation.hooks) {
      compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration.tapAsync('htmlWebpackIncludeAssetsPlugin', onBeforeHtmlGeneration);
      compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync('htmlWebpackIncludeAssetsPlugin', onAlterAssetTag);
    } else {
        // Webpack 3
      compilation.plugin('html-webpack-plugin-before-html-generation', onBeforeHtmlGeneration);
      compilation.plugin('html-webpack-plugin-alter-asset-tags', onAlterAssetTag);
    }
  }

  // Webpack 4+
  if (compiler.hooks) {
    compiler.hooks.compilation.tap('htmlWebpackIncludeAssetsPlugin', onCompilation);
  } else {
    // Webpack 3
    compiler.plugin('compilation', onCompilation);
  }
};

module.exports = HtmlWebpackIncludeAssetsPlugin;
