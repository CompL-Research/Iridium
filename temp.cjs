"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;
var _test = _interopRequireDefault(require("./temp.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
// // 1.
// import "source";
// import { zxx as y } from "source";
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
//   let a = `ABC${t}def`;
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

// // 6. FunctionScope
// function fn() {
//   var a = 1;
//   try {
//     throw 'stuff3';
//     return;
//   } catch (a) {
//     // catch parameter shadowing var variable
//     console.log(a, 'stuff3');
//   }
//   console.log(a, 1);
//   return foo;
// }
// fn()

// // 7.Try Catch
// try {
//   var xxa = 1;
// } catch([a, ...{x: { y: boo }}]) {
//   let b = 2;
// }
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
//   var caas = 3;
// }

// 8. Template Literals
// let a = `a,b,c${g}da`
// let b = tag`a,b,c${g}da`

// // 9. Call Expression
// let f = function(a,b,c) {  }

// f(a,b*c,(b*c,6,7) );
// g.h.i(a,b*c,(b*c,6,7) );
// (g?.h)?.i(a,b*c,(b*c,6,7) );

// 10. CallExpressions
// import("boo");
// f(a,b*c,(b*c,6,7));
// c. Super [ID,...ID]
// d. V8IntrinsicIdentifier [ID,...ID]

// // 11. Meta Property
// function Foo() {
//   import.meta
//   if (!new.target) {
//     throw new Error("Foo() must be called with new");
//   }
//   console.log("Foo instantiated with new");
// }
// new Foo(); // Logs "Foo instantiated with new"
// Foo(); // Throws "Foo() must be called with new"

// // 12. Yield/Await
// async function* Foo() {
//   yield 
//   yield 10;
//   await 10;
// }

// // 13. ThisExpression
// function foo() {
//   let b = this;
//   this.boo;
// }

// // 14. Binops
// // OPA = "+" | "-" | "/" | "%" | "*" | "**"
// var a = 1 + 1;
// var a = 1 - 1;
// var a = 1 / 1;
// var a = 1 % 1;
// var a = 1 * 1;
// var a = 1 ** 1;

// // OPB = "&" | "|" | ">>" | ">>>" | "<<" | "^"
// var a = 1 & 1;
// var a = 1 | 1;
// var a = 1 >> 1;
// var a = 1 >>> 1;
// var a = 1 << 1;
// var a = 1 ^ 1;

// // OPC =  "==" | "===" | "!=" | "!==" 
// var a = 1 == 1;
// var a = 1 === 1;
// var a = 1 != 1;
// var a = 1 !== 1;

// // OPD = "in"
// var a = class boo {
//   #boo = 1
//   test() {
//     #boo in { boo: 1 };
//   }
// }
// var a = "boo" in { boo: 1 };

// // OPE = "instanceof" 
// var a = a instanceof boo;

// // OPF = ">" | "<" | ">=" | "<="
// var a = 1 > 1;
// var a = 1 < 1;
// var a = 1 >= 1;
// var a = 1 <= 1;

// // 15. Assignments
// var a, b, c, d = { e: 1, f: { g: 2 } }, pokemon;
// // simple assn
// a = b = c = d;

// // member assn
// d.e = d.f

// // this assn
// globalThis.boo = a;

// // super assn.
// // 
// // 

// // arrpatassn
// [a, b] = [b, a];

// // objpatassn
// ({ f: { g: pokemon } } = d);
// console.log(a, b, c, d, pokemon)

// 16. Optional Chaining

// let a;
// a = a.b.c.d?.e; // Optional chain at terminals
// a = a.b.c.d?.e();   // Optional chain at terminals
// a = a.b.c?.d.e;     // One intermediate optional chain
// a = a.b.c?.d().e;     // One intermediate optional chain
// a = a.b.c?.d().e();     // One intermediate optional chain
// a = a.b.c?.d.e();     // One intermediate optional chain

// a = a?.()

// a = a.b().c?.().b?.c;
// a = a[a?.a()].c?.().d?.[e].f?.g;

// export default function MyApp() {
//   let a;
//   a = a?.v[(test) ? 1 : 2].c?.().d.e.f?.g;
//   return a;
// }

// foo.b.x(() => { console.log("Boo") },23)

// let a = (a, pokemon = 199, ...{x, y: { mee: { te: { s : xxz = "h" } } }}) => {
//   return a + pokemon + xxz
// }

// a("M", 12, { x: 100, y: { mee: { te: { s: "h" } } }})

// let { x: { y: xs } } = { x: { y: "Meetesh" } }
// console.log(xs)

// let a = (a, pokemon = 199, ...{ 0: { x : x }, 1: y, 2: z }) => {
//   return (a + pokemon + (y + z) + x).toLowerCase() 
// }
// console.log(a("Ba", "", { x: "a", y: 1, z: 2 }))

// console.log(("B" + "a" + +"b" + "a" ).toLowerCase())

// function Test() { console.log("Outer Test", this); }
// function foo(a = Test()) {
//   let x = Test()
//   function Test() { console.log("Inner Test"); }
// }

// foo()

// 
// 1. Argument: a = Test, "Test is a let binding"
//      
//      Here Test is searched in the argument scope,
//      and it behaves like a let binding, throwing reference error
//      as it could not be found.
// 
// var Test = "outer"
// function f1(a = Test, Test = "args") {
//   var Test = "inner" 
//   return a + Test;
// }
// console.log(f1()) // Test uninit error, undefinedinner in babel

// // 
// // 2. Argument: (a, a, a=1)
// //      
// //      Duplicate parameter name not allowed in this context
// // 
// function f2(a,a,a = 1) {
//   return a;
// }
// console.log(f2()) // Error

// // 
// // 3. Argument: (a,a,a) { SCRIPT MODE }
// //      
// //      returns undefined... a gets set to undefined for missing
// //      argument.
// // 
// function f3(a, a, a) {
//   return a;
// }

// console.log(f3(1,2)) // 

// // 
// // 4. Argument: (a)
// //      
// //      returns 10... hoisting "a = undefined" to the top of the scope
// //      is wrong because argument evaluation takes precedence over
// //      setting "a = undefined"
// // 
// function f3(a) {
//   var a;
//   return a;
// }

// console.log(f3(10)) // 10

// function f3({ f: { g: a } }) {
//   var a;
//   try {
//     eval('var a');
//     console.log("a was a var")
//   } catch (error) {
//     console.log("a was a let/const")
//   }

//   return a;
// }

// console.log(f3({ f: { g: 12 } })) // 10

// // 
// // Semantics of arguments most closely resemble "var", 
// // in their own function scope.
// // 

// function f4({ f: { g: a } }, test = a) {
//   return test;
// }

// console.log(f4({ f: { g: 12 } })) // 10

// // 
// // Code that breaks after babel
// // 
// var test = 100
// function f4({ f: { g: a = test } }, test) {
//   return a;
// }

// console.log(f4({ f: { gg: 12 } })) // 10

// // Transformation that might work, but doesnt...
// var test = 100
// function f4_patched(arg1, arg2) {
//   var { f: temp1 } = arg1
//   var { g: a = test } = temp1

//   return ((arg2) => {
//     var test = arg2;
//     return (() => {
//       return a;
//     })()
//   })(arg2)
// }

// console.log(f4_patched({ f: { gg: 12 } })) // 10

// var test = 100
// function f4({ f: { g: a = test } }, test) {
//   return a;
// }
// console.log(f4({f:{}}))

// import a from "./test1.js"
// import b from "./test1.cjs"
// console.log(a, b)

// const x = {
//   get value() {
//     console.log("value getter called")
//     return { get boo() { console.log("boo getter called"); return undefined; }, set boo(a) { console.log("boo setter called"); }  };
//   },
//   set value(v) {
//     console.log("value setter called");
//   },
// };

// x.value.boo ??= 2;

// let log = console.log
// let a = 3;
// let b = -2;
// log(a > 0 && b > 0);
// // Expected output: false

// let a = 3;
// let b = -2;
// log(a > 0 || b > 0);
// Expected output: true

// const foo = null ?? 'default string';
// log(foo);
// // Expected output: "default string"

// const baz = 0 ?? 42;
// log(baz);
// // Expected output: 0

// export default function test(arg) {
//   let a = {}
//   let b = test ? a?.b() : tt;
// }

// a.x(function foo() { var a, b, c; console.log(a, b, c); })

// let a;
// a = {
//   f1(a = Test) {
//     return a;
//   },
//   moo(a, b, c,) {
//   },
//   [a]: a,
//   ...a
// }

// a = function() {
//   a = {
//     get [f1]() {
//       return a;
//     },
//     moo(a, b, c,) {
//     },
//     [a]: a,
//     ...a
//   }
// }

// let b;

// let foo = (a) => {
//   console.log(a.name)
// }

// foo(() => { console.log("boo") }, [1,2,,3,,,4])

// a[a?.a()].c?.().d?.[e].f?.g;

// let a = new Array(() => { console.log("boo") }, [1,2,,3,,,4])

// let a = delete ((a * b + c) == 6)

// let Global = false
// function test(
//     foo = ((a) => (a ? bas : 1))(Global), // missing error
//     baz = () => bas, // ok, accessing 'bas' is deferred
//     bas,
// ) {
//     return {foo,baz}
// }
// test(undefined,undefined,3)

// let a = {
//   foo() {
//     return this.x;
//   },
//   x: 10
// }
// let b = a.foo()
// console.log(b)

// let c = { x: 2 }

// b = a.foo.apply(c)
// console.log(a.foo.apply(c))

function _default() {}
console.log(_test["default"].name);

// 
// Binding creation of x in catch is conditionally validly/invalidly bound
// 

// 
// Works
// 
// (function() {
//   try {
//       throw new Error("err");
//   } catch (x) {
//       var x = 100
//       var y = 100
//       var z = 100
//       console.log(x)
//   }
//   console.log(x, y, z)
// })();

// 
// Does not work
// 
// (function() {
//   try {
//       throw new Error(["err"]);
//   } catch ([x]) {
//       var x = 100
//       var y = 100
//       var z = 100
//       console.log(x)
//   }

//   console.log(x, y, z)
// })();

// // 
// // Test to check the evaluation order of effects when creating classes
// // 
// var probeBefore = function() { console.log("[probe before]");  return C; };
// var probeHeritage;
// var C = 'outside';

// const Test = class C extends ( // <- This evaluation happens under a specific new scope
//   ( 
//     console.log("super stuff"), 
//     probeHeritage = function() { console.log("[probe after]"); return C; }, // This (i.e. C) is a non-writable property
//     function () {} 
//   )
// ) {
//   #private1 = (console.log("[private-1] value init"), 1);;
//   [(console.log("[local-field-1] name init"), "field1")] = (console.log("[local-field-1] value init"), 1);
//   [(console.log("[local-method-1] name init"), "local-method-1")]() { }
//   static [(console.log("[static-method-1] name init"), "local-method-1")]() { }
//   static [(console.log("[static-field-1] name init"), "field1")] = (console.log("[static-field-1] value init"), 1);
//   static {
//     console.log("[static-block-1]", this === C, this.field1, this.field2, this.field3)
//   }

//   #private2 = (console.log("[private-2] value init"), 1);;
//   [(console.log("[local-field-2] name init"), "field2")] = (console.log("[local-field-2] value init"), 1);
//   static [(console.log("[static-field-2] name init"), "field2")] = (console.log("[static-field-2] value init"), 1);
//   [(console.log("[local-method-2] name init"), "local-method-2")]() { }
//   static [(console.log("[static-method-2] name init"), "local-method-2")]() { }
//   static {
//     console.log("[static-block-2]", this === C, this.field1, this.field2, this.field3)
//   }

//   #private3 = (console.log("[private-3] value init"), 1);;
//   [(console.log("[local-field-3] name init"), "field3")] = (console.log("[local-field-3] value init"), 1);
//   static [(console.log("[static-field-3] name init"), "field3")] = (console.log("[static-field-3] value init"), 1);
//   [(console.log("[local-method-3] name init"), "local-method-3")]() { }
//   static [(console.log("[static-method-3] name init"), "local-method-3")]() { }
//   static {
//     console.log("[static-block-3]", this === C, this.field1, this.field2, this.field3)
//   }
// }

// console.log("--- Instantiation ---")
// let t = new Test()
// console.log(t)
// probeBefore()
// probeHeritage()

// var t;

// class Test extends (
//   t = 10,
//   console.log("1", t),
//   function() {}
// ) {
//   [[console.log("2", t), t = 12, console.log("3", t)]] = 1
// }

// export default () => {
//   console.log("Test")
// }

// import a from "./test.js"

// console.log(a.name)

