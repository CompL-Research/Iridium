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