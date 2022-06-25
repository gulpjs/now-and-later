'use strict';

var expect = require('expect');

var nal = require('../');

describe('map', function () {
  it('will execute without an extension object', function (done) {
    var initial = [1, 2, 3];

    function iterator(value, key, cb) {
      cb(null, value);
    }

    nal.map(initial, iterator, function (err, result) {
      expect(initial).toEqual(result);
      done(err);
    });
  });

  it('should execute without a final callback', function (done) {
    var initial = [1, 2, 3];
    var result = [];

    function iterator(value, key, cb) {
      result.push(value);
      if (result.length === initial.length) {
        expect(initial).toEqual(result);
        done();
      }
      cb(null, value);
    }

    nal.map(initial, iterator);
  });

  it('should execute with array', function (done) {
    var initial = [1, 2, 3];

    function iterator(value, key, cb) {
      cb(null, value);
    }

    nal.map(initial, iterator, function (err, result) {
      expect(initial).toEqual(result);
      done(err);
    });
  });

  it('executes with an empty array', function (done) {
    var initial = [];

    function iterator(value, key, cb) {
      cb(null, value);
    }

    nal.map(initial, iterator, function (err, result) {
      expect(initial).toEqual(result);
      done(err);
    });
  });

  it('should execute with an object', function (done) {
    var initial = {
      test: 1,
      test2: 2,
      test3: 3,
    };

    function iterator(value, key, cb) {
      cb(null, value);
    }

    nal.map(initial, iterator, function (err, result) {
      expect(initial).toEqual(result);
      done(err);
    });
  });

  it('executes with an empty object', function (done) {
    var initial = {};

    function iterator(value, key, cb) {
      cb(null, value);
    }

    nal.map(initial, iterator, function (err, result) {
      expect(initial).toEqual(result);
      done(err);
    });
  });

  it('should throw if first argument is a non-object', function (done) {
    function nonObject() {
      nal.map('nope');
    }

    expect(nonObject).toThrow(Error);
    done();
  });

  it('should maintain order', function (done) {
    var callOrder = [];

    function iterator(value, key, cb) {
      setTimeout(function () {
        callOrder.push(value);
        cb(null, value * 2);
      }, value * 25);
    }

    nal.map([1, 3, 2], iterator, function (err, result) {
      expect(callOrder).toEqual([1, 2, 3]);
      expect(result).toEqual([2, 6, 4]);
      done(err);
    });
  });

  it('should not mutate the original array', function (done) {
    var initial = [1, 2, 3];

    function iterator(value, key, cb) {
      cb(null, value);
    }

    nal.map(initial, iterator, function (err, result) {
      expect(initial === result).toEqual(false);
      expect(initial).toEqual(result);
      done(err);
    });
  });

  it('should fail when an error occurs', function (done) {
    function iterator(value, key, cb) {
      cb(new Error('Boom'));
    }

    nal.map([1, 2, 3], iterator, function (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toEqual('Boom');
      done();
    });
  });

  it('should ignore multiple calls to the callback inside iterator', function (done) {
    var initial = [1, 2, 3];

    function iterator(value, key, cb) {
      cb(null, value);
      cb(null, value * 2);
    }

    nal.map(initial, iterator, function (err, result) {
      expect(initial).toEqual(result);
      done(err);
    });
  });

  it('should take extension points and call them for each function', function (done) {
    var initial = [1, 2, 3];
    var create = [];
    var before = [];
    var after = [];

    function iterator(value, key, cb) {
      cb(null, value);
    }

    var extensions = {
      create: function (value, idx) {
        expect(initial).toContain(value);
        create[idx] = value;
        return { idx: idx, value: value };
      },
      before: function (storage) {
        before[storage.idx] = storage.value;
      },
      after: function (result, storage) {
        after[storage.idx] = result;
      },
    };

    nal.map(initial, iterator, extensions, function (err, result) {
      expect(initial).toEqual(create);
      expect(initial).toEqual(before);
      expect(result).toEqual(after);
      done(err);
    });
  });

  it('should call the error extension point upon error', function (done) {
    var initial = [1, 2, 3];
    var error = [];

    function iterator(value, key, cb) {
      cb(new Error('Boom'));
    }

    var extensions = {
      create: function () {
        return {};
      },
      error: function (err) {
        error = err;
      },
    };

    nal.map(initial, iterator, extensions, function (err) {
      expect(err).toEqual(error);
      done();
    });
  });

  it('should pass an empty object if falsy value is returned from create', function (done) {
    var initial = [1, 2, 3];

    function iterator(value, key, cb) {
      cb(null, value);
    }

    var extensions = {
      create: function () {
        return null;
      },
      before: function (storage) {
        expect(typeof storage).toEqual('object');
        expect(storage).toEqual({});
      },
    };

    nal.map(initial, iterator, extensions, done);
  });

  it('passes the key as the second argument to iterator (array)', function (done) {
    var initial = [1, 2, 3];
    var results = [];

    function iterator(value, key, cb) {
      results.push(key);
      cb(null, value);
    }

    nal.map(initial, iterator, function (err) {
      expect(results).toEqual(['0', '1', '2']);
      done(err);
    });
  });

  it('passes the key as the second argument to iterator (object)', function (done) {
    var initial = {
      test: 1,
      test2: 2,
      test3: 3,
    };
    var results = [];

    function iterator(value, key, cb) {
      results.push(key);
      cb(null, value);
    }

    nal.map(initial, iterator, function (err) {
      expect(results).toEqual(['test', 'test2', 'test3']);
      done(err);
    });
  });

  it('reports partial result after an error', function (done) {
    var initial = {
      test1: 'a',
      test2: 'b',
      test3: 'c',
      test4: 'd',
    };

    var testedKeys = [];

    var cbCount = 0;

    function iterator(value, key, cb) {
      testedKeys.push(key);

      if (key === 'test1') {
        cb(null, value);
      } else if (key === 'test2') {
        cb(null, key);
      } else if (key === 'test3') {
        // Report an error here
        cb('Boom');
      } else if (key === 'test4') {
        // Triggered after the callback:
        expect(cbCount).toBe(1);
        // This result should be ignored:
        cb('bang');
        // Finish the test here:
        done();
      } else {
        // NOT expected to get here:
        expect(false).toBe(true);
        cb('crash');
      }
    }

    nal.map(initial, iterator, function (err, res) {
      expect(res).toEqual({
        test1: 'a',
        test2: 'test2',
        test3: undefined,
        test4: undefined,
      });

      expect(err).toBe('Boom');

      expect(testedKeys).toEqual(['test1', 'test2', 'test3']);

      expect(cbCount).toBe(0);
      ++cbCount;

      // Wait for the parallel map function to finish
      // (last iterator call is triggered after this callback)
    });
  });
});
