var x = 100

function foo() {
  
  console.log(x)
  var x = 101
  f()


  function f() {
    console.log(x)
  }
}

foo()
console.log(x)

// 
// Output:
// 
// undefined 
// 101
// 100
// 