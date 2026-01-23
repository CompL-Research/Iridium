#!/usr/bin/env bash

DIR="${1:-.}"

cwd=`pwd`

jsbin="/home/meetesh/wd/mozilla-unified/obj-opt-x86_64-pc-linux-gnu/dist/bin/js"

for file in "$DIR"/*.cjs; do
  # Skip if no .cjs files exist
  [[ -e "$file" ]] || continue
  
  cd $cwd
  echo "CWD: $cwd"
  filePath=`realpath $file`
  echo "FILE: $(realpath "$file")"
  
  JUST_ANALYZE=1 ./iridium iri --ljson . $filePath > out
  cd /home/meetesh/wd/mozilla-unified
  unset TDZI
  echo "Without TDZI"
  time $jsbin $filePath
  echo "With TDZI"
  export TDZI="/home/meetesh/wd/Iridium/out"
  time $jsbin $filePath
done




