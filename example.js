'use strict';

var nowAndLater = require('./');
var asyncDone = require('async-done');

function fn1(done){
  console.log('fn1 called');
  done(null, 1);
}

function fn2(done){
  console.log('fn2 called');
  setTimeout(function(){
    console.log('fn2 timeout');
    done(null, 2);
  }, 500);
}

function fn3(done){
  done(new Error('fn3 threw'));
}

var uid = 0;

function create(fn, key){
  return {
    uid: uid++,
    key: key
  };
}

function before(storage){
  console.log('before', storage);
}

function after(storage){
  console.log('after', storage);
}

function error(storage){
  console.log('error', storage);
}

// var parallel = nowAndLater.parallel({
//   fn1: fn1,
//   fn2: fn2
// }, asyncDone, {
//   create: create,
//   before: before,
//   after: after,
//   error: error
// }, console.log);

nowAndLater.series([fn1, fn2, fn3], asyncDone, {
  create: create,
  before: before,
  after: after,
  error: error
}, console.log);
