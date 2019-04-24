/* eslint-env jasmine */
// const path = require('path');
require('jasmine-expect');

const HtmlWebpackTagsPlugin = require('../');

describe('api', () => {
  it('exports the api', done => {
    const { api } = HtmlWebpackTagsPlugin;
    expect(api && typeof api === 'object' && !Array.isArray(api));
    done();
  });

  it('exports the api IS', done => {
    const { IS } = HtmlWebpackTagsPlugin.api;
    expect(typeof IS === 'object' && typeof IS.isDefined === 'function');
    done();
  });

  describe('getValidatedMainOptions', () => {
    it('exports the api getValidatedMainOptions', done => {
      const { getValidatedMainOptions } = HtmlWebpackTagsPlugin.api;
      expect(typeof getValidatedMainOptions === 'function');
      done();
    });

    it('should throw with the right error for bad options', done => {
      const { getValidatedMainOptions } = HtmlWebpackTagsPlugin.api;
      expect(typeof getValidatedMainOptions === 'function');
      const theFunction = () => {
        return getValidatedMainOptions({ append: '123' }, 'pluginName.options');
      };

      expect(theFunction).toThrowError(/(pluginName.options.append should be a boolean)/);
      done();
    });

    it('should return the right options for valid options', done => {
      const { getValidatedMainOptions } = HtmlWebpackTagsPlugin.api;
      expect(typeof getValidatedMainOptions === 'function');
      const theFunction = () => {
        return getValidatedMainOptions({ append: true }, 'pluginName.options');
      };

      expect(theFunction).not.toThrowError();
      expect(theFunction().append).toBe(true);
      done();
    });
  });

  describe('getValidatedLinksOptions', () => {
    it('exports the api getValidatedLinksOptions', done => {
      const { getValidatedLinksOptions } = HtmlWebpackTagsPlugin.api;
      expect(typeof getValidatedLinksOptions === 'function');
      done();
    });

    it('should throw with the right error for bad options', done => {
      const { getValidatedLinksOptions } = HtmlWebpackTagsPlugin.api;
      expect(typeof getValidatedLinksOptions === 'function');
      const theFunction = () => {
        return getValidatedLinksOptions(['a', true, 'false'], 'pluginName.options');
      };

      expect(theFunction).toThrowError(/(pluginName.options.links items must be an object or string)/);
      done();
    });

    it('should throw with the right error for bad external', done => {
      const { getValidatedLinksOptions } = HtmlWebpackTagsPlugin.api;
      expect(typeof getValidatedLinksOptions === 'function');
      const theFunction = () => {
        return getValidatedLinksOptions(['a', { path: 'b', external: { packageName: 'b', variableName: 'B' } }, 'c'], 'pluginName.options');
      };

      expect(theFunction).toThrowError(/(pluginName.options.links.external should not be used on non script tags)/);
      done();
    });

    it('should return the right options for valid options', done => {
      const { getValidatedLinksOptions } = HtmlWebpackTagsPlugin.api;
      expect(typeof getValidatedLinksOptions === 'function');
      const theFunction = () => {
        return getValidatedLinksOptions(['a', 'b', 'c'], 'pluginName.options');
      };

      expect(theFunction).not.toThrowError();
      expect(theFunction()).toEqual([{ path: 'a' }, { path: 'b' }, { path: 'c' }]);
      done();
    });
  });

  describe('getValidatedScriptsOptions', () => {
    it('exports the api getValidatedScriptsOptions', done => {
      const { getValidatedScriptsOptions } = HtmlWebpackTagsPlugin.api;
      expect(typeof getValidatedScriptsOptions === 'function');
      done();
    });

    it('should throw with the right error for bad options', done => {
      const { getValidatedScriptsOptions } = HtmlWebpackTagsPlugin.api;
      expect(typeof getValidatedScriptsOptions === 'function');
      const theFunction = () => {
        return getValidatedScriptsOptions(['a', true, 'false'], 'pluginName.options');
      };

      expect(theFunction).toThrowError(/(pluginName.options.scripts items must be an object or string)/);
      done();
    });

    it('should throw with the right error for bad external', done => {
      const { getValidatedScriptsOptions } = HtmlWebpackTagsPlugin.api;
      expect(typeof getValidatedScriptsOptions === 'function');
      const theFunction = () => {
        return getValidatedScriptsOptions(['a', { path: 'b', external: 'abc' }, 'c'], 'pluginName.options');
      };

      expect(theFunction).toThrowError(/(pluginName.options.scripts.external should be an object)/);
      done();
    });

    it('should return the right options for valid options', done => {
      const { getValidatedScriptsOptions } = HtmlWebpackTagsPlugin.api;
      expect(typeof getValidatedScriptsOptions === 'function');
      const theFunction = () => {
        return getValidatedScriptsOptions(['a', 'b', 'c'], 'pluginName.options');
      };

      expect(theFunction).not.toThrowError();
      expect(theFunction()).toEqual([{ path: 'a' }, { path: 'b' }, { path: 'c' }]);
      done();
    });

    it('should return the right options for valid options with external', done => {
      const { getValidatedScriptsOptions } = HtmlWebpackTagsPlugin.api;
      expect(typeof getValidatedScriptsOptions === 'function');
      const theFunction = () => {
        return getValidatedScriptsOptions(['a', { path: 'b', external: { variableName: 'B', packageName: 'b' } }, 'c'], 'pluginName.options');
      };

      expect(theFunction).not.toThrowError();
      expect(theFunction()).toEqual([{ path: 'a' }, { path: 'b', external: { variableName: 'B', packageName: 'b' } }, { path: 'c' }]);
      done();
    });
  });

  describe('getShouldSkip', () => {
    it('exports the api getShouldSkip', done => {
      const { getShouldSkip } = HtmlWebpackTagsPlugin.api;
      expect(typeof getShouldSkip === 'function');
      done();
    });

    it('should throw with the right error for bad options', done => {
      const { getShouldSkip } = HtmlWebpackTagsPlugin.api;
      expect(typeof getShouldSkip === 'function');
      const theFunction = () => {
        return getShouldSkip([123], 'plugin-name.options.files');
      };

      expect(theFunction).toThrowError(/(plugin-name.options.files should be an array of strings)/);
      done();
    });

    it('should return the right options for valid options', done => {
      const { getShouldSkip } = HtmlWebpackTagsPlugin.api;
      expect(typeof getShouldSkip === 'function');
      const theFunction = () => {
        return getShouldSkip(['the-file'], 'plugin-name.options.files');
      };

      expect(theFunction).not.toThrowError();
      const result = theFunction();
      expect(typeof result).toBe('function');
      expect(result({ outputName: 'different-file' })).toBe(true);
      expect(result({ outputName: 'the-file' })).toBe(false);
      done();
    });
  });
});
