


# List of unsupported tests/features

1. `test262/test/language/expressions/await/await-non-promise-thenable.js`, `test262/test/language/expressions/await/await-monkey-patched-promise.js`

Transformation of this form fails for `await` and `yield`. 

**Source**

```javascript
async function trigger() {
  actual.push('Await: ' + (await patched));
  actual.push('Await: ' + (await patched));
}
```

**Transformed**

```javascript
async function trigger() {
  let js3$13 = actual.push((() => {
    let js3$15 = 'Await: ';
    let js3$17 = patched;
    let js3$16 = await js3$17;
    let js3$14 = js3$15 + js3$16;
    return js3$14;
  })());
  js3$13;
  let js3$18 = actual.push((() => {
    let js3$20 = 'Await: ';
    let js3$22 = patched;
    let js3$21 = await js3$22;
    let js3$19 = js3$20 + js3$21;
    return js3$19;
  })());
  js3$18;
}
```

We could transform this correctly by pushing the argument evaluation to happen before the call, but this breaks Javascript semantics.
Evaluation of the callee must happen before the argument.

There are two reasons for this

1. Callee resolution can have side effects (`get` methods)
2. Nullish callee, we could add an if condition check and conditionally resolve the arguments. But there are some cases where this is semantically invalid.

# Others

1. `test/language/module-code/export-expname-from-string-string.js`

The babel generator produces wrong output for this node currently.
Even though this is a problem, the babel262 tests seem to pass anyway, noted here for reference.

**Input Code**
```javascript
export { "☿" as "Ami" } from "./export-expname_FIXTURE.js";
```

**Output Code**
```javascript
export { "☿" } from "./export-expname_FIXTURE.js";
```

# Handled
1. `language/expressions/async-arrow-function/name.js`

This test is not supported as transformation of code into 3AC might cause anonymous functions to get incorrect names.
As this is a read-only property defined in the runtime semantics of [ECMA](https://tc39.es/ecma262/#sec-runtime-semantics-instantiatearrowfunctionexpression) we have no easy way to force this read-only property to be set correctly.


Anonymous function with name `a` gets set to a dummy name `t1`.
**Input Code**
```javascript
let a = () => {}
```

**Output Code**
```javascript
let t1 = () => {}
let a = t1
```

Anonymous nameless function gets name `t1`.
**Input Code**
```javascript
fn(() => {})
```

**Output Code**
```javascript
let t1 = () => {}
fn(t1)
```