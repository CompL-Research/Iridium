#!/usr/bin/env bash
set -euo pipefail
# Initialize variables
js3_passed=false
iri_passed=false
ulimit -n 65535

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --js3) js3_passed=true; shift ;;
        --iri) iri_passed=true; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
done

if [ "$js3_passed" = true ] && [ "$iri_passed" = true ]; then
    echo "Error: You cannot use --js3 and --iri at the same time."
    exit 1
fi

if [ "$js3_passed" = false ] && [ "$iri_passed" = false ]; then
    echo "Error: You must provide either --js3 or --iri."
    exit 1
fi

# Test
TESTS=(
  # "test/language/eval-code"
  # "test/language/statements/try"
  "test/language"
  # "test/language/expressions/logical-assignment"
  # "test/language/expressions/call"

  # "test/language/expressions/addition/S11.6.1_A3.2_T1.2"
  # "test/language/expressions/addition"
  # "test/language/expressions/array"
  # "test/language/expressions/arrow-function"
  # "test/language/expressions/assignment"
  # "test/language/expressions/assignmenttargettype"
  # "test/language/expressions/async-arrow-function"
  # "test/language/expressions/async-function"
  # "test/language/expressions/async-generator"
  # "test/language/expressions/await"
  # "test/language/expressions/bitwise-and"
  # "test/language/expressions/bitwise-not"
  # "test/language/expressions/bitwise-or"
  # "test/language/expressions/bitwise-xor"
  # "test/language/expressions/call"
  # "test/language/expressions/class"
  # "test/language/expressions/coalesce"
  # "test/language/expressions/comma"
  # "test/language/expressions/compound-assignment"
  # "test/language/expressions/concatenation"
  # "test/language/expressions/conditional"
  # "test/language/expressions/delete"
  # "test/language/expressions/division"
  # "test/language/expressions/does-not-equals"
  # "test/language/expressions/dynamic-import"
  # "test/language/expressions/equals"
  # "test/language/expressions/exponentiation"
  # "test/language/expressions/function"
  # "test/language/expressions/generators"
  # "test/language/expressions/greater-than-or-equal"
  # "test/language/expressions/greater-than"
  # "test/language/expressions/grouping"
  # "test/language/expressions/import.meta"
  # "test/language/expressions/in"
  # "test/language/expressions/instanceof"
  # "test/language/expressions/left-shift"
  # "test/language/expressions/less-than-or-equal"
  # "test/language/expressions/less-than"
  # "test/language/expressions/logical-and"
  # "test/language/expressions/logical-assignment"
  # "test/language/expressions/logical-not"
  # "test/language/expressions/logical-or"
  # "test/language/expressions/member-expression"
  # "test/language/expressions/modulus"
  # "test/language/expressions/multiplication"
  # "test/language/expressions/new.target"
  # "test/language/expressions/new"
  # "test/language/expressions/object"
  # "test/language/expressions/optional-chaining"
  # "test/language/expressions/postfix-decrement"
  # "test/language/expressions/postfix-increment"
  # "test/language/expressions/prefix-decrement"
  # "test/language/expressions/prefix-increment"
  # "test/language/expressions/property-accessors"
  # "test/language/expressions/relational"
  # "test/language/expressions/right-shift"
  # "test/language/expressions/strict-does-not-equals"
  # "test/language/expressions/strict-equals"
  # "test/language/expressions/subtraction"
  # "test/language/expressions/super"
  # "test/language/expressions/tagged-template"
  # "test/language/expressions/template-literal"
  # "test/language/expressions/this"
  # "test/language/expressions/typeof"
  # "test/language/expressions/unary-minus"
  # "test/language/expressions/unary-plus"
  # "test/language/expressions/unsigned-right-shift"
  # "test/language/expressions/void"
  # "test/language/expressions/yield"

  # "test/language/M_super"

  # "test/language/expressions/assignment"


  # "test/language/arguments-object"
  # "test/language/asi"
  # "test/language/block-scope"
  # "test/language/comments"
  # "test/language/computed-property-names"
  # "test/language/destructuring"
  # "test/language/directive-prologue"
  # "test/language/eval-code"
  # "test/language/export"
  # "test/language/expressions"
  # "test/language/function-code"
  # "test/language/future-reserved-words"
  # "test/language/global-code"
  # "test/language/identifier-resolution"
  # "test/language/identifiers"
  # # "test/language/import"
  # # "test/language/keywords"
  # "test/language/line-terminators"
  # "test/language/literals"
  # # "test/language/module-code"
  # "test/language/punctuators"
  # "test/language/reserved-words"
  # "test/language/rest-parameters"
  # "test/language/source-text"
  # "test/language/statementList"
  # "test/language/statements"
  # "test/language/types"
  # "test/language/white-space"





  # "test/language/statements/async-function"
  # "test/language/statements/async-generator"
  # "test/language/statements/await-using"
  # "test/language/statements/block"
  # "test/language/statements/break"
  # "test/language/statements/class"
  # "test/language/statements/const"
  # "test/language/statements/continue"
  # # "test/language/statements/debugger"
  # "test/language/statements/do-while"
  # "test/language/statements/empty"
  # "test/language/statements/expression"
  # "test/language/statements/for"
  # "test/language/statements/for-await-of"
  # "test/language/statements/for-in"
  # "test/language/statements/for-of"
  # "test/language/statements/function"
  # "test/language/statements/generators"
  # "test/language/statements/if"
  # "test/language/statements/labeled"
  # "test/language/statements/let"
  # "test/language/statements/return"
  # "test/language/statements/switch"
  # "test/language/statements/throw"
  # "test/language/statements/try"
  # # "test/language/statements/using"
  # "test/language/statements/variable"
  # "test/language/statements/while"
  # "test/language/statements/with"
)

for test in "${TESTS[@]}"; do
  rm -rf failing_tests
  mkdir failing_tests

  # 3. Branching logic
  if [ "$js3_passed" = true ]; then
    outFile="failure_summary_js3_${test//\//_}"
    NO_OPT=1 node run.cjs "$test/" --only-diff --ignore-with --ignore-name --js3 2> $outFile

    # node audit_failures.cjs
    # mv failure_summary.txt $outFile
    rm -rf "failing_tests_js3_${test//\//_}"
    mv failing_tests "failing_tests_js3_${test//\//_}"

  else
    outFile="failure_summary_iri_${test//\//_}"
    NO_OPT=1 node run.cjs "$test/" --only-diff --ignore-with --ignore-name --iri 2> $outFile

    # node audit_failures.cjs
    # mv failure_summary.txt $outFile
    rm -rf "failing_tests_iri_${test//\//_}"
    mv failing_tests "failing_tests_iri_${test//\//_}"
  fi

done
