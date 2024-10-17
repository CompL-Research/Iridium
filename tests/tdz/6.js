var x = 100

function foo() {
  if (true) {
    console.log(x)
    var x = 101
  }
  console.log(x)
  if (true) {
    console.log(x)
    var x = 102
  }
  console.log(x)
  
}

foo()

// 
// Output:
// 
// undefined
// 101 
// 101
// 102
// 