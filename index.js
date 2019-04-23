'use strict';
const assert = require('assert');
const minimatch = require('minimatch');
const glob = require('glob');
const path = require('path');
const slash = require('slash'); // fixes slashes in file paths for windows

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

function splitLinkScriptTags (options, optionName, tagObjects) {
  const linkObjects = [];
  const scriptObjects = [];
  const { isAssetTypeCss, isAssetTypeJs } = getAssetTypeCheckers(options);

  tagObjects.forEach(tagObject => {
    if (isDefined(tagObject.type)) {
      const { type, ...others } = tagObject;
      assert(isType(type), `${PLUGIN_NAME} options.${optionName} type must be css or js (${type})`);
      (isCss(type) ? linkObjects : scriptObjects).push({
        ...others
      });
    } else {
      const { path } = tagObject;
      if (isAssetTypeCss(path)) {
        linkObjects.push(tagObject);
      } else if (isAssetTypeJs(path)) {
        scriptObjects.push(tagObject);
      } else {
        assert(false, `${PLUGIN_NAME} options.${optionName} could not determine asset type for (${path})`);
      }
    }
  });

  return [linkObjects, scriptObjects];
}

function getTagObjects (tag, optionName) {
  let tagObjects;
  assert(isString(tag) || isObject(tag), `${PLUGIN_NAME} options.${optionName} items must be an object or string`);
  if (isString(tag)) {
    tagObjects = [{
      path: tag
    }];
  } else {
    assert(isString(tag.path), `${PLUGIN_NAME} options.${optionName} object must have a string path property`);
    if (isDefined(tag.append)) {
      assert(isBoolean(tag.append), `${PLUGIN_NAME} options.${optionName} object append should be a boolean`);
    }
    if (isDefined(tag.publicPath)) {
      const { publicPath } = tag;
      assert(isBoolean(publicPath) || isFunction(publicPath), `${PLUGIN_NAME} options.${optionName} object publicPath should be a boolean or function`);
      if (isFunction(publicPath)) {
        assert(isString(publicPath('', '')), `${PLUGIN_NAME} options.${optionName} object publicPath should be a function that returns a string`);
      }
    }
    if (isDefined(tag.hash)) {
      const { hash } = tag;
      assert(isBoolean(hash) || isFunction(hash), `${PLUGIN_NAME} options.${optionName} object hash should be a boolean or function`);
      if (isFunction(hash)) {
        assert(isString(hash('', '')), `${PLUGIN_NAME} options.${optionName} object hash should be a function that returns a string`);
      }
    }
    if (isDefined(tag.sourcePath)) {
      assert(isString(tag.sourcePath), `${PLUGIN_NAME} options.${optionName} object should have a string sourcePath property`);
    }
    if (isDefined(tag.attributes)) {
      const { attributes } = tag;
      assert(isObject(attributes), `${PLUGIN_NAME} options.${optionName} object should have an object attributes property`);
      Object.keys(attributes).forEach(attribute => {
        const value = attributes[attribute];
        assert(isString(value) || isBoolean(value) || isNumber(value), `${PLUGIN_NAME} options.${optionName} object attribute values should strings, booleans or numbers`);
      });
    }
    if (isDefined(tag.glob) || isDefined(tag.globPath)) {
      const { glob: assetGlob, globPath, ...otherAssetProperties } = tag;
      assert(isString(assetGlob), `${PLUGIN_NAME} options.${optionName} object should have a string glob property`);
      assert(isString(globPath), `${PLUGIN_NAME} options.${optionName} object should have a string globPath property`);
      const globAssets = glob.sync(assetGlob, { cwd: globPath });
      const globAssetPaths = globAssets.map(globAsset => slash(path.join(tag.path, globAsset)));
      assert(globAssetPaths.length > 0, `${PLUGIN_NAME} options.${optionName} object glob found no files (${tag.path} ${assetGlob} ${globPath})`);
      tagObjects = [];
      globAssetPaths.forEach(globAssetPath => {
        tagObjects.push({
          ...otherAssetProperties,
          path: globAssetPath
        });
      });
    } else {
      tagObjects = [tag];
    }
  }
  return tagObjects;
}

function getAllTagObjects (options, append, optionName) {
  let tagObjects;
  if (isDefined(options[optionName])) {
    const tags = options[optionName];
    assert(isString(tags) || isObject(tags) || isArray(tags), `${PLUGIN_NAME} options.${optionName} should be a string, object, or array (${tags})`);
    if (isArray(tags)) {
      tagObjects = [];
      tags.forEach(asset => {
        tagObjects = tagObjects.concat(getTagObjects(asset, optionName));
      });
    } else {
      tagObjects = getTagObjects(tags, optionName);
    }
  }
  if (tagObjects) {
    tagObjects = tagObjects.map(tag => {
      if (!isDefined(tag.append)) {
        tag = {
          ...tag,
          append: append
        };
      }
      return tag;
    });
  }
  return tagObjects;
}

function filterExternalTagObjects (tagObjects, filterName, optionName) {
  const allowed = filterName === 'scripts';
  if (isArray(tagObjects)) {
    tagObjects.forEach(tagObject => {
      if (isObject(tagObject) && isDefined(tagObject.external)) {
        const { external } = tagObject;
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
  return tagObjects;
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
      const tagObjects = getAllTagObjects(options, append, 'tags');
      let [linkObjects, scriptObjects] = splitLinkScriptTags(options, 'tags', tagObjects);
      linkObjects = filterExternalTagObjects(linkObjects, 'links', 'tags');
      scriptObjects = filterExternalTagObjects(scriptObjects, 'scripts', 'tags');
      links = links.concat(linkObjects);
      scripts = scripts.concat(scriptObjects);
    }
    if (isDefined(options.links)) {
      let linkObjects = getAllTagObjects(options, append, 'links');
      linkObjects = filterExternalTagObjects(linkObjects, 'links', 'links');
      links = links.concat(linkObjects);
    }
    if (isDefined(options.scripts)) {
      let scriptObjects = getAllTagObjects(options, append, 'scripts');
      scriptObjects = filterExternalTagObjects(scriptObjects, 'scripts', 'scripts');
      scripts = scripts.concat(scriptObjects);
    }
    const linksPrepend = links.filter(({ append }) => !append);
    const linksAppend = links.filter(({ append }) => append);
    const scriptsPrepend = scripts.filter(({ append }) => !append);
    const scriptsAppend = scripts.filter(({ append }) => append);

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

    const htmlPluginName = isDefined(options.htmlPluginName) ? options.htmlPluginName : 'html-webpack-plugin';

    this.options = {
      links,
      linksPrepend,
      linksAppend,
      scripts,
      scriptsPrepend,
      scriptsAppend,
      append,
      usePublicPath,
      addPublicPath,
      useHash,
      addHash,
      shouldSkip,
      htmlPluginName
    };
  }
}

function getTagPath (tagObject, usePublicPath, addPublicPath, useHash, addHash, webpackPublicPath, compilationHash) {
  const { publicPath, hash } = tagObject;
  let { path } = tagObject;

  if (isDefined(publicPath)) {
    if (publicPath === true) {
      path = slash(addPublicPath(path, webpackPublicPath));
    } else if (isFunction(publicPath)) {
      path = slash(publicPath(path, webpackPublicPath));
    }
  } else if (usePublicPath) {
    path = slash(addPublicPath(path, webpackPublicPath));
  }
  if (isDefined(hash)) {
    if (hash === true) {
      path = slash(addHash(path, compilationHash));
    } else if (isFunction(hash)) {
      path = slash(hash(path, compilationHash));
    }
  } else if (useHash) {
    path = slash(addHash(path, compilationHash));
  }
  return path;
}

HtmlWebpackTagsPlugin.prototype.apply = function (compiler) {
  const { options } = this;
  const { usePublicPath, addPublicPath, useHash, addHash, shouldSkip, htmlPluginName } = options;
  const { scripts, scriptsPrepend, scriptsAppend, linksPrepend, linksAppend } = options;

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

      const getPath = tag => {
        if (isString(tag.sourcePath)) {
          assetPromises.push(addAsset(tag.sourcePath));
        }
        return getTagPath(tag, usePublicPath, addPublicPath, useHash, addHash, pluginPublicPath, compilationHash);
      };

      const jsPrependPaths = scriptsPrepend.map(getPath);
      const jsAppendPaths = scriptsAppend.map(getPath);

      const cssPrependPaths = linksPrepend.map(getPath);
      const cssAppendPaths = linksAppend.map(getPath);

      assets.js = jsPrependPaths.concat(assets.js).concat(jsAppendPaths);
      assets.css = cssPrependPaths.concat(assets.css).concat(cssAppendPaths);

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

      const pluginHead = htmlPluginData.head ? htmlPluginData.head : htmlPluginData.headTags;
      const pluginBody = htmlPluginData.body ? htmlPluginData.body : htmlPluginData.bodyTags;

      const pluginLinks = pluginHead.filter(({ tagName }) => tagName === 'link');
      const pluginScripts = pluginBody.filter(({ tagName }) => tagName === 'script');

      const headPrepend = pluginLinks.slice(0, linksPrepend.length);
      const headAppend = pluginLinks.slice(pluginLinks.length - linksAppend.length);

      const bodyPrepend = pluginScripts.slice(0, scriptsPrepend.length);
      const bodyAppend = pluginScripts.slice(pluginScripts.length - scriptsAppend.length);

      const copyAttributes = (tags, tagObjects) => {
        tags.forEach((tag, i) => {
          const { attributes } = tagObjects[i];
          if (attributes) {
            const { attributes: tagAttributes } = tag;
            Object.keys(attributes).forEach(attribute => {
              tagAttributes[attribute] = attributes[attribute];
            });
          }
        });
      };

      copyAttributes(headPrepend.concat(headAppend), linksPrepend.concat(linksAppend));
      copyAttributes(bodyPrepend.concat(bodyAppend), scriptsPrepend.concat(scriptsAppend));

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
        const HtmlWebpackPlugin = require(htmlPluginName);
        if (HtmlWebpackPlugin.getHooks) {
          const hooks = HtmlWebpackPlugin.getHooks(compilation);
          hooks.beforeAssetTagGeneration.tapAsync('htmlWebpackIncludeAssetsPlugin', onBeforeHtmlGeneration);
          hooks.alterAssetTagGroups.tapAsync('htmlWebpackIncludeAssetsPlugin', onAlterAssetTag);
        } else {
          const message = "Error running html-webpack-tags-plugin, are you sure you have html-webpack-plugin before it in your webpack config's plugins?";
          throw new Error(message);
        }
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
