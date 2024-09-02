#!/bin/bash

rm -rf tmp 2>/dev/null
mkdir tmp 2>/dev/null
# Function to run the node command and print the section header
run_test() {
  local index=$1
  local total=$2
  local test_dir=$3

  echo "=== Running tests in $test_dir ($index of $total) ==="
  node run.cjs "$test_dir"
  echo ""

  echo "Completed: $index of $total tests."
  echo "Remaining: $((total - index)) tests."
  echo ""
}

# Print the current date and time
{
  echo "=== Test Run Started: $(date) ==="
  echo ""
}

# List of test directories
tests=(
  # "test/language/asi"
  "test/language/module-code"
  # "test/language/export"
  # "test/language/reserved-words"
  # "test/language/eval-code"
  # "test/language/destructuring"
  # "test/language/directive-prologue"
  # "test/language/comments"
  # "test/language/arguments-object"
  # "test/language/types"
  # "test/language/expressions"
  # "test/language/global-code"
  # "test/language/white-space"
  # "test/language/block-scope"
  # "test/language/statements"
  # "test/language/future-reserved-words"
  # "test/language/source-text"
  # "test/language/statementList"
  # "test/language/line-terminators"
  # "test/language/identifier-resolution"
  # "test/language/identifiers"
  # "test/language/rest-parameters"
  # "test/language/keywords"
  # "test/language/punctuators"
  # "test/language/literals"
  # "test/language/function-code"
  # "test/language/computed-property-names"
  # "test/language/import"
)

total_tests=${#tests[@]}

# Run the tests with progress tracking
for i in "${!tests[@]}"; do
  current_test=$((i + 1))
  run_test "$current_test" "$total_tests" "${tests[i]}"
done

# Print completion message
echo "=== Test Run Completed: $(date) ==="
