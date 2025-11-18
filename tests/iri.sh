#!/usr/bin/env bash
set -euo pipefail  # safe defaults

if [ $# -lt 1 ]; then
  echo "Error: Missing argument!" >&2
  echo "Usage: $0 <arg>" >&2
  exit 1
fi

# Go to Iridium root and run Iridium
cd ..
# ./iridium iri -s script --ljson . ./tests/$1
./iridium iri --ljson . ./tests/$1

# Collect generated outputs
outputs=$(ls -1 "$PWD/outputs" | sed "s|^|$PWD/outputs/|")

# Print them
echo "$outputs"

# # Extract the generated .js3 and .json paths
# js3_file=$(echo "$outputs" | grep '\.js3$' || true)
# json_file=$(echo "$outputs" | grep '\.json$' || true)

# # Run in quickjs if files exist
# cd /home/meetesh/wd/quickjs

# if [[ -n "$js3_file" ]]; then
#   ./script.sh "$js3_file"
# fi

# if [[ -n "$json_file" ]]; then
#   ./tiri.sh "$json_file"
# fi