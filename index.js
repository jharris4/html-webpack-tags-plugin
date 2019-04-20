'use strict';
const assert = require('assert');
const minimatch = require('minimatch');
const glob = require('glob');
const path = require('path');
const slash = require('slash');

const PLUGIN_NAME = 'HtmlWebpackTagsPlugin';

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

function getExtensions (options, optionExtensionName) {
  let extensions = DEFAULT_OPTIONS[optionExtensionName];
  if (isDefined(options[optionExtensionName])) {
    if (isString(options[optionExtensionName])) {
      extensions = [options[optionExtensionName]];
    } else {
      extensions = options[optionExtensionName];
      assert(isArray(extensions), `${PLUGIN_NAME} options.${optionExtensionName} should be a string or array of strings (${extensions})`);
      extensions.forEach(function (extension) {
        assert(isString(extension), `${PLUGIN_NAME} options.${optionExtensionName} array should only contain strings (${extension})`);
      });
    }
  }
  return extensions;
}

function createExtensionsRegex (extensions) {
  return new RegExp(`.*(${extensions.join('|')})$`);
}

function getHasExtensions (options, optionExtensionName) {
  const regexp = createExtensionsRegex(getExtensions(options, optionExtensionName));
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

function splitLinkScriptTags (options, optionName, assetObjects) {
  const linkObjects = [];
  const scriptObjects = [];
  const { isAssetTypeCss, isAssetTypeJs } = getAssetTypeCheckers(options);

  assetObjects.forEach(assetObject => {
    if (isDefined(assetObject.type)) {
      const { type, ...others } = assetObject;
      assert(isType(type), `${PLUGIN_NAME} options.${optionName} type must be css or js (${type})`);
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
        assert(false, `${PLUGIN_NAME} options.${optionName} could not determine asset type for (${path})`);
      }
    }
  });

  return [linkObjects, scriptObjects];
}

function getAssetObjects (asset, optionName) {
  let assetObjects;
  assert(isString(asset) || isObject(asset), `${PLUGIN_NAME} options.${optionName} items must be an object or string`);
  if (isString(asset)) {
    assetObjects = [{
      path: asset
    }];
  } else {
    assert(isString(asset.path), `${PLUGIN_NAME} options.${optionName} object must have a string path property`);
    if (isDefined(asset.publicPath)) {
      const { publicPath } = asset;
      assert(isBoolean(publicPath) || isFunction(publicPath), `${PLUGIN_NAME} options.${optionName} object publicPath should be a boolean or function`);
      if (isFunction(publicPath)) {
        assert(isString(publicPath('', '')), `${PLUGIN_NAME} options.${optionName} object publicPath should be a function that returns a string`);
      }
    }
    if (isDefined(asset.hash)) {
      const { hash } = asset;
      assert(isBoolean(hash) || isFunction(hash), `${PLUGIN_NAME} options.${optionName} object hash should be a boolean or function`);
      if (isFunction(hash)) {
        assert(isString(hash('', '')), `${PLUGIN_NAME} options.${optionName} object hash should be a function that returns a string`);
      }
    }
    if (isDefined(asset.sourcePath)) {
      assert(isString(asset.sourcePath), `${PLUGIN_NAME} options.${optionName} object should have a string sourcePath property`);
    }
    if (isDefined(asset.attributes)) {
      const { attributes } = asset;
      assert(isObject(attributes), `${PLUGIN_NAME} options.${optionName} object should have an object attributes property`);
      Object.keys(attributes).forEach(attribute => {
        const value = attributes[attribute];
        assert(isString(value) || isBoolean(value) || isNumber(value), `${PLUGIN_NAME} options.${optionName} object attribute values should strings, booleans or numbers`);
      });
    }
    if (isDefined(asset.glob) || isDefined(asset.globPath)) {
      const { glob: assetGlob, globPath, ...otherAssetProperties } = asset;
      assert(isString(assetGlob), `${PLUGIN_NAME} options.${optionName} object should have a string glob property`);
      assert(isString(globPath), `${PLUGIN_NAME} options.${optionName} object should have a string globPath property`);
      const globAssets = glob.sync(assetGlob, { cwd: globPath });
      const globAssetPaths = globAssets.map(globAsset => slash(path.join(asset.path, globAsset)));
      assert(globAssetPaths.length > 0, `${PLUGIN_NAME} options.${optionName} object glob found no files (${asset.path} ${assetGlob} ${globPath})`);
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

function getAllAssetObjects (options, optionName) {
  let assetObjects;
  if (isDefined(options[optionName])) {
    const assets = options[optionName];
    assert(isString(assets) || isObject(assets) || isArray(assets), `${PLUGIN_NAME} options.${optionName} should be a string, object, or array (${assets})`);
    if (isArray(assets)) {
      assetObjects = [];
      assets.forEach(asset => {
        assetObjects = assetObjects.concat(getAssetObjects(asset, optionName));
      });
    } else {
      assetObjects = getAssetObjects(assets, optionName);
    }
  }
  return assetObjects;
}

function filterExternalAssetObjects (assetObjects, filterName, optionName) {
  const allowed = filterName === 'scripts';
  if (isArray(assetObjects)) {
    assetObjects.forEach(assetObject => {
      if (isObject(assetObject) && isDefined(assetObject.external)) {
        const { external } = assetObject;
        try {
          if (allowed) {
            assert(isObject(external), `${PLUGIN_NAME} options.${optionName} external should be an object`);
            const { packageName, variableName } = external;
            assert(isString(packageName) || isString(variableName), `${PLUGIN_NAME} options.${optionName} external should have a string packageName and variableName property`);
            assert(isString(packageName), `${PLUGIN_NAME} options.${optionName} external should have a string packageName property`);
            assert(isString(variableName), `${PLUGIN_NAME} options.${optionName} external should have a string variableName property`);
          } else {
            assert(false, `${PLUGIN_NAME} options.${optionName} external should not be used on non script tags`);
          }
        } catch (err) {
          throw err;
        }
      }
    });
  }
  return assetObjects;
}

function HtmlWebpackTagsPlugin (options) {
  assert(isObject(options), `${PLUGIN_NAME} options should be an object`);
  if (isObject(options)) {
    let append = DEFAULT_OPTIONS.append;
    if (isDefined(options.append)) {
      assert(isBoolean(options.append), `${PLUGIN_NAME} options.append should be a boolean`);
      append = options.append;
    }

    let usePublicPath = DEFAULT_OPTIONS.usePublicPath;
    let addPublicPath = DEFAULT_OPTIONS.addPublicPath;
    if (isDefined(options.usePublicPath) || isDefined(options.addPublicPath)) {
      if (isDefined(options.usePublicPath)) {
        assert(isBoolean(options.usePublicPath), `${PLUGIN_NAME} options.usePublicPath should be a boolean`);
        usePublicPath = options.usePublicPath;
      }
      if (isDefined(options.addPublicPath)) {
        assert(isFunction(options.addPublicPath), `${PLUGIN_NAME} options.addPublicPath should be a function`);
        assert(isString(options.addPublicPath('', '')), `${PLUGIN_NAME} options.addPublicPath should be a function that returns a string`);
        addPublicPath = options.addPublicPath;
      }
    } else if (isDefined(options.publicPath)) {
      const { publicPath } = options;
      assert(isBoolean(publicPath) || isString(publicPath) || isFunction(publicPath),
        `${PLUGIN_NAME} options should specify a publicPath that is either a boolean or a string or a function`);
      if (isBoolean(publicPath)) {
        usePublicPath = publicPath;
      } else if (isString(publicPath)) {
        // create function that injects the string
        usePublicPath = true;
        const oldAddPublicPath = addPublicPath;
        addPublicPath = path => oldAddPublicPath(path, publicPath);
      } else {
        assert(isString(publicPath('', '')), `${PLUGIN_NAME} options.publicPath should be a function that returns a string`);
        usePublicPath = true;
        addPublicPath = publicPath;
      }
    }

    let useHash = DEFAULT_OPTIONS.useHash;
    let addHash = DEFAULT_OPTIONS.addHash;
    if (isDefined(options.useHash) || isDefined(options.addHash)) {
      if (isDefined(options.useHash)) {
        assert(isBoolean(options.useHash), `${PLUGIN_NAME} options.useHash should be a boolean`);
        useHash = options.useHash;
      }
      if (isDefined(options.addHash)) {
        assert(isFunction(options.addHash), `${PLUGIN_NAME} options.addHash should be a function`);
        assert(isString(options.addHash('', '')), `${PLUGIN_NAME} options.addHash should be a function that returns a string`);
        addHash = options.addHash;
      }
    } else if (isDefined(options.hash)) {
      const { hash } = options;
      assert(isBoolean(hash) || isFunction(hash), `${PLUGIN_NAME} options.hash should be a boolean or a function`);
      if (isBoolean(hash)) {
        useHash = hash;
      } else {
        assert(isString(hash('', '')), `${PLUGIN_NAME} options.hash should be a function that returns a string`);
        useHash = true;
        addHash = hash;
      }
    }

    let links = [];
    let scripts = [];
    if (isDefined(options.tags)) {
      const assetObjects = getAllAssetObjects(options, 'tags');
      let [linkObjects, scriptObjects] = splitLinkScriptTags(options, 'tags', assetObjects);
      linkObjects = filterExternalAssetObjects(linkObjects, 'links', 'tags');
      scriptObjects = filterExternalAssetObjects(scriptObjects, 'scripts', 'tags');
      links = links.concat(linkObjects);
      scripts = scripts.concat(scriptObjects);
    }
    if (isDefined(options.links)) {
      let linkObjects = getAllAssetObjects(options, 'links');
      linkObjects = filterExternalAssetObjects(linkObjects, 'links', 'links');
      links = links.concat(linkObjects);
    }
    if (isDefined(options.scripts)) {
      let scriptObjects = getAllAssetObjects(options, 'scripts');
      scriptObjects = filterExternalAssetObjects(scriptObjects, 'scripts', 'scripts');
      scripts = scripts.concat(scriptObjects);
    }

    let shouldSkip = () => false;
    if (isDefined(options.files)) {
      let { files } = options;
      assert((isString(files) || isArray(files)), `${PLUGIN_NAME} options.files should be a string or array`);
      if (isString(files)) {
        files = [files];
      } else if (isArray(files)) {
        files.forEach(file => {
          assert(isString(file), `${PLUGIN_NAME} options.files should be an array of strings`);
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

HtmlWebpackTagsPlugin.prototype.apply = function (compiler) {
  const { options } = this;
  const { usePublicPath, addPublicPath, useHash, addHash, shouldSkip } = options;
  const { append, scripts, links } = options;

  const externals = compiler.options.externals || {};
  scripts.forEach(script => {
    const { external } = script;
    if (isObject(external)) {
      externals[external.packageName] = external.variableName;
    }
  });
  compiler.options.externals = externals;

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
        if (isString(script.sourcePath)) {
          assetPromises.push(addAsset(script.sourcePath));
        }
        jsPaths.push(getAssetPath(script, usePublicPath, addPublicPath, useHash, addHash, pluginPublicPath, compilationHash));
      });
      links.forEach(link => {
        if (isString(link.sourcePath)) {
          assetPromises.push(addAsset(link.sourcePath));
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

      let pluginHead = htmlPluginData.head ? htmlPluginData.head : htmlPluginData.headTags;
      let pluginBody = htmlPluginData.body ? htmlPluginData.body : htmlPluginData.bodyTags;

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
        compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration.tapAsync('htmlWebpackTagsPlugin', onBeforeHtmlGeneration);
        compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync('htmlWebpackTagsPlugin', onAlterAssetTag);
      } else {
        const message = "Error running html-webpack-tags-plugin, are you sure you have html-webpack-plugin before it in your webpack config's plugins?";
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
    compiler.hooks.compilation.tap('htmlWebpackTagsPlugin', onCompilation);
  } else {
    // Webpack 3
    compiler.plugin('compilation', onCompilation);
  }
};

module.exports = HtmlWebpackTagsPlugin;
