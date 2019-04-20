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
    it('should throw an error if the publicPath flag is not a boolean or string or a function', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ publicPath: 123 });
      };

      expect(theFunction).toThrowError(/(options should specify a publicPath that is either a boolean or a string)/);
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

        expect(theCheck).toThrowError(/(options\.files should be a string or array)/);
      });

      done();
    });

    it('should throw an error if any of the files options are not strings', done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ tags: ['foo.js', 'bar.css'], append: false, files: ['abc', true, 'def'] });
      };
      expect(theFunction).toThrowError(/(options\.files should be an array of strings)/);
      done();
    });
  });

  describe('options.hash', () => {
    it('should throw an error if the hash option is not a boolean or function', done => {
      const nonBooleanCheck = [123, 'not a boolean', /regex/, [], {}];

      nonBooleanCheck.forEach(val => {
        const theCheck = () => {
          return new HtmlWebpackTagsPlugin({ tags: [], append: true, publicPath: true, hash: val });
        };
        expect(theCheck).toThrowError(/(options.hash should be a boolean or a function)/);
      });
      done();
    });
  });

  describe('options[tags|links|scripts]', () => {
    runTestsForOption('tags', 'link', runTestsForAssetType);
    runTestsForOption('tags', 'script', runTestsForAssetType);
    runTestsForOption('links', 'link');
    runTestsForOption('scripts', 'script');
  });
});

function runTestsForOption (optionName, type, runExtraTests) {
  const isScript = type === 'script';
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
        return new HtmlWebpackTagsPlugin({ [optionName]: [`foo.js`, true, `bar.css`] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} items must be an object or string)`));
      done();
    });

    it(`should not throw an error if the ${optionName} contains strings and objects`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [`foo.js`, { path: `file.js` }, `bar.css`] });
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
        return new HtmlWebpackTagsPlugin({ [optionName]: [{ path: `a${ext}` }, { path: 123, type: 'js' }, { path: 'c.css' }] });
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

  describe(`options.${optionName} publicPath`, () => {
    it(`should throw an error if the ${optionName} contains an element that is an object with publicPath set to string`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [{ path: `a${ext}` }, { path: `b${ext}`, publicPath: 'string' }, { path: `c${ext}` }] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object publicPath should be a boolean or function)`));
      done();
    });

    it(`should throw an error if the ${optionName} contains an element that is an object with publicPath set to object`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [{ path: `a${ext}` }, { path: `b${ext}`, publicPath: {} }, { path: `c${ext}` }] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object publicPath should be a boolean or function)`));
      done();
    });

    it(`should throw an error if the ${optionName} contains an element that is an object with publicPath set to number`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [{ path: `a${ext}` }, { path: `b${ext}`, publicPath: 0 }, { path: `c${ext}` }] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object publicPath should be a boolean or function)`));
      done();
    });

    it(`should throw an error if the ${optionName} contains an element that is an object with publicPath set to array`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [{ path: `a${ext}` }, { path: `b${ext}`, publicPath: [] }, { path: `c${ext}` }] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object publicPath should be a boolean or function)`));
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
      expect(theFunction).toThrowError(/(options\.tags object attribute values should strings, booleans or numbers)/);
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

    it(`should throw an error if any of the ${optionName} options are objects with glob specified but globPath missing`, done => {
      const theFunction = () => {
        return new HtmlWebpackTagsPlugin({ [optionName]: [`foo${ext}`, { path: `pathWithExtension${ext}`, glob: 'withoutExtensions*' }, `bar${ext}`], append: false });
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
        return new HtmlWebpackTagsPlugin({ [optionName]: [{ path: 'assets/', globPath: FIXTURES_PATH, glob: 'nonexistant*.js' }, { path: 'assets/', globPath: FIXTURES_PATH, glob: 'nonexistant*.css' }], append: true });
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
        expect(theFunction).toThrowError(new RegExp(`(options.${optionName} external should be an object)`));
      } else {
        expect(theFunction).toThrowError(new RegExp(`(options.${optionName} external should not be used on non script tags)`));
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
        expect(theFunction).toThrowError(new RegExp(`(options.${optionName} external should have a string packageName and variableName property)`));
        done();
      });

      it(`should throw an error if any of the ${optionName} options are objects with external that has packageName but not variableName string properties`, done => {
        const theFunction = () => {
          return new HtmlWebpackTagsPlugin({ [optionName]: [`foo${ext}`, { path: `a${ext}`, external: { packageName: 'a' } }, `bar${ext}`] });
        };
        expect(theFunction).toThrowError(new RegExp(`(options.${optionName} external should have a string variableName property)`));
        done();
      });

      it(`should throw an error if any of the ${optionName} options are objects with external that has variableName but not packageName string properties`, done => {
        const theFunction = () => {
          return new HtmlWebpackTagsPlugin({ [optionName]: [`foo${ext}`, { path: `a${ext}`, external: { variableName: 'A' } }, `bar${ext}`] });
        };
        expect(theFunction).toThrowError(new RegExp(`(options.${optionName} external should have a string packageName property)`));
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
