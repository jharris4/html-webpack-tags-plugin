'use strict';
const assert = require('assert');
const minimatch = require('minimatch');
const glob = require('glob');
const path = require('path');
const slash = require('slash');

const DEFAULT_OPTIONS = {
  append: true,
  useHash: false,
  addHash: (assetPath, hash) => assetPath + '?' + hash,
  usePublicPath: true,
  addPublicPath: (assetPath, publicPath) => path.join(publicPath, assetPath),
  jsExtensions: ['.js'],
  cssExtensions: ['.css']
};

const ASSET_TYPE_CSS = 'css';
const ASSET_TYPE_JS = 'js';

const ASSET_TYPES = [ASSET_TYPE_CSS, ASSET_TYPE_JS];

function isType (type) {
  return ASSET_TYPES.indexOf(type) !== -1;
}

function isCss (type) {
  return type === ASSET_TYPE_CSS;
}

function isDefined (v) {
  return v !== void 0;
}

function isObject (v) {
  return v !== null && v !== void 0 && typeof v === 'object' && !isArray(v);
}

function isBoolean (v) {
  return v === true || v === false;
}

function isNumber (v) {
  return v !== void 0 && (typeof v === 'number' || v instanceof Number) && isFinite(v);
}

function isString (v) {
  return v !== null && v !== void 0 && (typeof v === 'string' || v instanceof String);
}

function isArray (v) {
  return Array.isArray(v);
}

function isFunction (v) {
  return typeof v === 'function';
}

function getExtensions (options, key) {
  let extensions = DEFAULT_OPTIONS[key];
  if (isDefined(options[key])) {
    if (isString(options[key])) {
      extensions = [options[key]];
    } else {
      extensions = options[key];
      assert(isArray(extensions), `HtmlWebpackIncludeAssetsPlugin options.${key} should be a string or array of strings (${extensions})`);
      extensions.forEach(function (extension) {
        assert(isString(extension), `HtmlWebpackIncludeAssetsPlugin options.${key} array should only contain strings (${extension})`);
      });
    }
  }
  return extensions;
}

function createExtensionsRegex (extensions) {
  return new RegExp(`.*(${extensions.join('|')})$`);
}

function getHasExtensions (options, key) {
  const regexp = createExtensionsRegex(getExtensions(options, key));
  return value => regexp.test(value);
}

function getAssetTypeCheckers (options) {
  const hasJsExtensions = getHasExtensions(options, 'jsExtensions');
  const hasCssExtensions = getHasExtensions(options, 'cssExtensions');
  return {
    isAssetTypeCss (value) {
      return hasCssExtensions(value);
    },
    isAssetTypeJs (value) {
      return hasJsExtensions(value);
    }
  };
}

function splitLinkScriptAssets (options, key, assetObjects) {
  const linkObjects = [];
  const scriptObjects = [];
  const { isAssetTypeCss, isAssetTypeJs } = getAssetTypeCheckers(options);

  assetObjects.forEach(assetObject => {
    if (isDefined(assetObject.type)) {
      const { type, ...others } = assetObject;
      assert(isType(type), `HtmlWebpackIncludeAssetsPlugin options.${key} type must be css or js (${type})`);
      (isCss(type) ? linkObjects : scriptObjects).push({
        ...others
      });
    } else {
      const { path } = assetObject;
      if (isAssetTypeCss(path)) {
        linkObjects.push(assetObject);
      } else if (isAssetTypeJs(path)) {
        scriptObjects.push(assetObject);
      } else {
        assert(false, `HtmlWebpackIncludeAssetsPlugin options.${key} could not determine asset type for (${path})`);
      }
    }
  });

  return [linkObjects, scriptObjects];
}

function getAssetObjects (asset, key) {
  let assetObjects;
  assert(isString(asset) || isObject(asset), `HtmlWebpackIncludeAssetsPlugin options.${key} items must be an object or string`);
  if (isString(asset)) {
    assetObjects = [{
      path: asset
    }];
  } else {
    assert(isString(asset.path), `HtmlWebpackIncludeAssetsPlugin options.${key} object must have a string path property`);
    if (isDefined(asset.publicPath)) {
      const { publicPath } = asset;
      assert(isBoolean(publicPath) || isFunction(publicPath), `HtmlWebpackIncludeAssetsPlugin options.${key} object publicPath should be a boolean or function`);
      if (isFunction(publicPath)) {
        assert(isString(publicPath('', '')), `HtmlWebpackIncludeAssetsPlugin options.${key} object publicPath should be a function that returns a string`);
      }
    }
    if (isDefined(asset.hash)) {
      const { hash } = asset;
      assert(isBoolean(hash) || isFunction(hash), `HtmlWebpackIncludeAssetsPlugin options.${key} object hash should be a boolean or function`);
      if (isFunction(hash)) {
        assert(isString(hash('', '')), `HtmlWebpackIncludeAssetsPlugin options.${key} object hash should be a function that returns a string`);
      }
    }
    if (isDefined(asset.assetPath)) {
      assert(isString(asset.assetPath), `HtmlWebpackIncludeAssetsPlugin options.${key} object should have a string assetPath property`);
    }
    if (isDefined(asset.attributes)) {
      const { attributes } = asset;
      assert(isObject(attributes), `HtmlWebpackIncludeAssetsPlugin options.${key} object should have an object attributes property`);
      Object.keys(attributes).forEach(attribute => {
        const value = attributes[attribute];
        assert(isString(value) || isBoolean(value) || isNumber(value), `HtmlWebpackIncludeAssetsPlugin options.${key} object attribute values should strings, booleans or numbers`);
      });
    }
    if (isDefined(asset.glob) || isDefined(asset.globPath)) {
      const { glob: assetGlob, globPath, ...otherAssetProperties } = asset;
      assert(isString(assetGlob), `HtmlWebpackIncludeAssetsPlugin options.${key} object should have a string glob property`);
      assert(isString(globPath), `HtmlWebpackIncludeAssetsPlugin options.${key} object should have a string globPath property`);
      const globAssets = glob.sync(assetGlob, { cwd: globPath });
      const globAssetPaths = globAssets.map(globAsset => slash(path.join(asset.path, globAsset)));
      assert(globAssetPaths.length > 0, `HtmlWebpackIncludeAssetsPlugin options.${key} object glob found no files (${asset.path} ${assetGlob} ${globPath})`);
      assetObjects = [];
      globAssetPaths.forEach(globAssetPath => {
        assetObjects.push({
          ...otherAssetProperties,
          path: globAssetPath
        });
      });
    } else {
      assetObjects = [asset];
    }
  }
  return assetObjects;
}

function getAllAssetObjects (options, key) {
  let assetObjects;
  if (isDefined(options[key])) {
    let assets = options[key];
    assert(isString(assets) || isObject(assets) || isArray(assets), `HtmlWebpackIncludeAssetsPlugin options.${key} should be a string, object, or array (${assets})`);
    if (isArray(assets)) {
      assetObjects = [];
      assets.forEach(asset => {
        assetObjects = assetObjects.concat(getAssetObjects(asset, key));
      });
    } else {
      assetObjects = getAssetObjects(assets, key);
    }
  }
  return assetObjects;
}

function HtmlWebpackIncludeAssetsPlugin (options) {
  assert(isObject(options), 'HtmlWebpackIncludeAssetsPlugin options should be an object');
  if (isObject(options)) {
    let append = DEFAULT_OPTIONS.append;
    if (isDefined(options.append)) {
      assert(isBoolean(options.append), 'HtmlWebpackIncludeAssetsPlugin options.append should be a boolean');
      append = options.append;
    }

    // TODO - this is wrong, need to return both addPublicPath and usePublicPath to enable asset object override
    // if (isDefined(options.usePublicPath)) {

    // }

    let usePublicPath = DEFAULT_OPTIONS.usePublicPath;
    let addPublicPath = DEFAULT_OPTIONS.addPublicPath;
    if (isDefined(options.usePublicPath) || isDefined(options.addPublicPath)) {
      if (isDefined(options.usePublicPath)) {
        assert(isBoolean(options.usePublicPath), 'HtmlWebpackIncludeAssetsPlugin options.usePublicPath should be a boolean');
        usePublicPath = options.usePublicPath;
      }
      if (isDefined(options.addPublicPath)) {
        assert(isFunction(options.addPublicPath), 'HtmlWebpackIncludeAssetsPlugin options.addPublicPath should be a function');
        assert(isString(options.addPublicPath('', '')), 'HtmlWebpackIncludeAssetsPlugin options.addPublicPath should be a function that returns a string');
        addPublicPath = options.addPublicPath;
      }
    } else if (isDefined(options.publicPath)) {
      const { publicPath } = options;
      assert(isBoolean(publicPath) || isString(publicPath) || isFunction(publicPath),
        'HtmlWebpackIncludeAssetsPlugin options should specify a publicPath that is either a boolean or a string or a function');
      if (isBoolean(publicPath)) {
        usePublicPath = publicPath;
      } else if (isString(publicPath)) {
        // create function that injects the string
        usePublicPath = true;
        const oldAddPublicPath = addPublicPath;
        addPublicPath = path => oldAddPublicPath(path, publicPath);
      } else {
        assert(isString(publicPath('', '')), `HtmlWebpackIncludeAssetsPlugin options.publicPath should be a function that returns a string`);
        usePublicPath = true;
        addPublicPath = publicPath;
      }
    }

    let useHash = DEFAULT_OPTIONS.useHash;
    let addHash = DEFAULT_OPTIONS.addHash;
    if (isDefined(options.useHash) || isDefined(options.addHash)) {
      if (isDefined(options.useHash)) {
        assert(isBoolean(options.useHash), 'HtmlWebpackIncludeAssetsPlugin options.useHash should be a boolean');
        useHash = options.useHash;
      }
      if (isDefined(options.addHash)) {
        assert(isFunction(options.addHash), 'HtmlWebpackIncludeAssetsPlugin options.addHash should be a function');
        assert(isString(options.addHash('', '')), 'HtmlWebpackIncludeAssetsPlugin options.addHash should be a function that returns a string');
        addHash = options.addHash;
      }
    } else if (isDefined(options.hash)) {
      const { hash } = options;
      assert(isBoolean(hash) || isFunction(hash), 'HtmlWebpackIncludeAssetsPlugin options.hash should be a boolean or a function');
      if (isBoolean(hash)) {
        useHash = hash;
      } else {
        assert(isString(hash('', '')), `HtmlWebpackIncludeAssetsPlugin options.hash should be a function that returns a string`);
        useHash = true;
        addHash = hash;
      }
    }

    let links = [];
    let scripts = [];
    if (isDefined(options.assets)) {
      const assetObjects = getAllAssetObjects(options, 'assets');
      const [linkObjects, scriptObjects] = splitLinkScriptAssets(options, 'assets', assetObjects);
      links = links.concat(linkObjects);
      scripts = scripts.concat(scriptObjects);
    }
    if (isDefined(options.links)) {
      const linkObjects = getAllAssetObjects(options, 'links');
      links = links.concat(linkObjects);
    }
    if (isDefined(options.scripts)) {
      const scriptObjects = getAllAssetObjects(options, 'scripts');
      scripts = scripts.concat(scriptObjects);
    }

    let shouldSkip = () => false;
    if (isDefined(options.files)) {
      let { files } = options;
      assert((isString(files) || isArray(files)), 'HtmlWebpackIncludeAssetsPlugin options.files should be a string or array');
      if (isString(files)) {
        files = [files];
      } else if (isArray(files)) {
        files.forEach(file => {
          assert(isString(file), 'HtmlWebpackIncludeAssetsPlugin options.files should be an array of strings');
        });
      }
      shouldSkip = htmlPluginData => !files.some(function (file) {
        return minimatch(htmlPluginData.outputName, file);
      });
    }

    this.options = {
      links,
      scripts,
      append: append,
      usePublicPath,
      addPublicPath,
      useHash,
      addHash,
      shouldSkip
    };
  }
}

function getAssetPath (assetObject, usePublicPath, addPublicPath, useHash, addHash, webpackPublicPath, compilationHash) {
  const { publicPath, hash } = assetObject;
  let { path } = assetObject;

  if (isDefined(publicPath)) {
    if (publicPath === true) {
      path = addPublicPath(path, webpackPublicPath);
    } else if (isFunction(publicPath)) {
      path = publicPath(path, webpackPublicPath);
    }
  } else if (usePublicPath) {
    path = addPublicPath(path, webpackPublicPath);
  }
  if (isDefined(hash)) {
    if (hash === true) {
      path = addHash(path, compilationHash);
    } else if (isFunction(hash)) {
      path = hash(path, compilationHash);
    }
  } else if (useHash) {
    path = addHash(path, compilationHash);
  }
  return path;
}

HtmlWebpackIncludeAssetsPlugin.prototype.apply = function (compiler) {
  const { options } = this;
  const { usePublicPath, addPublicPath, useHash, addHash, shouldSkip } = options;

  // Hook into the html-webpack-plugin processing
  const onCompilation = compilation => {
    const onBeforeHtmlGeneration = (htmlPluginData, callback) => {
      if (shouldSkip(htmlPluginData)) {
        if (callback) {
          return callback(null, htmlPluginData);
        } else {
          return Promise.resolve(htmlPluginData);
        }
      }

      const { assets } = htmlPluginData;
      const pluginPublicPath = assets.publicPath;
      const compilationHash = compilation.hash;
      const assetPromises = [];

      const { links, scripts, append } = options;

      const addAsset = assetPath => {
        try {
          return htmlPluginData.plugin.addFileToAssets(assetPath, compilation);
        } catch (err) {
          return Promise.reject(err);
        }
      };

      const jsPaths = [];
      const cssPaths = [];
      scripts.forEach(script => {
        if (isString(script.assetPath)) {
          assetPromises.push(addAsset(script.assetPath));
        }
        jsPaths.push(getAssetPath(script, usePublicPath, addPublicPath, useHash, addHash, pluginPublicPath, compilationHash));
      });
      links.forEach(link => {
        if (isString(link.assetPath)) {
          assetPromises.push(addAsset(link.assetPath));
        }
        cssPaths.push(getAssetPath(link, usePublicPath, addPublicPath, useHash, addHash, pluginPublicPath, compilationHash));
      });

      if (append) {
        assets.js = assets.js.concat(jsPaths);
        assets.css = assets.css.concat(cssPaths);
      } else {
        assets.js = jsPaths.concat(assets.js);
        assets.css = cssPaths.concat(assets.css);
      }

      Promise.all(assetPromises).then(
        () => {
          if (callback) {
            callback(null, htmlPluginData);
          } else {
            return Promise.resolve(htmlPluginData);
          }
        },
        (err) => {
          if (callback) {
            callback(err);
          } else {
            return Promise.reject(err);
          }
        }
      );
    };

    const onAlterAssetTag = (htmlPluginData, callback) => {
      if (shouldSkip(htmlPluginData)) {
        if (callback) {
          return callback(null, htmlPluginData);
        } else {
          return Promise.resolve(htmlPluginData);
        }
      }

      const { append, scripts, links } = this.options;
      var pluginHead = htmlPluginData.head ? htmlPluginData.head : htmlPluginData.headTags;
      var pluginBody = htmlPluginData.body ? htmlPluginData.body : htmlPluginData.bodyTags;

      pluginHead = pluginHead.slice(
        append ? pluginHead.length - links.length : 0,
        append ? pluginHead.length : links.length
      );

      pluginBody = pluginBody.slice(
        append ? pluginHead.length - scripts.length : 0,
        append ? pluginHead.length : scripts.length
      );

      pluginBody.forEach(function (tag, i) {
        const { attributes } = scripts[i];
        if (attributes) {
          const { attributes: tagAttributes } = tag;
          Object.keys(attributes).forEach(attribute => {
            tagAttributes[attribute] = attributes[attribute];
          });
        }
      });

      pluginHead.forEach(function (tag, i) {
        const { attributes } = links[i];
        if (attributes) {
          const { attributes: tagAttributes } = tag;
          Object.keys(attributes).forEach(attribute => {
            tagAttributes[attribute] = attributes[attribute];
          });
        }
      });

      if (callback) {
        callback(null, htmlPluginData);
      } else {
        return Promise.resolve(htmlPluginData);
      }
    };

    // Webpack >= 4
    if (compilation.hooks) {
      // HtmlWebPackPlugin - new
      if (compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration) {
        compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration.tapAsync('htmlWebpackIncludeAssetsPlugin', onBeforeHtmlGeneration);
        compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync('htmlWebpackIncludeAssetsPlugin', onAlterAssetTag);
      } else {
        const message = "Error running html-webpack-include-assets-plugin, are you sure you have html-webpack-plugin before it in your webpack config's plugins?";
        throw new Error(message);
      }
    } else {
      // Webpack < 4
      compilation.plugin('html-webpack-plugin-before-html-generation', onBeforeHtmlGeneration);
      compilation.plugin('html-webpack-plugin-alter-asset-tags', onAlterAssetTag);
    }
  };

  // Webpack 4+
  if (compiler.hooks) {
    compiler.hooks.compilation.tap('htmlWebpackIncludeAssetsPlugin', onCompilation);
  } else {
    // Webpack 3
    compiler.plugin('compilation', onCompilation);
  }
};

module.exports = HtmlWebpackIncludeAssetsPlugin;
