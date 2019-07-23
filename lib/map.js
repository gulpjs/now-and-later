'use strict';

var once = require('once');

var helpers = require('./helpers');

function getMaxConcurrentIterations() {
  var envVar = process.env['NAL_MAX_CONCURRENCY'];
  var parsed = envVar && parseInt(envVar);
  return parsed && parsed > 0 ? parsed : Number.MAX_SAFE_INTEGER;
}

function map(values, iterator, extensions, done) {
  // Allow for extensions to not be specified
  if (typeof extensions === 'function') {
    done = extensions;
    extensions = {};
  }

  // Handle no callback case
  if (typeof done !== 'function') {
    done = helpers.noop;
  }

  done = once(done);

  // Will throw if non-object
  var keys = Object.keys(values);
  var length = keys.length;
  var count = length;
  var idx = 0;
  // Return the same type as passed in
  var results = helpers.initializeResults(values);

  var exts = helpers.defaultExtensions(extensions);

  if (length === 0) {
    return done(null, results);
  }

  var maxConcurrent = getMaxConcurrentIterations();
  var running = 0;
  var sync = false;
  kickoff();

  function kickoff() {
    if (sync) {
      return;
    }
    sync = true;
    while (running < maxConcurrent && idx < length) {
      var key = keys[idx];
      next(key);
      idx++;
    }
    sync = false;
  }

  function next(key) {
    running++;
    var value = values[key];

    var storage = exts.create(value, key) || {};

    exts.before(storage);
    iterator(value, key, once(handler));

    function handler(err, result) {
      running--;
      if (err) {
        exts.error(err, storage);
        return done(err, results);
      }

      exts.after(result, storage);
      results[key] = result;
      if (--count === 0) {
        done(err, results);
      } else {
        kickoff();
      }
    }
  }
}

module.exports = map;
