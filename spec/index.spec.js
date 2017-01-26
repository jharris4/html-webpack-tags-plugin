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
    expect(theFunction).toThrowError(/(options assets key array should not contain strings not ending in .js or .css)/);
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
        loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') }]
      },
      plugins: [
        new ExtractTextPlugin('[name].css'),
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
        loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') }]
      },
      plugins: [
        new ExtractTextPlugin('[name].css'),
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
        loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') }]
      },
      plugins: [
        new ExtractTextPlugin('[name].css'),
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
        loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') }]
      },
      plugins: [
        new ExtractTextPlugin('[name].css'),
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
        loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') }]
      },
      plugins: [
        new ExtractTextPlugin('[name].css'),
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
        loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') }]
      },
      plugins: [
        new ExtractTextPlugin('[name].css'),
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
        loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') }]
      },
      plugins: [
        new ExtractTextPlugin('[name].css'),
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
        loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') }]
      },
      plugins: [
        new ExtractTextPlugin('[name].css'),
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
        loaders: [{ test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') }]
      },
      plugins: [
        new ExtractTextPlugin('[name].css'),
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
