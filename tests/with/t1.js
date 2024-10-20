function f(x, o) {
  with (o) {
    console.log(x);
  }
}

// 
// When resolving bindings, we would normally lookup in the scope chain and find where something loads from.
// When using 'with', the object supplied is used as the lookup environment for 'unqualified' bindings.
// If the binding is found in the object, then we return that otherwise we lookup in the scope chain.
// 
// Also, if the binding is found to be a function in the object; the object becomes the 'this' context for the call.
// 

// 1.
// f("pikachu", { x: "pokemon" })
// pokemon

// 2.
// f("pikachu", {  })
// pikachu