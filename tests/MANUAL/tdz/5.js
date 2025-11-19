var x = 100

function foo() {
  let f = () => {
    var x = 101
    console.log(x)
  }
  console.log(x)
  f()
  switch(x) {
    case 1:
      var x = 111
  }
  console.log(x)
  
}

foo()

// 
// Output:
// 
// undefined 
// 101
// undefined
// 