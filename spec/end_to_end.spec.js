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
const HtmlWebpackPluginNext = require('html-webpack-plugin-4');
const HtmlWebpackTagsPlugin = require('../');

const OUTPUT_FILENAME = '[name].js';

const FIXTURES_PATH = path.join(__dirname, './fixtures');
const FIXTURES_ENTRY = path.join(FIXTURES_PATH, 'entry.js');
const FIXTURES_STYLE = path.join(FIXTURES_PATH, 'app.css');
const FIXTURES_OUTPUT_DIR = path.join(__dirname, '../dist');
const FIXTURES_HTML_FILE = path.join(FIXTURES_OUTPUT_DIR, 'index.html');

const EXTERNALS_PATH = path.join(FIXTURES_PATH, 'external');
const EXTERNALS_ENTRY = path.join(EXTERNALS_PATH, 'external-entry.js');
const EXTERNALS_STYLE = path.join(EXTERNALS_PATH, 'external-style.css');
const EXTERNALS_OUTPUT_DIR = path.join(EXTERNALS_PATH, 'dist');
const EXTERNALS_HTML_FILE = path.join(EXTERNALS_OUTPUT_DIR, 'index.html');

const WEBPACK_CSS_RULE = { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] };

const WEBPACK_ENTRY = {
  app: FIXTURES_ENTRY,
  style: FIXTURES_STYLE
};

const WEBPACK_OUTPUT = {
  path: FIXTURES_OUTPUT_DIR,
  filename: OUTPUT_FILENAME
};

const WEBPACK_MODULE = {
  rules: [WEBPACK_CSS_RULE]
};

// This is for debugging. It should always be set to true
const RUN_ALL_TESTS = true;

describe('end to end', () => {
  runTestsForHtmlVersion({ isHtmlNext: false });
  if (RUN_ALL_TESTS) {
    runTestsForHtmlVersion({ isHtmlNext: true });
  }
});

function runTestsForHtmlVersion ({ isHtmlNext }) {
  const createHtmlPlugin = isHtmlNext ? opts => new HtmlWebpackPluginNext(opts) : opts => new HtmlWebpackPlugin(opts);
  const createTagsPlugin = isHtmlNext ? opts => new HtmlWebpackTagsPlugin({ ...opts, htmlPluginName: 'html-webpack-plugin-4' }) : opts => new HtmlWebpackTagsPlugin(opts);
  const createWebpackConfig = ({
    webpackEntry,
    webpackStyle,
    webpackOutput,
    webpackPublicPath,
    copyOptions,
    htmlOptions,
    options
  }) => {
    const copyPlugins = copyOptions !== false ? [new CopyWebpackPlugin(copyOptions)] : [];
    const htmlPlugins = htmlOptions !== false ? [createHtmlPlugin(htmlOptions)] : [];
    const tagsPlugins = Array.isArray(options) ? options.map(createTagsPlugin) : options !== false ? [createTagsPlugin(options)] : [];

    return {
      entry: {
        ...WEBPACK_ENTRY,
        ...(webpackEntry !== void 0 ? { app: webpackEntry } : {}),
        ...(webpackStyle !== void 0 ? { style: webpackStyle } : {})
      },
      output: {
        ...WEBPACK_OUTPUT,
        ...(webpackOutput !== void 0 ? { path: webpackOutput } : {}),
        ...(webpackPublicPath !== void 0 ? { publicPath: webpackPublicPath } : {})
      },
      module: { ...WEBPACK_MODULE },
      plugins: [
        new MiniCssExtractPlugin({ filename: '[name].css' }),
        ...copyPlugins,
        ...htmlPlugins,
        ...tagsPlugins
      ]
    };
  };

  describe(isHtmlNext ? 'html-next' : 'html-latest', () => {
    beforeEach(done => {
      rimraf(FIXTURES_OUTPUT_DIR, done);
    });

    it('should throw an error if html-webpack-plugin is not in the webpack config', done => {
      const theError = /(are you sure you have html-webpack-plugin before it in your webpack config's plugins)/;
      const theFunction = () => {
        webpack(createWebpackConfig({
          htmlOptions: false,
          options: {
            tags: 'foobar.js',
            publicPath: false
          }
        }), () => { });
      };
      expect(theFunction).toThrowError(theError);
      done();
    });

    describe('main options', () => {
      describe('options.append', () => {
        it('should include a single js file and append it', done => {
          webpack(createWebpackConfig({
            options: {
              tags: 'foobar.js',
              append: true,
              publicPath: false
            }
          }), (err, result) => {
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
              expect(er).toBeFalsy();
              const $ = cheerio.load(data);
              expect($('script').length).toBe(3);
              expect($('link').length).toBe(1);
              expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
              expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
              expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
              expect($('script[src="foobar.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'foobar.js' } });
              expect($($('script').get(2))).toBeTag({ tagName: 'script', attributes: { src: 'foobar.js' } });
              done();
            });
          });
        });

        it('should include a single css file and append it', done => {
          webpack(createWebpackConfig({
            options: {
              tags: 'foobar.css',
              append: true,
              publicPath: false
            }
          }), (err, result) => {
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
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
          webpack(createWebpackConfig({
            options: {
              tags: 'foobar.js',
              append: false,
              publicPath: false
            }
          }), (err, result) => {
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
              expect(er).toBeFalsy();
              const $ = cheerio.load(data);
              expect($('script').length).toBe(3);
              expect($('link').length).toBe(1);
              expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
              expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
              expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
              expect($('script[src="foobar.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'foobar.js' } });
              expect($($('script').get(0))).toBeTag({ tagName: 'script', attributes: { src: 'foobar.js' } });
              done();
            });
          });
        });

        it('should include a single css file and prepend it', done => {
          webpack(createWebpackConfig({
            options: {
              tags: 'foobar.css',
              append: false,
              publicPath: false
            }
          }), (err, result) => {
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
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
          webpack(createWebpackConfig({
            options: [
              {
                tags: ['foo.css', 'foo.js'],
                append: false,
                publicPath: false
              },
              {
                tags: ['bar.css', 'bar.js'],
                append: true,
                publicPath: false
              }
            ]
          }), (err, result) => {
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
              expect(er).toBeFalsy();
              const $ = cheerio.load(data);
              expect($('script').length).toBe(4);
              expect($('link').length).toBe(3);
              expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
              expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
              expect($('script[src="foo.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'foo.js' } });
              expect($('script[src="bar.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'bar.js' } });
              expect($($('script').get(0))).toBeTag({ tagName: 'script', attributes: { src: 'foo.js' } });
              expect($($('script').get(3))).toBeTag({ tagName: 'script', attributes: { src: 'bar.js' } });
              expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
              expect($('link[href="foo.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'foo.css', rel: 'stylesheet' } });
              expect($('link[href="bar.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'bar.css', rel: 'stylesheet' } });
              expect($($('link').get(0))).toBeTag({ tagName: 'link', attributes: { href: 'foo.css', rel: 'stylesheet' } });
              expect($($('link').get(2))).toBeTag({ tagName: 'link', attributes: { href: 'bar.css', rel: 'stylesheet' } });
              done();
            });
          });
        });

        it('should support overriding append at the tag level', done => {
          webpack(createWebpackConfig({
            options: [
              {
                tags: [
                  'foo.css',
                  { path: 'foo.js', append: true }
                ],
                scripts: 'baz.js',
                append: false,
                publicPath: false
              },
              {
                tags: [
                  { path: 'bar.css', append: false },
                  'bar.js'
                ],
                links: 'baz.css',
                append: true,
                publicPath: false
              }
            ]
          }), (err, result) => {
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
              expect(er).toBeFalsy();
              const $ = cheerio.load(data);
              expect($('script').length).toBe(5);
              expect($('link').length).toBe(4);
              expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
              expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
              expect($('script[src="foo.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'foo.js' } });
              expect($('script[src="bar.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'bar.js' } });
              expect($('script[src="baz.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'baz.js' } });
              expect($($('script').get(0))).toBeTag({ tagName: 'script', attributes: { src: 'baz.js' } });
              expect($($('script').get(3))).toBeTag({ tagName: 'script', attributes: { src: 'foo.js' } });
              expect($($('script').get(4))).toBeTag({ tagName: 'script', attributes: { src: 'bar.js' } });
              expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
              expect($('link[href="foo.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'foo.css', rel: 'stylesheet' } });
              expect($('link[href="bar.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'bar.css', rel: 'stylesheet' } });
              expect($('link[href="baz.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'baz.css', rel: 'stylesheet' } });
              expect($($('link').get(0))).toBeTag({ tagName: 'link', attributes: { href: 'bar.css', rel: 'stylesheet' } });
              expect($($('link').get(1))).toBeTag({ tagName: 'link', attributes: { href: 'foo.css', rel: 'stylesheet' } });
              expect($($('link').get(3))).toBeTag({ tagName: 'link', attributes: { href: 'baz.css', rel: 'stylesheet' } });
              done();
            });
          });
        });

        it('should include multiple css files and append them in order', done => {
          webpack(createWebpackConfig({
            options: {
              tags: [
                'foo.css',
                'bar.css',
                { path: 'baz.css' }
              ],
              append: true,
              publicPath: false
            }
          }), (err, result) => {
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
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
          webpack(createWebpackConfig({
            options: {
              tags: ['foo.css', 'bar.css'],
              append: false,
              publicPath: false
            }
          }), (err, result) => {
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
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

      describe('options.prependExternals', () => {
        it('should auto prepend a script when it has an external and prependExternals is true', done => {
          webpack(createWebpackConfig({
            options: {
              tags: {
                path: 'foobar.js',
                external: {
                  packageName: 'foobar',
                  variableName: 'FooBar'
                }
              },
              append: true,
              prependExternals: true,
              publicPath: false
            }
          }), (err, result) => {
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
              expect(er).toBeFalsy();
              const $ = cheerio.load(data);
              expect($('script').length).toBe(3);
              expect($('link').length).toBe(1);
              expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
              expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
              expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
              expect($('script[src="foobar.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'foobar.js' } });
              expect($($('script').get(0))).toBeTag({ tagName: 'script', attributes: { src: 'foobar.js' } });
              done();
            });
          });
        });

        it('should not auto prepend a script when it has an external and prependExternals is false', done => {
          webpack(createWebpackConfig({
            options: {
              tags: {
                path: 'foobar.js',
                external: {
                  packageName: 'foobar',
                  variableName: 'FooBar'
                }
              },
              append: true,
              prependExternals: false,
              publicPath: false
            }
          }), (err, result) => {
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
              expect(er).toBeFalsy();
              const $ = cheerio.load(data);
              expect($('script').length).toBe(3);
              expect($('link').length).toBe(1);
              expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
              expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
              expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
              expect($('script[src="foobar.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'foobar.js' } });
              expect($($('script').get(2))).toBeTag({ tagName: 'script', attributes: { src: 'foobar.js' } });
              done();
            });
          });
        });

        it('should not auto prepend a script that specifies append even when it has an external and prependExternals is false', done => {
          webpack(createWebpackConfig({
            options: {
              tags: {
                append: true,
                path: 'foobar.js',
                external: {
                  packageName: 'foobar',
                  variableName: 'FooBar'
                }
              },
              append: true,
              prependExternals: true,
              publicPath: false
            }
          }), (err, result) => {
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
              expect(er).toBeFalsy();
              const $ = cheerio.load(data);
              expect($('script').length).toBe(3);
              expect($('link').length).toBe(1);
              expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
              expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
              expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
              expect($('script[src="foobar.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'foobar.js' } });
              expect($($('script').get(2))).toBeTag({ tagName: 'script', attributes: { src: 'foobar.js' } });
              done();
            });
          });
        });

        it('should auto prepend a script when append is set to false', done => {
          webpack(createWebpackConfig({
            options: {
              tags: {
                path: 'foobar.js',
                external: {
                  packageName: 'foobar',
                  variableName: 'FooBar'
                }
              },
              append: false,
              prependExternals: true,
              publicPath: false
            }
          }), (err, result) => {
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
              expect(er).toBeFalsy();
              const $ = cheerio.load(data);
              expect($('script').length).toBe(3);
              expect($('link').length).toBe(1);
              expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
              expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
              expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
              expect($('script[src="foobar.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'foobar.js' } });
              expect($($('script').get(0))).toBeTag({ tagName: 'script', attributes: { src: 'foobar.js' } });
              done();
            });
          });
        });

        it('should auto prepend a script when append is not specified', done => {
          webpack(createWebpackConfig({
            options: {
              tags: {
                path: 'foobar.js',
                external: {
                  packageName: 'foobar',
                  variableName: 'FooBar'
                }
              },
              prependExternals: true,
              publicPath: false
            }
          }), (err, result) => {
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
              expect(er).toBeFalsy();
              const $ = cheerio.load(data);
              expect($('script').length).toBe(3);
              expect($('link').length).toBe(1);
              expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
              expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
              expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
              expect($('script[src="foobar.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'foobar.js' } });
              expect($($('script').get(0))).toBeTag({ tagName: 'script', attributes: { src: 'foobar.js' } });
              done();
            });
          });
        });
      });

      describe('options.files', () => {
        it('should not include if not present in defined files', done => {
          webpack(createWebpackConfig({
            options: {
              files: ['fail.html'],
              tags: 'foobar.js',
              append: true,
              publicPath: false
            }
          }), (err, result) => {
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
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
          webpack(createWebpackConfig({
            options: {
              files: ['*.html'],
              tags: 'foobar.js',
              append: true,
              publicPath: false
            }
          }), (err, result) => {
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
              expect(er).toBeFalsy();
              const $ = cheerio.load(data);
              expect($('script').length).toBe(3);
              expect($('link').length).toBe(1);
              expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
              expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
              expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
              expect($('script[src="foobar.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'foobar.js' } });
              expect($($('script').get(2))).toBeTag({ tagName: 'script', attributes: { src: 'foobar.js' } });
              done();
            });
          });
        });
      });

      describe('options.jsExtensions', () => {
        it('should include all js type files when multiple jsExtensions are specified', done => {
          webpack(createWebpackConfig({
            options: {
              tags: ['foo.js', 'foo.jsx'],
              append: true,
              jsExtensions: ['.js', '.jsx']
            }
          }), (err, result) => {
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
              expect(er).toBeFalsy();
              const $ = cheerio.load(data);
              expect($('script').length).toBe(4);
              expect($('link').length).toBe(1);
              expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
              expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
              expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
              expect($('script[src="foo.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'foo.js' } });
              expect($('script[src="foo.jsx"]')).toBeTag({ tagName: 'script', attributes: { src: 'foo.jsx' } });
              done();
            });
          });
        });
      });

      describe('options.cssExtensions', () => {
        it('should include all css type files when multiple cssExtensions are specified', done => {
          webpack(createWebpackConfig({
            options: {
              tags: ['foo.css', 'foo.style'],
              append: true,
              cssExtensions: ['.css', '.style']
            }
          }), (err, result) => {
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
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
          webpack(createWebpackConfig({
            webpackPublicPath: 'thePublicPath',
            options: {
              tags: 'foobar.js',
              append: false,
              publicPath: true
            }
          }), (err, result) => {
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
              expect(er).toBeFalsy();
              const $ = cheerio.load(data);
              expect($('script').length).toBe(3);
              expect($('link').length).toBe(1);
              expect($('script[src="thePublicPath/style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/style.js' } });
              expect($('script[src="thePublicPath/app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/app.js' } });
              expect($('link[href="thePublicPath/style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'thePublicPath/style.css', rel: 'stylesheet' } });
              expect($('script[src="thePublicPath/foobar.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/foobar.js' } });
              expect($($('script').get(0))).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/foobar.js' } });
              done();
            });
          });
        });

        it('should not prefix the publicPath if the publicPath option is set to false', done => {
          webpack(createWebpackConfig({
            webpackPublicPath: 'thePublicPath',
            options: [
              {
                tags: 'local-with-public-path.js',
                append: false,
                publicPath: true
              },
              {
                tags: [
                  'local-without-public-path.js',
                  'http://www.foo.com/foobar.js'
                ],
                append: false,
                publicPath: false
              }
            ]
          }), (err, result) => {
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
              expect(er).toBeFalsy();
              const $ = cheerio.load(data);
              expect($('script').length).toBe(5);
              expect($('link').length).toBe(1);
              expect($('script[src="thePublicPath/style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/style.js' } });
              expect($('script[src="thePublicPath/app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/app.js' } });
              expect($('link[href="thePublicPath/style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'thePublicPath/style.css', rel: 'stylesheet' } });
              expect($('script[src="thePublicPath/local-with-public-path.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/local-with-public-path.js' } });
              expect($('script[src="local-without-public-path.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'local-without-public-path.js' } });
              expect($('script[src="http://www.foo.com/foobar.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'http://www.foo.com/foobar.js' } });
              expect($($('script').get(2))).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/local-with-public-path.js' } });
              expect($($('script').get(0))).toBeTag({ tagName: 'script', attributes: { src: 'local-without-public-path.js' } });
              expect($($('script').get(1))).toBeTag({ tagName: 'script', attributes: { src: 'http://www.foo.com/foobar.js' } });
              done();
            });
          });
        });

        it('should not prefix the publicPath if the publicPath option is set to false and the asset is a protocol-relative path', done => {
          webpack(createWebpackConfig({
            webpackPublicPath: 'thePublicPath',
            options: [
              {
                tags: 'local-with-public-path.js',
                append: false,
                publicPath: true
              },
              {
                tags: '//www.foo.com/foobar.js',
                append: false,
                publicPath: false
              }
            ]
          }), (err, result) => {
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
              expect(er).toBeFalsy();
              const $ = cheerio.load(data);
              expect($('script').length).toBe(4);
              expect($('link').length).toBe(1);
              expect($('script[src="thePublicPath/style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/style.js' } });
              expect($('script[src="thePublicPath/app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/app.js' } });
              expect($('link[href="thePublicPath/style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'thePublicPath/style.css', rel: 'stylesheet' } });
              expect($('script[src="thePublicPath/local-with-public-path.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/local-with-public-path.js' } });
              expect($('script[src="//www.foo.com/foobar.js"]')).toBeTag({ tagName: 'script', attributes: { src: '//www.foo.com/foobar.js' } });
              expect($($('script').get(1))).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/local-with-public-path.js' } });
              expect($($('script').get(0))).toBeTag({ tagName: 'script', attributes: { src: '//www.foo.com/foobar.js' } });
              done();
            });
          });
        });

        it('should prefix the value of the publicPath option if the publicPath option is set to a string', done => {
          webpack(createWebpackConfig({
            webpackPublicPath: 'thePublicPath',
            options: {
              tags: 'foobar.js',
              append: false,
              publicPath: 'abc/'
            }
          }), (err, result) => {
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
              expect(er).toBeFalsy();
              const $ = cheerio.load(data);
              expect($('script').length).toBe(3);
              expect($('link').length).toBe(1);
              expect($('script[src="thePublicPath/style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/style.js' } });
              expect($('script[src="thePublicPath/app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'thePublicPath/app.js' } });
              expect($('link[href="thePublicPath/style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'thePublicPath/style.css', rel: 'stylesheet' } });
              expect($('script[src="abc/foobar.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'abc/foobar.js' } });
              expect($($('script').get(0))).toBeTag({ tagName: 'script', attributes: { src: 'abc/foobar.js' } });
              done();
            });
          });
        });
      });

      describe('options.hash', () => {
        const appendHash = (v, hash) => {
          if (hash.length > 0) hash = '?' + hash;
          return v + hash;
        };

        it('should not append hash if hash options are not provided', done => {
          webpack(createWebpackConfig({
            webpackPublicPath: 'myPublic/',
            htmlOptions: {
              hash: true
            },
            options: {
              tags: 'foobar.css',
              append: false,
              publicPath: true
            }
          }), (err, result) => {
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            const hash = result.compilation.hash;
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
              expect(er).toBeFalsy();
              const $ = cheerio.load(data);
              expect($('script').length).toBe(2);
              expect($('link').length).toBe(2);
              expect($('script[src^="myPublic/style.js"]')).toBeTag({
                tagName: 'script',
                attributes: {
                  src: appendHash('myPublic/style.js', hash)
                }
              });
              expect($('script[src^="myPublic/app.js"]')).toBeTag({
                tagName: 'script',
                attributes: {
                  src: appendHash('myPublic/app.js', hash)
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
            createWebpackConfig({
              webpackPublicPath: 'myPublic/',
              htmlOptions: { hash: true },
              options: {
                tags: 'foobar.css',
                append: false,
                publicPath: true,
                hash: false
              }
            }), (err, result) => {
              expect(err).toBeFalsy();
              expect(JSON.stringify(result.compilation.errors)).toBe('[]');
              const hash = result.compilation.hash;
              fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
                expect(er).toBeFalsy();
                const $ = cheerio.load(data);
                expect($('script').length).toBe(2);
                expect($('link').length).toBe(2);
                expect($('script[src^="myPublic/style.js"]')).toBeTag({
                  tagName: 'script',
                  attributes: {
                    src: appendHash('myPublic/style.js', hash)
                  }
                });
                expect($('script[src^="myPublic/app.js"]')).toBeTag({
                  tagName: 'script',
                  attributes: {
                    src: appendHash('myPublic/app.js', hash)
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
          webpack(createWebpackConfig({
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
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
              expect(er).toBeFalsy();
              const $ = cheerio.load(data);
              expect($('script').length).toBe(2);
              expect($('link').length).toBe(2);
              expect($('script[src^="myPublic/style.js"]')).toBeTag({
                tagName: 'script',
                attributes: {
                  src: appendHash('myPublic/style.js', hash)
                }
              });
              expect($('script[src^="myPublic/app.js"]')).toBeTag({
                tagName: 'script',
                attributes: {
                  src: appendHash('myPublic/app.js', hash)
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
          webpack(createWebpackConfig({
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
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
              expect(er).toBeFalsy();
              const $ = cheerio.load(data);
              expect($('script').length).toBe(2);
              expect($('link').length).toBe(2);
              expect($('script[src^="myPublic/style.js"]')).toBeTag({
                tagName: 'script',
                attributes: {
                  src: 'myPublic/style.js'
                }
              });
              expect($('script[src^="myPublic/app.js"]')).toBeTag({
                tagName: 'script',
                attributes: {
                  src: 'myPublic/app.js'
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
          webpack(createWebpackConfig({
            webpackPublicPath: 'myPublic/',
            htmlOptions: { hash: false },
            options: {
              tags: 'foobar.css',
              append: false,
              publicPath: true,
              hash: false
            }
          }), (err, result) => {
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
              expect(er).toBeFalsy();
              const $ = cheerio.load(data);
              expect($('script').length).toBe(2);
              expect($('link').length).toBe(2);
              expect($('script[src^="myPublic/style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'myPublic/style.js' } });
              expect($('script[src^="myPublic/app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'myPublic/app.js' } });
              expect($('link[href^="myPublic/style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'myPublic/style.css' } });
              expect($($('link[href^="myPublic/foobar.css"]')).attr('href')).toBe('myPublic/foobar.css');
              done();
            });
          });
        });

        it('should replace the hash if a replacer hash function is provided in the plugin options', done => {
          const hashReplacer = (assetName, hash) => {
            return assetName.replace(/\[hash\]/, hash);
          };
          webpack(createWebpackConfig({
            webpackPublicPath: 'myPublic/',
            htmlOptions: { hash: false },
            options: {
              tags: 'foobar.[hash].css',
              append: false,
              publicPath: true,
              hash: hashReplacer
            }
          }), (err, result) => {
            const theHash = result.compilation.hash;
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
              expect(er).toBeFalsy();
              const $ = cheerio.load(data);
              expect($('script').length).toBe(2);
              expect($('link').length).toBe(2);
              expect($('script[src^="myPublic/style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'myPublic/style.js' } });
              expect($('script[src^="myPublic/app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'myPublic/app.js' } });
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
          webpack(createWebpackConfig({
            webpackPublicPath: 'myPublic/',
            copyOptions: [{ from: 'spec/fixtures/g*', to: 'assets/', flatten: true }],
            options: {
              tags: [
                { path: 'assets/', globPath: 'spec/fixtures/', glob: 'g*-a.js' },
                { path: 'assets/', globPath: 'spec/fixtures/', glob: 'g*-a.css' }
              ],
              hash: hashInjector,
              append: true
            }
          }), (err, result) => {
            const theHash = result.compilation.hash;
            expect(err).toBeFalsy();
            expect(JSON.stringify(result.compilation.errors)).toBe('[]');
            fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
              expect(er).toBeFalsy();
              const $ = cheerio.load(data);
              expect($('script').length).toBe(3);
              expect($('link').length).toBe(2);
              expect($('script[src^="myPublic/style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'myPublic/style.js' } });
              expect($('script[src^="myPublic/app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'myPublic/app.js' } });
              expect($('link[href^="myPublic/style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'myPublic/style.css', rel: 'stylesheet' } });
              expect($('link[href^="myPublic/assets/glob-a.' + theHash + '.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'myPublic/assets/glob-a.' + theHash + '.css', rel: 'stylesheet' } });
              expect($('script[src^="myPublic/assets/glob-a.' + theHash + '.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'myPublic/assets/glob-a.' + theHash + '.js' } });
              done();
            });
          });
        });
      });
    });

    runTestsForOption({ optionName: 'tags', optionTag: 'link' }, createWebpackConfig);
    runTestsForOption({ optionName: 'tags', optionTag: 'script' }, createWebpackConfig);
    if (RUN_ALL_TESTS) {
      runTestsForOption({ optionName: 'links', optionTag: 'link' }, createWebpackConfig);
      runTestsForOption({ optionName: 'scripts', optionTag: 'script' }, createWebpackConfig);
    }

    describe('option.tags', () => {
      it('should include a mixture of js and css files', done => {
        webpack(createWebpackConfig({
          options: {
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
          }
        }), (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(5);
            expect($('link').length).toBe(4);
            expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
            expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
            expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
            expect($('script[src="foo.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'foo.js' } });
            expect($('script[src="bar.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'bar.js' } });
            expect($('script[src="qux"]')).toBeTag({ tagName: 'script', attributes: { src: 'qux' } });
            expect($('link[href="foo.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'foo.css', rel: 'stylesheet' } });
            expect($('link[href="bar.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'bar.css', rel: 'stylesheet' } });
            expect($('link[href="baz"]')).toBeTag({ tagName: 'link', attributes: { href: 'baz', rel: 'stylesheet' } });
            done();
          });
        });
      });
    });

    describe('multiple plugins', () => {
      it('should output all files when multiple plugins are used with varying append', done => {
        webpack(createWebpackConfig({
          options: [
            {
              tags: ['foo.js', 'foo.css'],
              append: true,
              publicPath: false
            },
            {
              links: 'bar.css',
              append: false,
              publicPath: false
            },
            {
              links: { path: 'bar2.css' },
              scripts: 'bar.js',
              append: true,
              publicPath: false
            },
            {
              links: 'car.css',
              append: true,
              publicPath: false
            },
            {
              scripts: 'car.js',
              append: false,
              publicPath: false
            }
          ]
        }), (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            const scripts = $('script');
            const links = $('link');

            expect(scripts.length).toBe(5);
            expect(scripts.get(0)).toBeTag({ tagName: 'script', attributes: { src: 'car.js' } });
            expect(scripts.get(1)).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
            expect(scripts.get(2)).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
            expect(scripts.get(3)).toBeTag({ tagName: 'script', attributes: { src: 'foo.js' } });
            expect(scripts.get(4)).toBeTag({ tagName: 'script', attributes: { src: 'bar.js' } });

            expect(links.length).toBe(5);
            expect(links.get(0)).toBeTag({ tagName: 'link', attributes: { href: 'bar.css', rel: 'stylesheet' } });
            expect(links.get(1)).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
            expect(links.get(2)).toBeTag({ tagName: 'link', attributes: { href: 'foo.css', rel: 'stylesheet' } });
            expect(links.get(3)).toBeTag({ tagName: 'link', attributes: { href: 'bar2.css', rel: 'stylesheet' } });
            expect(links.get(4)).toBeTag({ tagName: 'link', attributes: { href: 'car.css', rel: 'stylesheet' } });

            done();
          });
        });
      });
    });

    describe('options.links', () => {
      it('should prepend links and tags together with a custom index.html template when inject is false and append is set to false', done => {
        webpack(createWebpackConfig({
          htmlOptions: {
            template: path.join(__dirname, 'fixtures', 'index-no-inject.html'),
            inject: false
          },
          options: {
            tags: [{
              path: 'assets/astyle.css',
              sourcePath: 'spec/fixtures/astyle.css'
            }],
            append: false,
            links: [{
              path: 'the-href',
              attributes: { rel: 'the-rel', sizes: '16x16' }
            }]
          }
        }), (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(3);
            expect($('link').length).toBe(3);
            expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
            expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
            expect($('script[id="loading-script"]').toString()).toContain('<script id="loading-script"');
            expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css' } });
            expect($('link[href="assets/astyle.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'assets/astyle.css' } });
            expect($('link[href="the-href"]')).toBeTag({ tagName: 'link', attributes: { href: 'the-href' } });
            done();
          });
        });
      });

      it('should append links and tags together with a custom index.html template when inject is false and append is set to true', done => {
        webpack(createWebpackConfig({
          htmlOptions: {
            template: path.join(__dirname, 'fixtures', 'index-no-inject.html'),
            inject: false
          },
          options: {
            tags: [{
              path: 'assets/astyle.css',
              sourcePath: 'spec/fixtures/astyle.css'
            }],
            append: true,
            links: [{
              path: 'the-href',
              attributes: { rel: 'the-rel', sizes: '16x16' }
            }]
          }
        }), (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(3);
            expect($('link').length).toBe(3);
            expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
            expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
            expect($('script[id="loading-script"]').toString()).toContain('<script id="loading-script"');
            expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css' } });
            expect($('link[href="assets/astyle.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'assets/astyle.css' } });
            expect($('link[href="the-href"]')).toBeTag({ tagName: 'link', attributes: { href: 'the-href' } });
            done();
          });
        });
      });

      it('should append links and tags together with a custom index.html template when inject is false and append is set to true and false', done => {
        webpack(createWebpackConfig({
          htmlOptions: {
            template: path.join(__dirname, 'fixtures', 'index-no-inject.html'),
            inject: false
          },
          options: [
            {
              tags: [{ path: 'assets/astyle-1.css', sourcePath: 'spec/fixtures/astyle.css' }],
              append: true,
              links: [{ path: 'the-href-1', attributes: { rel: 'the-rel-1', sizes: '16x16' } }]
            },
            {
              tags: [{ path: 'assets/astyle-2.css', sourcePath: 'spec/fixtures/astyle.css' }],
              append: false,
              links: [{ path: 'the-href-2', attributes: { rel: 'the-rel-2', sizes: '16x16' } }]
            }
          ]
        }), (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(3);
            expect($('link').length).toBe(5);
            expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
            expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
            expect($('script[id="loading-script"]').toString()).toContain('<script id="loading-script"');
            expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css' } });
            expect($('link[href="assets/astyle-1.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'assets/astyle-1.css' } });
            expect($('link[href="the-href-1"]')).toBeTag({ tagName: 'link', attributes: { href: 'the-href-1' } });
            expect($('link[href="assets/astyle-2.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'assets/astyle-2.css' } });
            expect($('link[href="the-href-2"]')).toBeTag({ tagName: 'link', attributes: { href: 'the-href-2' } });
            done();
          });
        });
      });

      it('should append links and tags together with a custom index.html template when inject is true and append is set to true and false', done => {
        webpack(createWebpackConfig({
          htmlOptions: {
            template: path.join(__dirname, 'fixtures', 'index.html'),
            inject: true
          },
          options: [
            {
              tags: [{ path: 'assets/astyle-1.css', sourcePath: 'spec/fixtures/astyle.css' }],
              append: true,
              links: [{ path: 'the-href-1', attributes: { rel: 'the-rel-1', sizes: '16x16' } }]
            },
            {
              tags: [{ path: 'assets/astyle-2.css', sourcePath: 'spec/fixtures/astyle.css' }],
              append: false,
              links: [{ path: 'the-href-2', attributes: { rel: 'the-rel-2', sizes: '16x16' } }]
            }
          ]
        }), (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(3);
            expect($('link').length).toBe(5);
            expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
            expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
            expect($('script[id="loading-script"]').toString()).toContain('<script id="loading-script"');
            expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
            expect($('link[href="assets/astyle-1.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'assets/astyle-1.css', rel: 'stylesheet' } });
            expect($('link[href="the-href-1"]')).toBeTag({ tagName: 'link', attributes: { href: 'the-href-1', rel: 'the-rel-1', sizes: '16x16' } });
            expect($('link[href="assets/astyle-2.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'assets/astyle-2.css', rel: 'stylesheet' } });
            expect($('link[href="the-href-2"]')).toBeTag({ tagName: 'link', attributes: { href: 'the-href-2', rel: 'the-rel-2', sizes: '16x16' } });
            done();
          });
        });
      });

      it('should append links and tags together with a custom index.html template when append is set to false', done => {
        webpack(createWebpackConfig({
          htmlOptions: {
            template: path.join(__dirname, 'fixtures', 'index.html')
          },
          options: {
            tags: [{ path: 'assets/astyle.css', sourcePath: 'spec/fixtures/astyle.css' }],
            append: false,
            links: [{ path: 'the-href', attributes: { rel: 'the-rel', sizes: '16x16' } }]
          }
        }), (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(3);
            expect($('link').length).toBe(3);
            expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
            expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
            expect($('script[id="loading-script"]').toString()).toContain('<script id="loading-script"');
            expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
            expect($('link[href="assets/astyle.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'assets/astyle.css', rel: 'stylesheet' } });
            expect($('link[href="the-href"]')).toBeTag({ tagName: 'link', attributes: { href: 'the-href', rel: 'the-rel', sizes: '16x16' } });
            done();
          });
        });
      });

      it('should append links and tags together with a custom index.html template when append is set to true', done => {
        webpack(createWebpackConfig({
          htmlOptions: {
            template: path.join(__dirname, 'fixtures', 'index.html')
          },
          options: {
            tags: [{ path: 'assets/astyle.css', sourcePath: 'spec/fixtures/astyle.css' }],
            append: true,
            links: [{ path: 'the-href', attributes: { rel: 'the-rel', sizes: '16x16' } }]
          }
        }), (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(3);
            expect($('link').length).toBe(3);
            expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
            expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
            expect($('script[id="loading-script"]').toString()).toContain('<script id="loading-script"');
            expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
            expect($('link[href="the-href"]')).toBeTag({ tagName: 'link', attributes: { href: 'the-href', rel: 'the-rel', sizes: '16x16' } });
            expect($('link[href="assets/astyle.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'assets/astyle.css', rel: 'stylesheet' } });
            done();
          });
        });
      });

      it('should append links and tags together when append is set to false', done => {
        webpack(createWebpackConfig({
          options: {
            tags: [{ path: 'assets/astyle.css', sourcePath: 'spec/fixtures/astyle.css' }],
            append: false,
            links: [{ path: 'the-href', attributes: { rel: 'the-rel', sizes: '16x16' } }]
          }
        }), (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
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

      it('should append links and tags together when append is set to true', done => {
        webpack(createWebpackConfig({
          options: {
            tags: [{ path: 'assets/astyle.css', sourcePath: 'spec/fixtures/astyle.css' }],
            append: true,
            links: [{ path: 'the-href', attributes: { rel: 'the-rel', sizes: '16x16' } }]
          }
        }), (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
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
}

function runTestsForOption (options, createWebpackConfig) {
  const {
    optionName, // = 'tags' || 'scripts' || 'links'
    optionTag //   = 'script' || 'link'
  } = options;

  const isScript = optionTag === 'script';
  const optionAttr = isScript ? 'src' : 'href';
  const optionType = isScript ? 'js' : 'css';
  const ext = isScript ? '.js' : '.css';

  describe(`options.${optionName}`, () => {
    it(`should not include ${optionName} when an empty array is provided`, done => {
      webpack(createWebpackConfig({ options: { [optionName]: [] } }), (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
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
        fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
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
            path: `the-href${ext}`,
            attributes: { rel: 'the-rel' }
          }]
        }
      }), (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2 + (optionTag === 'script' ? 1 : 0));
          expect($('link').length).toBe(1 + (optionTag === 'link' ? 1 : 0));
          expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
          expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
          expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
          expect($(`${optionTag}[${optionAttr}="the-href${ext}"]`)).toBeTag({ tagName: optionTag, attributes: { [optionAttr]: `the-href${ext}`, rel: 'the-rel' } });
          expect($($(optionTag).get(0))).toBeTag({ tagName: optionTag, attributes: { [optionAttr]: `the-href${ext}`, rel: 'the-rel' } });
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
        fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
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
            { path: `assets/abc${ext}`, attributes: { id: 'abc' } },
            { path: `assets/def${ext}`, attributes: { id: 'def', media: 'screen' } },
            { path: `assets/ghi${ext}` }]
        }
      }), (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2 + (optionTag === 'script' ? 3 : 0));
          expect($('link').length).toBe(1 + (optionTag === 'link' ? 3 : 0));
          expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
          expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
          expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
          expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
          expect($(`${optionTag}[${optionAttr}="assets/abc${ext}"]`)).toBeTag({
            tagName: optionTag,
            attributes: {
              [optionAttr]: `assets/abc${ext}`,
              id: 'abc'
            }
          });
          expect($(`${optionTag}[${optionAttr}="assets/def${ext}"]`)).toBeTag({
            tagName: optionTag,
            attributes: {
              [optionAttr]: `assets/def${ext}`,
              id: 'def',
              media: 'screen'
            }
          });
          expect($(`${optionTag}[${optionAttr}="assets/ghi${ext}"]`)).toBeTag({
            tagName: optionTag,
            attributes: {
              [optionAttr]: `assets/ghi${ext}`
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
            { path: `assets/abc${ext}`, attributes: { id: 'abc' } },
            { path: `assets/def${ext}`, attributes: { id: 'def', media: 'screen' } },
            { path: `assets/ghi${ext}` }
          ],
          append: false,
          hash: true
        }
      }), (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        const hash = result.compilation.hash;
        fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2 + (optionTag === 'script' ? 3 : 0));
          expect($('link').length).toBe(1 + (optionTag === 'link' ? 3 : 0));
          expect($('script[src^="thePublicPath/app.js"]')).toBeTag({ tagName: 'script', attributes: { src: appendHash('thePublicPath/app.js', hash) } });
          expect($('script[src^="thePublicPath/style.js"]')).toBeTag({ tagName: 'script', attributes: { src: appendHash('thePublicPath/style.js', hash) } });
          expect($('link[href^="thePublicPath/style.css"]')).toBeTag({ tagName: 'link', attributes: { rel: 'stylesheet', href: appendHash('thePublicPath/style.css', hash) } });
          expect($(`${optionTag}[${optionAttr}^="thePublicPath/assets/abc${ext}"]`)).toBeTag({
            tagName: optionTag,
            attributes: {
              [optionAttr]: appendHash(`thePublicPath/assets/abc${ext}`, hash),
              id: 'abc'
            }
          });
          expect($(`${optionTag}[${optionAttr}^="thePublicPath/assets/def${ext}"]`)).toBeTag({
            tagName: optionTag,
            attributes: {
              [optionAttr]: appendHash(`thePublicPath/assets/def${ext}`, hash),
              id: 'def',
              media: 'screen'
            }
          });
          expect($(`${optionTag}[${optionAttr}^="thePublicPath/assets/ghi${ext}"]`)).toBeTag({
            tagName: optionTag,
            attributes: {
              [optionAttr]: appendHash(`thePublicPath/assets/ghi${ext}`, hash)
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
          fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
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
              { path: `/the-href${ext}`, publicPath: false, attributes: { rel: 'the-rel-a', a: 'abc', x: 'xyz' } },
              { path: `the-href-1${ext}`, publicPath: true, attributes: { rel: 'the-rel-b', a: '123', x: '789' } },
              { path: `the-href-2${ext}`, attributes: { rel: 'the-rel-c', a: '___', x: '---' } }
            ]
          }
        }), (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(2 + (optionTag === 'script' ? 3 : 0));
            expect($('link').length).toBe(1 + (optionTag === 'link' ? 3 : 0));
            expect($('script[src="' + publicPath + 'app.js"]')).toBeTag({ tagName: 'script', attributes: { src: publicPath + 'app.js' } });
            expect($('script[src="' + publicPath + 'style.js"]')).toBeTag({ tagName: 'script', attributes: { src: publicPath + 'style.js' } });
            expect($('link[href="' + publicPath + 'style.css"]')).toBeTag({ tagName: 'link', attributes: { href: publicPath + 'style.css', rel: 'stylesheet' } });
            expect($(`link[href="/the-href${ext}"]`)).toBeTag({ tagName: 'link', attributes: { href: `/the-href${ext}`, rel: 'the-rel-a', a: 'abc', x: 'xyz' } });
            expect($(`link[href="${publicPath}the-href-1${ext}"]`)).toBeTag({ tagName: 'link', attributes: { href: `${publicPath}the-href-1${ext}`, rel: 'the-rel-b', a: '123', x: '789' } });
            expect($(`link[href="${publicPath}the-href-2${ext}"]`)).toBeTag({ tagName: 'link', attributes: { href: `${publicPath}the-href-2${ext}`, rel: 'the-rel-c', a: '___', x: '---' } });
            done();
          });
        });
      });
    }
  });

  describe(`option.${optionName} glob`, () => {
    it(`should include any files for a ${optionName} glob that does match files`, done => {
      webpack(createWebpackConfig({
        copyOptions: [{ from: 'spec/fixtures/g*', to: 'assets/', flatten: true }],
        options: {
          [optionName]: [
            { path: 'assets/', globPath: 'spec/fixtures/', glob: `glob-a*${ext}` },
            { path: 'assets/', globPath: 'spec/fixtures/', glob: `glob-b*${ext}` }
          ],
          append: true
        }
      }), (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2 + (optionTag === 'script' ? 2 : 0));
          expect($('link').length).toBe(1 + (optionTag === 'link' ? 2 : 0));
          expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
          expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
          expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
          expect($(`${optionTag}[${optionAttr}="assets/glob-a${ext}"]`)).toBeTag({ tagName: optionTag, attributes: { [optionAttr]: `assets/glob-a${ext}` } });
          expect($(`${optionTag}[${optionAttr}="assets/glob-b${ext}"]`)).toBeTag({ tagName: optionTag, attributes: { [optionAttr]: `assets/glob-b${ext}` } });
          done();
        });
      });
    });

    it(`should include any files for a ${optionName} glob that does match files and has globFlatten false`, done => {
      webpack(createWebpackConfig({
        copyOptions: [{ from: 'spec/fixtures/a-dir*', to: 'assets/a-dir', flatten: false }],
        options: {
          [optionName]: [
            { path: 'assets/', globPath: 'spec/fixtures/', glob: `**/file-a*${ext}`, globFlatten: false },
            { path: 'assets/', globPath: 'spec/fixtures/', glob: `**/file-b*${ext}`, globFlatten: false }
          ],
          append: true
        }
      }), (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2 + (optionTag === 'script' ? 2 : 0));
          expect($('link').length).toBe(1 + (optionTag === 'link' ? 2 : 0));
          expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
          expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
          expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
          expect($(`${optionTag}[${optionAttr}="assets/a-dir/file-a${ext}"]`)).toBeTag({ tagName: optionTag, attributes: { [optionAttr]: `assets/a-dir/file-a${ext}` } });
          expect($(`${optionTag}[${optionAttr}="assets/a-dir/file-b${ext}"]`)).toBeTag({ tagName: optionTag, attributes: { [optionAttr]: `assets/a-dir/file-b${ext}` } });
          done();
        });
      });
    });

    it(`should include any files for a ${optionName} glob that does match files and has globFlatten true`, done => {
      webpack(createWebpackConfig({
        copyOptions: [{ from: 'spec/fixtures/a-dir*', to: 'assets', flatten: true }],
        options: {
          [optionName]: [
            { path: 'assets/', globPath: 'spec/fixtures/', glob: `**/file-a*${ext}`, globFlatten: true },
            { path: 'assets/', globPath: 'spec/fixtures/', glob: `**/file-b*${ext}`, globFlatten: true }
          ],
          append: true
        }
      }), (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2 + (optionTag === 'script' ? 2 : 0));
          expect($('link').length).toBe(1 + (optionTag === 'link' ? 2 : 0));
          expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
          expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
          expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
          expect($(`${optionTag}[${optionAttr}="assets/file-a${ext}"]`)).toBeTag({ tagName: optionTag, attributes: { [optionAttr]: `assets/file-a${ext}` } });
          expect($(`${optionTag}[${optionAttr}="assets/file-b${ext}"]`)).toBeTag({ tagName: optionTag, attributes: { [optionAttr]: `assets/file-b${ext}` } });
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
            path: `foobar${ext}`,
            sourcePath: path.join(FIXTURES_PATH, 'other')
          }
        }
      }), (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2 + (optionTag === 'script' ? 1 : 0));
          expect($('link').length).toBe(1 + (optionTag === 'link' ? 1 : 0));
          expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
          expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
          expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
          expect($(`${optionTag}[${optionAttr}="foobar${ext}"]`)).toBeTag({ tagName: optionTag, attributes: { [optionAttr]: `foobar${ext}` } });
          expect($($(optionTag).get(optionTag === 'script' ? 2 : 1))).toBeTag({ tagName: optionTag, attributes: { [optionAttr]: `foobar${ext}` } });
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
            path: `assets/afile${ext}`,
            sourcePath: 'spec/fixtures/other'
          }],
          append: false
        }
      }), (err, result) => {
        expect(err).toBeFalsy();
        expect(JSON.stringify(result.compilation.errors)).toBe('[]');
        fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
          expect(er).toBeFalsy();
          const $ = cheerio.load(data);
          expect($('script').length).toBe(2 + (optionTag === 'script' ? 1 : 0));
          expect($('link').length).toBe(1 + (optionTag === 'link' ? 1 : 0));
          expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
          expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
          expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
          expect($(`${optionTag}[${optionAttr}="assets/afile${ext}"]`)).toBeTag({ tagName: optionTag, attributes: { [optionAttr]: `assets/afile${ext}` } });
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
      // The error used to be thrown, but now the error is in the webpack compilation result
      // expect(theFunction).toThrowError(/(HtmlWebpackPlugin: could not load file)/);
    });
  });

  if (isScript) {
    describe(`options.${optionName} external`, () => {
      beforeEach(done => {
        rimraf(EXTERNALS_OUTPUT_DIR, done);
      });

      it(`should add the webpack external when external is used`, done => {
        webpack(createWebpackConfig({
          options: {
            [optionName]: {
              path: `foobar${ext}`,
              external: {
                packageName: '@scope/my-package',
                variableName: 'MyPackage'
              },
              sourcePath: path.join(FIXTURES_PATH, 'other')
            },
            prependExternals: true
          }
        }), (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          expect(JSON.stringify(result.compilation.options.externals)).toBe('{"@scope/my-package":"MyPackage"}');
          fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(2 + (optionTag === 'script' ? 1 : 0));
            expect($('link').length).toBe(1 + (optionTag === 'link' ? 1 : 0));
            expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
            expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
            expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
            expect($(`${optionTag}[${optionAttr}="foobar${ext}"]`)).toBeTag({ tagName: optionTag, attributes: { [optionAttr]: `foobar${ext}` } });
            expect($($(optionTag).get(0))).toBeTag({ tagName: optionTag, attributes: { [optionAttr]: `foobar${ext}` } });
            done();
          });
        });
      });

      it(`should not add the webpack external when external is not used`, done => {
        webpack(createWebpackConfig({
          options: {
            [optionName]: {
              path: `foobar${ext}`,
              sourcePath: path.join(FIXTURES_PATH, 'other')
            }
          }
        }), (err, result) => {
          expect(err).toBeFalsy();
          expect(JSON.stringify(result.compilation.errors)).toBe('[]');
          expect(JSON.stringify(result.compilation.options.externals)).toBe('{}');
          fs.readFile(FIXTURES_HTML_FILE, 'utf8', (er, data) => {
            expect(er).toBeFalsy();
            const $ = cheerio.load(data);
            expect($('script').length).toBe(2 + (optionTag === 'script' ? 1 : 0));
            expect($('link').length).toBe(1 + (optionTag === 'link' ? 1 : 0));
            expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
            expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
            expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });
            expect($(`${optionTag}[${optionAttr}="foobar${ext}"]`)).toBeTag({ tagName: optionTag, attributes: { [optionAttr]: `foobar${ext}` } });
            expect($($(optionTag).get(optionTag === 'script' ? 2 : 1))).toBeTag({ tagName: optionTag, attributes: { [optionAttr]: `foobar${ext}` } });
            done();
          });
        });
      });

      it('should remove the specified fake package from the webpack bundles when external option is specified', done => {
        webpack(createWebpackConfig({
          webpackEntry: EXTERNALS_ENTRY,
          webpackStyle: EXTERNALS_STYLE,
          webpackOutput: EXTERNALS_OUTPUT_DIR,
          options: {
            scripts: {
              path: 'fake-b',
              external: {
                packageName: 'fake-b-package',
                variableName: 'FakeB'
              }
            },
            append: true,
            publicPath: false
          }
        }), (webpackError, webpackResult) => {
          expect(webpackError).toBeFalsy();
          expect(JSON.stringify(webpackResult.compilation.errors)).toBe('[]');
          fs.readFile(EXTERNALS_HTML_FILE, 'utf8', (htmlError, htmlData) => {
            expect(htmlError).toBeFalsy();
            const $ = cheerio.load(htmlData);
            expect($('script').length).toBe(3);
            expect($('link').length).toBe(1);
            expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
            expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
            expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });

            fs.readFile(path.join(EXTERNALS_OUTPUT_DIR, 'app.js'), 'utf8', (appError, appData) => {
              expect(appError).toBeFalsy();

              expect(appData).toContain('% webpack fakeA %');
              expect(appData).not.toContain('% webpack fakeB %');
              expect(appData).toContain('% webpack fakeC %');

              done();
            });
          });
        });
      });

      it('should not remove any fake packages when external option is not specified', done => {
        webpack(createWebpackConfig({
          webpackEntry: EXTERNALS_ENTRY,
          webpackStyle: EXTERNALS_STYLE,
          webpackOutput: EXTERNALS_OUTPUT_DIR,
          options: {
            scripts: {
              path: 'fake-b'
            },
            append: true,
            publicPath: false
          }
        }), (webpackError, webpackResult) => {
          expect(webpackError).toBeFalsy();
          expect(JSON.stringify(webpackResult.compilation.errors)).toBe('[]');
          fs.readFile(EXTERNALS_HTML_FILE, 'utf8', (htmlError, htmlData) => {
            expect(htmlError).toBeFalsy();
            const $ = cheerio.load(htmlData);
            expect($('script').length).toBe(2 + (optionTag === 'script' ? 1 : 0));
            expect($('link').length).toBe(1 + (optionTag === 'link' ? 1 : 0));
            expect($('script[src="style.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'style.js' } });
            expect($('script[src="app.js"]')).toBeTag({ tagName: 'script', attributes: { src: 'app.js' } });
            expect($('link[href="style.css"]')).toBeTag({ tagName: 'link', attributes: { href: 'style.css', rel: 'stylesheet' } });

            fs.readFile(path.join(EXTERNALS_OUTPUT_DIR, 'app.js'), 'utf8', (appError, appData) => {
              expect(appError).toBeFalsy();

              expect(appData).toContain('% webpack fakeA %');
              expect(appData).toContain('% webpack fakeB %');
              expect(appData).toContain('% webpack fakeC %');

              done();
            });
          });
        });
      });
    });
  }
}
