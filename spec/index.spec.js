/* eslint-env jasmine */
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');
const webpack = require('webpack');
const rimraf = require('rimraf');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('../');

const OUTPUT_DIR = path.join(__dirname, '../dist');

const FIXTURES_PATH = path.join(__dirname, './fixtures');

describe('HtmlWebpackIncludeAssetsPlugin', function () {
  beforeEach(function (done) {
    rimraf(OUTPUT_DIR, done);
  });

  describe('option validation', function () {
    it('should throw an error if no options are provided', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin();
      };

      expect(theFunction).toThrowError(/(options should be an object)/);
      done();
    });

    it('should throw an error if the options are not an object', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin('hello');
      };

      expect(theFunction).toThrowError(/(options should be an object)/);
      done();
    });

    it('should not throw an error if the assets are not provided', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ append: false });
      };

      expect(theFunction).not.toThrowError();
      done();
    });

    it('should throw an error if the links are not an array or string or object', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ append: false, assets: [], links: 123 });
      };

      expect(theFunction).toThrowError(/(options\.links should be a string, object, or array)/);
      done();
    });

    it('should throw an error if the links contains an element that is not an object or string', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ append: false, assets: [], links: [{ path: '' }, false, { path: '' }] });
      };

      expect(theFunction).toThrowError(/(options\.links items must be an object or string)/);
      done();
    });

    it('should throw an error if the links contains an element that is not an object with string path', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ append: false, assets: [], links: [{ path: '' }, { }, { path: '' }] });
      };

      expect(theFunction).toThrowError(/(options\.links object must have a string path property)/);
      done();
    });

    it('should throw an error if the links contains an element that is an object with publicPath set to string', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ append: false, assets: [], links: [{ path: '' }, { path: '', publicPath: 'string' }, { path: '' }] });
      };

      expect(theFunction).toThrowError(/(options\.links object publicPath should be a boolean or function)/);
      done();
    });

    it('should throw an error if the links contains an element that is an object with publicPath set to object', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ append: false, assets: [], links: [{ path: '' }, { path: '', publicPath: {} }, { path: '' }] });
      };

      expect(theFunction).toThrowError(/(options\.links object publicPath should be a boolean or function)/);
      done();
    });

    it('should throw an error if the links contains an element that is an object with publicPath set to number', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ append: false, assets: [], links: [{ path: '' }, { path: '', publicPath: 0 }, { path: '' }] });
      };

      expect(theFunction).toThrowError(/(options\.links object publicPath should be a boolean or function)/);
      done();
    });

    it('should throw an error if the links contains an element that is an object with publicPath set to array', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ append: false, assets: [], links: [{ path: '' }, { path: '', publicPath: [] }, { path: '' }] });
      };

      expect(theFunction).toThrowError(/(options\.links object publicPath should be a boolean or function)/);
      done();
    });

    it('should not throw an error if the links contains an element that is an object with publicPath set to true', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ append: false, assets: [], links: [{ path: '', publicPath: true }, { path: '' }, { path: '' }] });
      };

      expect(theFunction).not.toThrowError();
      done();
    });

    it('should not throw an error if the links contains an element that is an object with asset set to false', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ append: false, assets: [], links: [{ path: '', asset: false }, { path: '' }, { path: '' }] });
      };

      expect(theFunction).not.toThrowError();
      done();
    });

    it('should not throw an error if the links contains elements that are all objects that have a path', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ append: false, assets: [], links: [{ path: '' }, { path: '' }, { path: '' }] });
      };

      expect(theFunction).not.toThrowError();
      done();
    });

    it('should throw an error if the links contains an element that is an object with non object string attributes', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ append: false, assets: [], links: [{ path: '' }, { path: '', attributes: '' }, { path: '' }] });
      };

      expect(theFunction).toThrowError(/(options\.links object should have an object attributes property)/);
      done();
    });

    it('should throw an error if the links contains an element that is an object with array attributes', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ append: false, assets: [], links: [{ path: '' }, { path: '', attributes: [] }, { path: '' }] });
      };

      expect(theFunction).toThrowError(/(options\.links object should have an object attributes property)/);
      done();
    });

    it('should throw an error if the links contains an element that is an object with number attributes', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ append: false, assets: [], links: [{ path: '' }, { path: '', attributes: 0 }, { path: '' }] });
      };

      expect(theFunction).toThrowError(/(options\.links object should have an object attributes property)/);
      done();
    });

    it('should throw an error if the links contains an element that is an object with boolean attributes', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ append: false, assets: [], links: [{ path: '' }, { path: '', attributes: true }, { path: '' }] });
      };

      expect(theFunction).toThrowError(/(options\.links object should have an object attributes property)/);
      done();
    });

    it('should not throw an error if the links contains an element that is an object with empty object attributes', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ append: false, assets: [], links: [{ path: '' }, { path: '', attributes: {} }, { path: '' }] });
      };

      expect(theFunction).not.toThrowError();
      done();
    });

    it('should throw an error if the assets are not an array or string or object', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: 123, append: false });
      };

      expect(theFunction).toThrowError(/(options\.assets should be a string, object, or array)/);
      done();
    });

    it('should throw an error if any of the asset options are not strings or objects', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', true, 'bar.css'], append: false });
      };
      expect(theFunction).toThrowError(/(options\.assets items must be an object or string)/);
      done();
    });

    it('should throw an error if any of the asset options are objects missing the path property', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { type: 'js' }, 'bar.css'], append: false });
      };
      expect(theFunction).toThrowError(/(options\.assets object must have a string path property)/);
      done();
    });

    it('should throw an error if any of the asset options are objects with a path property that is not a string', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 123, type: 'js' }, 'bar.css'], append: false });
      };
      expect(theFunction).toThrowError(/(options\.assets object must have a string path property)/);
      done();
    });

    it('should throw an error if any of the asset options are objects with a glob property that is not a string', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: '', glob: 123, type: 'js' }, 'bar.css'], append: false });
      };
      expect(theFunction).toThrowError(/(options\.assets object should have a string glob property)/);
      done();
    });

    it('should throw an error if any of the asset options are objects with an assetPath property that is not a string', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: '', assetPath: 123, type: 'js' }, 'bar.css'], append: false });
      };
      expect(theFunction).toThrowError(/(options\.assets object should have a string assetPath property)/);
      done();
    });

    it('should throw an error if any of the asset options are objects with an invalid type property', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'baz.js', type: 'foo' }, 'bar.css'], append: false });
      };
      expect(theFunction).toThrowError(/(options\.assets type must be css or js \(foo\))/);
      done();
    });

    it('should throw an error if any of the assets options do not end with .css or .js', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.css', 'bad.txt', 'bar.js'], append: false });
      };
      expect(theFunction).toThrowError(/(options\.assets could not determine asset type for \(bad\.txt\))/);
      done();
    });

    it('should throw an error if any of the asset options are objects without a type property that cannot be inferred from the path', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'pathWithoutExtension' }, 'bar.css'], append: false });
      };
      expect(theFunction).toThrowError(/(options\.assets could not determine asset type for \(pathWithoutExtension\))/);
      done();
    });

    it('should not throw an error if any of the asset options are objects without a type property that can be inferred from the path', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'pathWithExtension.js' }, 'bar.css'], append: false });
      };
      expect(theFunction).not.toThrowError();
      done();
    });

    it('should throw an error if glob is specified but the globPath is missing', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'pathWithExtension.js', glob: 'withoutExtensions*' }, 'bar.css'], append: false });
      };
      expect(theFunction).toThrowError(/(options\.assets object should have a string globPath property)/);
      done();
    });

    it('should throw an error if globPath is specified but the glob is missing', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'pathWithExtension.js', globPath: 'withoutExtensions*' }, 'bar.css'], append: false });
      };
      expect(theFunction).toThrowError(/(options\.assets object should have a string glob property)/);
      done();
    });

    it('should not throw an error if any of the asset options are objects without a type property that can be inferred from the glob', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'pathWithoutExtension', globPath: FIXTURES_PATH, glob: 'glo*.js' }, 'bar.css'], append: false });
      };
      expect(theFunction).not.toThrowError();
      done();
    });

    it('should throw an error if any of the asset options are objects with an attributes property that is not an object', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'pathWithExtension.js', attributes: 'foobar' }, 'bar.css'], append: false });
      };
      expect(theFunction).toThrowError(/(options\.assets object should have an object attributes property)/);
      done();
    });

    it('should throw an error if any of the asset options are objects with an attributes property with non string or boolean values', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'pathWithExtension.js', attributes: { crossorigin: 'crossorigin', id: null, enabled: true } }, 'bar.css'], append: false });
      };
      expect(theFunction).toThrowError(/(options\.assets object attribute values should strings, booleans or numbers)/);
      done();
    });

    it('should not throw an error if any of the asset options are objects with an attributes property with string or boolean values', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'pathWithExtension.js', attributes: { crossorigin: 'crossorigin', id: 'test', enabled: true } }, 'bar.css'], append: false });
      };
      expect(theFunction).not.toThrowError();
      done();
    });

    it('should not throw an error if any of the asset options are objects without an attributes property', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'pathWithExtension.js' }, 'bar.css'], append: false });
      };
      expect(theFunction).not.toThrowError();
      done();
    });

    it('should throw an error if the jsExtensions is not an array or string', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: false, jsExtensions: 123 });
      };
      expect(theFunction).toThrowError(/(options\.jsExtensions should be a string or array of strings)/);
      done();
    });

    it('should throw an error if any of the jsExtensions are not a string', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: false, jsExtensions: ['a', 123, 'b'] });
      };
      expect(theFunction).toThrowError(/(options\.jsExtensions array should only contain strings)/);
      done();
    });

    it('should throw an error if the csssExtensions is not an array or string', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: false, cssExtensions: 123 });
      };
      expect(theFunction).toThrowError(/(options\.cssExtensions should be a string or array of strings)/);
      done();
    });

    it('should throw an error if any of the cssExtensions are not a string', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: false, cssExtensions: ['a', 123, 'b'] });
      };
      expect(theFunction).toThrowError(/(options\.cssExtensions array should only contain strings)/);
      done();
    });

    it('should not throw an error if the append flag is not provided', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: [] });
      };

      expect(theFunction).not.toThrowError();
      done();
    });

    it('should throw an error if the append flag is not a boolean', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: 'hello' });
      };

      expect(theFunction).toThrowError(/(options.append should be a boolean)/);
      done();
    });

    it('should throw an error if the publicPath flag is not a boolean or string or a function', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: true, publicPath: 123 });
      };

      expect(theFunction).toThrowError(/(options should specify a publicPath that is either a boolean or a string)/);
      done();
    });

    it('should throw an error if the files option is not a string', function (done) {
      const nonStringCheck = [123, true, /regex/, {}];

      nonStringCheck.forEach(function (val) {
        const theCheck = function () {
          return new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: true, publicPath: true, files: val });
        };

        expect(theCheck).toThrowError(/(options\.files should be a string or array)/);
      });

      done();
    });

    it('should throw an error if any of the files options are not strings', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', 'bar.css'], append: false, files: ['abc', true, 'def'] });
      };
      expect(theFunction).toThrowError(/(options\.files should be an array of strings)/);
      done();
    });

    it('should throw an error if the hash option is not a boolean or function', function (done) {
      const nonBooleanCheck = [123, 'not a boolean', /regex/, [], {}];

      nonBooleanCheck.forEach(function (val) {
        const theCheck = function () {
          return new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: true, publicPath: true, hash: val });
        };
        expect(theCheck).toThrowError(/(options.hash should be a boolean or a function)/);
      });
      done();
    });

    it('should throw an error for a glob that does not match any files', function (done) {
      const theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: [{ path: 'assets/', globPath: 'spec/fixtures/', glob: 'nonexistant*.js' }, { path: 'assets/', globPath: 'spec/fixtures/', glob: 'nonexistant*.css' }], append: true });
      };
      expect(theFunction).toThrowError(/(options.assets object glob found no files \(assets\/ nonexistant\*.js spec\/fixtures\/\))/);
      done();
    });
  });

  xdescribe('plugin dependencies', function () {
    it('should throw an error if html-webpack-plugin is not in the webpack config', function (done) {
      const theError = /(are you sure you have html-webpack-plugin before it in your webpack config's plugins)/;
      const theFunction = function () {
        webpack({
          entry: {
            app: path.join(__dirname, 'fixtures', 'entry.js'),
            style: path.join(__dirname, 'fixtures', 'app.css')
          },
          output: {
            path: OUTPUT_DIR,
            filename: '[name].js'
          },
          module: {
            rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
          },
          plugins: [
            new MiniCssExtractPlugin({ filename: '[name].css' }),
            new HtmlWebpackIncludeAssetsPlugin({ assets: 'foobar.js', append: true, publicPath: false })
          ]
        }, function () {});
      };
      expect(theFunction).toThrowError(theError);
      done();
    });
  });

  describe('option.append', function () {
    it('should include a single js file and append it', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({ assets: 'foobar.js', append: true, publicPath: false })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(1);
          expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script type="text/javascript" src="app.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('script[src="foobar.js"]').toString()).toBe('<script type="text/javascript" src="foobar.js"></script>');
          expect($($('script').get(2)).toString()).toBe('<script type="text/javascript" src="foobar.js"></script>');
          done();
        });
      });
    });

    it('should include a single css file and append it', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({ assets: 'foobar.css', append: true, publicPath: false })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(2);
          expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script type="text/javascript" src="app.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('link[href="foobar.css"]').toString()).toBe('<link href="foobar.css" rel="stylesheet">');
          expect($($('link').get(1)).toString()).toBe('<link href="foobar.css" rel="stylesheet">');
          done();
        });
      });
    });

    it('should include a single js file and prepend it', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({ assets: 'foobar.js', append: false, publicPath: false })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(1);
          expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script type="text/javascript" src="app.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('script[src="foobar.js"]').toString()).toBe('<script type="text/javascript" src="foobar.js"></script>');
          expect($($('script').get(0)).toString()).toBe('<script type="text/javascript" src="foobar.js"></script>');
          done();
        });
      });
    });

    it('should include a single css file and prepend it', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({ assets: 'foobar.css', append: false, publicPath: false })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(2);
          expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script type="text/javascript" src="app.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('link[href="foobar.css"]').toString()).toBe('<link href="foobar.css" rel="stylesheet">');
          expect($($('link').get(0)).toString()).toBe('<link href="foobar.css" rel="stylesheet">');
          done();
        });
      });
    });

    it('should support appending and prepending at the same time', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.css', 'foo.js'], append: false, publicPath: false, debug: true }),
          new HtmlWebpackIncludeAssetsPlugin({ assets: ['bar.css', 'bar.js'], append: true, publicPath: false, debug: true })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(4);
          expect($('link').length).toBe(3);
          expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script type="text/javascript" src="app.js"></script>');
          expect($('script[src="foo.js"]').toString()).toBe('<script type="text/javascript" src="foo.js"></script>');
          expect($('script[src="bar.js"]').toString()).toBe('<script type="text/javascript" src="bar.js"></script>');
          expect($($('script').get(0)).toString()).toBe('<script type="text/javascript" src="foo.js"></script>');
          expect($($('script').get(3)).toString()).toBe('<script type="text/javascript" src="bar.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('link[href="foo.css"]').toString()).toBe('<link href="foo.css" rel="stylesheet">');
          expect($('link[href="bar.css"]').toString()).toBe('<link href="bar.css" rel="stylesheet">');
          expect($($('link').get(0)).toString()).toBe('<link href="foo.css" rel="stylesheet">');
          expect($($('link').get(2)).toString()).toBe('<link href="bar.css" rel="stylesheet">');
          done();
        });
      });
    });

    it('should include multiple css files and append them in order', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.css', 'bar.css', { path: 'baz.css' }], append: true, publicPath: false })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(4);
          expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script type="text/javascript" src="app.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('link[href="foo.css"]').toString()).toBe('<link href="foo.css" rel="stylesheet">');
          expect($('link[href="bar.css"]').toString()).toBe('<link href="bar.css" rel="stylesheet">');
          expect($('link[href="baz.css"]').toString()).toBe('<link href="baz.css" rel="stylesheet">');
          expect($($('link').get(1)).toString()).toBe('<link href="foo.css" rel="stylesheet">');
          expect($($('link').get(2)).toString()).toBe('<link href="bar.css" rel="stylesheet">');
          expect($($('link').get(3)).toString()).toBe('<link href="baz.css" rel="stylesheet">');
          done();
        });
      });
    });

    it('should include multiple css files and prepend them in order', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.css', 'bar.css'], append: false, publicPath: false })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(3);
          expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script type="text/javascript" src="app.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('link[href="foo.css"]').toString()).toBe('<link href="foo.css" rel="stylesheet">');
          expect($('link[href="bar.css"]').toString()).toBe('<link href="bar.css" rel="stylesheet">');
          expect($($('link').get(0)).toString()).toBe('<link href="foo.css" rel="stylesheet">');
          expect($($('link').get(1)).toString()).toBe('<link href="bar.css" rel="stylesheet">');
          done();
        });
      });
    });
  });

  describe('option.files', function () {
    it('should not include if not present in defined files', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({
            files: ['fail.html'],
            assets: 'foobar.js',
            append: true,
            publicPath: false
          })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(1);
          expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script type="text/javascript" src="app.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          done();
        });
      });
    });

    it('should include if present in defined files', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({
            files: ['*.html'],
            assets: 'foobar.js',
            append: true,
            publicPath: false
          })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(1);
          expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script type="text/javascript" src="app.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('script[src="foobar.js"]').toString()).toBe('<script type="text/javascript" src="foobar.js"></script>');
          expect($($('script').get(2)).toString()).toBe('<script type="text/javascript" src="foobar.js"></script>');
          done();
        });
      });
    });
  });

  describe('option.assets', function () {
    it('should not include assets when none are requested', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: [path.join(__dirname, 'fixtures', 'app.css')]
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: true })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(1);
          expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script type="text/javascript" src="app.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          done();
        });
      });
    });

    it('should include a mixture of js and css files', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({
            assets: [
              'foo.js',
              'foo.css',
              { path: 'baz', type: 'css' },
              { path: 'bar.js' },
              'bar.css',
              { path: 'qux', type: 'js' }
            ],
            append: true,
            publicPath: false
          })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(5);
          expect($('link').length).toBe(4);
          expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script type="text/javascript" src="app.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('script[src="foo.js"]').toString()).toBe('<script type="text/javascript" src="foo.js"></script>');
          expect($('script[src="bar.js"]').toString()).toBe('<script type="text/javascript" src="bar.js"></script>');
          expect($('script[src="qux"]').toString()).toBe('<script type="text/javascript" src="qux"></script>');
          expect($('link[href="foo.css"]').toString()).toBe('<link href="foo.css" rel="stylesheet">');
          expect($('link[href="bar.css"]').toString()).toBe('<link href="bar.css" rel="stylesheet">');
          expect($('link[href="baz"]').toString()).toBe('<link href="baz" rel="stylesheet">');
          done();
        });
      });
    });
  });

  describe('option.jsExtensions', function () {
    it('should include all js type files when multiple jsExtensions are specified', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', 'foo.jsx'], append: true, jsExtensions: ['.js', '.jsx'] })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(4);
          expect($('link').length).toBe(1);
          expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script type="text/javascript" src="app.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('script[src="foo.js"]').toString()).toBe('<script type="text/javascript" src="foo.js"></script>');
          expect($('script[src="foo.jsx"]').toString()).toBe('<script type="text/javascript" src="foo.jsx"></script>');
          done();
        });
      });
    });
  });

  describe('option.cssExtensions', function () {
    it('should include all css type files when multiple cssExtensions are specified', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.css', 'foo.style'], append: true, cssExtensions: ['.css', '.style'] })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(3);
          expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script type="text/javascript" src="app.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('link[href="foo.css"]').toString()).toBe('<link href="foo.css" rel="stylesheet">');
          expect($('link[href="foo.style"]').toString()).toBe('<link href="foo.style" rel="stylesheet">');
          done();
        });
      });
    });
  });

  describe('option.assets.glob', function () {
    it('should include any files for a glob that does match files', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new CopyWebpackPlugin([{ from: 'spec/fixtures/g*', to: 'assets/', flatten: true }]),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({ assets: [{ path: 'assets/', globPath: 'spec/fixtures/', glob: 'g*.js' }, { path: 'assets/', globPath: 'spec/fixtures/', glob: 'g*.css' }], append: true })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(2);
          expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script type="text/javascript" src="app.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('link[href="assets/glob.css"]').toString()).toBe('<link href="assets/glob.css" rel="stylesheet">');
          expect($('script[src="assets/glob.js"]').toString()).toBe('<script type="text/javascript" src="assets/glob.js"></script>');
          done();
        });
      });
    });
  });

  describe('option.assets.attributes', function () {
    it('should add the given attributes to the matching tag', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({ assets: [{ path: 'assets/abc.js', attributes: { id: 'abc' } }, { path: 'assets/def.css', attributes: { id: 'def', media: 'screen' } }, { path: 'assets/ghi.css' }], append: false })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(3);
          expect($('script[src="app.js"]').toString()).toBe('<script type="text/javascript" src="app.js"></script>');
          expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('script[src="assets/abc.js"]').toString()).toBe('<script type="text/javascript" src="assets/abc.js" id="abc"></script>');
          expect($('link[href="assets/def.css"]').toString()).toBe('<link href="assets/def.css" rel="stylesheet" id="def" media="screen">');
          expect($('link[href="assets/ghi.css"]').toString()).toBe('<link href="assets/ghi.css" rel="stylesheet">');
          done();
        });
      });
    });

    it('can match tags with an overridden publicPath and set hash', function (done) {
      const appendHash = function (v, hash) {
        if (hash.length > 0) hash = '?' + hash;
        return v + hash;
      };

      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          publicPath: 'thePublicPath/',
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin({ hash: true }),
          new HtmlWebpackIncludeAssetsPlugin({ assets: [{ path: 'assets/abc.js', attributes: { id: 'abc' } }, { path: 'assets/def.css', attributes: { id: 'def', media: 'screen' } }, { path: 'assets/ghi.css' }], append: false, hash: true })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const hash = result.compilation.hash;
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(3);
          expect($('script[src^="thePublicPath/app.js"]').toString()).toBe('<script type="text/javascript" src="' + appendHash('thePublicPath/app.js', hash) + '"></script>');
          expect($('script[src^="thePublicPath/style.js"]').toString()).toBe('<script type="text/javascript" src="' + appendHash('thePublicPath/style.js', hash) + '"></script>');
          expect($('link[href^="thePublicPath/style.css"]').toString()).toBe('<link href="' + appendHash('thePublicPath/style.css', hash) + '" rel="stylesheet">');
          expect($('script[src^="thePublicPath/assets/abc.js"]').toString()).toBe('<script type="text/javascript" src="' + appendHash('thePublicPath/assets/abc.js', hash) + '" id="abc"></script>');
          expect($('link[href^="thePublicPath/assets/def.css"]').toString()).toBe('<link href="' + appendHash('thePublicPath/assets/def.css', hash) + '" rel="stylesheet" id="def" media="screen">');
          expect($('link[href^="thePublicPath/assets/ghi.css"]').toString()).toBe('<link href="' + appendHash('thePublicPath/assets/ghi.css', hash) + '" rel="stylesheet">');
          done();
        });
      });
    });
  });

  describe('option.assets.assetPath', function () {
    it('should not throw an error when assets assetPath is used and the file exists', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({ assets: [{ path: 'assets/astyle.css', assetPath: 'spec/fixtures/astyle.css' }], append: false })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(2);
          expect($('script[src="app.js"]').toString()).toBe('<script type="text/javascript" src="app.js"></script>');
          expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('link[href="assets/astyle.css"]').toString()).toBe('<link href="assets/astyle.css" rel="stylesheet">');
          done();
        });
      });
    });

    it('should throw an error when assets assetPath is used and the file does not exist', function (done) {
      function theFunction () {
        webpack({
          entry: {
            app: path.join(__dirname, 'fixtures', 'entry.js'),
            style: path.join(__dirname, 'fixtures', 'app.css')
          },
          output: {
            path: OUTPUT_DIR,
            filename: '[name].js'
          },
          module: {
            rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
          },
          plugins: [
            new MiniCssExtractPlugin({ filename: '[name].css' }),
            new HtmlWebpackPlugin(),
            new HtmlWebpackIncludeAssetsPlugin({ assets: [{ path: 'assets/astyle.css', assetPath: 'spec/fixtures/anotherstyle.css' }], append: false })
          ]
        }, function (err, result) {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).not.toBe('[]');
          done();
        });
      }

      theFunction();
      // expect(theFunction).toThrowError(/(HtmlWebpackPlugin: could not load file)/);
    });
  });

  describe('options.links', function () {
    it('should prepend when the links are all valid and append is set to false', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: false, links: [{ path: 'the-href', attributes: { rel: 'the-rel' } }] })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(2);
          expect($('script[src="app.js"]').toString()).toBe('<script type="text/javascript" src="app.js"></script>');
          expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('link[href="the-href"]').toString()).toBe('<link href="the-href" rel="the-rel">');
          done();
        });
      });
    });

    it('should append when the links are all valid and append is set to true', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: true, links: [{ path: 'the-href', attributes: { rel: 'the-rel' } }] })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(2);
          expect($('script[src="app.js"]').toString()).toBe('<script type="text/javascript" src="app.js"></script>');
          expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('link[href="the-href"]').toString()).toBe('<link href="the-href" rel="the-rel">');
          done();
        });
      });
    });

    it('should append links and assets together with a custom index.html template when inject is false and append is set to false', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin({
            template: path.join(__dirname, 'fixtures', 'index-no-inject.html'),
            inject: false
          }),
          new HtmlWebpackIncludeAssetsPlugin({
            assets: [{ path: 'assets/astyle.css', assetPath: 'spec/fixtures/astyle.css' }],
            append: false,
            links: [{ path: 'the-href', attributes: { rel: 'the-rel', sizes: '16x16' } }]
          })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(3);
          expect($('script[src="app.js"]').toString()).toBe('<script src="app.js"></script>');
          expect($('script[src="style.js"]').toString()).toBe('<script src="style.js"></script>');
          expect($('script[id="loading-script"]').toString()).toContain('<script id="loading-script" type="text/javascript">');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css">');
          expect($('link[href="assets/astyle.css"]').toString()).toBe('<link href="assets/astyle.css">');
          expect($('link[href="the-href"]').toString()).toBe('<link href="the-href">');
          done();
        });
      });
    });

    it('should append links and assets together with a custom index.html template when inject is false and append is set to true', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin({
            template: path.join(__dirname, 'fixtures', 'index-no-inject.html'),
            inject: false
          }),
          new HtmlWebpackIncludeAssetsPlugin({
            assets: [{ path: 'assets/astyle.css', assetPath: 'spec/fixtures/astyle.css' }],
            append: true,
            links: [{ path: 'the-href', attributes: { rel: 'the-rel', sizes: '16x16' } }]
          })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(3);
          expect($('script[src="app.js"]').toString()).toBe('<script src="app.js"></script>');
          expect($('script[src="style.js"]').toString()).toBe('<script src="style.js"></script>');
          expect($('script[id="loading-script"]').toString()).toContain('<script id="loading-script" type="text/javascript">');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css">');
          expect($('link[href="assets/astyle.css"]').toString()).toBe('<link href="assets/astyle.css">');
          expect($('link[href="the-href"]').toString()).toBe('<link href="the-href">');
          done();
        });
      });
    });

    it('should append links and assets together with a custom index.html template when inject is false and append is set to true and false', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin({
            template: path.join(__dirname, 'fixtures', 'index-no-inject.html'),
            inject: false
          }),
          new HtmlWebpackIncludeAssetsPlugin({
            assets: [{ path: 'assets/astyle-1.css', assetPath: 'spec/fixtures/astyle.css' }],
            append: true,
            links: [{ path: 'the-href-1', attributes: { rel: 'the-rel-1', sizes: '16x16' } }]
          }),
          new HtmlWebpackIncludeAssetsPlugin({
            assets: [{ path: 'assets/astyle-2.css', assetPath: 'spec/fixtures/astyle.css' }],
            append: false,
            links: [{ path: 'the-href-2', attributes: { rel: 'the-rel-2', sizes: '16x16' } }]
          })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(5);
          expect($('script[src="app.js"]').toString()).toBe('<script src="app.js"></script>');
          expect($('script[src="style.js"]').toString()).toBe('<script src="style.js"></script>');
          expect($('script[id="loading-script"]').toString()).toContain('<script id="loading-script" type="text/javascript">');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css">');
          expect($('link[href="assets/astyle-1.css"]').toString()).toBe('<link href="assets/astyle-1.css">');
          expect($('link[href="the-href-1"]').toString()).toBe('<link href="the-href-1">');
          expect($('link[href="assets/astyle-2.css"]').toString()).toBe('<link href="assets/astyle-2.css">');
          expect($('link[href="the-href-2"]').toString()).toBe('<link href="the-href-2">');
          done();
        });
      });
    });

    it('should append links and assets together with a custom index.html template when inject is true and append is set to true and false', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin({
            template: path.join(__dirname, 'fixtures', 'index.html'),
            inject: true
          }),
          new HtmlWebpackIncludeAssetsPlugin({
            assets: [{ path: 'assets/astyle-1.css', assetPath: 'spec/fixtures/astyle.css' }],
            append: true,
            links: [{ path: 'the-href-1', attributes: { rel: 'the-rel-1', sizes: '16x16' } }]
          }),
          new HtmlWebpackIncludeAssetsPlugin({
            assets: [{ path: 'assets/astyle-2.css', assetPath: 'spec/fixtures/astyle.css' }],
            append: false,
            links: [{ path: 'the-href-2', attributes: { rel: 'the-rel-2', sizes: '16x16' } }]
          })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(5);
          expect($('script[src="app.js"]').toString()).toBe('<script type="text/javascript" src="app.js"></script>');
          expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
          expect($('script[id="loading-script"]').toString()).toContain('<script id="loading-script" type="text/javascript">');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('link[href="assets/astyle-1.css"]').toString()).toBe('<link href="assets/astyle-1.css" rel="stylesheet">');
          expect($('link[href="the-href-1"]').toString()).toBe('<link href="the-href-1" rel="the-rel-1" sizes="16x16">');
          expect($('link[href="assets/astyle-2.css"]').toString()).toBe('<link href="assets/astyle-2.css" rel="stylesheet">');
          expect($('link[href="the-href-2"]').toString()).toBe('<link href="the-href-2" rel="the-rel-2" sizes="16x16">');
          done();
        });
      });
    });

    it('should append links and assets together with a custom index.html template when append is set to false', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin({
            template: path.join(__dirname, 'fixtures', 'index.html')
          }),
          new HtmlWebpackIncludeAssetsPlugin({
            assets: [{ path: 'assets/astyle.css', assetPath: 'spec/fixtures/astyle.css' }],
            append: false,
            links: [{ path: 'the-href', attributes: { rel: 'the-rel', sizes: '16x16' } }]
          })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(3);
          expect($('script[src="app.js"]').toString()).toBe('<script type="text/javascript" src="app.js"></script>');
          expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
          expect($('script[id="loading-script"]').toString()).toContain('<script id="loading-script" type="text/javascript">');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('link[href="assets/astyle.css"]').toString()).toBe('<link href="assets/astyle.css" rel="stylesheet">');
          expect($('link[href="the-href"]').toString()).toBe('<link href="the-href" rel="the-rel" sizes="16x16">');
          done();
        });
      });
    });

    it('should append links and assets together with a custom index.html template when append is set to true', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin({
            template: path.join(__dirname, 'fixtures', 'index.html')
          }),
          new HtmlWebpackIncludeAssetsPlugin({
            assets: [{ path: 'assets/astyle.css', assetPath: 'spec/fixtures/astyle.css' }],
            append: true,
            links: [{ path: 'the-href', attributes: { rel: 'the-rel', sizes: '16x16' } }]
          })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(3);
          expect($('script[src="app.js"]').toString()).toBe('<script type="text/javascript" src="app.js"></script>');
          expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
          expect($('script[id="loading-script"]').toString()).toContain('<script id="loading-script" type="text/javascript">');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('link[href="the-href"]').toString()).toBe('<link href="the-href" rel="the-rel" sizes="16x16">');
          expect($('link[href="assets/astyle.css"]').toString()).toBe('<link href="assets/astyle.css" rel="stylesheet">');
          done();
        });
      });
    });

    it('should append links and assets together when append is set to false', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({
            assets: [{ path: 'assets/astyle.css', assetPath: 'spec/fixtures/astyle.css' }],
            append: false,
            links: [{ path: 'the-href', attributes: { rel: 'the-rel', sizes: '16x16' } }]
          })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(3);
          expect($('script[src="app.js"]').toString()).toBe('<script type="text/javascript" src="app.js"></script>');
          expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('link[href="the-href"]').toString()).toBe('<link href="the-href" rel="the-rel" sizes="16x16">');
          expect($('link[href="assets/astyle.css"]').toString()).toBe('<link href="assets/astyle.css" rel="stylesheet">');
          done();
        });
      });
    });

    it('should append links and assets together when append is set to true', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({
            assets: [{ path: 'assets/astyle.css', assetPath: 'spec/fixtures/astyle.css' }],
            append: true,
            links: [{ path: 'the-href', attributes: { rel: 'the-rel', sizes: '16x16' } }]
          })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(3);
          expect($('script[src="app.js"]').toString()).toBe('<script type="text/javascript" src="app.js"></script>');
          expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('link[href="the-href"]').toString()).toBe('<link href="the-href" rel="the-rel" sizes="16x16">');
          expect($('link[href="assets/astyle.css"]').toString()).toBe('<link href="assets/astyle.css" rel="stylesheet">');
          done();
        });
      });
    });

    it('should output links attributes other than href', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: false, links: [{ path: '/the-href', attributes: { rel: 'the-rel', a: 'abc', x: 'xyz' } }] })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(2);
          expect($('script[src="app.js"]').toString()).toBe('<script type="text/javascript" src="app.js"></script>');
          expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('link[href="/the-href"]').toString()).toBe('<link href="/the-href" rel="the-rel" a="abc" x="xyz">');
          done();
        });
      });
    });

    it('should output link attributes and inject the publicPath only when link.asset is not false', function (done) {
      const publicPath = '/pub-path/';

      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          publicPath: publicPath,
          path: OUTPUT_DIR,
          filename: '[name].js'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({
            assets: [],
            append: false,
            links: [
              { path: '/the-href', publicPath: false, attributes: { rel: 'the-rel-a', a: 'abc', x: 'xyz' } },
              { path: 'the-href-1', publicPath: true, attributes: { rel: 'the-rel-b', a: '123', x: '789' } },
              { path: 'the-href-2', attributes: { rel: 'the-rel-c', a: '___', x: '---' } }
            ]
          })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(4);
          expect($('script[src="' + publicPath + 'app.js"]').toString()).toBe('<script type="text/javascript" src="' + publicPath + 'app.js"></script>');
          expect($('script[src="' + publicPath + 'style.js"]').toString()).toBe('<script type="text/javascript" src="' + publicPath + 'style.js"></script>');
          expect($('link[href="' + publicPath + 'style.css"]').toString()).toBe('<link href="' + publicPath + 'style.css" rel="stylesheet">');
          expect($('link[href="/the-href"]').toString()).toBe('<link href="/the-href" rel="the-rel-a" a="abc" x="xyz">');
          expect($('link[href="' + publicPath + 'the-href-1"]').toString()).toBe('<link href="' + publicPath + 'the-href-1" rel="the-rel-b" a="123" x="789">');
          expect($('link[href="' + publicPath + 'the-href-2"]').toString()).toBe('<link href="' + publicPath + 'the-href-2" rel="the-rel-c" a="___" x="---">');
          done();
        });
      });
    });
  });

  describe('option.publicPath', function () {
    it('should prefix the publicPath if the publicPath option is set to true', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js',
          publicPath: 'thePublicPath'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({ assets: 'foobar.js', append: false, publicPath: true })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(1);
          expect($('script[src="thePublicPath/style.js"]').toString()).toBe('<script type="text/javascript" src="thePublicPath/style.js"></script>');
          expect($('script[src="thePublicPath/app.js"]').toString()).toBe('<script type="text/javascript" src="thePublicPath/app.js"></script>');
          expect($('link[href="thePublicPath/style.css"]').toString()).toBe('<link href="thePublicPath/style.css" rel="stylesheet">');
          expect($('script[src="thePublicPath/foobar.js"]').toString()).toBe('<script type="text/javascript" src="thePublicPath/foobar.js"></script>');
          expect($($('script').get(0)).toString()).toBe('<script type="text/javascript" src="thePublicPath/foobar.js"></script>');
          done();
        });
      });
    });

    it('should not prefix the publicPath if the publicPath option is set to false', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js',
          publicPath: 'thePublicPath'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin(
            { assets: 'local-with-public-path.js', append: false, publicPath: true }
          ),
          new HtmlWebpackIncludeAssetsPlugin(
            { assets: ['local-without-public-path.js', 'http://www.foo.com/foobar.js'], append: false, publicPath: false }
          )
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(5);
          expect($('link').length).toBe(1);
          expect($('script[src="thePublicPath/style.js"]').toString()).toBe('<script type="text/javascript" src="thePublicPath/style.js"></script>');
          expect($('script[src="thePublicPath/app.js"]').toString()).toBe('<script type="text/javascript" src="thePublicPath/app.js"></script>');
          expect($('link[href="thePublicPath/style.css"]').toString()).toBe('<link href="thePublicPath/style.css" rel="stylesheet">');
          expect($('script[src="thePublicPath/local-with-public-path.js"]').toString()).toBe('<script type="text/javascript" src="thePublicPath/local-with-public-path.js"></script>');
          expect($('script[src="local-without-public-path.js"]').toString()).toBe('<script type="text/javascript" src="local-without-public-path.js"></script>');
          expect($('script[src="http://www.foo.com/foobar.js"]').toString()).toBe('<script type="text/javascript" src="http://www.foo.com/foobar.js"></script>');
          expect($($('script').get(2)).toString()).toBe('<script type="text/javascript" src="thePublicPath/local-with-public-path.js"></script>');
          expect($($('script').get(0)).toString()).toBe('<script type="text/javascript" src="local-without-public-path.js"></script>');
          expect($($('script').get(1)).toString()).toBe('<script type="text/javascript" src="http://www.foo.com/foobar.js"></script>');
          done();
        });
      });
    });

    it('should not prefix the publicPath if the publicPath option is set to false and the asset is a protocol-relative path', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js',
          publicPath: 'thePublicPath'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin(
            { assets: 'local-with-public-path.js', append: false, publicPath: true }
          ),
          new HtmlWebpackIncludeAssetsPlugin(
            { assets: ['//www.foo.com/foobar.js'], append: false, publicPath: false }
          )
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(4);
          expect($('link').length).toBe(1);
          expect($('script[src="thePublicPath/style.js"]').toString()).toBe('<script type="text/javascript" src="thePublicPath/style.js"></script>');
          expect($('script[src="thePublicPath/app.js"]').toString()).toBe('<script type="text/javascript" src="thePublicPath/app.js"></script>');
          expect($('link[href="thePublicPath/style.css"]').toString()).toBe('<link href="thePublicPath/style.css" rel="stylesheet">');
          expect($('script[src="thePublicPath/local-with-public-path.js"]').toString()).toBe('<script type="text/javascript" src="thePublicPath/local-with-public-path.js"></script>');
          expect($('script[src="//www.foo.com/foobar.js"]').toString()).toBe('<script type="text/javascript" src="//www.foo.com/foobar.js"></script>');
          expect($($('script').get(1)).toString()).toBe('<script type="text/javascript" src="thePublicPath/local-with-public-path.js"></script>');
          expect($($('script').get(0)).toString()).toBe('<script type="text/javascript" src="//www.foo.com/foobar.js"></script>');
          done();
        });
      });
    });

    it('should prefix the value of the publicPath option if the publicPath option is set to a string', function (done) {
      webpack({
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js',
          publicPath: 'thePublicPath'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({ assets: 'foobar.js', append: false, publicPath: 'abc/' })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(1);
          expect($('script[src="thePublicPath/style.js"]').toString()).toBe('<script type="text/javascript" src="thePublicPath/style.js"></script>');
          expect($('script[src="thePublicPath/app.js"]').toString()).toBe('<script type="text/javascript" src="thePublicPath/app.js"></script>');
          expect($('link[href="thePublicPath/style.css"]').toString()).toBe('<link href="thePublicPath/style.css" rel="stylesheet">');
          expect($('script[src="abc/foobar.js"]').toString()).toBe('<script type="text/javascript" src="abc/foobar.js"></script>');
          expect($($('script').get(0)).toString()).toBe('<script type="text/javascript" src="abc/foobar.js"></script>');
          done();
        });
      });
    });
  });

  describe('option.hash', function () {
    beforeEach(function () {
      this.hashTestWebpackConfig = {
        entry: {
          app: path.join(__dirname, 'fixtures', 'entry.js'),
          style: path.join(__dirname, 'fixtures', 'app.css')
        },
        output: {
          path: OUTPUT_DIR,
          filename: '[name].js',
          publicPath: 'myPublic'
        },
        module: {
          rules: [{ test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] }]
        },
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin({ hash: true })
        ]
      };
    });

    const appendHash = function (v, hash) {
      if (hash.length > 0) hash = '?' + hash;
      return v + hash;
    };

    it('should not append hash if hash options are not provided', function (done) {
      this.hashTestWebpackConfig.plugins.push(new HtmlWebpackIncludeAssetsPlugin({ assets: 'foobar.css', append: false, publicPath: true }));
      webpack(this.hashTestWebpackConfig, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const hash = result.compilation.hash;
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(2);
          expect($('script[src^="myPublic/style.js"]').toString()).toBe('<script type="text/javascript" src="' + appendHash('myPublic/style.js', hash) + '"></script>');
          expect($('script[src^="myPublic/app.js"]').toString()).toBe('<script type="text/javascript" src="' + appendHash('myPublic/app.js', hash) + '"></script>');
          expect($('link[href^="myPublic/style.css"]').toString()).toBe('<link href="' + appendHash('myPublic/style.css', hash) + '" rel="stylesheet">');
          expect($($('link[href^="myPublic/foobar.css"]')).attr('href')).toBe('myPublic/foobar.css');
          done();
        });
      });
    });

    it('should not append hash if hash options are set to false', function (done) {
      this.hashTestWebpackConfig.plugins.push(new HtmlWebpackIncludeAssetsPlugin({ assets: 'foobar.css', append: false, publicPath: true, hash: false }));
      webpack(this.hashTestWebpackConfig, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const hash = result.compilation.hash;
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(2);
          expect($('script[src^="myPublic/style.js"]').toString()).toBe('<script type="text/javascript" src="' + appendHash('myPublic/style.js', hash) + '"></script>');
          expect($('script[src^="myPublic/app.js"]').toString()).toBe('<script type="text/javascript" src="' + appendHash('myPublic/app.js', hash) + '"></script>');
          expect($('link[href^="myPublic/style.css"]').toString()).toBe('<link href="' + appendHash('myPublic/style.css', hash) + '" rel="stylesheet">');
          expect($($('link[href^="myPublic/foobar.css"]')).attr('href')).toBe('myPublic/foobar.css');
          done();
        });
      });
    });

    it('should append hash if hash options are set to true', function (done) {
      this.hashTestWebpackConfig.plugins.push(new HtmlWebpackIncludeAssetsPlugin({ assets: 'foobar.css', append: false, publicPath: true, hash: true }));
      webpack(this.hashTestWebpackConfig, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const hash = result.compilation.hash;
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(2);
          expect($('script[src^="myPublic/style.js"]').toString()).toBe('<script type="text/javascript" src="' + appendHash('myPublic/style.js', hash) + '"></script>');
          expect($('script[src^="myPublic/app.js"]').toString()).toBe('<script type="text/javascript" src="' + appendHash('myPublic/app.js', hash) + '"></script>');
          expect($('link[href^="myPublic/style.css"]').toString()).toBe('<link href="' + appendHash('myPublic/style.css', hash) + '" rel="stylesheet">');
          expect($($('link[href^="myPublic/foobar.css"]')).attr('href')).toBe(appendHash('myPublic/foobar.css', hash));
          done();
        });
      });
    });

    it('should append hash if hash option in this plugin set to true but hash options in HtmlWebpackPlugin config are set to false', function (done) {
      this.hashTestWebpackConfig.plugins[1] = new HtmlWebpackPlugin({ hash: false });
      this.hashTestWebpackConfig.plugins.push(new HtmlWebpackIncludeAssetsPlugin({ assets: 'foobar.css', append: false, publicPath: true, hash: true }));
      webpack(this.hashTestWebpackConfig, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const hash = result.compilation.hash;
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(2);
          expect($('script[src^="myPublic/style.js"]').toString()).toBe('<script type="text/javascript" src="myPublic/style.js"></script>');
          expect($('script[src^="myPublic/app.js"]').toString()).toBe('<script type="text/javascript" src="myPublic/app.js"></script>');
          expect($('link[href^="myPublic/style.css"]').toString()).toBe('<link href="myPublic/style.css" rel="stylesheet">');
          expect($($('link[href^="myPublic/foobar.css"]')).attr('href')).toBe(appendHash('myPublic/foobar.css', hash));
          done();
        });
      });
    });

    it('should not append hash if hash option in this plugin set to false and hash options in HtmlWebpackPlugin config are set to false', function (done) {
      this.hashTestWebpackConfig.plugins[1] = new HtmlWebpackPlugin({ hash: false });
      this.hashTestWebpackConfig.plugins.push(new HtmlWebpackIncludeAssetsPlugin({ assets: 'foobar.css', append: false, publicPath: true, hash: false }));
      webpack(this.hashTestWebpackConfig, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(2);
          expect($('script[src^="myPublic/style.js"]').toString()).toBe('<script type="text/javascript" src="myPublic/style.js"></script>');
          expect($('script[src^="myPublic/app.js"]').toString()).toBe('<script type="text/javascript" src="myPublic/app.js"></script>');
          expect($('link[href^="myPublic/style.css"]').toString()).toBe('<link href="myPublic/style.css" rel="stylesheet">');
          expect($($('link[href^="myPublic/foobar.css"]')).attr('href')).toBe('myPublic/foobar.css');
          done();
        });
      });
    });

    it('should replace the hash if a replacer hash function is provided in the plugin options', function (done) {
      function hashReplacer (assetName, hash) {
        return assetName.replace(/\[hash\]/, hash);
      }
      this.hashTestWebpackConfig.plugins[1] = new HtmlWebpackPlugin({ hash: false });
      this.hashTestWebpackConfig.plugins.push(new HtmlWebpackIncludeAssetsPlugin({ assets: 'foobar.[hash].css', append: false, publicPath: true, hash: hashReplacer }));
      webpack(this.hashTestWebpackConfig, function (err, result) {
        const theHash = result.compilation.hash;
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(2);
          expect($('script[src^="myPublic/style.js"]').toString()).toBe('<script type="text/javascript" src="myPublic/style.js"></script>');
          expect($('script[src^="myPublic/app.js"]').toString()).toBe('<script type="text/javascript" src="myPublic/app.js"></script>');
          expect($('link[href^="myPublic/style.css"]').toString()).toBe('<link href="myPublic/style.css" rel="stylesheet">');
          expect($($('link[href^="myPublic/foobar.' + theHash + '.css"]')).attr('href')).toBe('myPublic/foobar.' + theHash + '.css');
          done();
        });
      });
    });

    it('should inject the hash if an injector hash function is provided in the plugin options', function (done) {
      function hashInjector (assetName, hash) {
        assetName = assetName.replace(/\.js$/, '.' + hash + '.js');
        assetName = assetName.replace(/\.css$/, '.' + hash + '.css');
        return assetName;
      }
      this.hashTestWebpackConfig.plugins = [
        new MiniCssExtractPlugin({ filename: '[name].css' }),
        new CopyWebpackPlugin([{ from: 'spec/fixtures/g*', to: 'assets/', flatten: true }]),
        new HtmlWebpackPlugin(),
        new HtmlWebpackIncludeAssetsPlugin({
          assets: [
            { path: 'assets/', globPath: 'spec/fixtures/', glob: 'g*.js' },
            { path: 'assets/', globPath: 'spec/fixtures/', glob: 'g*.css' }
          ],
          hash: hashInjector,
          append: true
        })
      ];
      webpack(this.hashTestWebpackConfig, function (err, result) {
        const theHash = result.compilation.hash;
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(2);
          expect($('script[src^="myPublic/style.js"]').toString()).toBe('<script type="text/javascript" src="myPublic/style.js"></script>');
          expect($('script[src^="myPublic/app.js"]').toString()).toBe('<script type="text/javascript" src="myPublic/app.js"></script>');
          expect($('link[href^="myPublic/style.css"]').toString()).toBe('<link href="myPublic/style.css" rel="stylesheet">');
          expect($('link[href^="myPublic/assets/glob.' + theHash + '.css"]').toString()).toBe('<link href="myPublic/assets/glob.' + theHash + '.css" rel="stylesheet">');
          expect($('script[src^="myPublic/assets/glob.' + theHash + '.js"]').toString()).toBe('<script type="text/javascript" src="myPublic/assets/glob.' + theHash + '.js"></script>');
          done();
        });
      });
    });
  });
});
