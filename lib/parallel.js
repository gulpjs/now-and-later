'use strict';

var once = require('once');

var helpers = require('./helpers');

function parallel(values, iterator, extensions, done){
  // allow for extensions to not be specified
  if(typeof extensions === 'function'){
    done = extensions;
    extensions = {};
  }

  // handle no callback case
  if(typeof done !== 'function'){
    done = helpers.noop;
  }

  done = once(done);

  // will throw if non-object
  var keys = Object.keys(values);
  var length = keys.length;
  var count = length;
  var idx = 0;
  // return the same type as passed in
  var results = helpers.initializeResults(values);

  var exts = helpers.defaultExtensions(extensions);

  for(idx = 0; idx < length; idx++){
    var key = keys[idx];
    next(key);
  }

  function next(key){
    var fn = values[key];

    var storage = exts.create(fn, key);

    exts.before(storage);
    iterator(fn, handler);

    function handler(err, result){
      if(err){
        exts.error(storage);
        return done(err, results);
      }

      exts.after(storage);
      results[key] = result;
      if(--count === 0){
        done(err, results);
      }
    }
  }
}

module.exports = parallel;
