execute() {
  echo $1 $2
  printf "($2) "
  JUST_ANALYZE=1 ./iridium iri --ljson $1 $2
}

iterate() {
  ROOT="$1"

  find "$ROOT" -type f -name "*.js" -print0 | while IFS= read -r -d '' file; do
    execute "$ROOT" "$file"
  done
}

# iterate "/home/meetesh/wd/material-dashboard-react"
# iterate "/home/meetesh/wd/frontendViz"

iterate "/home/meetesh/wd/react-motion"
# iterate "/home/meetesh/wd/OrigamiSimulator" # too long to run

# iterate "/home/meetesh/wd/llm.js"

# iterate "/home/meetesh/wd/qs"