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

function isFunction (v) {
  return typeof v === 'function';
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
  var cssAssets;
  if (options.resolvePaths !== undefined) {
    assert(isBoolean(options.resolvePaths), 'HtmlWebpackIncludeAssetsPlugin options should specify a resolvePaths that is a boolean');
  }
  if (isString(options.assets) || isObject(options.assets)) {
    assets = [options.assets];
  } else {
    assets = options.assets;
  }
  assert(isArray(assets), 'HtmlWebpackIncludeAssetsPlugin options must have an assets key with an array or string value');
  if (options.cssAssets !== undefined) {
    cssAssets = options.cssAssets;
    assert(isArray(cssAssets), 'HtmlWebpackIncludeAssetsPlugin options cssAsset key should be an array');
    if (isArray(cssAssets)) {
      cssAssets.forEach(function (cssAsset) {
        assert(isObject(cssAsset), 'HtmlWebpackIncludeAssetsPlugin options cssAsset key should be an array of objects');
        assert(isString(cssAsset.href), 'HtmlWebpackIncludeAssetsPlugin options cssAsset key should be an array of objects with string href');
        if (cssAsset.attributes !== undefined) {
          assert(isObject(cssAsset.attributes), 'HtmlWebpackIncludeAssetsPlugin options cssAsset key should be an array of objects with undefined or object attributes');
        } else {
          cssAsset.attributes = {};
        }
        if (cssAsset.asset !== undefined) {
          assert(isBoolean(cssAsset.asset), 'HtmlWebpackIncludeAssetsPlugin options cssAsset key should be an array of objects with undefined or boolean asset');
        } else {
          cssAsset.asset = true;
        }
      });
    }
  } else {
    cssAssets = [];
  }
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
      if (asset.assetPath !== undefined) {
        assert(isString(asset.assetPath),
          'HtmlWebpackIncludeAssetsPlugin options assets key array objects assetPath property should be a string (' + asset.assetPath + ')');
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
        if (isObject(asset.attributes)) {
          forOwn(asset.attributes, function (value) {
            assert(isString(value) || isBoolean(value), 'HtmlWebpackIncludeAssetsPlugin options assets key array objects attributes property should be an object with string or boolean values');
          });
        }
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
    assert(isBoolean(options.hash) || isFunction(options.hash), 'HtmlWebpackIncludeAssetsPlugin options should specify a hash key with a boolean or function value');
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
    cssAssets: cssAssets,
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
      if (isFunction(hash)) {
        includeAssetPath = hash(includeAssetPath, compilation.hash);
      }
      var assetPath = includeAssetPrefix + includeAssetPath + includeAssetHash;
      return self.options.resolvePaths ? path.resolve(assetPath) : assetPath;
    };

    var jsAssetAttributes = [];
    var jsAssetStrings = [];
    var cssAssetAttributes = [];
    var cssAssetStrings = [];

    function onBeforeHtmlGeneration (htmlPluginData, callback) {
      if (shouldSkip(htmlPluginData)) {
        if (callback) {
          return callback(null, htmlPluginData);
        } else {
          return Promise.resolve(htmlPluginData);
        }
      }

      var addAsset = function (assetPath) {
        var promise;
        try {
          promise = htmlPluginData.plugin.addFileToAssets(
            assetPath,
            compilation
          );
          return promise;
        } catch (err) {
          return Promise.reject(err);
        }
      };

      var includeAssets = self.options.assets;
      var includeCssAssets = self.options.cssAssets;
      var jsExtensions = self.options.jsExtensions;
      var cssExtensions = self.options.cssExtensions;
      var appendAssets = self.options.append;
      var assets = htmlPluginData.assets;

      defaultPublicPath = assets.publicPath;

      var includeAsset;
      var includeAssetString;
      var includeAssetPaths;
      var includeAssetAttributes;
      var includeAssetCount;
      var includeAssetPath;
      var includeAssetType;
      var includeAssetsLength = includeAssets.length;
      var assetPromises = [];

      for (var i = 0; i < includeAssetsLength; i++) {
        includeAsset = includeAssets[i];
        includeAssetAttributes = {};
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
          if (includeAsset.assetPath !== undefined) {
            assetPromises.push(addAsset(includeAsset.assetPath));
          }
          if (includeAsset.attributes !== undefined) {
            includeAssetAttributes = includeAsset.attributes;
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
            jsAssetStrings.push(includeAssetString);
            jsAssetAttributes.push(includeAssetAttributes);
          } else if ((includeAssetType && includeAssetType === 'css') || hasExtensions(includeAssetString, cssExtensions)) {
            cssAssetStrings.push(includeAssetString);
            cssAssetAttributes.push(includeAssetAttributes);
          }
        }
      }
      if (includeCssAssets) {
        var includeCount = includeCssAssets.length;
        for (var j = 0; j < includeCount; j++) {
          if (includeCssAssets[j].asset !== false) {
            cssAssetStrings.push(defaultPublicPath + includeCssAssets[j].href);
          } else {
            cssAssetStrings.push(includeCssAssets[j].href);
          }
          cssAssetAttributes.push(includeCssAssets[j].attributes || {});
        }
      }
      if (appendAssets) {
        assets.js = assets.js.concat(jsAssetStrings);
        assets.css = assets.css.concat(cssAssetStrings);
      } else {
        assets.js = jsAssetStrings.concat(assets.js);
        assets.css = cssAssetStrings.concat(assets.css);
      }
      Promise.all(assetPromises).then(
        function () {
          if (callback) {
            callback(null, htmlPluginData);
          } else {
            return Promise.resolve(htmlPluginData);
          }
        },
        function (err) {
          if (callback) {
            callback(err);
          } else {
            return Promise.reject(err);
          }
        }
      );
    }

    function onAlterAssetTag (htmlPluginData, callback) {
      if (shouldSkip(htmlPluginData)) {
        if (callback) {
          return callback(null, htmlPluginData);
        } else {
          return Promise.resolve(htmlPluginData);
        }
      }

      var append = self.options.append;
      var pluginHead = htmlPluginData.head ? htmlPluginData.head : htmlPluginData.headTags;
      var pluginBody = htmlPluginData.body ? htmlPluginData.body : htmlPluginData.bodyTags;

      pluginHead = pluginHead.slice(
        append ? pluginHead.length - cssAssetAttributes.length : 0,
        append ? pluginHead.length : cssAssetAttributes.length
      );

      pluginBody = pluginBody.slice(
        append ? pluginHead.length - jsAssetAttributes.length : 0,
        append ? pluginHead.length : jsAssetAttributes.length
      );

      pluginBody.forEach(function (tag, i) {
        extend(tag.attributes, jsAssetAttributes[i]);
      });

      pluginHead.forEach(function (tag, i) {
        extend(tag.attributes, cssAssetAttributes[i]);
      });

      if (callback) {
        callback(null, htmlPluginData);
      } else {
        return Promise.resolve(htmlPluginData);
      }
    }

    // Webpack >= 4
    if (compilation.hooks) {
      // HtmlWebPackPlugin - new
      if (compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration) {
        compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration.tapAsync('htmlWebpackIncludeAssetsPlugin', onBeforeHtmlGeneration);
        compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync('htmlWebpackIncludeAssetsPlugin', onAlterAssetTag);
      } else {
        var HtmlWebpackPlugin = require('html-webpack-plugin');
        // HtmlWebPackPlugin - old
        if (HtmlWebpackPlugin.getHooks) {
          var hooks = HtmlWebpackPlugin.getHooks(compilation);
          hooks.beforeAssetTagGeneration.tapAsync('htmlWebpackIncludeAssetsPlugin', onBeforeHtmlGeneration);
          hooks.alterAssetTagGroups.tapAsync('htmlWebpackIncludeAssetsPlugin', onAlterAssetTag);
        } else {
          // var message = "Error running html-webpack-include-assets-plugin, are you sure you have html-webpack-plugin before it in your webpack config's plugins?";
          // throw new Error(message);
        }
      }
    } else {
      // Webpack < 4
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
