

// let calleeContext = console
{ callee -> console.log } let callee = console.log
{ t1 -> object.f1 } let t1 = object.f1
{ t2 -> object.f2 } let t2 = object.f2
{ t3 -> object.f3 } let t3 = object.f3
{ t3 -> object.f3 } {  } call(console, console.log, t1,t2,t3)
