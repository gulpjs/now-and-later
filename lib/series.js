'use strict';

var asyncDone = require('async-done');

var helpers = require('./helpers');

function series(values, iterator, extensions, done){
  // allow for iterator to not be specified
  if(typeof iterator !== 'function'){
    done = extensions;
    extensions = iterator;
    iterator = asyncDone;
  }

  // allow for extensions to not be specified
  if(typeof extensions === 'function'){
    done = extensions;
    extensions = {};
  }

  // handle no callback case
  if(typeof done !== 'function'){
    done = helpers.noop;
  }

  // will throw if non-object
  var keys = Object.keys(values);
  // return the same type as passed in
  var results = Array.isArray(values) ? [] : {};
  var length = keys.length;
  var idx = 0;

  var exts = helpers.defaultExtensions(extensions);

  var key = keys[idx];
  next(key);

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

      if(++idx >= length){
        done(err, results);
      } else {
        next(keys[idx], done);
      }
    }
  }
}

module.exports = series;
