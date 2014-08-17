# now-and-later

Series/parallel execution of async functions with extension points

## Usage

```js
var nal = require('now-and-later');

function fn1(done){
  done(null, 1);
}

function fn2(done){
  done(null, 2);
}

function before(fn, key){
  console.log('called before: ', fn.name, key);
}

function after(fn, key){
  console.log('called after: ', fn.name, key);
}

function error(fn, key){
  console.log('called after error in: ', fn.name, key);
}

/*
  Calling series with an object can't guarantee order
  It uses Object.keys to get an order
  It is better to use an array if order must be guaranteed
 */
nal.series([fn1, fn2], {
  before: before,
  after: after,
  error: error
}, console.log);

nal.parallel({
  fn1: fn1,
  fn2: fn2
}, {
  before: before,
  after: after,
  error: error
}, console.log);
```
