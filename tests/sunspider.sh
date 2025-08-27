TESTS=(
  "benchmarks/sunspider-1.0-3d-cube.js"
  "benchmarks/sunspider-1.0-3d-morph.js"
  "benchmarks/sunspider-1.0-3d-raytrace.js"
  "benchmarks/sunspider-1.0-access-binary-trees.js"
  "benchmarks/sunspider-1.0-access-fannkuch.js"
  "benchmarks/sunspider-1.0-access-nbody.js"
  "benchmarks/sunspider-1.0-access-nsieve.js"
  "benchmarks/sunspider-1.0-bitops-3bit-bits-in-byte.js"
  "benchmarks/sunspider-1.0-bitops-bits-in-byte.js"
  "benchmarks/sunspider-1.0-bitops-bitwise-and.js"
  "benchmarks/sunspider-1.0-bitops-nsieve-bits.js"
  "benchmarks/sunspider-1.0-controlflow-recursive.js"
  "benchmarks/sunspider-1.0-crypto-aes.js"
  "benchmarks/sunspider-1.0-crypto-md5.js"
  "benchmarks/sunspider-1.0-crypto-sha1.js"
  "benchmarks/sunspider-1.0-date-format-tofte.js"
  "benchmarks/sunspider-1.0-date-format-xparb.js"
  "benchmarks/sunspider-1.0-math-cordic.js"
  "benchmarks/sunspider-1.0-math-partial-sums.js"
  "benchmarks/sunspider-1.0-math-spectral-norm.js"
  "benchmarks/sunspider-1.0-regexp-dna.js"
  "benchmarks/sunspider-1.0-string-base64.js"
  "benchmarks/sunspider-1.0-string-fasta.js"
  "benchmarks/sunspider-1.0-string-tagcloud.js"
  "benchmarks/sunspider-1.0-string-unpack-code.js"
  "benchmarks/sunspider-1.0-string-validate-input.js"
)

cd ..

iridir=`pwd`
qjsdir="/home/meetesh/wd/quickjs"

for test in "${TESTS[@]}"; do
  cd $iridir

  echo "Running Test $test"

  ./iridium iri --ljson . ./tests/$test

  # Collect generated outputs
  outputs=$(ls -1 "$PWD/outputs" | sed "s|^|$PWD/outputs/|")

  # Extract the generated .js3 and .json paths
  js3_file=$(echo "$outputs" | grep '\.js3$' || true)
  json_file=$(echo "$outputs" | grep '\.json$' || true)

  # Run in quickjs if files exist
  cd $qjsdir

  time ./script.sh "$iridir/tests/$test"

  if [[ -n "$json_file" ]]; then
    time ./tiri.sh "$json_file"
  fi

done