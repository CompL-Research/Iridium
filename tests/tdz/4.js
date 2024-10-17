var x = 100

function foo() {
  let f = () => {
    console.log(x)
  }
  console.log(x)
  if (false) {
    // var x = 101
  }
  f()
}

foo()
console.log(x)

// 
// Output:
// 
// 100 
// 100
// 100
// 