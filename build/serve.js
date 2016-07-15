var path = require('path');
var url = require('url');

var closure = require('closure-util');
var nomnom = require('nomnom');

var log = closure.log;

/**
 * Create a debug server for ol and Closure Library sources.
 * @param {function(Error, closure.Server)} callback Callback.
 * @param {boolean} loadTests whether the tests should be loaded
 */
var createServer = exports.createServer = function(callback, loadTests) {
  var lib = [
    'src/**/*.js'
  ];

  if (loadTests) {
    lib.push('test/**/*.test.js');
  }
  var manager = new closure.Manager({
    closure: true, // use the bundled Closure Library
    lib: lib,
    ignoreRequires: '^ol\\.'
  });
  manager.on('error', function(e) {
    log.error('ol3-google-maps', e.message);
  });
  manager.on('ready', function() {
    server = new closure.Server({
      manager: manager,
      loader: '/@loader'
    });
    callback(null, server);
  });
};

/**
 * If running this module directly start the server.
 */
if (require.main === module) {
  var options = nomnom.options({
    port: {
      abbr: 'p',
      'default': 4000,
      help: 'Port for incoming connections',
      metavar: 'PORT'
    },
    loglevel: {
      abbr: 'l',
      choices: ['silly', 'verbose', 'info', 'warn', 'error'],
      'default': 'info',
      help: 'Log level',
      metavar: 'LEVEL'
    }
  }).parse();

  /** @type {string} */
  log.level = options.loglevel;

  log.info('ol3-google-maps', 'Parsing dependencies...');

  createServer(function(err, server) {
    if (err) {
      log.error('ol3-google-maps', 'Parsing failed');
      log.error('ol3-google-maps', err.message);
      process.exit(1);
    }
    server.listen(options.port, function() {
      log.info('ol3-google-maps', 'Listening on http://localhost:' +
         options.port + '/ (Ctrl+C to stop)');
      });
    server.on('error', function(err) {
      log.error('ol3-google-maps', 'Server failed to start: ' + err.message);
      process.exit(1);
    });
  });
}
