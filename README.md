# now-and-later

## Usage

```js
var nal = require('now-and-later');

function fn1(done){
  done(null, 1);
}

function fn2(done){
  done(null, 2);
}

function before(key){
  console.log('called before: ', key);
}

function after(key){
  console.log('called after: ', key);
}

function error(key){
  console.log('called after error in: ', key);
}

/*
  Calling series with an object can't guarantee order
  It uses Object.keys to get an order
  It is better to use an array if order must be guaranteed
 */
nal.series({
  fn1: fn1,
  fn2: fn2
}, {
  before: before,
  after: after,
  error: error
});

nal.parallel({
  fn1: fn1,
  fn2: fn2
}, {
  before: before,
  after: after,
  error: error
});
```
