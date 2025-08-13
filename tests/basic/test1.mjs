// import { boo } from "./lib.mjs";

// export * from "./lib1.mjs";


// let a = 12;

// console.log(a);

// let {a, b} = { a: 1, b: 2, c: 3 };

// console.log(a, b);

// class Test { #foo() { return 42; } foo() { return this.#foo(); } }

// console.log(new Test().foo())

// class A {
//   #foo() {
//     return 42;
//   }
//   foo() {
//     return this.#foo();
//   }
// }

// console.log(new A().foo());


// function foo() {
//   this.x = 12;
//   console.log(this.x);
// }

// new foo();

// function foo() {
//   console.log(arguments);
// }

// foo(1, 2, 3);


// class A {
//   constructor() {
//     console.log("Parent class constructor called");
//   }
//   bar() { return 42; }
// }

// class B extends A {
//   foo() {
//     return super.bar();
//   }
// }

// console.log(new B().foo());

// function foo() {
//   for (let i of [1,2,3]) {
//     console.log(i);
//     if (i === 2) return;
//   }

//   for (let i in [1,2,3]) {
//     console.log(i);
//   }
// }

// foo();

// function foo() {
//   console.log("foo called");
// }

// foo();

// class B {

// }

// class A extends B{
//   p = (console.log("pinit 1 called"), 12);
//   constructor() {
//     console.log("pinit 2 called")
//     if (false) {
//       super();
//     } else {
//       super();
//     }
//   }
// }

// console.log(new A());

// class B {
//   constructor() {
//     console.log("B constructor called");
//   }
// }

// class A extends B {
//   p1 = (console.log("p1init"), 12);
//   constructor() {
//     let x = () => {
//       super();
//     };
//     let y = () => {
//       super();
//     }
//     x();
//   }
// }

// new A()

// class Test { #foo() { return 423; } foo() { return this.#foo(); } }
// console.log(new Test().foo());

// function test5() {
//   let a = 0;
//   let b = 1;
//   let c = 2;
//   let d = -1;
//   let e = a + b + c + d
//   console.log(e);
// }

// test5()

// let b = ["a", "b"];
// let c = ["foo", "bar"];
// let a = [1,2,...b, 3, ...c];

// console.log(a);

// let a = { a: 1, b: 2, c: 3 }
// let c = { ...a, c: 13 }
// console.log(c.c)

// let a = {
//  m() { console.log("m called"); },
//  set f(val) { this.m(), this.data = val; },
//  get f() { this.m(); return this.data; }
// };

// a.f = 13;
// console.log(a.f);

// let f = () => {
//   for (let e of [1,2,3]) {
//     try {
//       if (e === 3) {
//         throw "Pikachu";
//       }
//     } catch (e) {
//       console.log("caught", e);
//     } finally {
//       console.log(e);
//     }
//   }
  
// }

// f()

// function foo() {
//   console.log("Hello World");
// }

// foo();

// let a = 0;
// // let b = 13;
// console.log(typeof a);

class Foo {
  #bar = () => {
    console.log("Hello World");
  }
  
  foo() {
    this.#bar();
    this.#bar = 121;
    console.log(this.#bar);
  }
}

new Foo().foo()