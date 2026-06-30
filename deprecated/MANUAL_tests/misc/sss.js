"use strict";

function _toArray(r) {
  let returnStmt$4 = _arrayWithHoles(r);
  let returnStmt$5 = returnStmt$4;
  let returnStmt$7 = !returnStmt$4;
  if (returnStmt$7) {
    let returnStmt$6 = _iterableToArray(r);
    returnStmt$5 = returnStmt$6
  }
  let returnStmt$3 = returnStmt$5;
  let returnStmt$8 = returnStmt$3;
  let returnStmt$10 = !returnStmt$3;
  if (returnStmt$10) {
    let returnStmt$9 = _unsupportedIterableToArray(r);
    returnStmt$8 = returnStmt$9
  }
  let returnStmt$2 = returnStmt$8;
  let returnStmt$11 = returnStmt$2;
  let returnStmt$13 = !returnStmt$2;
  if (returnStmt$13) {
    let returnStmt$12 = _nonIterableRest();
    returnStmt$11 = returnStmt$12
  }
  let returnStmt$1 = returnStmt$11;
  return returnStmt$1;
}
function _nonIterableRest() {
  let js3$15 = TypeError;
  let js3$16 = "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.";
  let js3$14 = new js3$15(js3$16);
  throw js3$14;
}
function _unsupportedIterableToArray(r, a) {
  var t = undefined;
  let ifTest$17 = r;
  if (ifTest$17) {
    let ifTest$19 = "string";
    let ifTest$20 = typeof r;
    let ifTest$18 = ifTest$19 == ifTest$20;
    if (ifTest$18) {
      let returnStmt$21 = _arrayLikeToArray(r, a);
      return returnStmt$21;
    }
    let ifTrue$25 = {};
    let ifTrue$24 = ifTrue$25.toString;
    let ifTrue$23 = ifTrue$24.call(r);
    let ifTrue$22 = ifTrue$23.slice(8, -1);
    var t = ifTrue$22;
    let returnStmt$29 = "Object";
    let returnStmt$30 = t;
    let returnStmt$28 = returnStmt$29 === returnStmt$30;
    let returnStmt$31 = returnStmt$28;
    let returnStmt$33 = returnStmt$28;
    if (returnStmt$33) {
      let returnStmt$32 = r.constructor;
      returnStmt$31 = returnStmt$32
    }
    let returnStmt$27 = returnStmt$31;
    let returnStmt$34 = returnStmt$27;
    let returnStmt$38 = returnStmt$27;
    if (returnStmt$38) {
      let returnStmt$36 = r.constructor;
      let returnStmt$35 = returnStmt$36.name;
      let AssnRes$37 = t = returnStmt$35;
      returnStmt$34 = AssnRes$37
    }
    let returnStmt$26 = returnStmt$34;
    let returnStmt$41 = "Map";
    let returnStmt$42 = t;
    let returnStmt$40 = returnStmt$41 === returnStmt$42;
    let returnStmt$43 = returnStmt$40;
    let returnStmt$47 = !returnStmt$40;
    if (returnStmt$47) {
      let returnStmt$45 = "Set";
      let returnStmt$46 = t;
      let returnStmt$44 = returnStmt$45 === returnStmt$46;
      returnStmt$43 = returnStmt$44
    }
    let returnStmt$39 = returnStmt$43;
    let returnStmt$48;
    if (returnStmt$39) {
      let returnStmt$49 = Array.from(r);
      returnStmt$48 = returnStmt$49
    } else {
      let returnStmt$52 = "Arguments";
      let returnStmt$53 = t;
      let returnStmt$51 = returnStmt$52 === returnStmt$53;
      let returnStmt$54 = returnStmt$51;
      let returnStmt$57 = !returnStmt$51;
      if (returnStmt$57) {
        let returnStmt$56 = /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/;
        let returnStmt$55 = returnStmt$56.test(t);
        returnStmt$54 = returnStmt$55
      }
      let returnStmt$50 = returnStmt$54;
      let returnStmt$58;
      if (returnStmt$50) {
        let returnStmt$59 = _arrayLikeToArray(r, a);
        returnStmt$58 = returnStmt$59
      } else {
        let returnStmt$61 = 0;
        let returnStmt$60 = void returnStmt$61;
        returnStmt$58 = returnStmt$60
      }
      returnStmt$48 = returnStmt$58
    }
    return returnStmt$48;
  }
}
function _arrayLikeToArray(r, a) {
  var e = undefined;
  var n = undefined;
  let js3$65 = null;
  let js3$66 = a;
  let js3$64 = js3$65 == js3$66;
  let js3$67 = js3$64;
  let js3$71 = !js3$64;
  if (js3$71) {
    let js3$69 = a;
    let js3$70 = r.length;
    let js3$68 = js3$69 > js3$70;
    js3$67 = js3$68
  }
  let js3$63 = js3$67;
  let js3$72 = js3$63;
  let js3$75 = js3$63;
  if (js3$75) {
    let js3$73 = r.length;
    let AssnRes$74 = a = js3$73;
    js3$72 = AssnRes$74
  }
  let js3$62 = js3$72;
  for (var e = 0, n = Array(a); e < a; e++) {
    let js3$76 = r[e];
    let AssnRes$77 = n[e] = js3$76;
    ;
  }
  let returnStmt$78 = n;
  return returnStmt$78;
}
function _iterableToArray(r) {
  let ifTest$82 = "undefined";
  let ifTest$83 = typeof Symbol;
  let ifTest$81 = ifTest$82 != ifTest$83;
  let ifTest$84 = ifTest$81;
  let ifTest$89 = ifTest$81;
  if (ifTest$89) {
    let ifTest$86 = null;
    let ifTest$88 = Symbol.iterator;
    let ifTest$87 = r[ifTest$88];
    let ifTest$85 = ifTest$86 != ifTest$87;
    ifTest$84 = ifTest$85
  }
  let ifTest$80 = ifTest$84;
  let ifTest$90 = ifTest$80;
  let ifTest$95 = !ifTest$80;
  if (ifTest$95) {
    let ifTest$92 = null;
    let ifTest$94 = "@@iterator";
    let ifTest$93 = r[ifTest$94];
    let ifTest$91 = ifTest$92 != ifTest$93;
    ifTest$90 = ifTest$91
  }
  let ifTest$79 = ifTest$90;
  if (ifTest$79) {
    let returnStmt$96 = Array.from(r);
    return returnStmt$96;
  }
}
function _arrayWithHoles(r) {
  let ifTest$97 = Array.isArray(r);
  if (ifTest$97) {
    let returnStmt$98 = r;
    return returnStmt$98;
  }
}
var _x$a = undefined;
var a = undefined;
var _ref2 = undefined;
var _a = undefined;
var boo = undefined;
var b = undefined;
var x = undefined;
var res = undefined;
var _x$a;
try {
  var a = 1;
} catch (_ref) {
  let js3$99 = _toArray(_ref);
  var _ref2 = js3$99;
  let js3$101 = 0;
  let js3$100 = _ref2[js3$101];
  var _a = js3$100;
  let js3$104 = _ref2.slice(1);
  let js3$103 = js3$104.x;
  let js3$102 = js3$103.y;
  var boo = js3$102;
  var b = 2;
}
let js3$106 = {
  b: function b() {
    let returnStmt$107 = this.xx;
    return returnStmt$107;
  },
  xx: 10
};
let js3$105 = {
  a: js3$106
};
var x = js3$105;
let js3$113 = x;
let js3$114 = null;
let js3$112 = js3$113 === js3$114;
let js3$115 = js3$112;
let js3$120 = !js3$112;
if (js3$120) {
  let js3$117 = x;
  let js3$119 = 0;
  let js3$118 = void js3$119;
  let js3$116 = js3$117 === js3$118;
  js3$115 = js3$116
}
let js3$111 = js3$115;
let js3$121 = js3$111;
let js3$126 = !js3$111;
if (js3$126) {
  let js3$123 = x.a;
  let AssnRes$124 = _x$a = js3$123;
  let js3$125 = null;
  let js3$122 = AssnRes$124 === js3$125;
  js3$121 = js3$122
}
let js3$110 = js3$121;
let js3$127 = js3$110;
let js3$132 = !js3$110;
if (js3$132) {
  let js3$129 = _x$a;
  let js3$131 = 0;
  let js3$130 = void js3$131;
  let js3$128 = js3$129 === js3$130;
  js3$127 = js3$128
}
let js3$109 = js3$127;
let js3$133;
if (js3$109) {
  let js3$135 = 0;
  let js3$134 = void js3$135;
  js3$133 = js3$134
} else {
  let js3$137 = _x$a.b;
  let js3$136 = js3$137.bind(_x$a);
  js3$133 = js3$136
}
let js3$108 = js3$133();
var res = js3$108;
let js3$138 = console.log(res);
// // 1.
// import "source";
// import { x as y } from "source";
// import * as x from "source";
// import z from "source";

// // 2.
// let ID = 1
// let local = 1
// export default ID
// export { local as remote }
// export { local as remote2 } from "FROM"
// export * as REMOTE from "FROM"
// export * from "FROM"

// // 3. 
// debugger;
// // return...
// throw 1;

// // 4.
// function foo() {
//   let test = "foo";
// }

// // 5. Ifstmt
// let t = false;
// if (t) {
//   let a = 1;
// }
// if (t) {
//   let a = 123;
//   if (!t) {
//     let b = 121;
//   }
// } else {
//   let b = 123;
//   if (b) {
//     let x = 14;
//   } else {
//     let x = 1;
//   }
// }

// function fn() {
//   var a = 1;
//   try {
//     throw 'stuff3';
//   } catch (a) {
//     // catch parameter shadowing var variable
//     console.log(a, 'stuff3');
//   }
//   console.log(a, 1);
// }
// fn()

// try {
//   let a = 1;
// } finally {
//   let b = 2;
// }

// try {
//   let a = 1;
// } catch {
//   let b = 2;
// } finally {
//   let c = 3;
// }
