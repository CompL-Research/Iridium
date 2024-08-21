// Copyright (c) 2012 Ecma International.  All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
/*---
description: |
    Provides both:

    - An error class to avoid false positives when testing for thrown exceptions
    - A function to explicitly throw an exception using the Test262Error class
defines: [Test262Error, $DONOTEVALUATE]
---*/


function Test262Error(message) {
  this.message = message || "";
}

Test262Error.prototype.toString = function () {
  return "Test262Error: " + this.message;
};

Test262Error.thrower = function (message) {
  throw new Test262Error(message);
};

function $DONOTEVALUATE() {
  throw "Test262: This statement should not be evaluated.";
}

// Copyright (C) 2017 Ecma International.  All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
/*---
description: |
    Collection of functions used to safely verify the correctness of
    property descriptors.
defines:
  - verifyProperty
  - verifyEqualTo # deprecated
  - verifyWritable # deprecated
  - verifyNotWritable # deprecated
  - verifyEnumerable # deprecated
  - verifyNotEnumerable # deprecated
  - verifyConfigurable # deprecated
  - verifyNotConfigurable # deprecated
---*/

// @ts-check

/**
 * @param {object} obj
 * @param {string|symbol} name
 * @param {PropertyDescriptor|undefined} desc
 * @param {object} [options]
 * @param {boolean} [options.restore]
 */
function verifyProperty(obj, name, desc, options) {
  assert(
    arguments.length > 2,
    'verifyProperty should receive at least 3 arguments: obj, name, and descriptor'
  );

  var originalDesc = Object.getOwnPropertyDescriptor(obj, name);
  var nameStr = String(name);

  // Allows checking for undefined descriptor if it's explicitly given.
  if (desc === undefined) {
    assert.sameValue(
      originalDesc,
      undefined,
      "obj['" + nameStr + "'] descriptor should be undefined"
    );

    // desc and originalDesc are both undefined, problem solved;
    return true;
  }

  assert(
    Object.prototype.hasOwnProperty.call(obj, name),
    "obj should have an own property " + nameStr
  );

  assert.notSameValue(
    desc,
    null,
    "The desc argument should be an object or undefined, null"
  );

  assert.sameValue(
    typeof desc,
    "object",
    "The desc argument should be an object or undefined, " + String(desc)
  );

  var names = Object.getOwnPropertyNames(desc);
  for (var i = 0; i < names.length; i++) {
    assert(
      names[i] === "value" ||
        names[i] === "writable" ||
        names[i] === "enumerable" ||
        names[i] === "configurable" ||
        names[i] === "get" ||
        names[i] === "set",
      "Invalid descriptor field: " + names[i],
    );
  }

  var failures = [];

  if (Object.prototype.hasOwnProperty.call(desc, 'value')) {
    if (!isSameValue(desc.value, originalDesc.value)) {
      failures.push("descriptor value should be " + desc.value);
    }
    if (!isSameValue(desc.value, obj[name])) {
      failures.push("object value should be " + desc.value);
    }
  }

  if (Object.prototype.hasOwnProperty.call(desc, 'enumerable')) {
    if (desc.enumerable !== originalDesc.enumerable ||
        desc.enumerable !== isEnumerable(obj, name)) {
      failures.push('descriptor should ' + (desc.enumerable ? '' : 'not ') + 'be enumerable');
    }
  }

  if (Object.prototype.hasOwnProperty.call(desc, 'writable')) {
    if (desc.writable !== originalDesc.writable ||
        desc.writable !== isWritable(obj, name)) {
      failures.push('descriptor should ' + (desc.writable ? '' : 'not ') + 'be writable');
    }
  }

  if (Object.prototype.hasOwnProperty.call(desc, 'configurable')) {
    if (desc.configurable !== originalDesc.configurable ||
        desc.configurable !== isConfigurable(obj, name)) {
      failures.push('descriptor should ' + (desc.configurable ? '' : 'not ') + 'be configurable');
    }
  }

  assert(!failures.length, failures.join('; '));

  if (options && options.restore) {
    Object.defineProperty(obj, name, originalDesc);
  }

  return true;
}

function isConfigurable(obj, name) {
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  try {
    delete obj[name];
  } catch (e) {
    if (!(e instanceof TypeError)) {
      throw new Test262Error("Expected TypeError, got " + e);
    }
  }
  return !hasOwnProperty.call(obj, name);
}

function isEnumerable(obj, name) {
  var stringCheck = false;

  if (typeof name === "string") {
    for (var x in obj) {
      if (x === name) {
        stringCheck = true;
        break;
      }
    }
  } else {
    // skip it if name is not string, works for Symbol names.
    stringCheck = true;
  }

  return stringCheck &&
    Object.prototype.hasOwnProperty.call(obj, name) &&
    Object.prototype.propertyIsEnumerable.call(obj, name);
}

function isSameValue(a, b) {
  if (a === 0 && b === 0) return 1 / a === 1 / b;
  if (a !== a && b !== b) return true;

  return a === b;
}

var __isArray = Array.isArray;
function isWritable(obj, name, verifyProp, value) {
  var unlikelyValue = __isArray(obj) && name === "length" ?
    Math.pow(2, 32) - 1 :
    "unlikelyValue";
  var newValue = value || unlikelyValue;
  var hadValue = Object.prototype.hasOwnProperty.call(obj, name);
  var oldValue = obj[name];
  var writeSucceeded;

  try {
    obj[name] = newValue;
  } catch (e) {
    if (!(e instanceof TypeError)) {
      throw new Test262Error("Expected TypeError, got " + e);
    }
  }

  writeSucceeded = isSameValue(obj[verifyProp || name], newValue);

  // Revert the change only if it was successful (in other cases, reverting
  // is unnecessary and may trigger exceptions for certain property
  // configurations)
  if (writeSucceeded) {
    if (hadValue) {
      obj[name] = oldValue;
    } else {
      delete obj[name];
    }
  }

  return writeSucceeded;
}

/**
 * Deprecated; please use `verifyProperty` in new tests.
 */
function verifyEqualTo(obj, name, value) {
  if (!isSameValue(obj[name], value)) {
    throw new Test262Error("Expected obj[" + String(name) + "] to equal " + value +
           ", actually " + obj[name]);
  }
}

/**
 * Deprecated; please use `verifyProperty` in new tests.
 */
function verifyWritable(obj, name, verifyProp, value) {
  if (!verifyProp) {
    assert(Object.getOwnPropertyDescriptor(obj, name).writable,
         "Expected obj[" + String(name) + "] to have writable:true.");
  }
  if (!isWritable(obj, name, verifyProp, value)) {
    throw new Test262Error("Expected obj[" + String(name) + "] to be writable, but was not.");
  }
}

/**
 * Deprecated; please use `verifyProperty` in new tests.
 */
function verifyNotWritable(obj, name, verifyProp, value) {
  if (!verifyProp) {
    assert(!Object.getOwnPropertyDescriptor(obj, name).writable,
         "Expected obj[" + String(name) + "] to have writable:false.");
  }
  if (isWritable(obj, name, verifyProp)) {
    throw new Test262Error("Expected obj[" + String(name) + "] NOT to be writable, but was.");
  }
}

/**
 * Deprecated; please use `verifyProperty` in new tests.
 */
function verifyEnumerable(obj, name) {
  assert(Object.getOwnPropertyDescriptor(obj, name).enumerable,
       "Expected obj[" + String(name) + "] to have enumerable:true.");
  if (!isEnumerable(obj, name)) {
    throw new Test262Error("Expected obj[" + String(name) + "] to be enumerable, but was not.");
  }
}

/**
 * Deprecated; please use `verifyProperty` in new tests.
 */
function verifyNotEnumerable(obj, name) {
  assert(!Object.getOwnPropertyDescriptor(obj, name).enumerable,
       "Expected obj[" + String(name) + "] to have enumerable:false.");
  if (isEnumerable(obj, name)) {
    throw new Test262Error("Expected obj[" + String(name) + "] NOT to be enumerable, but was.");
  }
}

/**
 * Deprecated; please use `verifyProperty` in new tests.
 */
function verifyConfigurable(obj, name) {
  assert(Object.getOwnPropertyDescriptor(obj, name).configurable,
       "Expected obj[" + String(name) + "] to have configurable:true.");
  if (!isConfigurable(obj, name)) {
    throw new Test262Error("Expected obj[" + String(name) + "] to be configurable, but was not.");
  }
}

/**
 * Deprecated; please use `verifyProperty` in new tests.
 */
function verifyNotConfigurable(obj, name) {
  assert(!Object.getOwnPropertyDescriptor(obj, name).configurable,
       "Expected obj[" + String(name) + "] to have configurable:false.");
  if (isConfigurable(obj, name)) {
    throw new Test262Error("Expected obj[" + String(name) + "] NOT to be configurable, but was.");
  }
}

// Copyright (C) 2017 Ecma International.  All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
/*---
description: |
defines: [$DONE]
---*/

function __consolePrintHandle__(msg) {
  print(msg);
}

function $DONE(error) {
  if (error) {
    if(typeof error === 'object' && error !== null && 'name' in error) {
      __consolePrintHandle__('Test262:AsyncTestFailure:' + error.name + ': ' + error.message);
    } else {
      __consolePrintHandle__('Test262:AsyncTestFailure:Test262Error: ' + String(error));
    }
  } else {
    __consolePrintHandle__('Test262:AsyncTestComplete');
  }
}

// Copyright (C) 2017 Ecma International.  All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
/*---
description: |
    Collection of assertion functions used throughout test262
defines: [assert]
---*/


function assert(mustBeTrue, message) {
  if (mustBeTrue === true) {
    return;
  }

  if (message === undefined) {
    message = 'Expected true but got ' + assert._toString(mustBeTrue);
  }
  throw new Test262Error(message);
}

assert._isSameValue = function (a, b) {
  if (a === b) {
    // Handle +/-0 vs. -/+0
    return a !== 0 || 1 / a === 1 / b;
  }

  // Handle NaN vs. NaN
  return a !== a && b !== b;
};

assert.sameValue = function (actual, expected, message) {
  try {
    if (assert._isSameValue(actual, expected)) {
      return;
    }
  } catch (error) {
    throw new Test262Error(message + ' (_isSameValue operation threw) ' + error);
    return;
  }

  if (message === undefined) {
    message = '';
  } else {
    message += ' ';
  }

  message += 'Expected SameValue(«' + assert._toString(actual) + '», «' + assert._toString(expected) + '») to be true';

  throw new Test262Error(message);
};

assert.notSameValue = function (actual, unexpected, message) {
  if (!assert._isSameValue(actual, unexpected)) {
    return;
  }

  if (message === undefined) {
    message = '';
  } else {
    message += ' ';
  }

  message += 'Expected SameValue(«' + assert._toString(actual) + '», «' + assert._toString(unexpected) + '») to be false';

  throw new Test262Error(message);
};

assert.throws = function (expectedErrorConstructor, func, message) {
  var expectedName, actualName;
  if (typeof func !== "function") {
    throw new Test262Error('assert.throws requires two arguments: the error constructor ' +
      'and a function to run');
    return;
  }
  if (message === undefined) {
    message = '';
  } else {
    message += ' ';
  }

  try {
    func();
  } catch (thrown) {
    if (typeof thrown !== 'object' || thrown === null) {
      message += 'Thrown value was not an object!';
      throw new Test262Error(message);
    } else if (thrown.constructor !== expectedErrorConstructor) {
      expectedName = expectedErrorConstructor.name;
      actualName = thrown.constructor.name;
      if (expectedName === actualName) {
        message += 'Expected a ' + expectedName + ' but got a different error constructor with the same name';
      } else {
        message += 'Expected a ' + expectedName + ' but got a ' + actualName;
      }
      throw new Test262Error(message);
    }
    return;
  }

  message += 'Expected a ' + expectedErrorConstructor.name + ' to be thrown but no exception was thrown at all';
  throw new Test262Error(message);
};

assert._toString = function (value) {
  try {
    if (value === 0 && 1 / value === -Infinity) {
      return '-0';
    }

    return String(value);
  } catch (err) {
    if (err.name === 'TypeError') {
      return Object.prototype.toString.call(value);
    }

    throw err;
  }
};

// Copyright (C) 2017 Ecma International.  All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
/*---
description: |
    Compare the contents of two arrays
defines: [compareArray]
---*/

function compareArray(a, b) {
  if (b.length !== a.length) {
    return false;
  }

  for (var i = 0; i < a.length; i++) {
    if (!compareArray.isSameValue(b[i], a[i])) {
      return false;
    }
  }
  return true;
}

compareArray.isSameValue = function(a, b) {
  if (a === 0 && b === 0) return 1 / a === 1 / b;
  if (a !== a && b !== b) return true;

  return a === b;
};

compareArray.format = function(arrayLike) {
  return `[${[].map.call(arrayLike, String).join(', ')}]`;
};

assert.compareArray = function(actual, expected, message) {
  message  = message === undefined ? '' : message;

  if (typeof message === 'symbol') {
    message = message.toString();
  }

  assert(actual != null, `First argument shouldn't be nullish. ${message}`);
  assert(expected != null, `Second argument shouldn't be nullish. ${message}`);
  var format = compareArray.format;
  var result = compareArray(actual, expected);

  // The following prevents actual and expected from being iterated and evaluated
  // more than once unless absolutely necessary.
  if (!result) {
    assert(false, `Expected ${format(actual)} and ${format(expected)} to have the same contents. ${message}`);
  }
};

// Copyright (C) 2016 the V8 project authors. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
/*---
description: |
    This defines the number of consecutive recursive function calls that must be
    made in order to prove that stack frames are properly destroyed according to
    ES2015 tail call optimization semantics.
defines: [$MAX_ITERATIONS]
---*/




var $MAX_ITERATIONS = 100000;

// Copyright (c) 2020 Ecma International.  All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-assignment-operators-runtime-semantics-evaluation
description: >
    The LeftHandSideExpression is evaluated before the AssignmentExpression.
features: [logical-assignment-operators]

---*/

function DummyError() { }

assert.throws(DummyError, function() {
  var base = null;
  var prop = function() {
    throw new DummyError();
  };
  var expr = function() {
    throw new Test262Error("right-hand side expression evaluated");
  };

  base[prop()] &&= expr();
});

assert.throws(TypeError, function() {
  var base = null;
  var prop = {
    toString: function() {
      throw new Test262Error("property key evaluated");
    }
  };
  var expr = function() {
    throw new Test262Error("right-hand side expression evaluated");
  };

  base[prop] &&= expr();
});

var count = 0;
var obj = {};
function incr() {
  return ++count;
}

assert.sameValue(obj[incr()] &&= incr(), undefined, "obj[incr()] &&= incr()");
assert.sameValue(obj[1], undefined, "obj[1]");
assert.sameValue(count, 1, "count");

obj[2] = 1;
assert.sameValue(obj[incr()] &&= incr(), 3, "obj[incr()] &&= incr()");
assert.sameValue(obj[2], 3, "obj[2]");
assert.sameValue(count, 3, "count");

