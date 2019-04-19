/* eslint-env jasmine */
const path = require('path');
require('jasmine-expect');

const HtmlWebpackIncludeAssetsPlugin = require('../');

const FIXTURES_PATH = path.join(__dirname, './fixtures');

describe('option validation', () => {
  it('should throw an error if no options are provided', done => {
    const theFunction = () => {
      return new HtmlWebpackIncludeAssetsPlugin();
    };

    expect(theFunction).toThrowError(/(options should be an object)/);
    done();
  });

  it('should throw an error if the options are not an object', done => {
    const theFunction = () => {
      return new HtmlWebpackIncludeAssetsPlugin('hello');
    };

    expect(theFunction).toThrowError(/(options should be an object)/);
    done();
  });

  it('should not throw an error if the options is an empty object', done => {
    const theFunction = () => {
      return new HtmlWebpackIncludeAssetsPlugin({});
    };

    expect(theFunction).not.toThrowError();
    done();
  });

  describe('options.jsExtensions', () => {
    it('should throw an error if the jsExtensions is not an array or string', done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: false, jsExtensions: 123 });
      };
      expect(theFunction).toThrowError(/(options\.jsExtensions should be a string or array of strings)/);
      done();
    });

    it('should throw an error if any of the jsExtensions are not a string', done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: false, jsExtensions: ['a', 123, 'b'] });
      };
      expect(theFunction).toThrowError(/(options\.jsExtensions array should only contain strings)/);
      done();
    });
  });

  describe('options.cssExtensions', () => {
    it('should throw an error if the cssExtensions is not an array or string', done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: false, cssExtensions: 123 });
      };
      expect(theFunction).toThrowError(/(options\.cssExtensions should be a string or array of strings)/);
      done();
    });

    it('should throw an error if any of the cssExtensions are not a string', done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: false, cssExtensions: ['a', 123, 'b'] });
      };
      expect(theFunction).toThrowError(/(options\.cssExtensions array should only contain strings)/);
      done();
    });
  });

  describe('options.append', () => {
    it('should not throw an error if the append flag is not provided', done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: [] });
      };

      expect(theFunction).not.toThrowError();
      done();
    });

    it('should throw an error if the append flag is not a boolean', done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: 'hello' });
      };

      expect(theFunction).toThrowError(/(options.append should be a boolean)/);
      done();
    });
  });

  describe('options.publicPath', () => {
    it('should throw an error if the publicPath flag is not a boolean or string or a function', done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ publicPath: 123 });
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
          return new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: true, publicPath: true, files: val });
        };

        expect(theCheck).toThrowError(/(options\.files should be a string or array)/);
      });

      done();
    });

    it('should throw an error if any of the files options are not strings', done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', 'bar.css'], append: false, files: ['abc', true, 'def'] });
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
          return new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: true, publicPath: true, hash: val });
        };
        expect(theCheck).toThrowError(/(options.hash should be a boolean or a function)/);
      });
      done();
    });
  });

  describe('options[assets|links|scripts]', () => {
    runTestsForOption('assets', runTestsForAssetType);
    runTestsForOption('links');
    runTestsForOption('scripts');
  });
});

function runTestsForOption (optionName, runExtraTests) {
  describe(`options.${optionName}`, () => {
    it(`should throw an error if the ${optionName} are not an array or string or object`, done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ [optionName]: 123 });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} should be a string, object, or array)`));
      done();
    });

    it(`should throw an error if the ${optionName} contains objects and a boolean`, done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ [optionName]: [{ path: 'a.js' }, false, { path: 'b.css' }] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} items must be an object or string)`));
      done();
    });

    it(`should throw an error if the ${optionName} contains string and a boolean`, done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ [optionName]: ['foo.js', true, 'bar.css'] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} items must be an object or string)`));
      done();
    });

    it(`should not throw an error if the ${optionName} contains strings and objects`, done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ [optionName]: ['foo.js', { path: 'file.js' }, 'bar.css'] });
      };

      expect(theFunction).not.toThrowError();
      done();
    });
  });

  describe(`options.${optionName} path`, () => {
    it(`should throw an error if the ${optionName} contains an element that is an empty object`, done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ [optionName]: [{ path: 'a.js' }, {}, { path: 'b.css' }] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object must have a string path property)`));
      done();
    });

    it(`should throw an error if the ${optionName} contains an element that is an object with a non string path`, done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ [optionName]: [{ path: 'a.js' }, { path: 123, type: 'js' }, { path: 'c.css' }] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object must have a string path property)`));
      done();
    });

    it(`should not throw an error if the ${optionName} contains elements that are all objects that have a path`, done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ [optionName]: [{ path: 'a.js' }, { path: 'b.css' }, { path: 'c.js' }] });
      };

      expect(theFunction).not.toThrowError();
      done();
    });
  });

  describe(`options.${optionName} publicPath`, () => {
    it(`should throw an error if the ${optionName} contains an element that is an object with publicPath set to string`, done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ [optionName]: [{ path: 'a.js' }, { path: 'b.css', publicPath: 'string' }, { path: 'c.js' }] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object publicPath should be a boolean or function)`));
      done();
    });

    it(`should throw an error if the ${optionName} contains an element that is an object with publicPath set to object`, done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ [optionName]: [{ path: 'a.js' }, { path: 'b.css', publicPath: {} }, { path: 'c.js' }] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object publicPath should be a boolean or function)`));
      done();
    });

    it(`should throw an error if the ${optionName} contains an element that is an object with publicPath set to number`, done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ [optionName]: [{ path: 'a.js' }, { path: 'b.css', publicPath: 0 }, { path: 'c.js' }] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object publicPath should be a boolean or function)`));
      done();
    });

    it(`should throw an error if the ${optionName} contains an element that is an object with publicPath set to array`, done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ [optionName]: [{ path: 'a.js' }, { path: 'b.css', publicPath: [] }, { path: 'c.js' }] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object publicPath should be a boolean or function)`));
      done();
    });

    it(`should not throw an error if the ${optionName} contains an element that is an object with publicPath set to true`, done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ [optionName]: [{ path: 'a.js', publicPath: true }, { path: 'b.css' }, { path: 'c.js' }] });
      };

      expect(theFunction).not.toThrowError();
      done();
    });

    it(`should not throw an error if the ${optionName} contains an element that is an object with asset set to false`, done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ [optionName]: [{ path: 'a.js', asset: false }, { path: 'b.css' }, { path: 'c.js' }] });
      };

      expect(theFunction).not.toThrowError();
      done();
    });
  });

  describe(`options.${optionName} attributes`, () => {
    it(`should throw an error if the ${optionName} contains an element that is an object with non object string attributes`, done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ [optionName]: [{ path: 'a.js' }, { path: 'b.css', attributes: '' }, { path: 'c.js' }] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object should have an object attributes property)`));
      done();
    });

    it(`should throw an error if the ${optionName} contains an element that is an object with array attributes`, done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ [optionName]: [{ path: 'a.js' }, { path: 'b.css', attributes: [] }, { path: 'c.js' }] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object should have an object attributes property)`));
      done();
    });

    it(`should throw an error if the ${optionName} contains an element that is an object with number attributes`, done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ [optionName]: [{ path: 'a.js' }, { path: 'b.css', attributes: 0 }, { path: 'c.js' }] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object should have an object attributes property)`));
      done();
    });

    it(`should throw an error if the ${optionName} contains an element that is an object with boolean attributes`, done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ [optionName]: [{ path: 'a.js' }, { path: 'b.css', attributes: true }, { path: 'c.js' }] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object should have an object attributes property)`));
      done();
    });

    it(`should not throw an error if the ${optionName} contains an element that is an object with empty object attributes`, done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ [optionName]: [{ path: 'a.js' }, { path: 'b.css', attributes: {} }, { path: 'c.js' }] });
      };

      expect(theFunction).not.toThrowError();
      done();
    });

    // TODO
    it('should throw an error if any of the asset options are objects with an attributes property that is not an object', done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'pathWithExtension.js', attributes: 'foobar' }, 'bar.css'] });
      };
      expect(theFunction).toThrowError(/(options\.assets object should have an object attributes property)/);
      done();
    });

    it('should throw an error if any of the asset options are objects with an attributes property with non string or boolean values', done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'pathWithExtension.js', attributes: { crossorigin: 'crossorigin', id: null, enabled: true } }, 'bar.css'] });
      };
      expect(theFunction).toThrowError(/(options\.assets object attribute values should strings, booleans or numbers)/);
      done();
    });

    it('should not throw an error if any of the asset options are objects with an attributes property with string or boolean values', done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'pathWithExtension.js', attributes: { crossorigin: 'crossorigin', id: 'test', enabled: true } }, 'bar.css'] });
      };
      expect(theFunction).not.toThrowError();
      done();
    });

    it('should not throw an error if any of the asset options are objects without an attributes property', done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'pathWithExtension.js' }, 'bar.css'] });
      };
      expect(theFunction).not.toThrowError();
      done();
    });
  });

  describe(`options.${optionName} glob`, () => {
    it(`should throw an error if any of the ${optionName} options are objects with a glob property that is not a string`, done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ [optionName]: ['foo.js', { path: 'a.js', glob: 123, type: 'js' }, 'bar.css'] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object should have a string glob property)`));
      done();
    });

    it(`should throw an error if any of the ${optionName} options are objects with glob specified but globPath missing`, done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ [optionName]: ['foo.js', { path: 'pathWithExtension.js', glob: 'withoutExtensions*' }, 'bar.css'], append: false });
      };
      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object should have a string globPath property)`));
      done();
    });

    it(`should throw an error if any of the ${optionName} options are objects with globPath specified but glob missing`, done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ [optionName]: ['foo.js', { path: 'pathWithExtension.js', globPath: 'withoutExtensions*' }, 'bar.css'], append: false });
      };
      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object should have a string glob property)`));
      done();
    });

    it(`should throw an error if any of the ${optionName} options are objects with glob that does not match any files`, done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ [optionName]: [{ path: 'assets/', globPath: FIXTURES_PATH, glob: 'nonexistant*.js' }, { path: 'assets/', globPath: FIXTURES_PATH, glob: 'nonexistant*.css' }], append: true });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object glob found no files)`));
      done();
    });
  });

  describe(`options.${optionName} sourcePath`, () => {
    it(`should throw an error if any of the ${optionName} options are objects with an sourcePath property that is not a string`, done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ [optionName]: ['foo.js', { path: 'a.js', sourcePath: 123, type: 'js' }, 'bar.css'] });
      };

      expect(theFunction).toThrowError(new RegExp(`(options.${optionName} object should have a string sourcePath property)`));
      done();
    });
  });

  if (runExtraTests) {
    runExtraTests();
  }
}

function runTestsForAssetType () {
  describe(`options.assets type`, () => {
    it('should throw an error if any of the asset options are objects with an invalid type property', done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'baz.js', type: 'foo' }, 'bar.css'], append: false });
      };
      expect(theFunction).toThrowError(/(options\.assets type must be css or js \(foo\))/);
      done();
    });

    it('should throw an error if any of the assets options do not end with .css or .js', done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.css', 'bad.txt', 'bar.js'], append: false });
      };
      expect(theFunction).toThrowError(/(options\.assets could not determine asset type for \(bad\.txt\))/);
      done();
    });

    it('should throw an error if any of the asset options are objects without a type property that cannot be inferred from the path', done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'pathWithoutExtension' }, 'bar.css'], append: false });
      };
      expect(theFunction).toThrowError(/(options\.assets could not determine asset type for \(pathWithoutExtension\))/);
      done();
    });

    it('should not throw an error if any of the asset options are objects without a type property that can be inferred from the path', done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'pathWithExtension.js' }, 'bar.css'], append: false });
      };
      expect(theFunction).not.toThrowError();
      done();
    });

    it('should not throw an error if any of the asset options are objects without a type property that can be inferred from the glob', done => {
      const theFunction = () => {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'pathWithoutExtension', globPath: FIXTURES_PATH, glob: 'glo*.js' }, 'bar.css'], append: false });
      };
      expect(theFunction).not.toThrowError();
      done();
    });
  });
}
