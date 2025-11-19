((() => { console.log(arguments.callee.name === "") })());

((function boo() { console.log(arguments.callee.name === "boo") })());

