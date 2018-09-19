/* eslint-env jasmine */
var path = require('path');
var fs = require('fs');
var cheerio = require('cheerio');
var webpack = require('webpack');
var rimraf = require('rimraf');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackIncludeAssetsPlugin = require('../');

var OUTPUT_DIR = path.join(__dirname, '../dist');

describe('HtmlWebpackIncludeAssetsPlugin', function () {
  beforeEach(function (done) {
    rimraf(OUTPUT_DIR, done);
  });

  describe('option validation', function () {
    it('should throw an error if no options are provided', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin();
      };

      expect(theFunction).toThrowError(/(options are required)/);
      done();
    });

    it('should throw an error if the options are not an object', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin('hello');
      };

      expect(theFunction).toThrowError(/(options are required)/);
      done();
    });

    it('should throw an error if the assets are not provided', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ append: false });
      };

      expect(theFunction).toThrowError(/(options must have an assets key with an array or string value)/);
      done();
    });

    it('should throw an error if the assets are not an array or string or object', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: 123, append: false });
      };

      expect(theFunction).toThrowError(/(options must have an assets key with an array or string value)/);
      done();
    });

    it('should throw an error if any of the asset options are not strings or objects', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', true, 'bar.css'], append: false });
      };
      expect(theFunction).toThrowError(/(options assets key array must contain only strings and objects)/);
      done();
    });

    it('should throw an error if any of the asset options are objects missing the path property', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { type: 'js' }, 'bar.css'], append: false });
      };
      expect(theFunction).toThrowError(/(options assets key array objects path property must be a string)/);
      done();
    });

    it('should throw an error if any of the asset options are objects with a path property that is not a string', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 123, type: 'js' }, 'bar.css'], append: false });
      };
      expect(theFunction).toThrowError(/(options assets key array objects path property must be a string)/);
      done();
    });

    it('should throw an error if any of the asset options are objects with a glob property that is not a string', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: '', glob: 123, type: 'js' }, 'bar.css'], append: false });
      };
      expect(theFunction).toThrowError(/(options assets key array objects glob property should be a string)/);
      done();
    });

    it('should throw an error if any of the asset options are objects with an invalid type property', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'baz.js', type: 'foo' }, 'bar.css'], append: false });
      };
      expect(theFunction).toThrowError(/(options assets key array objects type property should be a string set to either `js` or `css`)/);
      done();
    });

    it('should throw an error if any of the assets options do not end with .css or .js', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.css', 'bad.txt', 'bar.js'], append: false });
      };
      expect(theFunction).toThrowError(/(options assets key array should only contain strings ending with the js or css extensions)/);
      done();
    });

    it('should throw an error if any of the asset options are objects without a type property that cannot be inferred from the path', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'pathWithoutExtension' }, 'bar.css'], append: false });
      };
      expect(theFunction).toThrowError(/(options assets key array objects path property should only contain strings ending with the js or css extensions if the type property is not set)/);
      done();
    });

    it('should not throw an error if any of the asset options are objects without a type property that can be inferred from the path', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'pathWithExtension.js' }, 'bar.css'], append: false });
      };
      expect(theFunction).not.toThrowError();
      done();
    });

    it('should throw an error if any of the asset options are objects without a type property that cannot be inferred from the glob', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'pathWithExtension.js', glob: 'withoutExtensions*' }, 'bar.css'], append: false });
      };
      expect(theFunction).toThrowError(/(options assets key array objects glob property should only contain strings ending with the js or css extensions if the type property is not set)/);
      done();
    });

    it('should not throw an error if any of the asset options are objects without a type property that can be inferred from the glob', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'pathWithoutExtension', glob: 'withExtensions*.js' }, 'bar.css'], append: false });
      };
      expect(theFunction).not.toThrowError();
      done();
    });

    it('should throw an error if any of the asset options are objects with an attributes property that is not an object', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'pathWithExtension.js', attributes: 'foobar' }, 'bar.css'], append: false });
      };
      expect(theFunction).toThrowError(/(options assets key array objects attributes property should be an object)/);
      done();
    });

    it('should throw an error if any of the asset options are objects with an attributes property with non-string values', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'pathWithExtension.js', attributes: { crossorigin: 'crossorigin', id: null } }, 'bar.css'], append: false });
      };
      expect(theFunction).toThrowError(/(options assets key array objects attributes property should be an object with string values)/);
      done();
    });

    it('should not throw an error if any of the asset options are objects with an attributes property with string values', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'pathWithExtension.js', attributes: { crossorigin: 'crossorigin', id: 'test' } }, 'bar.css'], append: false });
      };
      expect(theFunction).not.toThrowError();
      done();
    });

    it('should not throw an error if any of the asset options are objects without an attributes property', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', { path: 'pathWithExtension.js' }, 'bar.css'], append: false });
      };
      expect(theFunction).not.toThrowError();
      done();
    });

    it('should throw an error if the jsExtensions is not an array or string', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: false, jsExtensions: 123 });
      };
      expect(theFunction).toThrowError(/(options jsExtensions key should be a string or array of strings)/);
      done();
    });

    it('should throw an error if any of the jsExtensions are not a string', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: false, jsExtensions: ['a', 123, 'b'] });
      };
      expect(theFunction).toThrowError(/(options jsExtensions key array should not contain non-strings)/);
      done();
    });

    it('should throw an error if the csssExtensions is not an array or string', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: false, cssExtensions: 123 });
      };
      expect(theFunction).toThrowError(/(options cssExtensions key should be a string or array of strings)/);
      done();
    });

    it('should throw an error if any of the cssExtensions are not a string', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: false, cssExtensions: ['a', 123, 'b'] });
      };
      expect(theFunction).toThrowError(/(options cssExtensions key array should not contain non-strings)/);
      done();
    });

    it('should throw an error if the append flag is not provided', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: [] });
      };

      expect(theFunction).toThrowError(/(options must have an append key with a boolean value)/);
      done();
    });

    it('should throw an error if the append flag is not a boolean', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: 'hello' });
      };

      expect(theFunction).toThrowError(/(options must have an append key with a boolean value)/);
      done();
    });

    it('should throw an error if the publicPath flag is not a boolean or string', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: true, publicPath: 123 });
      };

      expect(theFunction).toThrowError(/(options should specify a publicPath that is either a boolean or a string)/);
      done();
    });

    it('should throw an error if the files option is not a string', function (done) {
      var theError = /(options should specify a files key with an array or string value)/;
      var nonStringCheck = [123, true, /regex/, {}];

      nonStringCheck.forEach(function (val) {
        var theCheck = function () {
          return new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: true, publicPath: true, files: val });
        };

        expect(theCheck).toThrowError(theError);
      });

      done();
    });

    it('should throw an error if any of the files options are not strings', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', 'bar.css'], append: false, files: ['abc', true, 'def'] });
      };
      expect(theFunction).toThrowError(/(options files key array must contain only strings)/);
      done();
    });

    it('should throw an error if the hash option is not a boolean', function (done) {
      var theError = /(options should specify a hash key with a boolean value)/;
      var nonBooleanCheck = [123, 'not a boolean', /regex/, [], {}];

      nonBooleanCheck.forEach(function (val) {
        var theCheck = function () {
          return new HtmlWebpackIncludeAssetsPlugin({ assets: [], append: true, publicPath: true, hash: val });
        };

        expect(theCheck).toThrowError(theError);
      });

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
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(1);
          expect($('script[src="style.js"]').toString()).toBe('<script src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script src="app.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('script[src="foobar.js"]').toString()).toBe('<script src="foobar.js"></script>');
          expect($($('script').get(2)).toString()).toBe('<script src="foobar.js"></script>');
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
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(2);
          expect($('script[src="style.js"]').toString()).toBe('<script src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script src="app.js"></script>');
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
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(1);
          expect($('script[src="style.js"]').toString()).toBe('<script src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script src="app.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('script[src="foobar.js"]').toString()).toBe('<script src="foobar.js"></script>');
          expect($($('script').get(0)).toString()).toBe('<script src="foobar.js"></script>');
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
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(2);
          expect($('script[src="style.js"]').toString()).toBe('<script src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script src="app.js"></script>');
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
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
          expect($('script').length).toBe(4);
          expect($('link').length).toBe(3);
          expect($('script[src="style.js"]').toString()).toBe('<script src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script src="app.js"></script>');
          expect($('script[src="foo.js"]').toString()).toBe('<script src="foo.js"></script>');
          expect($('script[src="bar.js"]').toString()).toBe('<script src="bar.js"></script>');
          expect($($('script').get(0)).toString()).toBe('<script src="foo.js"></script>');
          expect($($('script').get(3)).toString()).toBe('<script src="bar.js"></script>');
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
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(4);
          expect($('script[src="style.js"]').toString()).toBe('<script src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script src="app.js"></script>');
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
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(3);
          expect($('script[src="style.js"]').toString()).toBe('<script src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script src="app.js"></script>');
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
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(1);
          expect($('script[src="style.js"]').toString()).toBe('<script src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script src="app.js"></script>');
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
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(1);
          expect($('script[src="style.js"]').toString()).toBe('<script src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script src="app.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('script[src="foobar.js"]').toString()).toBe('<script src="foobar.js"></script>');
          expect($($('script').get(2)).toString()).toBe('<script src="foobar.js"></script>');
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
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(1);
          expect($('script[src="style.js"]').toString()).toBe('<script src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script src="app.js"></script>');
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
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
          expect($('script').length).toBe(5);
          expect($('link').length).toBe(4);
          expect($('script[src="style.js"]').toString()).toBe('<script src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script src="app.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('script[src="foo.js"]').toString()).toBe('<script src="foo.js"></script>');
          expect($('script[src="bar.js"]').toString()).toBe('<script src="bar.js"></script>');
          expect($('script[src="qux"]').toString()).toBe('<script src="qux"></script>');
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
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
          expect($('script').length).toBe(4);
          expect($('link').length).toBe(1);
          expect($('script[src="style.js"]').toString()).toBe('<script src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script src="app.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('script[src="foo.js"]').toString()).toBe('<script src="foo.js"></script>');
          expect($('script[src="foo.jsx"]').toString()).toBe('<script src="foo.jsx"></script>');
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
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(3);
          expect($('script[src="style.js"]').toString()).toBe('<script src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script src="app.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('link[href="foo.css"]').toString()).toBe('<link href="foo.css" rel="stylesheet">');
          expect($('link[href="foo.style"]').toString()).toBe('<link href="foo.style" rel="stylesheet">');
          done();
        });
      });
    });
  });

  describe('option.assets.glob', function () {
    it('should not include any files for a glob that does not match any files', function (done) {
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
          new HtmlWebpackIncludeAssetsPlugin({ assets: [{ path: 'assets/', globPath: 'spec/fixtures/', glob: 'nonexistant*.js' }, { path: 'assets/', globPath: 'spec/fixtures/', glob: 'nonexistant*.css' }], append: true })
        ]
      }, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(1);
          expect($('script[src="style.js"]').toString()).toBe('<script src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script src="app.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          done();
        });
      });
    });

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
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(2);
          expect($('script[src="style.js"]').toString()).toBe('<script src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script src="app.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('link[href="assets/glob.css"]').toString()).toBe('<link href="assets/glob.css" rel="stylesheet">');
          expect($('script[src="assets/glob.js"]').toString()).toBe('<script src="assets/glob.js"></script>');
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
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(3);
          expect($('script[src="app.js"]').toString()).toBe('<script src="app.js"></script>');
          expect($('script[src="style.js"]').toString()).toBe('<script src="style.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('script[src="assets/abc.js"]').toString()).toBe('<script src="assets/abc.js" id="abc"></script>');
          expect($('link[href="assets/def.css"]').toString()).toBe('<link href="assets/def.css" rel="stylesheet" id="def" media="screen">');
          expect($('link[href="assets/ghi.css"]').toString()).toBe('<link href="assets/ghi.css" rel="stylesheet">');
          done();
        });
      });
    });

    it('can match tags with an overridden publicPath and set hash', function (done) {
      var appendHash = function (v, hash) {
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
        var hash = result.compilation.hash;
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(3);
          expect($('script[src^="thePublicPath/app.js"]').toString()).toBe('<script src="' + appendHash('thePublicPath/app.js', hash) + '"></script>');
          expect($('script[src^="thePublicPath/style.js"]').toString()).toBe('<script src="' + appendHash('thePublicPath/style.js', hash) + '"></script>');
          expect($('link[href^="thePublicPath/style.css"]').toString()).toBe('<link href="' + appendHash('thePublicPath/style.css', hash) + '" rel="stylesheet">');
          expect($('script[src^="thePublicPath/assets/abc.js"]').toString()).toBe('<script src="' + appendHash('thePublicPath/assets/abc.js', hash) + '" id="abc"></script>');
          expect($('link[href^="thePublicPath/assets/def.css"]').toString()).toBe('<link href="' + appendHash('thePublicPath/assets/def.css', hash) + '" rel="stylesheet" id="def" media="screen">');
          expect($('link[href^="thePublicPath/assets/ghi.css"]').toString()).toBe('<link href="' + appendHash('thePublicPath/assets/ghi.css', hash) + '" rel="stylesheet">');
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
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(1);
          expect($('script[src="thePublicPath/style.js"]').toString()).toBe('<script src="thePublicPath/style.js"></script>');
          expect($('script[src="thePublicPath/app.js"]').toString()).toBe('<script src="thePublicPath/app.js"></script>');
          expect($('link[href="thePublicPath/style.css"]').toString()).toBe('<link href="thePublicPath/style.css" rel="stylesheet">');
          expect($('script[src="thePublicPath/foobar.js"]').toString()).toBe('<script src="thePublicPath/foobar.js"></script>');
          expect($($('script').get(0)).toString()).toBe('<script src="thePublicPath/foobar.js"></script>');
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
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
          expect($('script').length).toBe(5);
          expect($('link').length).toBe(1);
          expect($('script[src="thePublicPath/style.js"]').toString()).toBe('<script src="thePublicPath/style.js"></script>');
          expect($('script[src="thePublicPath/app.js"]').toString()).toBe('<script src="thePublicPath/app.js"></script>');
          expect($('link[href="thePublicPath/style.css"]').toString()).toBe('<link href="thePublicPath/style.css" rel="stylesheet">');
          expect($('script[src="thePublicPath/local-with-public-path.js"]').toString()).toBe('<script src="thePublicPath/local-with-public-path.js"></script>');
          expect($('script[src="local-without-public-path.js"]').toString()).toBe('<script src="local-without-public-path.js"></script>');
          expect($('script[src="http://www.foo.com/foobar.js"]').toString()).toBe('<script src="http://www.foo.com/foobar.js"></script>');
          expect($($('script').get(2)).toString()).toBe('<script src="thePublicPath/local-with-public-path.js"></script>');
          expect($($('script').get(0)).toString()).toBe('<script src="local-without-public-path.js"></script>');
          expect($($('script').get(1)).toString()).toBe('<script src="http://www.foo.com/foobar.js"></script>');
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
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(1);
          expect($('script[src="thePublicPath/style.js"]').toString()).toBe('<script src="thePublicPath/style.js"></script>');
          expect($('script[src="thePublicPath/app.js"]').toString()).toBe('<script src="thePublicPath/app.js"></script>');
          expect($('link[href="thePublicPath/style.css"]').toString()).toBe('<link href="thePublicPath/style.css" rel="stylesheet">');
          expect($('script[src="abc/foobar.js"]').toString()).toBe('<script src="abc/foobar.js"></script>');
          expect($($('script').get(0)).toString()).toBe('<script src="abc/foobar.js"></script>');
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

    var appendHash = function (v, hash) {
      if (hash.length > 0) hash = '?' + hash;
      return v + hash;
    };

    it('should not append hash if hash options are not provided', function (done) {
      this.hashTestWebpackConfig.plugins.push(new HtmlWebpackIncludeAssetsPlugin({ assets: 'foobar.css', append: false, publicPath: true }));
      webpack(this.hashTestWebpackConfig, function (err, result) {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        var hash = result.compilation.hash;
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(2);
          expect($('script[src^="myPublic/style.js"]').toString()).toBe('<script src="' + appendHash('myPublic/style.js', hash) + '"></script>');
          expect($('script[src^="myPublic/app.js"]').toString()).toBe('<script src="' + appendHash('myPublic/app.js', hash) + '"></script>');
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
        var hash = result.compilation.hash;
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(2);
          expect($('script[src^="myPublic/style.js"]').toString()).toBe('<script src="' + appendHash('myPublic/style.js', hash) + '"></script>');
          expect($('script[src^="myPublic/app.js"]').toString()).toBe('<script src="' + appendHash('myPublic/app.js', hash) + '"></script>');
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
        var hash = result.compilation.hash;
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(2);
          expect($('script[src^="myPublic/style.js"]').toString()).toBe('<script src="' + appendHash('myPublic/style.js', hash) + '"></script>');
          expect($('script[src^="myPublic/app.js"]').toString()).toBe('<script src="' + appendHash('myPublic/app.js', hash) + '"></script>');
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
        var hash = result.compilation.hash;
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(2);
          expect($('script[src^="myPublic/style.js"]').toString()).toBe('<script src="myPublic/style.js"></script>');
          expect($('script[src^="myPublic/app.js"]').toString()).toBe('<script src="myPublic/app.js"></script>');
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
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(2);
          expect($('script[src^="myPublic/style.js"]').toString()).toBe('<script src="myPublic/style.js"></script>');
          expect($('script[src^="myPublic/app.js"]').toString()).toBe('<script src="myPublic/app.js"></script>');
          expect($('link[href^="myPublic/style.css"]').toString()).toBe('<link href="myPublic/style.css" rel="stylesheet">');
          expect($($('link[href^="myPublic/foobar.css"]')).attr('href')).toBe('myPublic/foobar.css');
          done();
        });
      });
    });
  });
});
