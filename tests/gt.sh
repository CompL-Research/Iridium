#!/bin/bash
rm failing/* &>/dev/null

if [ $# -lt 1 ]; then
  echo "Error: Missing argument!" >&2
  echo "Usage: $0 <arg>" >&2
  exit 1
fi

path="$1"
newpath="${path//\//_}"
# ls -1 tmp | grep "$newpath" | sed 's|^|tmp/|' 
for file in $(ls -1 tmp | grep "$newpath" | sed 's|^|tmp/|'); do
  cp "$file" failing/
done

test262path="test262/$path"
cp $test262path failing
ls -1 failing | sed 's|^|failing/|'
