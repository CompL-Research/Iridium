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
//   let a = 1;
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
//   let c = 3;
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
// a = a.b.c?.().d.e.f?.g;

// export default function MyApp() {
//   let a;
//   a = a[(test) ? 1 : 2].c?.().d.e.f?.g;
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


// // 
// // 1. Argument: a = Test, "Test is a let binding"
// //      
// //      Here Test is searched in the argument scope,
// //      and it behaves like a let binding, throwing reference error
// //      as it could not be found.
// // 
// var Test = "outer"
// function f1(a = Test, Test = "args") {
//   var Test = "inner" 
//   return a;
// }
// console.log(f1()) // Test uninit error


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

let log = console.log
// let a = 3;
// let b = -2;
// log(a > 0 && b > 0);
// // Expected output: false

// let a = 3;
// let b = -2;
// log(a > 0 || b > 0);
// Expected output: true

const foo = null ?? 'default string';
log(foo);
// Expected output: "default string"

const baz = 0 ?? 42;
log(baz);
// Expected output: 0

