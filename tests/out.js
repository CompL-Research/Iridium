function assert(mustBeTrue, message) {
  let ifTest$2 = mustBeTrue;
  let ifTest$3 = true;
  let ifTest$1 = ifTest$2 === ifTest$3;
  if (ifTest$1) {
    return;
  }
  let ifTest$5 = message;
  let ifTest$6 = undefined;
  let ifTest$4 = ifTest$5 === ifTest$6;
  if (ifTest$4) {
    let ifTrue$8 = 'Expected true but got ';
    let ifTrue$9 = assert._toString(mustBeTrue);
    let ifTrue$7 = ifTrue$8 + ifTrue$9;
    let ifTrue$10 = message = ifTrue$7;
  }
  let js3$12 = Test262Error;
  let js3$13 = message;
  let js3$11 = new js3$12(js3$13);
  throw js3$11;
}
let js3$39 = assert._isSameValue = function (a, b) {
  let ifTest$15 = a;
  let ifTest$16 = b;
  let ifTest$14 = ifTest$15 === ifTest$16;
  if (ifTest$14) {
    let returnStmt$19 = a;
    let returnStmt$20 = 0;
    let returnStmt$18 = returnStmt$19 !== returnStmt$20;
    let returnStmt$21 = returnStmt$18;
    let returnStmt$29 = !returnStmt$18;
    if (returnStmt$29) {
      let returnStmt$24 = 1;
      let returnStmt$25 = a;
      let returnStmt$23 = returnStmt$24 / returnStmt$25;
      let returnStmt$27 = 1;
      let returnStmt$28 = b;
      let returnStmt$26 = returnStmt$27 / returnStmt$28;
      let returnStmt$22 = returnStmt$23 === returnStmt$26;
      returnStmt$21 = returnStmt$22
    }
    let returnStmt$17 = returnStmt$21;
    return returnStmt$17;
  }
  let returnStmt$32 = a;
  let returnStmt$33 = a;
  let returnStmt$31 = returnStmt$32 !== returnStmt$33;
  let returnStmt$34 = returnStmt$31;
  let returnStmt$38 = returnStmt$31;
  if (returnStmt$38) {
    let returnStmt$36 = b;
    let returnStmt$37 = b;
    let returnStmt$35 = returnStmt$36 !== returnStmt$37;
    returnStmt$34 = returnStmt$35
  }
  let returnStmt$30 = returnStmt$34;
  return returnStmt$30;
};
let js3$66 = assert.sameValue = function (actual, expected, message) {
  try {
    let ifTest$40 = assert._isSameValue(actual, expected);
    if (ifTest$40) {
      return;
    }
  } catch (error) {
    let js3$42 = Test262Error;
    let js3$45 = message;
    let js3$46 = ' (_isSameValue operation threw) ';
    let js3$44 = js3$45 + js3$46;
    let js3$47 = error;
    let js3$43 = js3$44 + js3$47;
    let js3$41 = new js3$42(js3$43);
    throw js3$41;
    return;
  }
  let ifTest$49 = message;
  let ifTest$50 = undefined;
  let ifTest$48 = ifTest$49 === ifTest$50;
  if (ifTest$48) {
    let ifTrue$51 = message = '';
  } else {
    let ifFalse$52 = message += ' ';
  }
  let js3$57 = 'Expected SameValue(«';
  let js3$58 = assert._toString(actual);
  let js3$56 = js3$57 + js3$58;
  let js3$59 = '», «';
  let js3$55 = js3$56 + js3$59;
  let js3$60 = assert._toString(expected);
  let js3$54 = js3$55 + js3$60;
  let js3$61 = '») to be true';
  let js3$53 = js3$54 + js3$61;
  let js3$62 = message += js3$53;
  let js3$64 = Test262Error;
  let js3$65 = message;
  let js3$63 = new js3$64(js3$65);
  throw js3$63;
};
let js3$87 = assert.notSameValue = function (actual, unexpected, message) {
  let ifTest$68 = assert._isSameValue(actual, unexpected);
  let ifTest$67 = !ifTest$68;
  if (ifTest$67) {
    return;
  }
  let ifTest$70 = message;
  let ifTest$71 = undefined;
  let ifTest$69 = ifTest$70 === ifTest$71;
  if (ifTest$69) {
    let ifTrue$72 = message = '';
  } else {
    let ifFalse$73 = message += ' ';
  }
  let js3$78 = 'Expected SameValue(«';
  let js3$79 = assert._toString(actual);
  let js3$77 = js3$78 + js3$79;
  let js3$80 = '», «';
  let js3$76 = js3$77 + js3$80;
  let js3$81 = assert._toString(unexpected);
  let js3$75 = js3$76 + js3$81;
  let js3$82 = '») to be false';
  let js3$74 = js3$75 + js3$82;
  let js3$83 = message += js3$74;
  let js3$85 = Test262Error;
  let js3$86 = message;
  let js3$84 = new js3$85(js3$86);
  throw js3$84;
};
let js3$152 = assert.throws = function (expectedErrorConstructor, func, message) {
  var expectedName;
  var actualName;
  let ifTest$89 = typeof func;
  let ifTest$90 = "function";
  let ifTest$88 = ifTest$89 !== ifTest$90;
  if (ifTest$88) {
    let ifTrue$92 = Test262Error;
    let ifTrue$94 = 'assert.throws requires two arguments: the error constructor ';
    let ifTrue$95 = 'and a function to run';
    let ifTrue$93 = ifTrue$94 + ifTrue$95;
    let ifTrue$91 = new ifTrue$92(ifTrue$93);
    throw ifTrue$91;
    return;
  }
  let ifTest$97 = message;
  let ifTest$98 = undefined;
  let ifTest$96 = ifTest$97 === ifTest$98;
  if (ifTest$96) {
    let ifTrue$99 = message = '';
  } else {
    let ifFalse$100 = message += ' ';
  }
  try {
    let js3$101 = func();
  } catch (thrown) {
    let ifTest$104 = typeof thrown;
    let ifTest$105 = 'object';
    let ifTest$103 = ifTest$104 !== ifTest$105;
    let ifTest$106 = ifTest$103;
    let ifTest$110 = !ifTest$103;
    if (ifTest$110) {
      let ifTest$108 = thrown;
      let ifTest$109 = null;
      let ifTest$107 = ifTest$108 === ifTest$109;
      ifTest$106 = ifTest$107
    }
    let ifTest$102 = ifTest$106;
    if (ifTest$102) {
      let ifTrue$111 = message += 'Thrown value was not an object!';
      let ifTrue$113 = Test262Error;
      let ifTrue$114 = message;
      let ifTrue$112 = new ifTrue$113(ifTrue$114);
      throw ifTrue$112;
    } else {
      let ifTest$116 = thrown.constructor;
      let ifTest$117 = expectedErrorConstructor;
      let ifTest$115 = ifTest$116 !== ifTest$117;
      if (ifTest$115) {
        let ifTrue$118 = expectedErrorConstructor.name;
        let ifTrue$119 = expectedName = ifTrue$118;
        let ifTrue$121 = thrown.constructor;
        let ifTrue$120 = ifTrue$121.name;
        let ifTrue$122 = actualName = ifTrue$120;
        let ifTest$124 = expectedName;
        let ifTest$125 = actualName;
        let ifTest$123 = ifTest$124 === ifTest$125;
        if (ifTest$123) {
          let ifTrue$128 = 'Expected a ';
          let ifTrue$129 = expectedName;
          let ifTrue$127 = ifTrue$128 + ifTrue$129;
          let ifTrue$130 = ' but got a different error constructor with the same name';
          let ifTrue$126 = ifTrue$127 + ifTrue$130;
          let ifTrue$131 = message += ifTrue$126;
        } else {
          let ifFalse$135 = 'Expected a ';
          let ifFalse$136 = expectedName;
          let ifFalse$134 = ifFalse$135 + ifFalse$136;
          let ifFalse$137 = ' but got a ';
          let ifFalse$133 = ifFalse$134 + ifFalse$137;
          let ifFalse$138 = actualName;
          let ifFalse$132 = ifFalse$133 + ifFalse$138;
          let ifFalse$139 = message += ifFalse$132;
        }
        let ifTrue$141 = Test262Error;
        let ifTrue$142 = message;
        let ifTrue$140 = new ifTrue$141(ifTrue$142);
        throw ifTrue$140;
      }
    }
    return;
  }
  let js3$145 = 'Expected a ';
  let js3$146 = expectedErrorConstructor.name;
  let js3$144 = js3$145 + js3$146;
  let js3$147 = ' to be thrown but no exception was thrown at all';
  let js3$143 = js3$144 + js3$147;
  let js3$148 = message += js3$143;
  let js3$150 = Test262Error;
  let js3$151 = message;
  let js3$149 = new js3$150(js3$151);
  throw js3$149;
};
let js3$172 = assert._toString = function (value) {
  try {
    let ifTest$155 = value;
    let ifTest$156 = 0;
    let ifTest$154 = ifTest$155 === ifTest$156;
    let ifTest$157 = ifTest$154;
    let ifTest$163 = ifTest$154;
    if (ifTest$163) {
      let ifTest$160 = 1;
      let ifTest$161 = value;
      let ifTest$159 = ifTest$160 / ifTest$161;
      let ifTest$162 = -Infinity;
      let ifTest$158 = ifTest$159 === ifTest$162;
      ifTest$157 = ifTest$158
    }
    let ifTest$153 = ifTest$157;
    if (ifTest$153) {
      return '-0';
    }
    let returnStmt$164 = String(value);
    return returnStmt$164;
  } catch (err) {
    let ifTest$166 = err.name;
    let ifTest$167 = 'TypeError';
    let ifTest$165 = ifTest$166 === ifTest$167;
    if (ifTest$165) {
      let returnStmt$170 = Object.prototype;
      let returnStmt$169 = returnStmt$170.toString;
      let returnStmt$168 = returnStmt$169.call(value);
      return returnStmt$168;
    }
    let js3$171 = err;
    throw js3$171;
  }
};
function Test262Error(message) {
  let js3$177 = this.message = (() => {
    let js3$174 = message;
    let js3$175 = js3$174;
    let js3$176 = !js3$174;
    if (js3$176) {
      js3$175 = ""
    }
    let js3$173 = js3$175;
    return js3$173;
  })();
}
let js3$178 = Test262Error.prototype;
let js3$182 = js3$178.toString = function () {
  let returnStmt$180 = "Test262Error: ";
  let returnStmt$181 = this.message;
  let returnStmt$179 = returnStmt$180 + returnStmt$181;
  return returnStmt$179;
};
let js3$186 = Test262Error.thrower = function (message) {
  let js3$184 = Test262Error;
  let js3$185 = message;
  let js3$183 = new js3$184(js3$185);
  throw js3$183;
};
function $DONOTEVALUATE() {
  let js3$187 = "Test262: This statement should not be evaluated.";
  throw js3$187;
}
{
  let js3$188 = 1;
}
let js3$189 = 2;
// Copyright (C) 2017 Ecma International.  All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
/*---
description: |
    Collection of assertion functions used throughout test262
defines: [assert]
---*/

// Handle +/-0 vs. -/+0

// Handle NaN vs. NaN

// Copyright (c) 2012 Ecma International.  All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
/*---
description: |
    Provides both:

    - An error class to avoid false positives when testing for thrown exceptions
    - A function to explicitly throw an exception using the Test262Error class
defines: [Test262Error, $DONOTEVALUATE]
---*/

// Copyright 2009 the Sputnik authors.  All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
info: Check {} for automatic semicolon insertion
es5id: 7.9_A10_T7
description: Checking if execution of "{1} 2" passes
---*/

//CHECK#1
