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
  "test/language"
)

for test in "${TESTS[@]}"; do
  rm -rf failing_tests
  mkdir failing_tests

  # --saveArtifacts : to save artifacts

  # 3. Branching logic
  if [ "$js3_passed" = true ]; then
    outFile="failure_summary_js3_${test//\//_}"
    NO_OPT=1 node run.cjs "$test/" --only-diff --ignore-with --ignore-name --js3 2> $outFile

    # rm -rf "failing_tests_js3_${test//\//_}"
    # mv failing_tests "failing_tests_js3_${test//\//_}"

  else
    outFile="failure_summary_iri_${test//\//_}"
    NO_OPT=1 node run.cjs "$test/" --only-diff --ignore-with --ignore-name --iri 2> $outFile

    # rm -rf "failing_tests_iri_${test//\//_}"
    # mv failing_tests "failing_tests_iri_${test//\//_}"
  fi

done
