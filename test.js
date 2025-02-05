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



// // 8. Template Literals
// let a = `a,b,c${g}da`
// let b = tag`a,b,c${g}da`


// 9. Call Expression
// let f = function(a,b,c) {  }

// f(a,b*c,(b*c,6,7) );
// g.h.i(a,b*c,(b*c,6,7) );
// (g?.h)?.i(a,b*c,(b*c,6,7) );

// // 10. CallExpressions
// import("boo");
// f(a,b*c,(b*c,6,7));
// // c. Super [ID,...ID]
// // d. V8IntrinsicIdentifier [ID,...ID]


// // // 11. Meta Property
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

// 13. ThisExpression
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
// a = b[x?.z()]?.c;


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


// export default function() { }
// import f from "./test.js"
// console.log(f.name)


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
//   static [(console.log("[static-field-1] name init"), "field1")] = (console.log("[static-field-1] value init", Object.getOwnPropertyNames(this)), 1);

//   #private1 = (console.log("[private-1] value init"), 1);;
//   static #staticprivate1 = (console.log("[static-private-1] value init"), 1);;
//   [(console.log("[local-field-1] name init"), "field1")] = (console.log("[local-field-1] value init"), 1);
//   [(console.log("[local-method-1] name init", this), "local-method-1")]() { }
//   static [(console.log("[static-method-1] name init"), "local-method-1")]() { }
//   static {
//     console.log("[static-block-1]", this,  this === C, this.field1, this.field2, this.field3)
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


// Class Test

// var Global = "global 1"
// let clos; 

// let Test = class Global extends ( console.log(a), clos = () => { console.log("Global: ", Global) } ) {
// }


// function foo({x : {b : [b]}}) {
//     var a = 10;
    
//     class A {
//         [a] = (console.log("a"), a)
//         static {
//             var a = 1;
//             var b = 2;
//             console.log("a inside: ", a);
//         }

//         static {
//             console.log("a inside (continued): ", a);
//             console.log("b inside (continued): ", b);

//         }
//     };

//     console.log("a outside: ", a)
// }


// class Test {
//   [(console.log(this), "a")] = 10

//   static {
//     console.log(this, Test, this === Test)
//   }
// }

// class Test {  
//   [(console.log("[1]"), "constructor")]() { console.log("Non statically resolvable constructor called"); }
//   constructor() { console.log("Statically resolvable constructor1 called"); } // <- Semantics only use syntax to bind the constructor 
//   [(console.log("[1]"), "constructor")]() { console.log("Non statically resolvable constructor called"); }

//   [(console.log("[2]"), "boo")]() { console.log("Non Statically resolvable method boo called"); }
//   boo() { console.log("Statically resolvable method boo called;") }
  
//   foo() { console.log("Statically resolvable method foo called;") }
//   [(console.log("[2]"), "foo")]() { console.log("Non Statically resolvable method foo called"); }
// }
// let o = new Test();
// o.boo()
// o.foo()

// Object.getPrototypeOf(o).constructor() // <- Userspace can only access the non-statically resolvable constructor


// class Test extends (
//   console.log("test"),
//   a = 12
// ){
//   [f1] = "f1 res"
//   #f2 = "f2 res"
//   f3 = "f3 res"

//   static [f4] = "f1 res"
//   static #f5 = "f2 res"
//   static {
//     console.log("nbb", this)
//   }
//   static f6 = "f3 res"

// }

// console.log(Test, Object.getOwnPropertyNames(Test.prototype.constructor))

// class Test extends (
//   console.log("Hello World", this, this === Test),
//   function() {}
// ) { 
// }

// import a from './test.js'

// let cls = class extends (
//   console.log("Hello World", a),
//   function () {}
// ){
//   a = 12
//   static {
//     var a = 12;
//   }

//   b = 2
//   static {
//     var x = 121;
//   }

// }

// let res = delete delete delete 1

// let res2 = res ? 1 : 2;


// let o = {
//   foo(a, b) { console.log(this.f1 === a, this.f2 === b) },
//   f1: 1,
//   f2: 3
// }
// o.foo(function() {}, class { a = 10 })

// let a = false;
// while(a++) {
//   if (a) {
//     continue;
//   } else {
//     break;
//   }
// }

// for (let i = 0; i < 10; i++) {
//   if (i) {
//     continue;
//   } else {
//     break;
//   }
// }

// {
//   let a = 12;
//   {
//     console.log(a)
//   }
// }

// for (let [a, {b: c}] = [12, { b: 22 }];  c*x <= 99*a; c++) {
//   console.log(a, c)
// }

// let a = 0;
// do {
//   console.log(a)
//   a++;
// } while(a < 10)

// switch((console.log("test"), 4)) {
//   case ((console.log("case 1 test"),1)):
//     console.log("case 1 body")
//     break;
//   case ((console.log("case 2 test"),2)):
//     console.log("case 2 body")
//     break;
//   case ((console.log("case 3 test"),3)):
//     console.log("case 3 body") 
//     break;
//   case ((console.log("case 4 test"),4)):
//     console.log("case 4 body")
//     break;
//   case ((console.log("case 5 test"),5)):
//     console.log("case 5 body")
//     break;
//   default:
//     console.log("Default case")
// }

// let a = "mee"
// for (let [a, {b: t}] of []) {
//   console.log(a)
// }


// class A extends (function() {}, function() {}, function() { }) {
//   a = (console.log("test"))
// }

// let a = 1;
// if (a) {
//   let b = 1;
// } else {
//   let c = 2
// }

// if (a) {
//   let d = 3;
// }

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

// let a = 1;

// while(a) {
//   // console.log(test);
//   continue;
//   break;
// }

// {

// }

// {
//   let a = 11;
// }

// let a = false;
// testing: while(a) {
//   console.log(test);
//   continue testing;
//   break;
//   break testing;
// }

// for (let a of [1,2,3]) {
//   let a = 2;
// }

// for (let a in [1,2,3]) {
//   let a = 2;
// }

// for (let a = 12; a < 12; a++) {
//   let b = 22;
// }

// let a = 12;
// do {
//   a = 11
// } while(a < 12)

// let a = 112;
// let x = 2;

// let z = a ? b * c + d / 23 : 12


// let a = 1;
// if (a) {
//   (a ? a : a);
// } else {
//   ((a.a) ? a.a : a.a);
// }

// let a = false;
// while((a.x ? a : a.xx.a)) {
//   console.log(test);
//   continue;
//   break;
// }

// let a;
// for ([a] of [[1],[23]]) {
//   console.log(a);
//   break;
// }

// let a;
// for (let [[a]] of [[[11]],[[22]]]) {
//   console.log(a);
// }


// for (let a = x ? 1 : 2 ? 3 : 4; a ? b : c ? d : e ; a++) {
//   console.log("1")
// }

// let a = 0;
// do {
//   console.log(a)
//   a++;
// } while(a < 10)


// switch((console.log("test"), 4)) {
//   case ((console.log("case 1 test"),1)):
//     console.log("case 1 body")
//     break;
//   case ((console.log("case 2 test"),2)):
//     console.log("case 2 body")
//     break;
//   default:
//     console.log("Default case")
// }

// a.x(xx.x.d, xxx.x ? 1 : 2, b ? c ? c : d : e)

// delete delete (xxx.x ? 1 : 2)

// function foo({x : {b : [b]}}) {
//     var a = 10;
    
//     class A {
//         [a] = (console.log("a"), a)
//         static {
//             var a = 1;
//             var b = 2;
//             console.log("a inside: ", a);
//         }

//         static {
//             console.log("a inside (continued): ", a);
//             console.log("b inside (continued): ", b);

//         }
//     };

//     // console.log("a outside: ", a)
// }


// class Test {
//   #hello = 10
//   static test(o) {
//     let containsHello = #hello in o
//     console.log(containsHello)
//   }
// }

// class Boo {

//   #hello = 11

//   static foo = 12
  
//   static test(o) {
//     let containsHello = #hello in o
//     console.log(containsHello)
//   }
// }

// Boo.test(new Boo())
// Boo.test(new Test())
// Test.test(new Boo())
// Test.test(new Test())

// var a = 10;

// var a; // <- Does this have an effect later?

// console.log(a)


// let foo = 12;

// class Test {
//   [foo] = 12
// }

// console.log(foo)

// class Test {
//   x = 10
//   boo() {
//     let test = {
//       a() {
//         console.log("a: ", this);
//       },
//       b: () =>{
//         console.log("b: ", this);
//       },
//       c: function() {
//         console.log("c: ", this);
//       }
//     };
//     test.a();
//     let t1 = test.a
//     t1();
    
//     test.b();
//     let t2 = test.b
//     t2();

//     test.c();
//     let t3 = test.c
//     t3()
//   }
// }

// (new Test()).boo()



// class TTT {
//   constructor() {
//     this.b = 212
//   }
//   a = () => { console.log("a", this); }
//   b = 12
//   c() {
//     console.log("c", this);
//   }
// }

// class BBB extends TTT {
//   b = 13
// }

// let o = (new BBB())
// o.b = 11
// let boo = o.a
// boo()
// boo = o.c
// boo()

// let test = {
//   a() {
//     console.log("a: ", this);
//   },
//   b: () =>{
//     console.log("b: ", this);
//   },
//   c: function() {
//     console.log("c: ", this);
//   }
// };


// class TTT {
//   f1 = () => { }
//   f2 = 12
//   m1() {
//     console.log("m1: ", this)
//   }

//   static f2 = 2
//   static m2() {
//     console.log("m2: ", this)
//   }
// }

// (new TTT()).m1()
// TTT.m2()

// loop1: for (let i = 0; i < 3; i++) {
//   // The second for statement is labeled "loop2"
//   loop2: for (let j = 0; j < 3; j++) {
//     if (i === 1 && j === 1) {
//       continue loop1;
//     }
//     console.log(`i = ${i}, j = ${j}`);
//   }
// }

// let a;
// while(a) {
//   switch(a){
//     case 1:
//       console.log("Boo")
//       continue;
//     case 2:
//       console.log("Boo1")
//       break;
//     default:
//       console.log("Flower")
//   }
// }

let test = (a) => {
  if (a) return 1;
  return; 
}