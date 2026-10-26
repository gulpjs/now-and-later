"use strict";

var assert = require("node:assert");
var { describe, it } = require("node:test");

var nal = require("../");

describe("mapSeries", function () {
  it("will execute without an extension object", function (t, done) {
    var initial = [1, 2, 3];

    function iterator(value, key, cb) {
      cb(null, value);
    }

    nal.mapSeries(initial, iterator, function (err, result) {
      assert.deepStrictEqual(initial, result);
      done(err);
    });
  });

  it("should execute without a final callback", function (t, done) {
    var initial = [1, 2, 3];
    var result = [];

    function iterator(value, key, cb) {
      result.push(value);
      if (result.length === initial.length) {
        assert.deepStrictEqual(initial, result);
        done();
      }
      cb(null, value);
    }

    nal.mapSeries(initial, iterator);
  });

  it("should execute with array", function (t, done) {
    var initial = [1, 2, 3];

    function iterator(value, key, cb) {
      cb(null, value);
    }

    nal.mapSeries(initial, iterator, function (err, result) {
      assert.deepStrictEqual(initial, result);
      done(err);
    });
  });

  it("executes with an empty array", function (t, done) {
    var initial = [];

    function iterator(value, key, cb) {
      cb(null, value);
    }

    nal.mapSeries(initial, iterator, function (err, result) {
      assert.deepStrictEqual(initial, result);
      done(err);
    });
  });

  it("should execute with an object", function (t, done) {
    var initial = {
      test: 1,
      test2: 2,
      test3: 3,
    };

    function iterator(value, key, cb) {
      cb(null, value);
    }

    nal.mapSeries(initial, iterator, function (err, result) {
      assert.deepStrictEqual(initial, result);
      done(err);
    });
  });

  it("executes with an empty object", function (t, done) {
    var initial = {};

    function iterator(value, key, cb) {
      cb(null, value);
    }

    nal.mapSeries(initial, iterator, function (err, result) {
      assert.deepStrictEqual(initial, result);
      done(err);
    });
  });

  it("should throw if first argument is a non-object", function () {
    function nonObject() {
      nal.mapSeries("nope");
    }

    assert.throws(nonObject);
  });

  it("should maintain order", function (t, done) {
    var callOrder = [];

    function iterator(value, key, cb) {
      setTimeout(function () {
        callOrder.push(value);
        cb(null, value * 2);
      }, value * 25);
    }

    nal.mapSeries([1, 3, 2], iterator, function (err, result) {
      assert.deepStrictEqual(callOrder, [1, 3, 2]);
      assert.deepStrictEqual(result, [2, 6, 4]);
      done(err);
    });
  });

  it("should not mutate the original array", function (t, done) {
    var initial = [1, 2, 3];

    function iterator(value, key, cb) {
      cb(null, value);
    }

    nal.mapSeries(initial, iterator, function (err, result) {
      assert.notStrictEqual(initial, result);
      assert.deepStrictEqual(initial, result);
      done(err);
    });
  });

  it("should fail when an error occurs", function (t, done) {
    function iterator(value, key, cb) {
      cb(new Error("Boom"));
    }

    nal.mapSeries([1, 2, 3], iterator, function (err) {
      assert.ok(err instanceof Error);
      assert.deepStrictEqual(err.message, "Boom");
      done();
    });
  });

  it("should ignore multiple calls to the callback inside iterator", function (t, done) {
    var initial = [1, 2, 3];

    function iterator(value, key, cb) {
      cb(null, value);
      cb(null, value * 2);
    }

    nal.mapSeries(initial, iterator, function (err, result) {
      assert.deepStrictEqual(initial, result);
      done(err);
    });
  });

  it("should take extension points and call them for each function", function (t, done) {
    var initial = [1, 2, 3];
    var create = [];
    var before = [];
    var after = [];

    function iterator(value, key, cb) {
      cb(null, value);
    }

    var extensions = {
      create: function (value, idx) {
        assert.deepStrictEqual(initial.includes(value), true);
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

    nal.mapSeries(initial, iterator, extensions, function (err, result) {
      assert.deepStrictEqual(initial, create);
      assert.deepStrictEqual(initial, before);
      assert.deepStrictEqual(result, after);
      done(err);
    });
  });

  it("should call the error extension point upon error", function (t, done) {
    var initial = [1, 2, 3];
    var error = [];

    function iterator(value, key, cb) {
      cb(new Error("Boom"));
    }

    var extensions = {
      create: function () {
        return {};
      },
      error: function (err) {
        error = err;
      },
    };

    nal.mapSeries(initial, iterator, extensions, function (err) {
      assert.deepStrictEqual(err, error);
      done();
    });
  });

  it("should pass an empty object if falsy value is returned from create", function (t, done) {
    var initial = [1, 2, 3];

    function iterator(value, key, cb) {
      cb(null, value);
    }

    var extensions = {
      create: function () {
        return null;
      },
      before: function (storage) {
        assert.deepStrictEqual(typeof storage, "object");
        assert.deepStrictEqual(storage, {});
      },
    };

    nal.mapSeries(initial, iterator, extensions, done);
  });

  it("passes the key as the second argument to iterator (array)", function (t, done) {
    var initial = [1, 2, 3];
    var results = [];

    function iterator(value, key, cb) {
      results.push(key);
      cb(null, value);
    }

    nal.mapSeries(initial, iterator, function (err) {
      assert.deepStrictEqual(results, ["0", "1", "2"]);
      done(err);
    });
  });

  it("passes the key as the second argument to iterator (object)", function (t, done) {
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

    nal.mapSeries(initial, iterator, function (err) {
      assert.deepStrictEqual(results, ["test", "test2", "test3"]);
      done(err);
    });
  });

  it("reports partial result after an error", function (t, done) {
    var initial = {
      test1: "a",
      test2: "b",
      test3: "c",
      test4: "d",
    };

    var testedKeys = [];

    var cbCount = 0;

    function iterator(value, key, cb) {
      testedKeys.push(key);

      if (key === "test1") {
        cb(null, value);
      } else if (key === "test2") {
        cb(null, key);
      } else if (key === "test3") {
        // Report an error here
        cb("Boom");
      } else if (key === "test4") {
        // NOT assert.deepStrictEqualed to get here:
        assert.strictEqual(false, true);
        cb("crash");
      } else {
        assert.fail("should not be reached");
        cb("crash");
      }
    }

    nal.mapSeries(initial, iterator, function (err, res) {
      assert.deepStrictEqual(res, {
        test1: "a",
        test2: "test2",
        test3: undefined,
        test4: undefined,
      });

      assert.strictEqual(err, "Boom");

      assert.deepStrictEqual(testedKeys, ["test1", "test2", "test3"]);

      assert.strictEqual(cbCount, 0);
      ++cbCount;

      done();
    });
  });
});
