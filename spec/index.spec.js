/* eslint-env jasmine */
var path = require('path');
var fs = require('fs');
var cheerio = require('cheerio');
var webpack = require('webpack');
var rm_rf = require('rimraf');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackIncludeAssetsPlugin = require('../');

var OUTPUT_DIR = path.join(__dirname, '../dist');

describe('HtmlWebpackIncludeAssetsPlugin', function () {
  beforeEach(function (done) {
    rm_rf(OUTPUT_DIR, done);
  });

  it('should not include assets by default', function (done) {
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
        new HtmlWebpackIncludeAssetsPlugin()
      ]
    }, function (err, result) {
      expect(err).toBeFalsy();
      expect(JSON.stringify(result.compilation.errors)).toBe('[]');
      var htmlFile = path.resolve(__dirname, '../dist/index.html');
      fs.readFile(htmlFile, 'utf8', function (er, data) {
        expect(er).toBeFalsy();
        var $ = cheerio.load(data);
        expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
        expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
        done();
      });
    });
  });

  it('should throw an error if the includeAssets are not strings', function (done) {
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
        new HtmlWebpackPlugin({
          includeAssets: { 'name': 'foobar.js' }
        }),
        new HtmlWebpackIncludeAssetsPlugin()
      ]
    }, function (err, result) {
      expect(err).toBeFalsy();
      expect(JSON.stringify(result.compilation.errors)).toMatch(/(requires that all includeAssets be strings)/);
      done();
    });
  });

  it('should throw an error if the includeAssets do not end with .css or .js', function (done) {
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
        new HtmlWebpackPlugin({
          includeAssets: ['foo.css', 'bad.txt', 'bar.js']
        }),
        new HtmlWebpackIncludeAssetsPlugin()
      ]
    }, function (err, result) {
      expect(err).toBeFalsy();
      expect(JSON.stringify(result.compilation.errors)).toMatch(/(requires that all includeAssets have a js or css extension)/);
      done();
    });
  });

  it('should include a single js file', function (done) {
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
        new HtmlWebpackPlugin({
          includeAssets: 'foobar.js'
        }),
        new HtmlWebpackIncludeAssetsPlugin()
      ]
    }, function (err, result) {
      expect(err).toBeFalsy();
      expect(JSON.stringify(result.compilation.errors)).toBe('[]');
      var htmlFile = path.resolve(__dirname, '../dist/index.html');
      fs.readFile(htmlFile, 'utf8', function (er, data) {
        expect(er).toBeFalsy();
        var $ = cheerio.load(data);
        expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
        expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
        expect($('script[src="foobar.js"]').toString()).toBe('<script type="text/javascript" src="foobar.js"></script>');
        done();
      });
    });
  });

  it('should include a single css file', function (done) {
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
        new HtmlWebpackPlugin({
          includeAssets: 'foobar.css'
        }),
        new HtmlWebpackIncludeAssetsPlugin()
      ]
    }, function (err, result) {
      expect(err).toBeFalsy();
      expect(JSON.stringify(result.compilation.errors)).toBe('[]');
      var htmlFile = path.resolve(__dirname, '../dist/index.html');
      fs.readFile(htmlFile, 'utf8', function (er, data) {
        expect(er).toBeFalsy();
        var $ = cheerio.load(data);
        expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
        expect($('link[href="style.css"]').toString()).toBe('<link href="style.css" rel="stylesheet">');
        expect($('link[href="foobar.css"]').toString()).toBe('<link href="foobar.css" rel="stylesheet">');
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
        new HtmlWebpackPlugin({
          includeAssets: ['foo.js', 'foo.css', 'bar.js', 'bar.css']
        }),
        new HtmlWebpackIncludeAssetsPlugin()
      ]
    }, function (err, result) {
      expect(err).toBeFalsy();
      expect(JSON.stringify(result.compilation.errors)).toBe('[]');
      var htmlFile = path.resolve(__dirname, '../dist/index.html');
      fs.readFile(htmlFile, 'utf8', function (er, data) {
        expect(er).toBeFalsy();
        var $ = cheerio.load(data);
        expect($('script[src="style.js"]').toString()).toBe('<script type="text/javascript" src="style.js"></script>');
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
