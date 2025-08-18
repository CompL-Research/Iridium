#!/usr/bin/env bash
set -euo pipefail

rm -rf tmp
mkdir tmp

BASE="test/language/statements"

dirs=(
  # "async-function"
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
  "for-in"
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

for dirname in "${dirs[@]}"; do
  outFile="outStmt$(tr '-' '_' <<<"$dirname" | sed -E 's/(^|_)([a-z])/\U\2/g')"
  echo "Running $dirname -> $outFile"
  node run.cjs "$BASE/$dirname/" > "$outFile"
done