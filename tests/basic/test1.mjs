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

function foo() {
  for (let i of [1,2,3]) {
    console.log(i);
    if (i === 2) return;
  }

  for (let i in [1,2,3]) {
    console.log(i);
  }
}

foo();
