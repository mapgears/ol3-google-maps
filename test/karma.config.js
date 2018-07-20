/* eslint-env node, es6 */

const path = require('path');

module.exports = function(karma) {
  karma.set({
    browserDisconnectTolerance: 2,
    frameworks: ['mocha', 'chai'],
    client: {
      runInParent: true,
      mocha: {
        timeout: 2500
      }
    },
    files: [
      `https://maps.googleapis.com/maps/api/js?v=3&key=${process.env.GOOGLE_MAPS_API_KEY}`,
      {
        pattern: path.resolve(__dirname, './index_test.js'),
        watched: false
      }
    ],
    exclude: [
      '**/*.test.js'
    ],
    preprocessors: {
      '**/*.js': ['webpack', 'sourcemap']
    },
    reporters: ['progress'],
    webpack: {
      devtool: 'inline-source-map',
      mode: 'development',
      resolve: {
        modules: [path.resolve(__dirname, '..', 'src'), 'node_modules']
      },
      module: {
        rules: [{
          use: {
            loader: 'buble-loader'
          },
          test: /\.js$/
        }]
      }
    },
    webpackMiddleware: {
      noInfo: true
    },
    crossOriginAttribute: false,
    browsers: ['PhantomJS']
  });

  if (process.env.TRAVIS) {
    karma.set({
      reporters: ['dots'],
      browserDisconnectTimeout: 10000,
      browserDisconnectTolerance: 1,
      captureTimeout: 240000,
      browserNoActivityTimeout: 240000,
      preprocessors: {
        '../src/**/*.js': ['coverage']
      },
      coverageReporter: {
        reporters: [
          {
            type: 'lcovonly', // that's enough for coveralls, no HTML
            dir: '../coverage/',
            subdir: '.'
          },
          {
            type: 'text-summary' // prints the textual summary to the terminal
          }
        ]
      }
    });
  }
};
