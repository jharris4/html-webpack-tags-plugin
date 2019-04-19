/* eslint-env jasmine */
const path = require('path');
const fs = require('fs');
require('jasmine-expect');
const { addMatchers } = require('add-matchers');

const matchersByName = {
  toBeTag (tagProperties, actual) {
    const node = actual.length > 0 ? actual[0] : actual;
    if (!node || node.tagName !== tagProperties.tagName) {
      return false;
    }
    if (tagProperties.attributes) {
      const tagAttrs = tagProperties.attributes;
      const nodeAttrs = node.attribs || {};
      return !Object.keys(tagAttrs).some(tagAttr => tagAttrs[tagAttr] !== nodeAttrs[tagAttr]);
    } else {
      return true;
    }
  }
};

addMatchers(matchersByName);

const cheerio = require('cheerio');
const webpack = require('webpack');
const rimraf = require('rimraf');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('../');

const OUTPUT_DIR = path.join(__dirname, '../dist');
const OUTPUT_FILENAME = '[name].js';

const FIXTURES_PATH = path.join(__dirname, './fixtures');
const FIXTURES_ENTRY = path.join(FIXTURES_PATH, 'entry.js');
const FIXTURES_STYLE = path.join(FIXTURES_PATH, 'app.css');

const WEBPACK_CSS_RULE = { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] };

const WEBPACK_ENTRY = {
  app: FIXTURES_ENTRY,
  style: FIXTURES_STYLE
};

const WEBPACK_OUTPUT = {
  path: OUTPUT_DIR,
  filename: OUTPUT_FILENAME
};

const WEBPACK_MODULE = {
  rules: [WEBPACK_CSS_RULE]
};

describe('end to end', () => {
  beforeEach(done => {
    rimraf(OUTPUT_DIR, done);
  });

  describe('plugin dependencies', () => {
    it('should throw an error if html-webpack-plugin is not in the webpack config', done => {
      const theError = /(are you sure you have html-webpack-plugin before it in your webpack config's plugins)/;
      const theFunction = () => {
        webpack({
          entry: WEBPACK_ENTRY,
          output: {
            path: OUTPUT_DIR,
            filename: '[name].js'
          },
          module: WEBPACK_MODULE,
          plugins: [
            new MiniCssExtractPlugin({ filename: '[name].css' }),
            new HtmlWebpackIncludeAssetsPlugin({ tags: 'foobar.js', append: true, publicPath: false })
          ]
        }, () => {});
      };
      expect(theFunction).toThrowError(theError);
      done();
    });
  });

  describe('main options', () => {
    describe('options.append', () => {
      it('should include a single js file and append it', done => {
        webpack({
          entry: WEBPACK_ENTRY,
          output: WEBPACK_OUTPUT,
          module: WEBPACK_MODULE,
          plugins: [
            new MiniCssExtractPlugin({ filename: '[name].css' }),
            new HtmlWebpackPlugin(),
            new HtmlWebpackIncludeAssetsPlugin({ tags: 'foobar.js', append: true, publicPath: false })
          ]
        }, (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          const htmlFile = path.resolve(__dirname, '../dist/index.html');
          fs.readFile(htmlFile, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(3);
            expect($('link').length).toBe(1);
            expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
            expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
            expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
            expect($('script[src="foobar.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'foobar.js', type: 'text/javascript' } });
            expect($($('script').get(2))).toBeTag({ tagName: 'script', attributes: { src: 'foobar.js', type: 'text/javascript' } });
            done();
          });
        });
      });

      it('should include a single css file and append it', done => {
        webpack({
          entry: WEBPACK_ENTRY,
          output: WEBPACK_OUTPUT,
          module: WEBPACK_MODULE,
          plugins: [
            new MiniCssExtractPlugin({ filename: '[name].css' }),
            new HtmlWebpackPlugin(),
            new HtmlWebpackIncludeAssetsPlugin({ tags: 'foobar.css', append: true, publicPath: false })
          ]
        }, (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          const htmlFile = path.resolve(__dirname, '../dist/index.html');
          fs.readFile(htmlFile, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(2);
            expect($('link').length).toBe(2);
            expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
            expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
            expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
            expect($('link[href="foobar.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'foobar.css', rel: 'stylesheet' } });
            expect($($('link').get(1))).toBeTag({ tagName: 'link', attributes: { href: 'foobar.css', rel: 'stylesheet' } });
            done();
          });
        });
      });

      it('should include a single js file and prepend it', done => {
        webpack({
          entry: WEBPACK_ENTRY,
          output: WEBPACK_OUTPUT,
          module: WEBPACK_MODULE,
          plugins: [
            new MiniCssExtractPlugin({ filename: '[name].css' }),
            new HtmlWebpackPlugin(),
            new HtmlWebpackIncludeAssetsPlugin({ tags: 'foobar.js', append: false, publicPath: false })
          ]
        }, (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          const htmlFile = path.resolve(__dirname, '../dist/index.html');
          fs.readFile(htmlFile, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(3);
            expect($('link').length).toBe(1);
            expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
            expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
            expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
            expect($('script[src="foobar.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'foobar.js', type: 'text/javascript' } });
            expect($($('script').get(0))).toBeTag({ tagName: 'script', attributes: { src: 'foobar.js', type: 'text/javascript' } });
            done();
          });
        });
      });

      it('should include a single css file and prepend it', done => {
        webpack({
          entry: WEBPACK_ENTRY,
          output: WEBPACK_OUTPUT,
          module: WEBPACK_MODULE,
          plugins: [
            new MiniCssExtractPlugin({ filename: '[name].css' }),
            new HtmlWebpackPlugin(),
            new HtmlWebpackIncludeAssetsPlugin({ tags: 'foobar.css', append: false, publicPath: false })
          ]
        }, (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          const htmlFile = path.resolve(__dirname, '../dist/index.html');
          fs.readFile(htmlFile, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(2);
            expect($('link').length).toBe(2);
            expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
            expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
            expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
            expect($('link[href="foobar.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'foobar.css', rel: 'stylesheet' } });
            expect($($('link').get(0))).toBeTag({ tagName: 'link', attributes: { href: 'foobar.css', rel: 'stylesheet' } });
            done();
          });
        });
      });

      it('should support appending and prepending at the same time', done => {
        webpack({
          entry: WEBPACK_ENTRY,
          output: WEBPACK_OUTPUT,
          module: WEBPACK_MODULE,
          plugins: [
            new MiniCssExtractPlugin({ filename: '[name].css' }),
            new HtmlWebpackPlugin(),
            new HtmlWebpackIncludeAssetsPlugin({ tags: ['foo.css', 'foo.js'], append: false, publicPath: false, debug: true }),
            new HtmlWebpackIncludeAssetsPlugin({ tags: ['bar.css', 'bar.js'], append: true, publicPath: false, debug: true })
          ]
        }, (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          const htmlFile = path.resolve(__dirname, '../dist/index.html');
          fs.readFile(htmlFile, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(4);
            expect($('link').length).toBe(3);
            expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
            expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
            expect($('script[src="foo.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'foo.js', type: 'text/javascript' } });
            expect($('script[src="bar.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'bar.js', type: 'text/javascript' } });
            expect($($('script').get(0))).toBeTag({ tagName: 'script', attributes: { src: 'foo.js', type: 'text/javascript' } });
            expect($($('script').get(3))).toBeTag({ tagName: 'script', attributes: { src: 'bar.js', type: 'text/javascript' } });
            expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
            expect($('link[href="foo.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'foo.css', rel: 'stylesheet' } });
            expect($('link[href="bar.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'bar.css', rel: 'stylesheet' } });
            expect($($('link').get(0))).toBeTag({ tagName: 'link', attributes: { href: 'foo.css', rel: 'stylesheet' } });
            expect($($('link').get(2))).toBeTag({ tagName: 'link', attributes: { href: 'bar.css', rel: 'stylesheet' } });
            done();
          });
        });
      });

      it('should include multiple css files and append them in order', done => {
        webpack({
          entry: WEBPACK_ENTRY,
          output: WEBPACK_OUTPUT,
          module: WEBPACK_MODULE,
          plugins: [
            new MiniCssExtractPlugin({ filename: '[name].css' }),
            new HtmlWebpackPlugin(),
            new HtmlWebpackIncludeAssetsPlugin({ tags: ['foo.css', 'bar.css', { path: 'baz.css' }], append: true, publicPath: false })
          ]
        }, (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          const htmlFile = path.resolve(__dirname, '../dist/index.html');
          fs.readFile(htmlFile, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(2);
            expect($('link').length).toBe(4);
            expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
            expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
            expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
            expect($('link[href="foo.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'foo.css', rel: 'stylesheet' } });
            expect($('link[href="bar.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'bar.css', rel: 'stylesheet' } });
            expect($('link[href="baz.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'baz.css', rel: 'stylesheet' } });
            expect($($('link').get(1))).toBeTag({ tagName: 'link', attributes: { href: 'foo.css', rel: 'stylesheet' } });
            expect($($('link').get(2))).toBeTag({ tagName: 'link', attributes: { href: 'bar.css', rel: 'stylesheet' } });
            expect($($('link').get(3))).toBeTag({ tagName: 'link', attributes: { href: 'baz.css', rel: 'stylesheet' } });
            done();
          });
        });
      });

      it('should include multiple css files and prepend them in order', done => {
        webpack({
          entry: WEBPACK_ENTRY,
          output: WEBPACK_OUTPUT,
          module: WEBPACK_MODULE,
          plugins: [
            new MiniCssExtractPlugin({ filename: '[name].css' }),
            new HtmlWebpackPlugin(),
            new HtmlWebpackIncludeAssetsPlugin({ tags: ['foo.css', 'bar.css'], append: false, publicPath: false })
          ]
        }, (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          const htmlFile = path.resolve(__dirname, '../dist/index.html');
          fs.readFile(htmlFile, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(2);
            expect($('link').length).toBe(3);
            expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
            expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
            expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
            expect($('link[href="foo.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'foo.css', rel: 'stylesheet' } });
            expect($('link[href="bar.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'bar.css', rel: 'stylesheet' } });
            expect($($('link').get(0))).toBeTag({ tagName: 'link', attributes: { href: 'foo.css', rel: 'stylesheet' } });
            expect($($('link').get(1))).toBeTag({ tagName: 'link', attributes: { href: 'bar.css', rel: 'stylesheet' } });
            done();
          });
        });
      });
    });

    describe('options.files', () => {
      it('should not include if not present in defined files', done => {
        webpack({
          entry: WEBPACK_ENTRY,
          output: WEBPACK_OUTPUT,
          module: WEBPACK_MODULE,
          plugins: [
            new MiniCssExtractPlugin({ filename: '[name].css' }),
            new HtmlWebpackPlugin(),
            new HtmlWebpackIncludeAssetsPlugin({
              files: ['fail.html'],
              tags: 'foobar.js',
              append: true,
              publicPath: false
            })
          ]
        }, (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          const htmlFile = path.resolve(__dirname, '../dist/index.html');
          fs.readFile(htmlFile, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(2);
            expect($('link').length).toBe(1);
            expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
            expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
            expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
            done();
          });
        });
      });

      it('should include if present in defined files', done => {
        webpack({
          entry: WEBPACK_ENTRY,
          output: WEBPACK_OUTPUT,
          module: WEBPACK_MODULE,
          plugins: [
            new MiniCssExtractPlugin({ filename: '[name].css' }),
            new HtmlWebpackPlugin(),
            new HtmlWebpackIncludeAssetsPlugin({
              files: ['*.html'],
              tags: 'foobar.js',
              append: true,
              publicPath: false
            })
          ]
        }, (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          const htmlFile = path.resolve(__dirname, '../dist/index.html');
          fs.readFile(htmlFile, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(3);
            expect($('link').length).toBe(1);
            expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
            expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
            expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
            expect($('script[src="foobar.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'foobar.js', type: 'text/javascript' } });
            expect($($('script').get(2))).toBeTag({ tagName: 'script', attributes: { src: 'foobar.js', type: 'text/javascript' } });
            done();
          });
        });
      });
    });

    describe('options.jsExtensions', () => {
      it('should include all js type files when multiple jsExtensions are specified', done => {
        webpack({
          entry: WEBPACK_ENTRY,
          output: WEBPACK_OUTPUT,
          module: WEBPACK_MODULE,
          plugins: [
            new MiniCssExtractPlugin({ filename: '[name].css' }),
            new HtmlWebpackPlugin(),
            new HtmlWebpackIncludeAssetsPlugin({ tags: ['foo.js', 'foo.jsx'], append: true, jsExtensions: ['.js', '.jsx'] })
          ]
        }, (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          const htmlFile = path.resolve(__dirname, '../dist/index.html');
          fs.readFile(htmlFile, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(4);
            expect($('link').length).toBe(1);
            expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
            expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
            expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
            expect($('script[src="foo.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'foo.js', type: 'text/javascript' } });
            expect($('script[src="foo.jsx"]')).toBeTag({ tagName: 'script', attributes: { src: 'foo.jsx', type: 'text/javascript' } });
            done();
          });
        });
      });
    });

    describe('options.cssExtensions', () => {
      it('should include all css type files when multiple cssExtensions are specified', done => {
        webpack({
          entry: WEBPACK_ENTRY,
          output: WEBPACK_OUTPUT,
          module: WEBPACK_MODULE,
          plugins: [
            new MiniCssExtractPlugin({ filename: '[name].css' }),
            new HtmlWebpackPlugin(),
            new HtmlWebpackIncludeAssetsPlugin({ tags: ['foo.css', 'foo.style'], append: true, cssExtensions: ['.css', '.style'] })
          ]
        }, (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          const htmlFile = path.resolve(__dirname, '../dist/index.html');
          fs.readFile(htmlFile, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(2);
            expect($('link').length).toBe(3);
            expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
            expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
            expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
            expect($('link[href="foo.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'foo.css', rel: 'stylesheet' } });
            expect($('link[href="foo.style"]')).toBeTag({ tagName: 'link', attributes: { href: 'foo.style', rel: 'stylesheet' } });
            done();
          });
        });
      });
    });

    describe('options.publicPath', () => {
      it('should prefix the publicPath if the publicPath option is set to true', done => {
        webpack({
          entry: WEBPACK_ENTRY,
          output: {
            ...WEBPACK_OUTPUT,
            publicPath: 'thePublicPath'
          },
          module: WEBPACK_MODULE,
          plugins: [
            new MiniCssExtractPlugin({ filename: '[name].css' }),
            new HtmlWebpackPlugin(),
            new HtmlWebpackIncludeAssetsPlugin({ tags: 'foobar.js', append: false, publicPath: true })
          ]
        }, (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          const htmlFile = path.resolve(__dirname, '../dist/index.html');
          fs.readFile(htmlFile, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(3);
            expect($('link').length).toBe(1);
            expect($('script[src="thePublicPath/style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/style.js', type: 'text/javascript' } });
            expect($('script[src="thePublicPath/app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/app.js', type: 'text/javascript' } });
            expect($('link[href="thePublicPath/style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'thePublicPath/style.css', rel: 'stylesheet' } });
            expect($('script[src="thePublicPath/foobar.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/foobar.js', type: 'text/javascript' } });
            expect($($('script').get(0))).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/foobar.js', type: 'text/javascript' } });
            done();
          });
        });
      });

      it('should not prefix the publicPath if the publicPath option is set to false', done => {
        webpack({
          entry: WEBPACK_ENTRY,
          output: {
            ...WEBPACK_OUTPUT,
            publicPath: 'thePublicPath'
          },
          module: WEBPACK_MODULE,
          plugins: [
            new MiniCssExtractPlugin({ filename: '[name].css' }),
            new HtmlWebpackPlugin(),
            new HtmlWebpackIncludeAssetsPlugin(
              { tags: 'local-with-public-path.js', append: false, publicPath: true }
            ),
            new HtmlWebpackIncludeAssetsPlugin(
              { tags: ['local-without-public-path.js', 'http://www.foo.com/foobar.js'], append: false, publicPath: false }
            )
          ]
        }, (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          const htmlFile = path.resolve(__dirname, '../dist/index.html');
          fs.readFile(htmlFile, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(5);
            expect($('link').length).toBe(1);
            expect($('script[src="thePublicPath/style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/style.js', type: 'text/javascript' } });
            expect($('script[src="thePublicPath/app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/app.js', type: 'text/javascript' } });
            expect($('link[href="thePublicPath/style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'thePublicPath/style.css', rel: 'stylesheet' } });
            expect($('script[src="thePublicPath/local-with-public-path.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/local-with-public-path.js', type: 'text/javascript' } });
            expect($('script[src="local-without-public-path.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'local-without-public-path.js', type: 'text/javascript' } });
            expect($('script[src="http://www.foo.com/foobar.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'http://www.foo.com/foobar.js', type: 'text/javascript' } });
            expect($($('script').get(2))).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/local-with-public-path.js', type: 'text/javascript' } });
            expect($($('script').get(0))).toBeTag({ tagName: 'script', attributes: { src: 'local-without-public-path.js', type: 'text/javascript' } });
            expect($($('script').get(1))).toBeTag({ tagName: 'script', attributes: { src: 'http://www.foo.com/foobar.js', type: 'text/javascript' } });
            done();
          });
        });
      });

      it('should not prefix the publicPath if the publicPath option is set to false and the asset is a protocol-relative path', done => {
        webpack({
          entry: WEBPACK_ENTRY,
          output: {
            ...WEBPACK_OUTPUT,
            publicPath: 'thePublicPath'
          },
          module: WEBPACK_MODULE,
          plugins: [
            new MiniCssExtractPlugin({ filename: '[name].css' }),
            new HtmlWebpackPlugin(),
            new HtmlWebpackIncludeAssetsPlugin(
              { tags: 'local-with-public-path.js', append: false, publicPath: true }
            ),
            new HtmlWebpackIncludeAssetsPlugin(
              { tags: ['//www.foo.com/foobar.js'], append: false, publicPath: false }
            )
          ]
        }, (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          const htmlFile = path.resolve(__dirname, '../dist/index.html');
          fs.readFile(htmlFile, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(4);
            expect($('link').length).toBe(1);
            expect($('script[src="thePublicPath/style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/style.js', type: 'text/javascript' } });
            expect($('script[src="thePublicPath/app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/app.js', type: 'text/javascript' } });
            expect($('link[href="thePublicPath/style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'thePublicPath/style.css', rel: 'stylesheet' } });
            expect($('script[src="thePublicPath/local-with-public-path.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/local-with-public-path.js', type: 'text/javascript' } });
            expect($('script[src="//www.foo.com/foobar.js"]')).toBeTag({ tagName: 'script', attributes: { src: '//www.foo.com/foobar.js', type: 'text/javascript' } });
            expect($($('script').get(1))).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/local-with-public-path.js', type: 'text/javascript' } });
            expect($($('script').get(0))).toBeTag({ tagName: 'script', attributes: { src: '//www.foo.com/foobar.js', type: 'text/javascript' } });
            done();
          });
        });
      });

      it('should prefix the value of the publicPath option if the publicPath option is set to a string', done => {
        webpack({
          entry: WEBPACK_ENTRY,
          output: {
            ...WEBPACK_OUTPUT,
            publicPath: 'thePublicPath'
          },
          module: WEBPACK_MODULE,
          plugins: [
            new MiniCssExtractPlugin({ filename: '[name].css' }),
            new HtmlWebpackPlugin(),
            new HtmlWebpackIncludeAssetsPlugin({ tags: 'foobar.js', append: false, publicPath: 'abc/' })
          ]
        }, (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          const htmlFile = path.resolve(__dirname, '../dist/index.html');
          fs.readFile(htmlFile, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(3);
            expect($('link').length).toBe(1);
            expect($('script[src="thePublicPath/style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/style.js', type: 'text/javascript' } });
            expect($('script[src="thePublicPath/app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/app.js', type: 'text/javascript' } });
            expect($('link[href="thePublicPath/style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'thePublicPath/style.css', rel: 'stylesheet' } });
            expect($('script[src="abc/foobar.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'abc/foobar.js', type: 'text/javascript' } });
            expect($($('script').get(0))).toBeTag({ tagName: 'script', attributes: { src: 'abc/foobar.js', type: 'text/javascript' } });
            done();
          });
        });
      });
    });

    describe('options.hash', () => {
      beforeEach(() => {
        this.hashTestWebpackConfig = {
          entry: { ...WEBPACK_ENTRY },
          output: {
            ...WEBPACK_OUTPUT,
            publicPath: 'myPublic'
          },
          module: { ...WEBPACK_MODULE },
          plugins: [
            new MiniCssExtractPlugin({ filename: '[name].css' }),
            new HtmlWebpackPlugin({ hash: true })
          ]
        };
      });

      const createWebpackHashConfig = ({ webpackPublicPath, htmlOptions, options }) => {
        return {
          entry: { ...WEBPACK_ENTRY },
          output: {
            ...WEBPACK_OUTPUT,
            publicPath: webpackPublicPath
          },
          module: { ...WEBPACK_MODULE },
          plugins: [
            new MiniCssExtractPlugin({ filename: '[name].css' }),
            new HtmlWebpackPlugin(htmlOptions),
            new HtmlWebpackIncludeAssetsPlugin(options)
          ]
        };
      };

      const appendHash = (v, hash) => {
        if (hash.length > 0) hash = '?' + hash;
        return v + hash;
      };

      it('should not append hash if hash options are not provided', done => {
        this.hashTestWebpackConfig.plugins.push(new HtmlWebpackIncludeAssetsPlugin({ tags: 'foobar.css', append: false, publicPath: true }));
        webpack(this.hashTestWebpackConfig, (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          const hash = result.compilation.hash;
          const htmlFile = path.resolve(__dirname, '../dist/index.html');
          fs.readFile(htmlFile, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(2);
            expect($('link').length).toBe(2);
            expect($('script[src^="myPublic/style.js"]')).toBeTag({
              tagName: 'script',
              attributes: {
                src: appendHash('myPublic/style.js', hash),
                type: 'text/javascript'
              }
            });
            expect($('script[src^="myPublic/app.js"]')).toBeTag({
              tagName: 'script',
              attributes: {
                src: appendHash('myPublic/app.js', hash),
                type: 'text/javascript'
              }
            });
            expect($('link[href^="myPublic/style.css"]')).toBeTag({
              tagName: 'link',
              attributes: {
                href: appendHash('myPublic/style.css', hash),
                rel: 'stylesheet'
              }
            });
            expect($($('link[href^="myPublic/foobar.css"]')).attr('href')).toBe('myPublic/foobar.css');
            done();
          });
        });
      });

      it('should not append hash if hash options are set to false', done => {
        webpack(
          createWebpackHashConfig({ webpackPublicPath: 'myPublic/', htmlOptions: { hash: true }, options: { tags: 'foobar.css', append: false, publicPath: true, hash: false } }),
          (err, result) => {
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            const hash = result.compilation.hash;
            const htmlFile = path.resolve(__dirname, '../dist/index.html');
            fs.readFile(htmlFile, 'utf8', (er, data) => {
              expect(er).toBeFalsy();
              const $ = cheerio.load(data);
              expect($('script').length).toBe(2);
              expect($('link').length).toBe(2);
              expect($('script[src^="myPublic/style.js"]')).toBeTag({
                tagName: 'script',
                attributes: {
                  src: appendHash('myPublic/style.js', hash),
                  type: 'text/javascript'
                }
              });
              expect($('script[src^="myPublic/app.js"]')).toBeTag({
                tagName: 'script',
                attributes: {
                  src: appendHash('myPublic/app.js', hash),
                  type: 'text/javascript'
                }
              });
              expect($('link[href^="myPublic/style.css"]')).toBeTag({
                tagName: 'link',
                attributes: {
                  href: appendHash('myPublic/style.css', hash),
                  rel: 'stylesheet'
                }
              });
              expect($($('link[href^="myPublic/foobar.css"]')).attr('href')).toBe('myPublic/foobar.css');
              done();
            });
          });
      });

      it('should append hash if hash options are set to true', done => {
        webpack(createWebpackHashConfig({
          webpackPublicPath: 'myPublic/',
          htmlOptions: { hash: true },
          options: {
            tags: 'foobar.css',
            append: false,
            publicPath: true,
            hash: true
          }
        }), (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          const hash = result.compilation.hash;
          const htmlFile = path.resolve(__dirname, '../dist/index.html');
          fs.readFile(htmlFile, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(2);
            expect($('link').length).toBe(2);
            expect($('script[src^="myPublic/style.js"]')).toBeTag({
              tagName: 'script',
              attributes: {
                src: appendHash('myPublic/style.js', hash),
                type: 'text/javascript'
              }
            });
            expect($('script[src^="myPublic/app.js"]')).toBeTag({
              tagName: 'script',
              attributes: {
                src: appendHash('myPublic/app.js', hash),
                type: 'text/javascript'
              }
            });
            expect($('link[href^="myPublic/style.css"]')).toBeTag({
              tagName: 'link',
              attributes: {
                href: appendHash('myPublic/style.css', hash),
                rel: 'stylesheet'
              }
            });
            expect($($('link[href^="myPublic/foobar.css"]')).attr('href')).toBe(appendHash('myPublic/foobar.css', hash));
            done();
          });
        });
      });

      it('should append hash if hash option in this plugin set to true but hash options in HtmlWebpackPlugin config are set to false', done => {
        webpack(createWebpackHashConfig({
          webpackPublicPath: 'myPublic/',
          htmlOptions: { hash: false },
          options: {
            tags: 'foobar.css',
            append: false,
            publicPath: true,
            hash: true
          }
        }), (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          const hash = result.compilation.hash;
          const htmlFile = path.resolve(__dirname, '../dist/index.html');
          fs.readFile(htmlFile, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(2);
            expect($('link').length).toBe(2);
            expect($('script[src^="myPublic/style.js"]')).toBeTag({
              tagName: 'script',
              attributes: {
                src: 'myPublic/style.js',
                type: 'text/javascript'
              }
            });
            expect($('script[src^="myPublic/app.js"]')).toBeTag({
              tagName: 'script',
              attributes: {
                src: 'myPublic/app.js',
                type: 'text/javascript'
              }
            });
            expect($('link[href^="myPublic/style.css"]')).toBeTag({
              tagName: 'link',
              attributes: {
                href: 'myPublic/style.css',
                rel: 'stylesheet'
              }
            });
            expect($($('link[href^="myPublic/foobar.css"]')).attr('href')).toBe(appendHash('myPublic/foobar.css', hash));
            done();
          });
        });
      });

      it('should not append hash if hash option in this plugin set to false and hash options in HtmlWebpackPlugin config are set to false', done => {
        this.hashTestWebpackConfig.plugins[1] = new HtmlWebpackPlugin({ hash: false });
        this.hashTestWebpackConfig.plugins.push(new HtmlWebpackIncludeAssetsPlugin({ tags: 'foobar.css', append: false, publicPath: true, hash: false }));
        webpack(this.hashTestWebpackConfig, (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          const htmlFile = path.resolve(__dirname, '../dist/index.html');
          fs.readFile(htmlFile, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(2);
            expect($('link').length).toBe(2);
            expect($('script[src^="myPublic/style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'myPublic/style.js', type: 'text/javascript' } });
            expect($('script[src^="myPublic/app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'myPublic/app.js', type: 'text/javascript' } });
            expect($('link[href^="myPublic/style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'myPublic/style.css', rel: 'stylesheet' } });
            expect($($('link[href^="myPublic/foobar.css"]')).attr('href')).toBe('myPublic/foobar.css');
            done();
          });
        });
      });

      it('should replace the hash if a replacer hash function is provided in the plugin options', done => {
        const hashReplacer = (assetName, hash) => {
          return assetName.replace(/\[hash\]/, hash);
        };
        this.hashTestWebpackConfig.plugins[1] = new HtmlWebpackPlugin({ hash: false });
        this.hashTestWebpackConfig.plugins.push(new HtmlWebpackIncludeAssetsPlugin({ tags: 'foobar.[hash].css', append: false, publicPath: true, hash: hashReplacer }));
        webpack(this.hashTestWebpackConfig, (err, result) => {
          const theHash = result.compilation.hash;
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          const htmlFile = path.resolve(__dirname, '../dist/index.html');
          fs.readFile(htmlFile, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(2);
            expect($('link').length).toBe(2);
            expect($('script[src^="myPublic/style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'myPublic/style.js', type: 'text/javascript' } });
            expect($('script[src^="myPublic/app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'myPublic/app.js', type: 'text/javascript' } });
            expect($('link[href^="myPublic/style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'myPublic/style.css', rel: 'stylesheet' } });
            expect($($('link[href^="myPublic/foobar.' + theHash + '.css"]')).attr('href')).toBe('myPublic/foobar.' + theHash + '.css');
            done();
          });
        });
      });

      it('should inject the hash if an injector hash function is provided in the plugin options', done => {
        const hashInjector = (assetName, hash) => {
          assetName = assetName.replace(/\.js$/, '.' + hash + '.js');
          assetName = assetName.replace(/\.css$/, '.' + hash + '.css');
          return assetName;
        };
        this.hashTestWebpackConfig.plugins = [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new CopyWebpackPlugin([{ from: 'spec/fixtures/g*', to: 'assets/', flatten: true }]),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({
            tags: [
              { path: 'assets/', globPath: 'spec/fixtures/', glob: 'g*.js' },
              { path: 'assets/', globPath: 'spec/fixtures/', glob: 'g*.css' }
            ],
            hash: hashInjector,
            append: true
          })
        ];
        webpack(this.hashTestWebpackConfig, (err, result) => {
          const theHash = result.compilation.hash;
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          const htmlFile = path.resolve(__dirname, '../dist/index.html');
          fs.readFile(htmlFile, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(3);
            expect($('link').length).toBe(2);
            expect($('script[src^="myPublic/style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'myPublic/style.js', type: 'text/javascript' } });
            expect($('script[src^="myPublic/app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'myPublic/app.js', type: 'text/javascript' } });
            expect($('link[href^="myPublic/style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'myPublic/style.css', rel: 'stylesheet' } });
            expect($('link[href^="myPublic/assets/glob.' + theHash + '.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'myPublic/assets/glob.' + theHash + '.css', rel: 'stylesheet' } });
            expect($('script[src^="myPublic/assets/glob.' + theHash + '.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'myPublic/assets/glob.' + theHash + '.js', type: 'text/javascript' } });
            done();
          });
        });
      });
    });
  });

  runTestsForOption({ optionName: 'tags', optionTag: 'link' });
  runTestsForOption({ optionName: 'tags', optionTag: 'script' });
  runTestsForOption({ optionName: 'links', optionTag: 'link' });
  runTestsForOption({ optionName: 'scripts', optionTag: 'script' });

  describe('option.tags', () => {
    it('should include a mixture of js and css files', done => {
      webpack({
        entry: WEBPACK_ENTRY,
        output: WEBPACK_OUTPUT,
        module: WEBPACK_MODULE,
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({
            tags: [
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
      }, (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', (er, data) => {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(5);
          expect($('link').length).toBe(4);
          expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
          expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
          expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
          expect($('script[src="foo.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'foo.js', type: 'text/javascript' } });
          expect($('script[src="bar.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'bar.js', type: 'text/javascript' } });
          expect($('script[src="qux"]')).toBeTag({ tagName: 'script', attributes: { src: 'qux', type: 'text/javascript' } });
          expect($('link[href="foo.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'foo.css', rel: 'stylesheet' } });
          expect($('link[href="bar.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'bar.css', rel: 'stylesheet' } });
          expect($('link[href="baz"]')).toBeTag({ tagName: 'link', attributes: { href: 'baz', rel: 'stylesheet' } });
          done();
        });
      });
    });
  });

  describe('options.links', () => {
    it('should append links and assets together with a custom index.html template when inject is false and append is set to false', done => {
      webpack({
        entry: WEBPACK_ENTRY,
        output: WEBPACK_OUTPUT,
        module: WEBPACK_MODULE,
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin({
            template: path.join(__dirname, 'fixtures', 'index-no-inject.html'),
            inject: false
          }),
          new HtmlWebpackIncludeAssetsPlugin({
            tags: [{
              path: 'assets/astyle.css',
              sourcePath: 'spec/fixtures/astyle.css'
            }],
            append: false,
            links: [{
              path: 'the-href',
              attributes: { rel: 'the-rel', sizes: '16x16' }
            }]
          })
        ]
      }, (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', (er, data) => {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(3);
          expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
          expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
          expect($('script[id="loading-script"]').toString()).toContain('<script id="loading-script" type="text/javascript">');
          expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css' } });
          expect($('link[href="assets/astyle.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'assets/astyle.css' } });
          expect($('link[href="the-href"]')).toBeTag({ tagName: 'link', attributes: { href: 'the-href' } });
          done();
        });
      });
    });

    it('should append links and assets together with a custom index.html template when inject is false and append is set to true', done => {
      webpack({
        entry: WEBPACK_ENTRY,
        output: WEBPACK_OUTPUT,
        module: WEBPACK_MODULE,
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin({
            template: path.join(__dirname, 'fixtures', 'index-no-inject.html'),
            inject: false
          }),
          new HtmlWebpackIncludeAssetsPlugin({
            tags: [{ path: 'assets/astyle.css', sourcePath: 'spec/fixtures/astyle.css' }],
            append: true,
            links: [{ path: 'the-href', attributes: { rel: 'the-rel', sizes: '16x16' } }]
          })
        ]
      }, (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', (er, data) => {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(3);
          expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
          expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
          expect($('script[id="loading-script"]').toString()).toContain('<script id="loading-script" type="text/javascript">');
          expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css' } });
          expect($('link[href="assets/astyle.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'assets/astyle.css' } });
          expect($('link[href="the-href"]')).toBeTag({ tagName: 'link', attributes: { href: 'the-href' } });
          done();
        });
      });
    });

    it('should append links and assets together with a custom index.html template when inject is false and append is set to true and false', done => {
      webpack({
        entry: WEBPACK_ENTRY,
        output: WEBPACK_OUTPUT,
        module: WEBPACK_MODULE,
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin({
            template: path.join(__dirname, 'fixtures', 'index-no-inject.html'),
            inject: false
          }),
          new HtmlWebpackIncludeAssetsPlugin({
            tags: [{ path: 'assets/astyle-1.css', sourcePath: 'spec/fixtures/astyle.css' }],
            append: true,
            links: [{ path: 'the-href-1', attributes: { rel: 'the-rel-1', sizes: '16x16' } }]
          }),
          new HtmlWebpackIncludeAssetsPlugin({
            tags: [{ path: 'assets/astyle-2.css', sourcePath: 'spec/fixtures/astyle.css' }],
            append: false,
            links: [{ path: 'the-href-2', attributes: { rel: 'the-rel-2', sizes: '16x16' } }]
          })
        ]
      }, (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', (er, data) => {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(5);
          expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
          expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
          expect($('script[id="loading-script"]').toString()).toContain('<script id="loading-script" type="text/javascript">');
          expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css' } });
          expect($('link[href="assets/astyle-1.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'assets/astyle-1.css' } });
          expect($('link[href="the-href-1"]')).toBeTag({ tagName: 'link', attributes: { href: 'the-href-1' } });
          expect($('link[href="assets/astyle-2.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'assets/astyle-2.css' } });
          expect($('link[href="the-href-2"]')).toBeTag({ tagName: 'link', attributes: { href: 'the-href-2' } });
          done();
        });
      });
    });

    it('should append links and assets together with a custom index.html template when inject is true and append is set to true and false', done => {
      webpack({
        entry: WEBPACK_ENTRY,
        output: WEBPACK_OUTPUT,
        module: WEBPACK_MODULE,
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin({
            template: path.join(__dirname, 'fixtures', 'index.html'),
            inject: true
          }),
          new HtmlWebpackIncludeAssetsPlugin({
            tags: [{ path: 'assets/astyle-1.css', sourcePath: 'spec/fixtures/astyle.css' }],
            append: true,
            links: [{ path: 'the-href-1', attributes: { rel: 'the-rel-1', sizes: '16x16' } }]
          }),
          new HtmlWebpackIncludeAssetsPlugin({
            tags: [{ path: 'assets/astyle-2.css', sourcePath: 'spec/fixtures/astyle.css' }],
            append: false,
            links: [{ path: 'the-href-2', attributes: { rel: 'the-rel-2', sizes: '16x16' } }]
          })
        ]
      }, (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', (er, data) => {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(5);
          expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
          expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
          expect($('script[id="loading-script"]').toString()).toContain('<script id="loading-script" type="text/javascript">');
          expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
          expect($('link[href="assets/astyle-1.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'assets/astyle-1.css', rel: 'stylesheet' } });
          expect($('link[href="the-href-1"]')).toBeTag({ tagName: 'link', attributes: { href: 'the-href-1', rel: 'the-rel-1', sizes: '16x16' } });
          expect($('link[href="assets/astyle-2.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'assets/astyle-2.css', rel: 'stylesheet' } });
          expect($('link[href="the-href-2"]')).toBeTag({ tagName: 'link', attributes: { href: 'the-href-2', rel: 'the-rel-2', sizes: '16x16' } });
          done();
        });
      });
    });

    it('should append links and assets together with a custom index.html template when append is set to false', done => {
      webpack({
        entry: WEBPACK_ENTRY,
        output: WEBPACK_OUTPUT,
        module: WEBPACK_MODULE,
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin({
            template: path.join(__dirname, 'fixtures', 'index.html')
          }),
          new HtmlWebpackIncludeAssetsPlugin({
            tags: [{ path: 'assets/astyle.css', sourcePath: 'spec/fixtures/astyle.css' }],
            append: false,
            links: [{ path: 'the-href', attributes: { rel: 'the-rel', sizes: '16x16' } }]
          })
        ]
      }, (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', (er, data) => {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(3);
          expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
          expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
          expect($('script[id="loading-script"]').toString()).toContain('<script id="loading-script" type="text/javascript">');
          expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
          expect($('link[href="assets/astyle.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'assets/astyle.css', rel: 'stylesheet' } });
          expect($('link[href="the-href"]')).toBeTag({ tagName: 'link', attributes: { href: 'the-href', rel: 'the-rel', sizes: '16x16' } });
          done();
        });
      });
    });

    it('should append links and assets together with a custom index.html template when append is set to true', done => {
      webpack({
        entry: WEBPACK_ENTRY,
        output: WEBPACK_OUTPUT,
        module: WEBPACK_MODULE,
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin({
            template: path.join(__dirname, 'fixtures', 'index.html')
          }),
          new HtmlWebpackIncludeAssetsPlugin({
            tags: [{ path: 'assets/astyle.css', sourcePath: 'spec/fixtures/astyle.css' }],
            append: true,
            links: [{ path: 'the-href', attributes: { rel: 'the-rel', sizes: '16x16' } }]
          })
        ]
      }, (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', (er, data) => {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(3);
          expect($('link').length).toBe(3);
          expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
          expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
          expect($('script[id="loading-script"]').toString()).toContain('<script id="loading-script" type="text/javascript">');
          expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
          expect($('link[href="the-href"]')).toBeTag({ tagName: 'link', attributes: { href: 'the-href', rel: 'the-rel', sizes: '16x16' } });
          expect($('link[href="assets/astyle.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'assets/astyle.css', rel: 'stylesheet' } });
          done();
        });
      });
    });

    it('should append links and assets together when append is set to false', done => {
      webpack({
        entry: WEBPACK_ENTRY,
        output: WEBPACK_OUTPUT,
        module: WEBPACK_MODULE,
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({
            tags: [{ path: 'assets/astyle.css', sourcePath: 'spec/fixtures/astyle.css' }],
            append: false,
            links: [{ path: 'the-href', attributes: { rel: 'the-rel', sizes: '16x16' } }]
          })
        ]
      }, (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', (er, data) => {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(3);
          expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
          expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
          expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
          expect($('link[href="the-href"]')).toBeTag({ tagName: 'link', attributes: { href: 'the-href', rel: 'the-rel', sizes: '16x16' } });
          expect($('link[href="assets/astyle.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'assets/astyle.css', rel: 'stylesheet' } });
          done();
        });
      });
    });

    it('should append links and assets together when append is set to true', done => {
      webpack({
        entry: WEBPACK_ENTRY,
        output: WEBPACK_OUTPUT,
        module: WEBPACK_MODULE,
        plugins: [
          new MiniCssExtractPlugin({ filename: '[name].css' }),
          new HtmlWebpackPlugin(),
          new HtmlWebpackIncludeAssetsPlugin({
            tags: [{ path: 'assets/astyle.css', sourcePath: 'spec/fixtures/astyle.css' }],
            append: true,
            links: [{ path: 'the-href', attributes: { rel: 'the-rel', sizes: '16x16' } }]
          })
        ]
      }, (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', (er, data) => {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(3);
          expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
          expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
          expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
          expect($('link[href="the-href"]')).toBeTag({ tagName: 'link', attributes: { href: 'the-href', rel: 'the-rel', sizes: '16x16' } });
          expect($('link[href="assets/astyle.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'assets/astyle.css', rel: 'stylesheet' } });
          done();
        });
      });
    });
  });
});

function runTestsForOption (options, runExtraTests) {
  const {
    optionName, // = 'assets' || 'scripts' || 'links'
    optionTag //   = 'script' || 'link'
  } = options;

  const optionAttr = optionTag === 'script' ? 'src' : 'href';
  const optionType = optionTag === 'script' ? 'js' : 'css';

  const createWebpackConfig = ({
    webpackPublicPath = void 0,
    preHtmlPlugin = void 0,
    htmlOptions = {},
    options = {}
  }) => {
    if (optionName === 'tags' && options.tags) {
      const type = optionTag === 'script' ? 'js' : 'css';
      const savedTags = options.tags;
      let tags;
      if (savedTags !== void 0) {
        if (Array.isArray(savedTags)) {
          tags = [];
          savedTags.forEach(asset => {
            if (typeof asset === 'object') {
              tags.push({ ...asset, type });
            } else {
              tags.push({ path: asset, type });
            }
          });
        } else if (typeof savedTags === 'object') {
          tags = { ...savedTags, type };
        } else {
          tags = { path: savedTags, type };
        }
        if (tags) {
          options.tags = tags;
        }
      }
    }
    return {
      entry: { ...WEBPACK_ENTRY },
      output: {
        ...WEBPACK_OUTPUT,
        ...(webpackPublicPath ? { publicPath: webpackPublicPath } : {})
      },
      module: { ...WEBPACK_MODULE },
      plugins: [
        new MiniCssExtractPlugin({ filename: '[name].css' }),
        ...(preHtmlPlugin ? [preHtmlPlugin] : []),
        new HtmlWebpackPlugin(htmlOptions),
        new HtmlWebpackIncludeAssetsPlugin(options)
      ]
    };
  };

  describe(`options.${optionName}`, () => {
    it(`should not include ${optionName} when an empty array is provided`, done => {
      webpack(createWebpackConfig({ options: { [optionName]: [] } }), (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', (er, data) => {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(1);
          expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
          expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
          expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
          done();
        });
      });
    });

    it(`should not include ${optionName} when nothing is provided`, done => {
      webpack(createWebpackConfig({ options: {} }), (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', (er, data) => {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2);
          expect($('link').length).toBe(1);
          expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
          expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
          expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
          done();
        });
      });
    });
  });

  describe(`option.${optionName} and options.append`, () => {
    it(`should prepend when the ${optionName} are all valid and append is set to false`, done => {
      webpack(createWebpackConfig({
        options: {
          append: false,
          [optionName]: [{
            path: 'the-href',
            attributes: { rel: 'the-rel' }
          }]
        }
      }), (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', (er, data) => {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2 + (optionTag === 'script' ? 1 : 0));
          expect($('link').length).toBe(1 + (optionTag === 'link' ? 1 : 0));
          expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
          expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
          expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
          expect($(`${optionTag}[${optionAttr}="the-href"]`)).toBeTag({ tagName: optionTag, attributes: { [optionAttr]: 'the-href', rel: 'the-rel' } });
          expect($($(optionTag).get(0))).toBeTag({ tagName: optionTag, attributes: { [optionAttr]: 'the-href', rel: 'the-rel' } });
          done();
        });
      });
    });

    it(`should append when the ${optionName} are all valid and append is set to true`, done => {
      webpack(createWebpackConfig({
        options: {
          append: true,
          [optionName]: [{
            path: 'the-href',
            type: optionType
          }]
        }
      }), (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', (er, data) => {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2 + (optionTag === 'script' ? 1 : 0));
          expect($('link').length).toBe(1 + (optionTag === 'link' ? 1 : 0));
          expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
          expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
          expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
          expect($(`${optionTag}[${optionAttr}="the-href"]`)).toBeTag({ tagName: optionTag, attributes: { [optionAttr]: 'the-href' } });
          expect($($(optionTag).get(optionTag === 'script' ? 2 : 1))).toBeTag({ tagName: optionTag, attributes: { [optionAttr]: 'the-href' } });
          done();
        });
      });
    });
  });

  describe(`option.${optionName} attributes`, () => {
    it(`should add the given ${optionName} attributes to the matching tag`, done => {
      webpack(createWebpackConfig({
        options: {
          append: false,
          [optionName]: [
            { path: 'assets/abc', attributes: { id: 'abc' } },
            { path: 'assets/def', attributes: { id: 'def', media: 'screen' } },
            { path: 'assets/ghi' }]
        }
      }), (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', (er, data) => {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2 + (optionTag === 'script' ? 3 : 0));
          expect($('link').length).toBe(1 + (optionTag === 'link' ? 3 : 0));
          expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
          expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
          expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
          expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
          expect($(`${optionTag}[${optionAttr}="assets/abc"]`)).toBeTag({
            tagName: optionTag,
            attributes: {
              [optionAttr]: 'assets/abc',
              id: 'abc'
            }
          });
          expect($(`${optionTag}[${optionAttr}="assets/def"]`)).toBeTag({
            tagName: optionTag,
            attributes: {
              [optionAttr]: 'assets/def',
              id: 'def',
              media: 'screen'
            }
          });
          expect($(`${optionTag}[${optionAttr}="assets/ghi"]`)).toBeTag({
            tagName: optionTag,
            attributes: {
              [optionAttr]: 'assets/ghi'
            }
          });
          done();
        });
      });
    });

    it(`can match tags with an ${optionName} overridden publicPath and set hash`, done => {
      const appendHash = (v, hash) => {
        if (hash.length > 0) hash = '?' + hash;
        return v + hash;
      };

      webpack(createWebpackConfig({
        webpackPublicPath: 'thePublicPath/',
        htmlOptions: { hash: true },
        options: {
          [optionName]: [
            { path: 'assets/abc', attributes: { id: 'abc' } },
            { path: 'assets/def', attributes: { id: 'def', media: 'screen' } },
            { path: 'assets/ghi' }
          ],
          append: false,
          hash: true
        }
      }), (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const hash = result.compilation.hash;
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', (er, data) => {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2 + (optionTag === 'script' ? 3 : 0));
          expect($('link').length).toBe(1 + (optionTag === 'link' ? 3 : 0));
          expect($('script[src^="thePublicPath/app.js"]')).toBeTag({ tagName: 'script', attributes: { type: 'text/javascript', src: appendHash('thePublicPath/app.js', hash) } });
          expect($('script[src^="thePublicPath/style.js"]')).toBeTag({ tagName: 'script', attributes: { type: 'text/javascript', src: appendHash('thePublicPath/style.js', hash) } });
          expect($('link[href^="thePublicPath/style.css"]')).toBeTag({ tagName: 'link', attributes: { rel: 'stylesheet', href: appendHash('thePublicPath/style.css', hash) } });
          expect($(`${optionTag}[${optionAttr}^="thePublicPath/assets/abc"]`)).toBeTag({
            tagName: optionTag,
            attributes: {
              [optionAttr]: appendHash('thePublicPath/assets/abc', hash),
              id: 'abc'
            }
          });
          expect($(`${optionTag}[${optionAttr}^="thePublicPath/assets/def"]`)).toBeTag({
            tagName: optionTag,
            attributes: {
              [optionAttr]: appendHash('thePublicPath/assets/def', hash),
              id: 'def',
              media: 'screen'
            }
          });
          expect($(`${optionTag}[${optionAttr}^="thePublicPath/assets/ghi"]`)).toBeTag({
            tagName: optionTag,
            attributes: {
              [optionAttr]: appendHash('thePublicPath/assets/ghi', hash)
            }
          });
          done();
        });
      });
    });

    if (optionTag === 'link') {
      it(`should output ${optionName} attributes other than path`, done => {
        webpack(createWebpackConfig({
          options: {
            append: false,
            [optionName]: [
              { path: '/the-href.css', attributes: { rel: 'the-rel', a: 'abc', x: 'xyz' } }
            ]
          }
        }), (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          const htmlFile = path.resolve(__dirname, '../dist/index.html');
          fs.readFile(htmlFile, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(2);
            expect($('link').length).toBe(2);
            expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
            expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
            expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
            expect($('link[href="/the-href.css"]')).toBeTag({ tagName: 'link', attributes: { href: '/the-href.css', rel: 'the-rel', a: 'abc', x: 'xyz' } });
            done();
          });
        });
      });

      it(`should output ${optionName} attributes and inject the publicPath only when ${optionName} object publicPath is not false`, done => {
        const publicPath = '/pub-path/';
        webpack(createWebpackConfig({
          webpackPublicPath: publicPath,
          options: {
            append: false,
            [optionName]: [
              { path: '/the-href', publicPath: false, attributes: { rel: 'the-rel-a', a: 'abc', x: 'xyz' } },
              { path: 'the-href-1', publicPath: true, attributes: { rel: 'the-rel-b', a: '123', x: '789' } },
              { path: 'the-href-2', attributes: { rel: 'the-rel-c', a: '___', x: '---' } }
            ]
          }
        }), (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          const htmlFile = path.resolve(__dirname, '../dist/index.html');
          fs.readFile(htmlFile, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(2 + (optionTag === 'script' ? 3 : 0));
            expect($('link').length).toBe(1 + (optionTag === 'link' ? 3 : 0));
            expect($('script[src="' + publicPath + 'app.js"]')).toBeTag({ tagName: 'script', attributes: { src: publicPath + 'app.js', type: 'text/javascript' } });
            expect($('script[src="' + publicPath + 'style.js"]')).toBeTag({ tagName: 'script', attributes: { src: publicPath + 'style.js', type: 'text/javascript' } });
            expect($('link[href="' + publicPath + 'style.css"]')).toBeTag({ tagName: 'link', attributes: { href: publicPath + 'style.css', rel: 'stylesheet' } });
            expect($('link[href="/the-href"]')).toBeTag({ tagName: 'link', attributes: { href: '/the-href', rel: 'the-rel-a', a: 'abc', x: 'xyz' } });
            expect($('link[href="' + publicPath + 'the-href-1"]')).toBeTag({ tagName: 'link', attributes: { href: publicPath + 'the-href-1', rel: 'the-rel-b', a: '123', x: '789' } });
            expect($('link[href="' + publicPath + 'the-href-2"]')).toBeTag({ tagName: 'link', attributes: { href: publicPath + 'the-href-2', rel: 'the-rel-c', a: '___', x: '---' } });
            done();
          });
        });
      });
    }
  });

  describe(`option.${optionName} glob`, () => {
    it(`should include any files for a ${optionName} glob that does match files`, done => {
      webpack(createWebpackConfig({
        preHtmlPlugin: new CopyWebpackPlugin([{ from: 'spec/fixtures/g*', to: 'assets/', flatten: true }]),
        options: {
          [optionName]: [
            { path: 'assets/', globPath: 'spec/fixtures/', glob: 'g*-a' },
            { path: 'assets/', globPath: 'spec/fixtures/', glob: 'g*-b' }
          ],
          append: true
        }
      }), (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', (er, data) => {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2 + (optionTag === 'script' ? 2 : 0));
          expect($('link').length).toBe(1 + (optionTag === 'link' ? 2 : 0));
          expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
          expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
          expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
          expect($(`${optionTag}[${optionAttr}="assets/glob-a"]`)).toBeTag({ tagName: optionTag, attributes: { [optionAttr]: 'assets/glob-a' } });
          expect($(`${optionTag}[${optionAttr}="assets/glob-b"]`)).toBeTag({ tagName: optionTag, attributes: { [optionAttr]: 'assets/glob-b' } });
          done();
        });
      });
    });
  });

  describe(`options.${optionName} sourcePath`, () => {
    it(`should not throw an error when the ${optionName} sourcePath points to a valid js file`, done => {
      webpack(createWebpackConfig({
        options: {
          [optionName]: {
            path: 'foobar',
            sourcePath: path.join(FIXTURES_PATH, 'other')
          }
        }
      }), (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', (er, data) => {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2 + (optionTag === 'script' ? 1 : 0));
          expect($('link').length).toBe(1 + (optionTag === 'link' ? 1 : 0));
          expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
          expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
          expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
          expect($(`${optionTag}[${optionAttr}="foobar"]`)).toBeTag({ tagName: optionTag, attributes: { [optionAttr]: 'foobar' } });
          expect($($(optionTag).get(optionTag === 'script' ? 2 : 1))).toBeTag({ tagName: optionTag, attributes: { [optionAttr]: 'foobar' } });
          done();
        });
      });
    });

    it(`should throw an error when the ${optionName} sourcePath does not point to a valid js file`, done => {
      const badFilename = 'does-not-exist.js';
      webpack(createWebpackConfig({
        options: {
          [optionName]: {
            path: 'foobar.js',
            sourcePath: path.join(FIXTURES_PATH, badFilename)
          }
        }
      }), (err, result) => {
        expect(err).toBeFalsy();
        const errorText = JSON.stringify(result.compilation.errors);
        expect(errorText).toContain('could not load file');
        expect(errorText).toContain(badFilename);
        done();
      });
    });

    it(`should not throw an error when ${optionName} sourcePath is used and the css file exists`, done => {
      webpack(createWebpackConfig({
        options: {
          [optionName]: [{
            path: 'assets/afile',
            sourcePath: 'spec/fixtures/other'
          }],
          append: false
        }
      }), (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const htmlFile = path.resolve(__dirname, '../dist/index.html');
        fs.readFile(htmlFile, 'utf8', (er, data) => {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2 + (optionTag === 'script' ? 1 : 0));
          expect($('link').length).toBe(1 + (optionTag === 'link' ? 1 : 0));
          expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
          expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
          expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
          expect($(`${optionTag}[${optionAttr}="assets/afile"]`)).toBeTag({ tagName: optionTag, attributes: { [optionAttr]: 'assets/afile' } });
          done();
        });
      });
    });

    it(`should throw an error when ${optionName} sourcePath is used and the css file does not exist`, done => {
      const theFunction = () => {
        webpack(createWebpackConfig({
          options: {
            [optionName]: [{
              path: 'assets/astyle.css',
              sourcePath: 'spec/fixtures/anotherstyle.css'
            }],
            append: false
          }
        }), (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).not.toBe('[]');
          done();
        });
      };

      theFunction();
      // No error thrown, the error is in the webpack result
      // expect(theFunction).toThrowError(/(HtmlWebpackPlugin: could not load file)/);
    });
  });

  if (runExtraTests) {
    runExtraTests();
  }
}
