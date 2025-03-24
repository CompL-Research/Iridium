// import "test.js";

// import a from "test.js";


// export * as boo from "";

// export default boo;

// import * as test from "./M1.js";
// console.log(test);


function foo() {
    let a = { foo: 100 };
    if (this) {
        this.foo = a;
    } else {
        foo.foo = foo;
    }
    return a;
}

foo()
let x = foo.foo();
x.foo = 12;
console.log(x)