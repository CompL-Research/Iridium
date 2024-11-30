"use strict";
// // 1. Let bindings are unusable before init
// console.log(pokemon)
// let pokemon = "Pikachu"
// // 
// // Cannot access 'pokemon' before initialization
// // 

// // 2. Function declarations are hoisted up
// foo()
// function foo() { console.log("foo") }
// // 
// // foo
// // 

// // 3. Cannot access before initialization
// let a = new A()
// class A {}

// // 4. Let bindings are unusable before init
// foo()
// let foo = function() { console.log("foo") }
// // 
// // Cannot access 'pokemon' before initialization
// //

// // 5. Let after let
// let foo = 100
// console.log(foo)
// let foo = 11110
// console.log(foo)
// // 
// // Identifier 'foo' has already been declared
// // 

// // 6. Function foo and boo mutual recursion
// boo(5)
// function foo(a) { console.log("foo"); if (a >= 0) boo(a-1) }
// function boo(a) { console.log("boo"); if (a >= 0) foo(a-1) }

// // 7. Exports of var declarations behave the same
// console.log(a)
// export let a = 199

// // 8. Exports of function declarations behave like normal function declarations
// foo()
// export function foo() {
//   console.log("foo")
// }

// // 9. Multiple vars
// var a = 19
// var a = 20
// var a = 21
// console.log(a)

// // 10. Export default declarations
// foo()
// export default function foo() {
//   console.log("foo")
// }

// // 11.
// foo()
// import {foo} from './exp.js'

// // 12.
// let a = (1,2,function() { })
// console.log(a.name) // -> ''

// // 13.
// let a = (function() { })
// console.log(a.name) // -> 'a'


// 
// 1. Let bindings
//  - Unusable before init, but we know that it will exist.
//  - Only one binding per scope
// 2. Var bindings
//  - Hoisted and set to 'undefined' value
//  - Any number of bindings can be made, acts as redefinitions.
// 4. Function declarations
//  - Hoist to top
// 5. Class declarations
//  - No hoisting, behaves like let bindings
// 6. Imports
//  - Can be hoisted to the top of the file


// // CASE 1: a is undefined
// console.log(a) // ReferenceError: a is not defined

// // CASE 2: b may be defined somewhere down the line
// console.log(b) // undefined
// if (b) {
//   if (b) {
//     if (b) {
//       var b = 100;
//     }
//   }
// }

// // CASE 3: c may be defined in a function scope
// console.log(c) // ReferenceError: c is not defined
// (() => { var c = 100 })()

// // CASE 4: switch case
// console.log(d) // undefined

// switch(true) {
//   case 1:
//     var d = 100;
//     break;
//   default:
//     var d = 11;
// }

// // CASE 5: while loop
// console.log(e) // undefined

// while (false) {
//   var e = 121
// }

// // CASE 6: For loop
// console.log(f) // undefined
// for (;;) {
//   var f = 121
//   break;
// }

// // CASE 7: While/do While loop
// console.log(g) // undefined
// console.log(h) // undefined
// while (false) {
//   var g = 11
// }

// do {
//   var h = 11
// } while (false)


// CASE 8: for in and for of loop

// let obj = []
// console.log(i) // undefined
// console.log(j) // undefined

// for (let _ in obj) {
//   var i = 10
// }

// for (let _ of obj) {
//   var j = 10
// }


// CASE 1: Optional Member Expr

// let a = { t: { f: function() { console.log(this.data) }, data: 101 } };

// let t = a.t?.[[(console.log("side effect"), "f")]]
// t.call(a.t);


// let i = 0
// console.log(`[Set Interval] ${i++}`);
// setInterval(() => {
//   console.log(`[DOPE] ${i++}`);
// }, 1000)

// new Promise((resolve, reject)=> {
//   console.log("[I PROMISE TO BEHAVE]")
// })

// async function foo() {
//   console.log(`[Foo starting] ${i++}`)

//   let p = new Promise((resolve, reject)=> {
//     setTimeout(() => {
//       console.log(`[TIMEOUT] ${i++}`);
//       resolve()
//     }, 5000)
//   })

//   await p;
//   console.log(`[Foo ending] ${i++}`)

// }

// foo()

// // Ordinary Object
// let o1 = { boo: 100 }
// let o2 = {}
// Object.setPrototypeOf(o2, o1);
// // o2.prototype = o1
// console.log(o2.boo)

// // function object
// function f() {
// }

// // array exotic object
// let o3 = [1,2,3]


// ArrayBuffer
// let ab = new ArrayBuffer(2); // 2 bytes
// let dataView = new DataView(ab);
// dataView.setInt8(0, 100);
// dataView.setInt8(1, 101);
// console.log(ab)
// console.log(dataView)
// console.log(new Uint8Array(ab).toString())

// let f = (a) => {
//   console.log("Final res: ",a)
// }

// let abv = new Promise((resolve, reject) => {
//   setTimeout(() => { resolve("bc"); }, 1000)
// })

// f ("a" + (await abv) + "d")

// let f = a => {
//   let f$1 = console.log("Final res: ", a);
// };
// let abv$3 = Promise;
// let NAMELESS_ANON_FN$7 = [(resolve, reject) => {
//   let NAMELESS_ANON_FN$6 = [() => {
//     let abv$5 = resolve("bc");
//   }][0];
//   let abv$4 = setTimeout(NAMELESS_ANON_FN$6, 1000);
// }][0];
// let abv$2 = new abv$3(NAMELESS_ANON_FN$7);
// let abv = abv$2;
// let js3$8 = f(await (async () => {
//   let js3$11 = "a";
//   let js3$12 = await abv;
//   let js3$10 = js3$11 + js3$12;
//   let js3$13 = "d";
//   let js3$9 = js3$10 + js3$13;
//   return js3$9;
// })());

// let b = new Promise((resolve, reject) => {
//   setTimeout(() => { resolve("234") }, 1000);
// });
// let res = "1" + (await ((async () => await b )())) + "5"
// console.log(res)

// export * as b from "test.js"
// let a = 1
// export {a}


// console.log(a)
// export const a = 10

// export var { b, c: { d: e } } = { b: 1, c: { d: 121 } }

// console.log(b, e)

// let [[[a],b,c] = [[11],12,13]] = [undefined, 2, 3, 4]
// console.log(a,b,c)

// let k = ""
// let { ["a" + k] : [a, b, c] = [1,2,3], d, ...e } = { a: undefined, d: 4, e: 11, f: 12, g: 13 }
// console.log(a, b, c, d, e)


// let a, b, c, d;
// [a, b, c, d] = [1,2,3,4];
// console.log(a,b,c,d);


// let k = 1;
// let a;
// console.log(1 + ({["" + k]: a } = [1,2,3,4]))


// let a = 12;
// let b = 13;
// let c = 14;
// let d = 15;
// let e = 1;
// e *= b/c+d;
// console.log(a,b,c,d,e)

// const a = { duration: 50 };
// a.speed ??= 25;
// console.log(a.speed);

// export default function xx() {

// }

// let { b, c: { d: e } } = undefined

// 
// IRIDIUM
// 

// 1.
// import "source";
// import { x as y } from "source";
// import * as x from "source";
// import z from "source";

// BB0 [Module]:
// IMPORT "source";
// IMPORT { x as y } from "source";
// IMPORT * as x from "source";
// IMPORT { default as z } from "source";

// 2.

// export default ID


// let k = 1;
// let a;
// console.log(1 + ({["" + k]: a } = [1,2,3,4]))


try {
  let a = 1;
} catch([a, ...{x: { y: boo }}]) {
  let b = 2;
}