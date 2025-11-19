function foo() {
  console.log(a)
  eval("var a = 101")
}

foo()