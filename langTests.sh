#!/bin/bash

# Define the directory and repository variables
TEST262_DIR="tests/test262"
REPO_URL="git@github.com:tc39/test262.git"
V8_BIN="/home/meetesh/wd/v8/v8/out/x64.release/d8"

SUCCESS_FILE="success_tests.log"
SKIPPED_FILE="skipped_tests.log"
FAIL_FILE="failed_tests.log"

SUCCESS_LOG="success_out.log"
FAIL_LOG="failed_out.log"

CWD=$(pwd)

# Check if the test262 directory exists
if [ ! -d "$TEST262_DIR" ]; then
  echo "Directory $TEST262_DIR does not exist. Cloning the repository..."
  git clone "$REPO_URL" "$TEST262_DIR" || { echo "Failed to clone repository."; exit 1; }
fi

# Navigate to the test262 directory
cd "$TEST262_DIR" || exit

# Check if it's a valid git repository
if git status &> /dev/null; then
  echo "Git repository is valid. Pulling latest updates..."
  git pull || { echo "Failed to pull updates."; exit 1; }
else
  echo "Repository is broken or not initialized correctly. Re-cloning..."
  cd ..
  rm -rf "$TEST262_DIR"
  git clone "$REPO_URL" "$TEST262_DIR" || { echo "Failed to clone repository."; exit 1; }
  cd "$TEST262_DIR" || exit
fi

cd "$CWD" || exit

HARNESSES="$TEST262_DIR/harness/sta.js $TEST262_DIR/harness/propertyHelper.js $TEST262_DIR/harness/doneprintHandle.js $TEST262_DIR/harness/assert.js"

# Navigate to the test/language folder
TESTS_DIR="$TEST262_DIR/test/language/arguments-object"

if [ -d "$TESTS_DIR" ]; then
  # Use a for loop to recursively iterate over all files in the directory
  echo "Iterating over all files in $TESTS_DIR:"
  # Clear or create the output files
  > "$SUCCESS_FILE"
  > "$SUCCESS_LOG"
  > "$FAIL_FILE"
  > "$FAIL_LOG"
  > "$SKIPPED_FILE"

  for file in $(find "$TESTS_DIR" -type f); do

    # Skip files containing "$DONOTEVALUATE()"
    if grep -q '\$DONOTEVALUATE()' "$file"; then
      echo "Skipping $file (contains \$DONOTEVALUATE())" > "$SKIPPED_FILE"
      continue
    fi

    FLAGS=$(sed -n 's/.*flags: \[\(.*\)\].*/\1/p' "$file" | tr -d '[:space:]' | sed 's/,/ /g')

    # Set MODULE based on the presence of 'onlyStrict'
    if echo "$FLAGS" | grep -q 'onlyStrict'; then
      MODULE="--module"
    else
      MODULE=""
    fi

    if $V8_BIN $HARNESSES $MODULE "$file" > /dev/null 2>&1; then
      echo "$file" >> "$SUCCESS_FILE"
      # Uncomment below lines to log successful test output
      # echo "$file" >> "$SUCCESS_LOG"
      # $V8_BIN $HARNESSES "$file" >> "$SUCCESS_LOG"
    else
      echo "$file" >> "$FAIL_FILE"
      echo "$file" >> "$FAIL_LOG"
      $V8_BIN $HARNESSES $MODULE "$file" >> "$FAIL_LOG"
    fi
  done

  # Generate summary
  SUCCESS_COUNT=$(wc -l < "$SUCCESS_FILE")
  FAIL_COUNT=$(wc -l < "$FAIL_FILE")

  echo "Summary of test results:"
  echo "Successful tests: $SUCCESS_COUNT"
  echo "Failed tests: $FAIL_COUNT"
else
  echo "Directory $TESTS_DIR does not exist."
fi
