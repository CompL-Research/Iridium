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