# List of unsupported tests/features

## 1. cannot lower expressions in arrow scope that contain `await` or `yield` expressions.

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

We could transform this correctly by pushing the argument evaluation to happen before the call, but this breaks Javascript semantics (evaluation of the callee must happen before the argument, and callee resolution is side effect prone).

There are two reasons for this

1. Callee resolution can have side effects (`get` methods)
2. Nullish callee we could add an if condition check and conditionally resolve the arguments. But there are some cases where this is semantically invalid (I have forgotten which ones those were sadly, I will find them sometime and link them here).

```bash
not ok 598 test/language/expressions/async-generator/named-no-strict-reassign-fn-name-in-body-in-arrow.js default # (expected success, got parser error)
not ok 640 test/language/expressions/async-generator/named-no-strict-reassign-fn-name-in-body.js default # (expected success, got parser error)
not ok 641 test/language/expressions/async-generator/named-strict-error-reassign-fn-name-in-body-in-eval.js strict mode # (expected success, got parser error)
not ok 645 test/language/expressions/async-generator/named-no-strict-reassign-fn-name-in-body-in-eval.js default # (expected success, got parser error)
not ok 663 test/language/expressions/async-generator/named-strict-error-reassign-fn-name-in-body-in-arrow.js strict mode # (expected success, got parser error)
not ok 674 test/language/expressions/async-generator/named-strict-error-reassign-fn-name-in-body.js strict mode # (expected success, got parser error)
not ok 928 test/language/expressions/await/await-monkey-patched-promise.js default # (expected success, got parser error)
not ok 962 test/language/expressions/await/await-non-promise-thenable.js default # (expected success, got parser error)
not ok 1002 test/language/expressions/await/await-non-promise-thenable.js strict mode # (expected success, got parser error)
not ok 1368 test/language/expressions/class/cpn-class-expr-accessors-computed-property-name-from-await-expression.js strict mode # (expected success, got parser error)
not ok 1379 test/language/expressions/class/cpn-class-expr-accessors-computed-property-name-from-yield-expression.js strict mode # (expected success, got parser error)
not ok 1383 test/language/expressions/class/cpn-class-expr-accessors-computed-property-name-from-await-expression.js default # (expected success, got parser error)
not ok 1447 test/language/expressions/class/cpn-class-expr-accessors-computed-property-name-from-yield-expression.js default # (expected success, got parser error)
not ok 1457 test/language/expressions/class/cpn-class-expr-fields-computed-property-name-from-await-expression.js strict mode # (expected success, got parser error)
not ok 1512 test/language/expressions/class/cpn-class-expr-fields-computed-property-name-from-yield-expression.js default # (expected success, got parser error)
not ok 1525 test/language/expressions/class/cpn-class-expr-fields-computed-property-name-from-yield-expression.js strict mode # (expected success, got parser error)
not ok 1580 test/language/expressions/class/cpn-class-expr-fields-computed-property-name-from-await-expression.js default # (expected success, got parser error)
not ok 2928 test/language/expressions/dynamic-import/for-await-resolution-and-error-agen.js strict mode # (expected success, got parser error)
not ok 2951 test/language/expressions/dynamic-import/for-await-resolution-and-error-agen-yield.js default # (expected success, got parser error)
not ok 2954 test/language/expressions/dynamic-import/for-await-resolution-and-error-agen.js default # (expected success, got parser error)
not ok 2955 test/language/expressions/dynamic-import/for-await-resolution-and-error-agen-yield.js strict mode # (expected success, got parser error)
not ok 2971 test/language/expressions/dynamic-import/imported-self-update.js strict mode # (expected success, got parser error)
not ok 3041 test/language/expressions/dynamic-import/imported-self-update.js default # (expected success, got parser error)
not ok 4653 test/language/expressions/object/cpn-obj-lit-computed-property-name-from-await-expression.js default # (expected success, got parser error)
not ok 4663 test/language/expressions/object/cpn-obj-lit-computed-property-name-from-await-expression.js strict mode # (expected success, got parser error)
not ok 4702 test/language/expressions/object/cpn-obj-lit-computed-property-name-from-yield-expression.js default # (expected success, got parser error)
not ok 4788 test/language/expressions/object/cpn-obj-lit-computed-property-name-from-yield-expression.js strict mode # (expected success, got parser error)
not ok 4968 test/language/expressions/optional-chaining/optional-chain-async-optional-chain-square-brackets.js default # (expected success, got parser error)
not ok 4990 test/language/expressions/optional-chaining/optional-chain-async-optional-chain-square-brackets.js strict mode # (expected success, got parser error)
not ok 5002 test/language/expressions/optional-chaining/optional-chain-async-square-brackets.js default # (expected success, got parser error)
not ok 5069 test/language/expressions/optional-chaining/optional-chain-async-square-brackets.js strict mode # (expected success, got parser error)


```


## 2. unsupported UnaryExpression->delete [forms other than member expressions to delete operator are often meaningless]

The syntax of the delete operator allows more than it is meant to do; on top of that it has some strange behaviour when lvalues are passed to it, we simply dont want to parse such syntax as it it unexpected in the wild.

[reddit post](https://www.reddit.com/r/Compilers/comments/1exqz48/comment/lj803ze/?context=3&rdt=37049)

Quote from [Mozilla](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/delete)
>
> Note: The syntax allows a wider range of expressions following the delete operator, 
> but only the above forms lead to meaningful behaviors.
>

```bash
not ok 2680 test/language/expressions/delete/11.4.1-0-1.js default # (expected success, got parser error)
not ok 2704 test/language/expressions/delete/S11.4.1_A2.1.js strict mode # (expected success, got parser error)
not ok 2709 test/language/expressions/delete/S11.4.1_A2.1.js default # (expected success, got parser error)
not ok 2742 test/language/expressions/delete/non-reference-return-true.js default # (expected success, got parser error)
not ok 2771 test/language/expressions/delete/non-reference-return-true.js strict mode # (expected success, got parser error)
not ok 4398 test/language/expressions/new.target/unary-expr.js strict mode # (expected success, got parser error)
not ok 4428 test/language/expressions/new.target/unary-expr.js default # (expected success, got parser error)
```


## 3. Experimental features

1. These are tests related to the proposal for [decorators](https://github.com/tc39/proposal-decorators), currently in Stage 2

```bash
not ok 17168 test/language/expressions/class/decorator/syntax/valid/decorator-call-expr-identifier-reference.js strict mode # (expected runtime error, got parser error)
not ok 17174 test/language/expressions/class/decorator/syntax/valid/decorator-member-expr-identifier-reference-yield.js default # (expected runtime error, got parser error)
not ok 17184 test/language/expressions/class/decorator/syntax/valid/decorator-call-expr-identifier-reference-yield.js default # (expected runtime error, got parser error)
not ok 17185 test/language/expressions/class/decorator/syntax/valid/decorator-parenthesized-expr-identifier-reference-yield.js default # (expected runtime error, got parser error)
not ok 17193 test/language/expressions/class/decorator/syntax/valid/decorator-parenthesized-expr-identifier-reference.js default # (expected runtime error, got parser error)
not ok 17206 test/language/expressions/class/decorator/syntax/valid/decorator-member-expr-decorator-member-expr.js default # (expected runtime error, got parser error)
not ok 17214 test/language/expressions/class/decorator/syntax/valid/decorator-call-expr-identifier-reference.js default # (expected runtime error, got parser error)
not ok 17223 test/language/expressions/class/decorator/syntax/valid/decorator-member-expr-identifier-reference.js default # (expected runtime error, got parser error)
not ok 17225 test/language/expressions/class/decorator/syntax/class-valid/decorator-member-expr-private-identifier.js default # (expected runtime error, got parser error)
not ok 17227 test/language/expressions/class/decorator/syntax/valid/decorator-member-expr-identifier-reference.js strict mode # (expected runtime error, got parser error)
not ok 17229 test/language/expressions/class/decorator/syntax/valid/decorator-member-expr-decorator-member-expr.js strict mode # (expected runtime error, got parser error)
not ok 17242 test/language/expressions/class/decorator/syntax/class-valid/decorator-member-expr-private-identifier.js strict mode # (expected runtime error, got parser error)
not ok 17246 test/language/expressions/class/decorator/syntax/valid/decorator-parenthesized-expr-identifier-reference.js strict mode # (expected runtime error, got parser error)
not ok 17221 test/language/expressions/class/elements/syntax/valid/grammar-field-accessor.js strict mode # (expected runtime error, got parser error)
```


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