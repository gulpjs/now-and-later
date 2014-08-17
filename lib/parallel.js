'use strict';

var assert = require('assert');

var asyncDone = require('async-done');

var helpers = require('./helpers');

function parallel(functions, extensions){
  var keys = Object.keys(functions);

  assert.ok(keys, 'First argument must be an array or object');

  var results = Array.isArray(functions) ? [] : {};
  var length = keys.length;
  var count = length;
  var idx = 0;

  var exts = helpers.defaultExtensions(extensions);

  function next(key, done){
    var fn = functions[key];

    exts.before(key);
    asyncDone(fn, handler);

    function handler(err, result){
      if(err){
        exts.error(key);
        return done(err, results);
      }

      exts.after(key);
      results[key] = result;

      if(--count === 0){
        done(err, results);
      }
    }
  }

  return function(done){
    done = done || helpers.noop;
    for(idx = 0; idx < length; idx++){
      var key = keys[idx];
      next(key, done);
    }
  };
}

module.exports = parallel;
