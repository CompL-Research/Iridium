let a =new function (){ this.foo=10; }()
console.log(Object.getPrototypeOf(a).constructor.name === "")

let b =new function b(){ this.foo=10; }()
console.log(Object.getPrototypeOf(b).constructor.name === "b")