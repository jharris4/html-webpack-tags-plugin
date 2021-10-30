'use strict';
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const assert = require('assert');
const minimatch = require('minimatch');
const glob = require('glob');
const slash = require('slash'); // fixes slashes in file paths for windows

const PLUGIN_NAME = 'HtmlWebpackTagsPlugin';

const IS = {
  isDefined: v => v !== undefined,
  isObject: v => v !== null && v !== undefined && typeof v === 'object' && !Array.isArray(v),
  isBoolean: v => v === true || v === false,
  isNumber: v => v !== undefined && (typeof v === 'number' || v instanceof Number) && isFinite(v),
  isString: v => v !== null && v !== undefined && (typeof v === 'string' || v instanceof String),
  isArray: v => Array.isArray(v),
  isFunction: v => typeof v === 'function'
};

const { isDefined, isObject, isBoolean, isNumber, isString, isArray, isFunction } = IS;

const DEFAULT_OPTIONS = {
  append: true,
  prependExternals: true,
  useHash: false,
  addHash: (assetPath, hash) => assetPath + '?' + hash,
  usePublicPath: true,
  addPublicPath: (assetPath, publicPath) => (publicPath !== '' && !publicPath.endsWith('/') && !assetPath.startsWith('/')) ? publicPath + '/' + assetPath : publicPath + assetPath,
  jsExtensions: ['.js'],
  cssExtensions: ['.css'],
  tags: [],
  links: [],
  scripts: []
};

const ASSET_TYPE_CSS = 'css';
const ASSET_TYPE_JS = 'js';

const ASSET_TYPES = [ASSET_TYPE_CSS, ASSET_TYPE_JS];

const ATTRIBUTES_TEXT = 'strings, booleans or numbers';

const isValidAttributeValue = v => isString(v) || isBoolean(v) || isNumber(v);

const isType = type => ASSET_TYPES.indexOf(type) !== -1;

const isTypeCss = type => type === ASSET_TYPE_CSS;

const isFunctionReturningString = v => isFunction(v) && isString(v('', ''));

const isArrayOfString = v => isArray(v) && v.every(i => isString(i));

const createExtensionsRegex = extensions => new RegExp(`.*(${extensions.join('|')})$`);

const getExtensions = (options, optionExtensionName, optionPath) => {
  let extensions = DEFAULT_OPTIONS[optionExtensionName];
  if (isDefined(options[optionExtensionName])) {
    if (isString(options[optionExtensionName])) {
      extensions = [options[optionExtensionName]];
    } else {
      extensions = options[optionExtensionName];
      assert(isArray(extensions), `${optionPath}.${optionExtensionName} should be a string or array of strings (${extensions})`);
      extensions.forEach(function (extension) {
        assert(isString(extension), `${optionPath}.${optionExtensionName} array should only contain strings (${extension})`);
      });
    }
  }
  return extensions;
};

const getHasExtensions = (options, optionExtensionName, optionPath) => {
  const regexp = createExtensionsRegex(getExtensions(options, optionExtensionName, optionPath));
  return value => regexp.test(value);
};

const getAssetTypeCheckers = (options, optionPath) => {
  const hasJsExtensions = getHasExtensions(options, 'jsExtensions', optionPath);
  const hasCssExtensions = getHasExtensions(options, 'cssExtensions', optionPath);
  return {
    isAssetTypeCss (value) {
      return hasCssExtensions(value);
    },
    isAssetTypeJs (value) {
      return hasJsExtensions(value);
    }
  };
};

const splitLinkScriptTags = (tagObjects, options, optionName, optionPath) => {
  const linkObjects = [];
  const scriptObjects = [];
  const { isAssetTypeCss, isAssetTypeJs } = getAssetTypeCheckers(options, optionPath);

  tagObjects.forEach(tagObject => {
    if (isDefined(tagObject.type)) {
      const { type, ...others } = tagObject;
      assert(isType(type), `${optionPath}.${optionName} type must be css or js (${type})`);
      (isTypeCss(type) ? linkObjects : scriptObjects).push({
        ...others
      });
    } else {
      const { path } = tagObject;
      if (isAssetTypeCss(path)) {
        linkObjects.push(tagObject);
      } else if (isAssetTypeJs(path)) {
        scriptObjects.push(tagObject);
      } else {
        assert(false, `${optionPath}.${optionName} could not determine asset type for (${path})`);
      }
    }
  });

  return [linkObjects, scriptObjects];
};

const getTagObjects = (tag, optionName, optionPath, isMetaTag = false) => {
  let tagObjects;
  if (isMetaTag) {
    assert(isObject(tag), `${optionPath}.${optionName} items must be an object`);
  } else {
    assert(isString(tag) || isObject(tag), `${optionPath}.${optionName} items must be an object or string`);
  }
  if (!isMetaTag && isString(tag)) {
    tagObjects = [{
      path: tag
    }];
  } else {
    if (isMetaTag) {
      if (isDefined(tag.path)) {
        assert(isString(tag.path), `${optionPath}.${optionName} object should have a string path property`);
      }
    } else {
      assert(isString(tag.path), `${optionPath}.${optionName} object must have a string path property`);
    }
    if (isDefined(tag.sourcePath)) {
      assert(isString(tag.sourcePath), `${optionPath}.${optionName} object should have a string sourcePath property`);
    }
    if (isMetaTag) {
      assert(isDefined(tag.attributes), `${optionPath}.${optionName} object must have an object attributes property`);
      assert(Object.keys(tag.attributes).length > 0, `${optionPath}.${optionName} object must have a non empty object attributes property`);
    }
    if (isDefined(tag.attributes)) {
      const { attributes } = tag;
      assert(isObject(attributes), `${optionPath}.${optionName} object should have an object attributes property`);
      Object.keys(attributes).forEach(attribute => {
        const value = attributes[attribute];
        assert(isValidAttributeValue(value), `${optionPath}.${optionName} object attribute values should be ` + ATTRIBUTES_TEXT);
      });
    }

    tag = getValidatedMainOptions(tag, `${optionPath}.${optionName}`, {});

    if (isDefined(tag.glob) || isDefined(tag.globPath) || isDefined(tag.globFlatten)) {
      if (isMetaTag) {
        assert(isDefined(tag.path), `${optionPath}.${optionName} object must have a path property when glob is used`);
      }
      const { glob: assetGlob, globPath, globFlatten, ...otherAssetProperties } = tag;
      assert(isString(assetGlob), `${optionPath}.${optionName} object should have a string glob property`);
      assert(isString(globPath), `${optionPath}.${optionName} object should have a string globPath property`);
      if (isDefined(globFlatten)) {
        assert(isBoolean(globFlatten), `${optionPath}.${optionName} object should have a boolean globFlatten property`);
      }
      const flatten = isDefined(globFlatten) ? globFlatten : false;
      const globAssets = glob.sync(assetGlob, { cwd: globPath });
      const globAssetPaths = globAssets.map(globAsset => slash(path.join(tag.path, flatten ? path.basename(globAsset) : globAsset)));
      assert(globAssetPaths.length > 0, `${optionPath}.${optionName} object glob found no files (${tag.path} ${assetGlob} ${globPath})`);
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
};

const getValidatedTagObjects = (options, optionName, optionPath) => {
  let tagObjects;
  if (isDefined(options[optionName])) {
    const tags = options[optionName];
    assert(isString(tags) || isObject(tags) || isArray(tags), `${optionPath}.${optionName} should be a string, object, or array (${tags})`);
    if (isArray(tags)) {
      tagObjects = [];
      tags.forEach(asset => {
        tagObjects = tagObjects.concat(getTagObjects(asset, optionName, optionPath));
      });
    } else {
      tagObjects = getTagObjects(tags, optionName, optionPath);
    }
  }
  return tagObjects;
};

const getValidatedMetaObjects = (options, optionName, optionPath) => {
  let metaObjects;
  if (isDefined(options[optionName])) {
    const tags = options[optionName];
    assert(isObject(tags) || isArray(tags), `${optionPath}.${optionName} should be an object or array (${tags})`);
    if (isArray(tags)) {
      metaObjects = [];
      tags.forEach(asset => {
        metaObjects = metaObjects.concat(getTagObjects(asset, optionName, optionPath, true));
      });
    } else {
      metaObjects = getTagObjects(tags, optionName, optionPath, true);
    }
  }
  return metaObjects;
};

const getValidatedTagObjectExternals = (tagObjects, isScript, optionName, optionPath) => {
  return tagObjects.map(tagObject => {
    if (isObject(tagObject) && isDefined(tagObject.external)) {
      const { external } = tagObject;
      if (isScript) {
        assert(isObject(external), `${optionPath}.${optionName}.external should be an object`);
        const { packageName, variableName } = external;
        assert(isString(packageName) || isString(variableName), `${optionPath}.${optionName}.external should have a string packageName and variableName property`);
        assert(isString(packageName), `${optionPath}.${optionName}.external should have a string packageName property`);
        assert(isString(variableName), `${optionPath}.${optionName}.external should have a string variableName property`);
      } else {
        assert(false, `${optionPath}.${optionName}.external should not be used on non script tags`);
      }
    }
    return tagObject;
  });
};

const getShouldSkip = files => {
  let shouldSkip = () => false;
  if (isDefined(files)) {
    shouldSkip = htmlPluginData => !files.some(function (file) {
      return minimatch(htmlPluginData.outputName, file);
    });
  }
  return shouldSkip;
};

const processShortcuts = (options, optionPath, keyShortcut, keyUse, keyAdd, add) => {
  const processedOptions = {};
  if (isDefined(options[keyUse]) || isDefined(options[keyAdd])) {
    assert(!isDefined(options[keyShortcut]), `${optionPath}.${keyShortcut} should not be used with either ${keyUse} or ${keyAdd}`);
    if (isDefined(options[keyUse])) {
      assert(isBoolean(options[keyUse]), `${optionPath}.${keyUse} should be a boolean`);
      processedOptions[keyUse] = options[keyUse];
    }
    if (isDefined(options[keyAdd])) {
      assert(isFunctionReturningString(options[keyAdd]), `${optionPath}.${keyAdd} should be a function that returns a string`);
      processedOptions[keyAdd] = options[keyAdd];
    }
  } else if (isDefined(options[keyShortcut])) {
    const shortcut = options[keyShortcut];
    assert(isBoolean(shortcut) || isString(shortcut) || isFunctionReturningString(shortcut),
      `${optionPath}.${keyShortcut} should be a boolean or a string or a function that returns a string`);
    if (isBoolean(shortcut)) {
      processedOptions[keyUse] = shortcut;
    } else if (isString(shortcut)) {
      processedOptions[keyUse] = true;
      processedOptions[keyAdd] = path => add(path, shortcut);
    } else {
      processedOptions[keyUse] = true;
      processedOptions[keyAdd] = shortcut;
    }
  }
  return processedOptions;
};

const getValidatedMainOptions = (options, optionPath, defaultOptions = {}) => {
  const { append, prependExternals, publicPath, usePublicPath, addPublicPath, hash, useHash, addHash, ...otherOptions } = options;
  const validatedOptions = { ...defaultOptions, ...otherOptions };
  if (isDefined(append)) {
    assert(isBoolean(append), `${optionPath}.append should be a boolean`);
    validatedOptions.append = append;
  }
  if (isDefined(prependExternals)) {
    assert(isBoolean(prependExternals), `${optionPath}.prependExternals should be a boolean`);
    validatedOptions.prependExternals = prependExternals;
  }
  const publicPathOptions = processShortcuts(options, optionPath, 'publicPath', 'usePublicPath', 'addPublicPath', DEFAULT_OPTIONS.addPublicPath);
  if (isDefined(publicPathOptions.usePublicPath)) {
    validatedOptions.usePublicPath = publicPathOptions.usePublicPath;
  }
  if (isDefined(publicPathOptions.addPublicPath)) {
    validatedOptions.addPublicPath = publicPathOptions.addPublicPath;
  }
  const hashOptions = processShortcuts(options, optionPath, 'hash', 'useHash', 'addHash', DEFAULT_OPTIONS.addHash);
  if (isDefined(hashOptions.useHash)) {
    validatedOptions.useHash = hashOptions.useHash;
  }
  if (isDefined(hashOptions.addHash)) {
    validatedOptions.addHash = hashOptions.addHash;
  }
  return validatedOptions;
};

const getValidatedOptions = (options, optionPath, defaultOptions = DEFAULT_OPTIONS) => {
  assert(isObject(options), `${optionPath} should be an object`);
  let validatedOptions = { ...defaultOptions };
  validatedOptions = {
    ...validatedOptions,
    ...getValidatedMainOptions(options, optionPath, defaultOptions)
  };
  const { append: globalAppend, prependExternals } = validatedOptions;

  const getAppend = prependExternals ? external => (isDefined(external) ? false : globalAppend) : () => globalAppend;

  const isTagPrepend = ({ append, external }) => isDefined(append) ? !append : !getAppend(external);
  const isTagAppend = ({ append, external }) => isDefined(append) ? append : getAppend(external);

  const hasTags = isDefined(options.tags);
  if (hasTags) {
    const tagObjects = getValidatedTagObjects(options, 'tags', optionPath);
    let [linkObjects, scriptObjects] = splitLinkScriptTags(tagObjects, options, 'tags', optionPath);
    linkObjects = getValidatedTagObjectExternals(linkObjects, false, 'tags', optionPath);
    scriptObjects = getValidatedTagObjectExternals(scriptObjects, true, 'tags', optionPath);
    validatedOptions.links = linkObjects;
    validatedOptions.scripts = scriptObjects;
  }
  if (isDefined(options.links)) {
    let linkObjects = getValidatedTagObjects(options, 'links', optionPath);
    linkObjects = getValidatedTagObjectExternals(linkObjects, false, 'links', optionPath);
    validatedOptions.links = hasTags ? validatedOptions.links.concat(linkObjects) : linkObjects;
  }
  if (isDefined(options.scripts)) {
    let scriptObjects = getValidatedTagObjects(options, 'scripts', optionPath);
    scriptObjects = getValidatedTagObjectExternals(scriptObjects, true, 'scripts', optionPath);
    validatedOptions.scripts = hasTags ? validatedOptions.scripts.concat(scriptObjects) : scriptObjects;
  }
  if (isDefined(validatedOptions.links)) {
    validatedOptions.linksPrepend = validatedOptions.links.filter(isTagPrepend);
    validatedOptions.linksAppend = validatedOptions.links.filter(isTagAppend);
  }
  if (isDefined(validatedOptions.scripts)) {
    validatedOptions.scriptsPrepend = validatedOptions.scripts.filter(isTagPrepend);
    validatedOptions.scriptsAppend = validatedOptions.scripts.filter(isTagAppend);
  }
  if (isDefined(options.metas)) {
    let metaObjects = getValidatedMetaObjects(options, 'metas', optionPath);
    metaObjects = getValidatedTagObjectExternals(metaObjects, false, 'metas', optionPath);
    validatedOptions.metas = metaObjects;
  }

  return validatedOptions;
};

const getTagPath = (tagObject, options, webpackPublicPath, compilationHash) => {
  const mergedOptions = { ...options };
  Object.keys(tagObject).filter(key => isDefined(tagObject[key])).forEach(key => {
    mergedOptions[key] = tagObject[key];
  });
  const { usePublicPath, addPublicPath, useHash, addHash } = mergedOptions;

  let { path } = tagObject;
  if (usePublicPath) {
    path = addPublicPath(path, webpackPublicPath);
  }
  if (useHash) {
    path = addHash(path, compilationHash);
  }
  return slash(path);
};

const getAllValidatedOptions = (options, optionPath) => {
  const validatedOptions = getValidatedOptions(options, optionPath);
  let { files } = options;
  if (isDefined(files)) {
    assert((isString(files) || isArrayOfString(files)), `${optionPath}.files should be a string or array of strings`);
    if (isString(files)) {
      files = [files];
    }
    return {
      ...validatedOptions,
      files
    };
  }
  return validatedOptions;
};

function HtmlWebpackTagsPlugin (options) {
  const validatedOptions = getAllValidatedOptions(options, PLUGIN_NAME + '.options');

  const shouldSkip = getShouldSkip(validatedOptions.files);

  // Allows tests to be run with html-webpack-plugin v4
  const htmlPluginName = isDefined(options.htmlPluginName) ? options.htmlPluginName : 'html-webpack-plugin';

  this.options = {
    ...validatedOptions,
    shouldSkip,
    htmlPluginName
  };
}

HtmlWebpackTagsPlugin.prototype.apply = function (compiler) {
  const { options } = this;
  const { shouldSkip, htmlPluginName } = options;
  const { scripts, scriptsPrepend, scriptsAppend, linksPrepend, linksAppend, metas } = options;

  const externals = compiler.options.externals || {};
  scripts.forEach(script => {
    const { external } = script;
    if (isObject(external)) {
      externals[external.packageName] = external.variableName;
    }
  });
  compiler.options.externals = externals;

  let savedAssetsPublicPath = null;

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
      const pluginPublicPath = savedAssetsPublicPath = assets.publicPath;
      const compilationHash = compilation.hash;
      const assetPromises = [];

      const addAsset = assetPath => {
        try {
          if (htmlPluginData.plugin && htmlPluginData.plugin.addFileToAssets) {
            return htmlPluginData.plugin.addFileToAssets(assetPath, compilation);
          } else {
            assetPath = path.resolve(compilation.compiler.context, assetPath);
            return Promise.all([
              new Promise((resolve, reject) => {
                fs.stat(assetPath, (err, stats) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(stats);
                  }
                });
              }),
              new Promise((resolve, reject) => {
                fs.readFile(assetPath, (err, data) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(data);
                  }
                });
              })
            ]).then(([stat, source]) => {
              const { size } = stat;
              const basename = path.basename(assetPath);
              source = new webpack.sources.RawSource(source, true);
              compilation.fileDependencies.add(assetPath);
              compilation.emitAsset(basename, source, { size });
            });
          }
        } catch (err) {
          return Promise.reject(err);
        }
      };

      const getPath = tag => {
        if (isString(tag.sourcePath)) {
          assetPromises.push(addAsset(tag.sourcePath));
        }
        return getTagPath(tag, options, pluginPublicPath, compilationHash);
      };

      const jsPrependPaths = scriptsPrepend.map(getPath);
      const jsAppendPaths = scriptsAppend.map(getPath);

      const cssPrependPaths = linksPrepend.map(getPath);
      const cssAppendPaths = linksAppend.map(getPath);

      assets.js = jsPrependPaths.concat(assets.js).concat(jsAppendPaths);
      assets.css = cssPrependPaths.concat(assets.css).concat(cssAppendPaths);

      if (metas) {
        metas.forEach(tag => {
          if (isString(tag.sourcePath)) {
            assetPromises.push(addAsset(tag.sourcePath));
          }
        });
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

    const onAlterAssetTagGroups = (htmlPluginData, callback) => {
      if (shouldSkip(htmlPluginData)) {
        if (callback) {
          return callback(null, htmlPluginData);
        } else {
          return Promise.resolve(htmlPluginData);
        }
      }

      const pluginHead = htmlPluginData.head ? htmlPluginData.head : htmlPluginData.headTags;
      const pluginBody = htmlPluginData.body ? htmlPluginData.body : htmlPluginData.bodyTags;

      if (metas) {
        const pluginPublicPath = savedAssetsPublicPath;
        const compilationHash = compilation.hash;

        const getMeta = tag => {
          if (isDefined(tag.path)) {
            return {
              tagName: 'meta',
              attributes: {
                content: getTagPath(tag, options, pluginPublicPath, compilationHash),
                ...tag.attributes
              }
            };
          } else {
            return {
              tagName: 'meta',
              attributes: tag.attributes
            };
          }
        };
        pluginHead.push(...metas.map(getMeta));
      }

      const injectOption = htmlPluginData.plugin.options.inject;
      const sourceScripts = injectOption === 'body' ? pluginBody : pluginHead;

      const pluginLinks = pluginHead.filter(({ tagName }) => tagName === 'link');
      const pluginScripts = sourceScripts.filter(({ tagName }) => tagName === 'script');

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

    const HtmlWebpackPlugin = require(htmlPluginName);
    if (HtmlWebpackPlugin.getHooks) {
      const hooks = HtmlWebpackPlugin.getHooks(compilation);
      const htmlPlugins = compilation.options.plugins.filter(plugin => plugin instanceof HtmlWebpackPlugin);
      if (htmlPlugins.length === 0) {
        const message = "Error running html-webpack-tags-plugin, are you sure you have html-webpack-plugin before it in your webpack config's plugins?";
        throw new Error(message);
      }
      hooks.beforeAssetTagGeneration.tapAsync('htmlWebpackTagsPlugin', onBeforeHtmlGeneration);
      hooks.alterAssetTagGroups.tapAsync('htmlWebpackTagsPlugin', onAlterAssetTagGroups);
    } else {
      const message = "Error running html-webpack-tags-plugin, are you sure you have html-webpack-plugin before it in your webpack config's plugins?";
      throw new Error(message);
    }
  };

  compiler.hooks.compilation.tap('htmlWebpackTagsPlugin', onCompilation);
};

HtmlWebpackTagsPlugin.api = {
  IS,
  getValidatedOptions
};

module.exports = HtmlWebpackTagsPlugin;
