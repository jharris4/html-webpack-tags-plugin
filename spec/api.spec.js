/* eslint-env jasmine */
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

  it('exports the api getValidatedOptions', done => {
    const { getValidatedMainOptions } = HtmlWebpackTagsPlugin.api;
    expect(typeof getValidatedMainOptions === 'function');
    done();
  });

  describe('getValidatedOptions', () => {
    it('should throw with the right error for bad options', done => {
      const { getValidatedOptions } = HtmlWebpackTagsPlugin.api;
      expect(typeof getValidatedOptions === 'function');
      const theFunction = () => {
        return getValidatedOptions({ append: '123' }, 'pluginName.options');
      };

      expect(theFunction).toThrowError(/(pluginName.options.append should be a boolean)/);
      done();
    });

    it('should return the right options for valid options', done => {
      const { getValidatedOptions } = HtmlWebpackTagsPlugin.api;
      expect(typeof getValidatedOptions === 'function');
      const theFunction = () => {
        return getValidatedOptions({ append: true }, 'pluginName.options');
      };

      expect(theFunction).not.toThrowError();
      expect(theFunction().append).toBe(true);
      done();
    });
  });

  it('should throw with the right error for bad links options', done => {
    const { getValidatedOptions } = HtmlWebpackTagsPlugin.api;
    expect(typeof getValidatedOptions === 'function');
    const theFunction = () => {
      return getValidatedOptions({ links: ['a', true, 'false'] }, 'pluginName.options');
    };

    expect(theFunction).toThrowError(/(pluginName.options.links items must be an object or string)/);
    done();
  });

  it('should throw with the right error for links with external', done => {
    const { getValidatedOptions } = HtmlWebpackTagsPlugin.api;
    expect(typeof getValidatedOptions === 'function');
    const theFunction = () => {
      return getValidatedOptions({ links: ['a', { path: 'b', external: { packageName: 'b', variableName: 'B' } }, 'c'] }, 'pluginName.options');
    };

    expect(theFunction).toThrowError(/(pluginName.options.links.external should not be used on non script tags)/);
    done();
  });

  it('should throw with the right error for scripts with bad external', done => {
    const { getValidatedOptions } = HtmlWebpackTagsPlugin.api;
    expect(typeof getValidatedOptions === 'function');
    const theFunction = () => {
      return getValidatedOptions({ scripts: ['a', { path: 'b', external: 'abc' }, 'c'] }, 'pluginName.options');
    };

    expect(theFunction).toThrowError(/(pluginName.options.scripts.external should be an object)/);
    done();
  });

  it('should return the right options for valid options', done => {
    const { getValidatedOptions } = HtmlWebpackTagsPlugin.api;
    expect(typeof getValidatedOptions === 'function');
    const theFunction = () => {
      return getValidatedOptions({ append: false, links: ['a', 'b', 'c'], scripts: [] }, 'pluginName.options');
    };

    expect(theFunction).not.toThrowError();
    const result = theFunction();
    expect(result.links).toEqual([
      { path: 'a' },
      { path: 'b' },
      { path: 'c' }
    ]);
    expect(result.scripts).toEqual([]);
    done();
  });

  it('should return the right options for scripts with valid external', done => {
    const { getValidatedOptions } = HtmlWebpackTagsPlugin.api;
    expect(typeof getValidatedOptions === 'function');
    const theFunction = () => {
      return getValidatedOptions({ scripts: ['a', { path: 'b', external: { variableName: 'B', packageName: 'b' } }, 'c'] }, 'pluginName.options');
    };

    expect(theFunction).not.toThrowError();
    const result = theFunction();
    expect(result.scripts).toEqual([
      { path: 'a' },
      { path: 'b', external: { variableName: 'B', packageName: 'b' } },
      { path: 'c' }
    ]);
    done();
  });
});
