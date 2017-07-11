/* eslint-env jasmine */
var path = require('path');
var fs = require('fs');
var cheerio = require('cheerio');
var webpack = require('webpack');
var rimraf = require('rimraf');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
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

    it('should throw an error if the assets are not an array or string', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: 123, append: false });
      };

      expect(theFunction).toThrowError(/(options must have an assets key with an array or string value)/);
      done();
    });

    it('should throw an error if any of the asset options are not strings', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', true, 'bar.css'], append: false });
      };
      expect(theFunction).toThrowError(/(options assets key array should not contain non-strings)/);
      done();
    });

    it('should throw an error if any of the assets options do not end with .css or .js', function (done) {
      var theFunction = function () {
        return new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.css', 'bad.txt', 'bar.js'], append: false });
      };
      expect(theFunction).toThrowError(/(options assets key array should not contain strings not ending with the js or css extensions)/);
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
          loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }) }]
        },
        plugins: [
          new ExtractTextPlugin({ filename: '[name].css' }),
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
          loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }) }]
        },
        plugins: [
          new ExtractTextPlugin({ filename: '[name].css' }),
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
          loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }) }]
        },
        plugins: [
          new ExtractTextPlugin({ filename: '[name].css' }),
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
          loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }) }]
        },
        plugins: [
          new ExtractTextPlugin({ filename: '[name].css' }),
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
          loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }) }]
        },
        plugins: [
          new ExtractTextPlugin({ filename: '[name].css' }),
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
          loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }) }]
        },
        plugins: [
          new ExtractTextPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.css', 'bar.css'], append: true, publicPath: false })
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
          expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script type="text/javascript" src="app.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('link[href="foo.css"]').toString()).toBe('<link href="foo.css" rel="stylesheet">');
          expect($('link[href="bar.css"]').toString()).toBe('<link href="bar.css" rel="stylesheet">');
          expect($($('link').get(1)).toString()).toBe('<link href="foo.css" rel="stylesheet">');
          expect($($('link').get(2)).toString()).toBe('<link href="bar.css" rel="stylesheet">');
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
          loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }) }]
        },
        plugins: [
          new ExtractTextPlugin({ filename: '[name].css' }),
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
          loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }) }]
        },
        plugins: [
          new ExtractTextPlugin({ filename: '[name].css' }),
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
          loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }) }]
        },
        plugins: [
          new ExtractTextPlugin({ filename: '[name].css' }),
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
          loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }) }]
        },
        plugins: [
          new ExtractTextPlugin({ filename: '[name].css' }),
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
          loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }) }]
        },
        plugins: [
          new ExtractTextPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({ assets: ['foo.js', 'foo.css', 'bar.js', 'bar.css'], append: true, publicPath: false })
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
          expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
          expect($('script[src="app.js"]').toString()).toBe('<script type="text/javascript" src="app.js"></script>');
          expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
          expect($('script[src="foo.js"]').toString()).toBe('<script type="text/javascript" src="foo.js"></script>');
          expect($('script[src="bar.js"]').toString()).toBe('<script type="text/javascript" src="bar.js"></script>');
          expect($('link[href="foo.css"]').toString()).toBe('<link href="foo.css" rel="stylesheet">');
          expect($('link[href="bar.css"]').toString()).toBe('<link href="bar.css" rel="stylesheet">');
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
          loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }) }]
        },
        plugins: [
          new ExtractTextPlugin({ filename: '[name].css' }),
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
          loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }) }]
        },
        plugins: [
          new ExtractTextPlugin({ filename: '[name].css' }),
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
          loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }) }]
        },
        plugins: [
          new ExtractTextPlugin({ filename: '[name].css' }),
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
          loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }) }]
        },
        plugins: [
          new ExtractTextPlugin({ filename: '[name].css' }),
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
          expect($('script[src="thePublicPath/style.js"]').toString()).toBe('<script type="text/javascript" src="thePublicPath/style.js"></script>');
          expect($('script[src="thePublicPath/app.js"]').toString()).toBe('<script type="text/javascript" src="thePublicPath/app.js"></script>');
          expect($('link[href="thePublicPath/style.css"]').toString()).toBe('<link href="thePublicPath/style.css" rel="stylesheet">');
          expect($('script[src="foobar.js"]').toString()).toBe('<script type="text/javascript" src="foobar.js"></script>');
          expect($($('script').get(0)).toString()).toBe('<script type="text/javascript" src="foobar.js"></script>');
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
          loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }) }]
        },
        plugins: [
          new ExtractTextPlugin({ filename: '[name].css' }),
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
          loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }) }]
        },
        plugins: [
          new ExtractTextPlugin({ filename: '[name].css' }),
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
        var hash = result.compilation.hash;
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
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
        var hash = result.compilation.hash;
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
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
        var hash = result.compilation.hash;
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
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
        var htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', function (er, data) {
          expect(er).toBeFalsy();
          var $ = cheerio.load(data);
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
  });
});
