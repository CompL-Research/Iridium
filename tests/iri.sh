#!/usr/bin/env bash
set -euo pipefail  # safe defaults

if [ $# -lt 1 ]; then
  echo "Error: Missing argument!" >&2
  echo "Usage: $0 <arg>" >&2
  exit 1
fi

cd ..
./iridium iri . ./tests/$1

ls -1 outputs | sed "s|^|$PWD/outputs/|"