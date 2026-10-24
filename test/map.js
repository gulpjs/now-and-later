"use strict";

var assert = require("node:assert");
var { describe, it } = require("node:test");

var nal = require("../");

describe("map", function () {
  it("will execute without an extension object", function (t, done) {
    var initial = [1, 2, 3];
    function iterator(value, key, cb) {
      cb(null, value);
    }

    nal.map(initial, iterator, function (err, result) {
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

    nal.map(initial, iterator);
  });

  it("should execute with array", function (t, done) {
    var initial = [1, 2, 3];

    function iterator(value, key, cb) {
      cb(null, value);
    }

    nal.map(initial, iterator, function (err, result) {
      assert.deepStrictEqual(initial, result);
      done(err);
    });
  });

  it("executes with an empty array", function (t, done) {
    var initial = [];

    function iterator(value, key, cb) {
      cb(null, value);
    }

    nal.map(initial, iterator, function (err, result) {
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

    nal.map(initial, iterator, function (err, result) {
      assert.deepStrictEqual(initial, result);
      done(err);
    });
  });

  it("executes with an empty object", function (t, done) {
    var initial = {};

    function iterator(value, key, cb) {
      cb(null, value);
    }

    nal.map(initial, iterator, function (err, result) {
      assert.deepStrictEqual(initial, result);
      done(err);
    });
  });

  it("should throw if first argument is a non-object", function () {
    function nonObject() {
      nal.map("nope");
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

    nal.map([1, 3, 2], iterator, function (err, result) {
      assert.deepStrictEqual(callOrder, [1, 2, 3]);
      assert.deepStrictEqual(result, [2, 6, 4]);
      done(err);
    });
  });

  it("should not mutate the original array", function (t, done) {
    var initial = [1, 2, 3];

    function iterator(value, key, cb) {
      cb(null, value);
    }

    nal.map(initial, iterator, function (err, result) {
      assert.notStrictEqual(initial, result);
      assert.deepStrictEqual(initial, result);
      done(err);
    });
  });

  it("should fail when an error occurs", function (t, done) {
    function iterator(value, key, cb) {
      cb(new Error("Boom"));
    }

    nal.map([1, 2, 3], iterator, function (err) {
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

    nal.map(initial, iterator, function (err, result) {
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

    nal.map(initial, iterator, extensions, function (err, result) {
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

    nal.map(initial, iterator, extensions, function (err) {
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

    nal.map(initial, iterator, extensions, done);
  });

  it("passes the key as the second argument to iterator (array)", function (t, done) {
    var initial = [1, 2, 3];
    var results = [];

    function iterator(value, key, cb) {
      results.push(key);
      cb(null, value);
    }

    nal.map(initial, iterator, function (err) {
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

    nal.map(initial, iterator, function (err) {
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
        // Triggered after the callback:
        assert.strictEqual(cbCount, 1);
        // This result should be ignored:
        cb("bang");
        // Finish the test here:
        done();
      } else {
        // NOT expected to get here:
        assert.fail("should not be reached");
      }
    }

    nal.map(initial, iterator, function (err, res) {
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

      // Wait for the parallel map function to finish
      // (last iterator call is triggered after this callback)
    });
  });

  it("runs at maximum concurrency by default", function (t, done) {
    var createOrder = [];
    var beforeOrder = [];
    var afterOrder = [];

    var options = {
      create: function (value, idx) {
        createOrder.push(idx);
        return { idx: idx, value: value };
      },
      before: function (storage) {
        beforeOrder.push(storage.idx);
      },
      after: function (result, storage) {
        afterOrder.push(storage.idx);
      },
    };

    function iterator(value, key, cb) {
      setTimeout(function () {
        cb(null, value);
      }, value * 25);
    }

    nal.map([10, 5, 1], iterator, options, function (err) {
      assert.deepStrictEqual(createOrder, ["0", "1", "2"]);
      assert.deepStrictEqual(beforeOrder, ["0", "1", "2"]);
      assert.deepStrictEqual(afterOrder, ["2", "1", "0"]);
      done(err);
    });
  });

  it("allows limiting concurrency to 1 via options", function (t, done) {
    var createOrder = [];
    var beforeOrder = [];
    var afterOrder = [];

    var options = {
      // Concurrency of 1 basically makes a series runner
      concurrency: 1,
      create: function (value, idx) {
        createOrder.push(idx);
        return { idx: idx, value: value };
      },
      before: function (storage) {
        beforeOrder.push(storage.idx);
      },
      after: function (result, storage) {
        afterOrder.push(storage.idx);
      },
    };

    function iterator(value, key, cb) {
      setTimeout(function () {
        cb(null, value);
      }, value * 25);
    }

    nal.map([10, 5, 1], iterator, options, function (err) {
      assert.deepStrictEqual(createOrder, ["0", "1", "2"]);
      assert.deepStrictEqual(beforeOrder, ["0", "1", "2"]);
      assert.deepStrictEqual(afterOrder, ["0", "1", "2"]);
      done(err);
    });
  });

  it("allows limiting concurrency to 2 via options", function (t, done) {
    var createOrder = [];
    var beforeOrder = [];
    var afterOrder = [];

    var options = {
      // Concurrency of 2
      concurrency: 2,
      create: function (value, idx) {
        createOrder.push(idx);
        return { idx: idx, value: value };
      },
      before: function (storage) {
        beforeOrder.push(storage.idx);
      },
      after: function (result, storage) {
        afterOrder.push(storage.idx);
      },
    };

    function iterator(value, key, cb) {
      setTimeout(function () {
        cb(null, value);
      }, value * 25);
    }

    nal.map([10, 1, 20, 5], iterator, options, function (err) {
      assert.deepStrictEqual(createOrder, ["0", "1", "2", "3"]);
      assert.deepStrictEqual(beforeOrder, ["0", "1", "2", "3"]);
      assert.deepStrictEqual(afterOrder, ["1", "0", "3", "2"]);
      done(err);
    });
  });
});
