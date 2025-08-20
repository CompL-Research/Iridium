#!/usr/bin/env bash
set -euo pipefail

rm -rf tmp
mkdir tmp

TESTS=(
  # "test/language/expressions"
  # "test/language/expressions/addition"
  # "test/language/expressions/array"
  # "test/language/expressions/arrow-function"
  "test/language/statements"
  # "test/language/statements/async-function"
  # "async-generator"
  # "await-using"
  # "block"
  # "break"
  # "class"
  # "const"
  # "continue"
  # "debugger"
  # "do-while"
  # "empty"
  # "expression"
  # "for"
  # "for-await-of"
  # "for-in"
  # "for-of"
  # "function"
  # "generators"
  # "if"
  # "labeled"
  # "let"
  # "return"
  # "switch"
  # "throw"
  # "try"
  # "using"
  # "variable"
  # "while"
  # "with"
)

for test in "${TESTS[@]}"; do
  outFile="out_${test//\//_}"
  echo "Running $test -> $outFile"
  node run.cjs "$test/" > "$outFile"
done