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
