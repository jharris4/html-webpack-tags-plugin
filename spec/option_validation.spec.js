/* eslint-env jasmine */
const path = require('path');
require('jasmine-expect');

const HtmlWebpackTagsPlugin = require('../');

const FIXTURES_PATH = path.join(__dirname, './fixtures');

describe('option validation', () => {
  it('should throw an error if no options are provided', done => {
    const theFunction = () => {
      return new HtmlWebpackTagsPlugin();
    };

    expect(theFunction).toThrowError(/(options should be an object)/);
    done();
  });

  it('should throw an error if the options are not an object', done => {
    const theFunction = () => {
      return new HtmlWebpackTagsPlugin('hello');
    };

    expect(theFunction).toThrowError(/(options should be an object)/);
    done();
  });

  it('should not throw an error if the options is an empty object', done => {
    const theFunction = () => {
      return new HtmlWebpackTagsPlugin({});
    };

    expect(theFunction).not.toThrowError();
    done();
  });

  describe('options.jsExtensions', () => {
    it('should throw an error if the jsExtensions is not an array or string', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ tags: [], append: false, jsExtensions: 123 });
      };
      expect(theFunction).toThrowError(/(options\.jsExtensions should be a string or array of strings)/);
      done();
    });

    it('should throw an error if any of the jsExtensions are not a string', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ tags: [], append: false, jsExtensions: ['a', 123, 'b'] });
      };
      expect(theFunction).toThrowError(/(options\.jsExtensions array should only contain strings)/);
      done();
    });
  });

  describe('options.cssExtensions', () => {
    it('should throw an error if the cssExtensions is not an array or string', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ tags: [], append: false, cssExtensions: 123 });
      };
      expect(theFunction).toThrowError(/(options\.cssExtensions should be a string or array of strings)/);
      done();
    });

    it('should throw an error if any of the cssExtensions are not a string', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ tags: [], append: false, cssExtensions: ['a', 123, 'b'] });
      };
      expect(theFunction).toThrowError(/(options\.cssExtensions array should only contain strings)/);
      done();
    });
  });

  describe('options.append', () => {
    it('should not throw an error if the append flag is not provided', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ tags: [] });
      };

      expect(theFunction).not.toThrowError();
      done();
    });

    it('should throw an error if the append flag is not a boolean', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ tags: [], append: 'hello' });
      };

      expect(theFunction).toThrowError(/(options.append should be a boolean)/);
      done();
    });
  });

  describe('options.publicPath', () => {
    it('should throw an error if the publicPath option is not a boolean or string or a function', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ publicPath: 123 });
      };

      expect(theFunction).toThrowError(/(options.publicPath should be a boolean or a string or a function)/);
      done();
    });

    it('should throw an error if the usePublicPath flag is not a boolean', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ usePublicPath: 123 });
      };

      expect(theFunction).toThrowError(/(options.usePublicPath should be a boolean)/);
      done();
    });

    it('should throw an error if the addPublicPath option is not a function', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ addPublicPath: 123 });
      };

      expect(theFunction).toThrowError(/(options.addPublicPath should be a function)/);
      done();
    });

    it('should throw an error if publicPath and usePublicPath are specified together', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ publicPath: true, usePublicPath: false });
      };

      expect(theFunction).toThrowError(/(options.publicPath should not be used with either usePublicPath or addPublicPath)/);
      done();
    });

    it('should throw an error if publicPath and addPublicPath are specified together', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ publicPath: true, addPublicPath: () => '' });
      };

      expect(theFunction).toThrowError(/(options.publicPath should not be used with either usePublicPath or addPublicPath)/);
      done();
    });
  });

  describe('options.hash', () => {
    it('should throw an error if the hash option is not a boolean or string or a function', done => {
      const nonBooleanCheck = [123, /regex/, [], {}];

      nonBooleanCheck.forEach(val => {
        const theCheck = () => {
          return new HtmlWebpackTagsPlugin({ tags: [], append: true, publicPath: true, hash: val });
        };
        expect(theCheck).toThrowError(/(options.hash should be a boolean or a string or a function that returns a string)/);
      });
      done();
    });

    it('should throw an error if the hash is a number', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ hash: 123 });
      };

      expect(theFunction).toThrowError(/(options.hash should be a boolean or a string or a function that returns a string)/);
      done();
    });

    it('should throw an error if the useHash flag is not a boolean', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ useHash: 123 });
      };

      expect(theFunction).toThrowError(/(options.useHash should be a boolean)/);
      done();
    });

    it('should throw an error if the addHash option is not a function', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ addHash: 123 });
      };

      expect(theFunction).toThrowError(/(options.addHash should be a function that returns a string)/);
      done();
    });

    it('should throw an error if hash and useHash are specified together', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ hash: true, useHash: false });
      };

      expect(theFunction).toThrowError(/(options.hash should not be used with either useHash or addHash)/);
      done();
    });

    it('should throw an error if hash and addHash are specified together', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ hash: true, addHash: () => '' });
      };

      expect(theFunction).toThrowError(/(options.hash should not be used with either useHash or addHash)/);
      done();
    });
  });

  describe('options.prependExternals', () => {
    it('should throw an error if prependExternals is not a boolean', done => {
      const nonBooleanCheck = [123, 'true', /regex/, {}];

      nonBooleanCheck.forEach(val => {
        const theCheck = () => {
          return new HtmlWebpackTagsPlugin({ prependExternals: val });
        };

        expect(theCheck).toThrowError(/(options\.prependExternals should be a boolean)/);
      });

      done();
    });

    it('should not throw an error if prependExternals is true', done => {
      const nonStringCheck = [123, true, /regex/, {}];

      nonStringCheck.forEach(val => {
        const theCheck = () => {
          return new HtmlWebpackTagsPlugin({ prependExternals: true });
        };

        expect(theCheck).not.toThrowError();
      });

      done();
    });

    it('should not throw an error if prependExternals is false', done => {
      const nonStringCheck = [123, true, /regex/, {}];

      nonStringCheck.forEach(val => {
        const theCheck = () => {
          return new HtmlWebpackTagsPlugin({ prependExternals: false });
        };

        expect(theCheck).not.toThrowError();
      });

      done();
    });
  });

  describe('options.files', () => {
    it('should throw an error if the files option is not a string', done => {
      const nonStringCheck = [123, true, /regex/, {}];

      nonStringCheck.forEach(val => {
        const theCheck = () => {
          return new HtmlWebpackTagsPlugin({ tags: [], append: true, publicPath: true, files: val });
        };

        expect(theCheck).toThrowError(/(options\.files should be a string or array of strings)/);
      });

      done();
    });

    it('should throw an error if any of the files options are not strings', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ tags: ['foo.js', 'bar.css'], append: false, files: ['abc', true, 'def'] });
      };
      expect(theFunction).toThrowError(/(options\.files should be a string or array of strings)/);
      done();
    });
  });

  describe('options.meta', () => {
    it('should throw an error if meta is a string', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ meta: 'a string' });
      };

      expect(theFunction).toThrowError(/(options.meta should be an object or array)/);
      done();
    });

    it('should throw an error if meta is an object without attributes', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ meta: { path: 'abc' } });
      };

      expect(theFunction).toThrowError(/(options.meta object must have an object attributes property)/);
      done();
    });

    it('should throw an error if meta is an object with non string path', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ meta: { attributes: { 'a': 'b' }, path: 123 } });
      };

      expect(theFunction).toThrowError(/(options.meta object should have a string path property)/);
      done();
    });

    it('should throw an error if meta is an array containing a string', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ meta: [{ attributes: { 'a': 1 }, path: 'a' }, '', { attributes: { 'b': 2 }, path: 'b' }] });
      };

      expect(theFunction).toThrowError(/(options.meta items must be an object)/);
      done();
    });

    it('should throw an error if meta is an object with empty attributes', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ meta: { attributes: { }, path: 'b' } });
      };

      expect(theFunction).toThrowError(/(options.meta object must have a non empty object attributes property)/);
      done();
    });

    it('should throw an error if meta is an array containing an object with empty attributes', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ meta: [{ attributes: { 'a': 1 }, path: 'a' }, { attributes: { }, path: 'b' }] });
      };

      expect(theFunction).toThrowError(/(options.meta object must have a non empty object attributes property)/);
      done();
    });

    it('should throw an error if meta has glob without path', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ meta: { attributes: { 'a': 1 }, glob: 'a' } });
      };

      expect(theFunction).toThrowError(/(options.meta object must have a path property when glob is used)/);
      done();
    });
  });

  describe('options[tags|links|scripts]', () => {
    runTestsForOption('tags', false, runTestsForAssetType);
    runTestsForOption('tags', true, runTestsForAssetType);
    runTestsForOption('links', false);
    runTestsForOption('scripts', true);
  });
});

function runTestsForOption (optionName, isScript, runExtraTests) {
  const ext = isScript ? '.js' : '.css';
  describe(`options.${optionName}`, () => {
    it(`should throw an error if the ${optionName} are not an array or string or object`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: 123 });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} should be a string, object, or array)`));
      done();
    });

    it(`should throw an error if the ${optionName} contains objects and a boolean`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [{ path: `a${ext}` }, false, { path: `b${ext}` }] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} items must be an object or string)`));
      done();
    });

    it(`should throw an error if the ${optionName} contains string and a boolean`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [`foo${ext}`, true, `bar${ext}`] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} items must be an object or string)`));
      done();
    });

    it(`should not throw an error if the ${optionName} contains strings and objects`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [`foo${ext}`, { path: `file${ext}` }, `bar${ext}`] });
      };

      expect(theFunction).not.toThrowError();
      done();
    });
  });

  describe(`options.${optionName} path`, () => {
    it(`should throw an error if the ${optionName} contains an element that is an empty object`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [{ path: `a${ext}` }, {}, { path: `b${ext}` }] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object must have a string path property)`));
      done();
    });

    it(`should throw an error if the ${optionName} contains an element that is an object with a non string path`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [{ path: `a${ext}` }, { path: 123, type: 'js' }, { path: `c${ext}` }] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object must have a string path property)`));
      done();
    });

    it(`should not throw an error if the ${optionName} contains elements that are all objects that have a path`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [{ path: `a${ext}` }, { path: `b${ext}` }, { path: `c${ext}` }] });
      };

      expect(theFunction).not.toThrowError();
      done();
    });
  });

  describe(`options.${optionName} append`, () => {
    it(`should throw an error if the ${optionName} contains an element that is an object with a non boolean append`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [{ path: `a${ext}` }, { path: `b${ext}`, append: 123 }, { path: `c${ext}` }] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName}.append should be a boolean)`));
      done();
    });

    it(`should not throw an error if the ${optionName} contains elements that are all objects that have a boolean append`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [{ path: `a${ext}`, append: true }, { path: `b${ext}`, append: false }, { path: `c${ext}`, append: true }] });
      };

      expect(theFunction).not.toThrowError();
      done();
    });
  });

  describe(`options.${optionName} publicPath`, () => {
    it(`should not throw an error if the ${optionName} contains an element that is an object with publicPath set to string`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [{ path: `a${ext}` }, { path: `b${ext}`, publicPath: 'my-public-path' }, { path: `c${ext}` }] });
      };

      expect(theFunction).not.toThrowError();
      done();
    });

    it(`should throw an error if the ${optionName} contains an element that is an object with publicPath set to object`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [{ path: `a${ext}` }, { path: `b${ext}`, publicPath: {} }, { path: `c${ext}` }] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName}.publicPath should be a boolean or a string or a function that returns a string)`));
      done();
    });

    it(`should throw an error if the ${optionName} contains an element that is an object with publicPath set to number`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [{ path: `a${ext}` }, { path: `b${ext}`, publicPath: 0 }, { path: `c${ext}` }] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName}.publicPath should be a boolean or a string or a function that returns a string)`));
      done();
    });

    it(`should throw an error if the ${optionName} contains an element that is an object with publicPath set to array`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [{ path: `a${ext}` }, { path: `b${ext}`, publicPath: [] }, { path: `c${ext}` }] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName}.publicPath should be a boolean or a string or a function that returns a string)`));
      done();
    });

    it(`should not throw an error if the ${optionName} contains an element that is an object with publicPath set to true`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [{ path: `a${ext}`, publicPath: true }, { path: `b${ext}` }, { path: `c${ext}` }] });
      };

      expect(theFunction).not.toThrowError();
      done();
    });
  });

  describe(`options.${optionName} attributes`, () => {
    it(`should throw an error if the ${optionName} contains an element that is an object with non object string attributes`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [{ path: `a${ext}` }, { path: `b${ext}`, attributes: '' }, { path: `c${ext}` }] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object should have an object attributes property)`));
      done();
    });

    it(`should throw an error if the ${optionName} contains an element that is an object with array attributes`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [{ path: `a${ext}` }, { path: `b${ext}`, attributes: [] }, { path: `c${ext}` }] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object should have an object attributes property)`));
      done();
    });

    it(`should throw an error if the ${optionName} contains an element that is an object with number attributes`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [{ path: `a${ext}` }, { path: `b${ext}`, attributes: 0 }, { path: `c${ext}` }] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object should have an object attributes property)`));
      done();
    });

    it(`should throw an error if the ${optionName} contains an element that is an object with boolean attributes`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [{ path: `a${ext}` }, { path: `b${ext}`, attributes: true }, { path: `c${ext}` }] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object should have an object attributes property)`));
      done();
    });

    it(`should not throw an error if the ${optionName} contains an element that is an object with empty object attributes`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [{ path: `a${ext}` }, { path: `b${ext}`, attributes: {} }, { path: `c${ext}` }] });
      };

      expect(theFunction).not.toThrowError();
      done();
    });

    it('should throw an error if any of the tags options are objects with an attributes property that is not an object', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ tags: [`foo${ext}`, { path: `pathWithExtension${ext}`, attributes: 'foobar' }, `bar${ext}`] });
      };
      expect(theFunction).toThrowError(/(options\.tags object should have an object attributes property)/);
      done();
    });

    it('should throw an error if any of the tags options are objects with an attributes property with non string or boolean values', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ tags: [`foo${ext}`, { path: `pathWithExtension${ext}`, attributes: { crossorigin: 'crossorigin', id: null, enabled: true } }, `bar${ext}`] });
      };
      expect(theFunction).toThrowError(/(options\.tags object attribute values should be strings, booleans or numbers)/);
      done();
    });

    it('should not throw an error if any of the tags options are objects with an attributes property with string or boolean values', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ tags: [`foo${ext}`, { path: `pathWithExtension${ext}`, attributes: { crossorigin: 'crossorigin', id: 'test', enabled: true } }, `bar${ext}`] });
      };
      expect(theFunction).not.toThrowError();
      done();
    });

    it('should not throw an error if any of the tags options are objects without an attributes property', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ tags: [`foo${ext}`, { path: `pathWithExtension${ext}` }, `bar${ext}`] });
      };
      expect(theFunction).not.toThrowError();
      done();
    });
  });

  describe(`options.${optionName} glob`, () => {
    it(`should throw an error if any of the ${optionName} options are objects with a glob property that is not a string`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [`foo${ext}`, { path: `a${ext}`, glob: 123, type: 'js' }, `bar${ext}`] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object should have a string glob property)`));
      done();
    });

    it(`should throw an error if any of the ${optionName} options are objects with a globPath property that is not a string`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [`foo${ext}`, { path: `a${ext}`, globPath: 123, type: 'js' }, `bar${ext}`] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object should have a string glob property)`));
      done();
    });

    it(`should throw an error if any of the ${optionName} options are objects with a globFlatten property that is not a boolean`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [`foo${ext}`, { path: '', globPath: FIXTURES_PATH, glob: `*${ext}`, globFlatten: 123 }, `bar${ext}`] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object should have a boolean globFlatten property)`));
      done();
    });

    it(`should throw an error if any of the ${optionName} options are objects with glob specified but globPath missing`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [`foo${ext}`, { path: `pathWithExtension${ext}`, glob: `withoutExtensions*` }, `bar${ext}`], append: false });
      };
      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object should have a string globPath property)`));
      done();
    });

    it(`should throw an error if any of the ${optionName} options are objects with globPath specified but glob missing`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [`foo${ext}`, { path: `pathWithExtension${ext}`, globPath: 'withoutExtensions*' }, `bar${ext}`], append: false });
      };
      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object should have a string glob property)`));
      done();
    });

    it(`should throw an error if any of the ${optionName} options are objects with glob that does not match any files`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [{ path: 'assets/', globPath: FIXTURES_PATH, glob: `nonexistant*${ext}` }], append: true });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object glob found no files)`));
      done();
    });
  });

  describe(`options.${optionName} sourcePath`, () => {
    it(`should throw an error if any of the ${optionName} options are objects with an sourcePath property that is not a string`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [`foo${ext}`, { path: `a${ext}`, sourcePath: 123, type: 'js' }, `bar${ext}`] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object should have a string sourcePath property)`));
      done();
    });
  });

  describe(`options.${optionName} external`, () => {
    it(`should throw an error if any of the ${optionName} options are objects with external property that is not an object`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [`foo${ext}`, { path: `a${ext}`, external: 123 }, `bar${ext}`] });
      };
      if (isScript) {
        expect(theFunction).toThrowError(new RegExp(`(options.${optionName}.external should be an object)`));
      } else {
        expect(theFunction).toThrowError(new RegExp(`(options.${optionName}.external should not be used on non script tags)`));
      }
      done();
    });

    if (isScript) {
      it(`should not throw an error if any of the ${optionName} options are objects with valid external objects`, done => {
        const theFunction = () => {
          return new HtmlWebpackTagsPlugin({ [optionName]: [`foo${ext}`, { path: `a${ext}`, external: { packageName: 'a', variableName: 'A' } }, `bar${ext}`] });
        };
        expect(theFunction).not.toThrowError();
        done();
      });

      it(`should throw an error if any of the ${optionName} options are objects with external that is an empty object`, done => {
        const theFunction = () => {
          return new HtmlWebpackTagsPlugin({ [optionName]: [`foo${ext}`, { path: `a${ext}`, external: { } }, `bar${ext}`] });
        };
        expect(theFunction).toThrowError(new RegExp(`(options.${optionName}.external should have a string packageName and variableName property)`));
        done();
      });

      it(`should throw an error if any of the ${optionName} options are objects with external that has packageName but not variableName string properties`, done => {
        const theFunction = () => {
          return new HtmlWebpackTagsPlugin({ [optionName]: [`foo${ext}`, { path: `a${ext}`, external: { packageName: 'a' } }, `bar${ext}`] });
        };
        expect(theFunction).toThrowError(new RegExp(`(options.${optionName}.external should have a string variableName property)`));
        done();
      });

      it(`should throw an error if any of the ${optionName} options are objects with external that has variableName but not packageName string properties`, done => {
        const theFunction = () => {
          return new HtmlWebpackTagsPlugin({ [optionName]: [`foo${ext}`, { path: `a${ext}`, external: { variableName: 'A' } }, `bar${ext}`] });
        };
        expect(theFunction).toThrowError(new RegExp(`(options.${optionName}.external should have a string packageName property)`));
        done();
      });
    }
  });

  if (runExtraTests) {
    runExtraTests(ext);
  }
}

function runTestsForAssetType (ext) {
  describe(`options.tags type`, () => {
    it('should throw an error if any of the tags options are objects with an invalid type property', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ tags: [`foo${ext}`, { path: `baz${ext}`, type: 'foo' }, `bar${ext}`], append: false });
      };
      expect(theFunction).toThrowError(/(options\.tags type must be css or js \(foo\))/);
      done();
    });

    it('should throw an error if any of the tags options do not end with .css or .js', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ tags: ['foo.css', 'bad.txt', 'bar.js'], append: false });
      };
      expect(theFunction).toThrowError(/(options\.tags could not determine asset type for \(bad\.txt\))/);
      done();
    });

    it('should throw an error if any of the tags options are objects without a type property that cannot be inferred from the path', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ tags: [`foo${ext}`, { path: 'pathWithoutExtension' }, `bar${ext}`], append: false });
      };
      expect(theFunction).toThrowError(/(options\.tags could not determine asset type for \(pathWithoutExtension\))/);
      done();
    });

    it('should not throw an error if any of the tags options are objects without a type property that can be inferred from the path', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ tags: [`foo${ext}`, { path: `pathWithExtension${ext}` }, `bar${ext}`], append: false });
      };
      expect(theFunction).not.toThrowError();
      done();
    });

    it('should not throw an error if any of the tags options are objects without a type property that can be inferred from the glob', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ tags: [`foo${ext}`, { path: '', globPath: FIXTURES_PATH, glob: `glo*${ext}` }, `bar${ext}`], append: false });
      };
      expect(theFunction).not.toThrowError();
      done();
    });
  });
}
