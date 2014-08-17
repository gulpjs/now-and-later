'use strict';

var nowAndLater = require('./');

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

function before(key){
  console.log('before', key);
}

function after(key){
  console.log('after', key);
}

function error(key){
  console.log('error', key);
}

nowAndLater.parallel({
  fn1: fn1,
  fn2: fn2,
  fn3: fn3
}, {
  before: before,
  after: after,
  error: error
})(console.log);

// nowAndLater.series({
//   fn1: fn1,
//   fn2: fn2,
//   fn3: fn3
// }, {
//   before: before,
//   after: after,
//   error: error
// })(console.log);
