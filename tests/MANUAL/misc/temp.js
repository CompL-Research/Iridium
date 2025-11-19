let js3$1 = {
  foo(a, b) {
    let js3$2 = console.log(/*JS3ContainedExprKey*/this.f1 === a, /*JS3ContainedExprKey*/this.f2 === b);
  },
  f1: 1,
  f2: 3
};
let o = js3$1;
let js3$3 = o.foo(/*JS3ContainedExprKey*/o.f1, /*JS3ContainedExprKey*/o.f2);
