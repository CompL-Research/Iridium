cd ..
mkdir -p tests/FINAL_RESULTS
execute() {
  echo "($2) "&>> $OUTFILE
  PRESET_FLOW=1 JUST_ANALYZE=1 ./iridium iri --ljson $1 $2 &>> $OUTFILE
}

iterate() {
  ROOT="$1"
  OUTFILE="$2"
  echo "Executing $1"

  echo "" > $OUTFILE

  find "$ROOT" -type f -name "*.js" -print0 | while IFS= read -r -d '' file; do
    execute "$ROOT" "$file" "$OUTFILE"
  done

  bash tests/count.sh $OUTFILE
  echo ""
}

iterate "/root/react-motion" "tests/FINAL_RESULTS/JITA_REACT_MOTION"
iterate "/root/OrigamiSimulator" "tests/FINAL_RESULTS/JITA_ORIGAMI_SIMULATOR"
iterate "/root/frontendViz" "tests/FINAL_RESULTS/JITA_FRONTEND_VIZ"
iterate "/root/qs" "tests/FINAL_RESULTS/JITA_QS"