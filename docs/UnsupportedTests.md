# List of unsupported tests/features

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