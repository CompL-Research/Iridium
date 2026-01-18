

module.exports = {
  "toSkipUnsupported": [
    // Syntax TODO
    "test/language/expressions/arrow-function/lexical-super-property-from-within-constructor.js",
    "test/language/expressions/arrow-function/lexical-super-property.js",
    "test/language/expressions/arrow-function/unscopables-with.js",
    "test/language/expressions/arrow-function/unscopables-with-in-nested-fn.js",
    "test/language/expressions/arrow-function/arrow/capturing-closure-variables-2.js",

    // 1
    "test/language/expressions/arrow-function/name.js",
    "test/language/expressions/async-arrow-function/name.js",
    "test/language/expressions/async-function/name.js",
    "test/language/expressions/async-generator/name.js",
    "-name-",

    // 2.1
    "test/language/expressions/assignment/S11.13.1_A6_T1.js",
    "test/language/expressions/assignment/S11.13.1_A6_T2.js",

    // 2.2
    "test/language/expressions/assignment/S11.13.1_A5_T1.js",
    "test/language/expressions/assignment/assignment-operator-calls-putvalue-lref--rval-.js",
    "test/language/expressions/assignment/S11.13.1_A5_T2.js",
    "test/language/expressions/assignment/S11.13.1_A6_T3.js",
    "test/language/expressions/assignment/S11.13.1_A5_T3.js",
    "test/language/expressions/assignment/destructuring/keyed-destructuring-property-reference-target-evaluation-order-with-bindings.js",

    "test/language/expressions/async-arrow-function/unscopables-with.js",
    "test/language/expressions/async-arrow-function/unscopables-with-in-nested-fn.js",

    "test/language/expressions/async-function/named-unscopables-with-in-nested-fn.js",
    "test/language/expressions/async-function/nameless-unscopables-with.js",
    "test/language/expressions/async-function/nameless-unscopables-with-in-nested-fn.js",
    "test/language/expressions/async-function/named-unscopables-with.js",

    "test/language/expressions/call/tco-non-eval-with.js",

    // NOT SUPPORTED BY QJS BUT SUPPORTED BY IRIDIUM
    "test/language/expressions/assignment/target-member-computed-reference.js",
    "test/language/expressions/assignment/destructuring/iterator-destructuring-property-reference-target-evaluation-order.js",
  ]
}