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
