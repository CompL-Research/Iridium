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


// 9. Call Expression
let f = function(a,b,c) {  }

f(a,b*c,(b*c,6,7) );
g.h.i(a,b*c,(b*c,6,7) );
(g?.h)?.i(a,b*c,(b*c,6,7) );