#!/bin/bash
set -e

SUNSPIDER=(
  "benchmarks/sunspider/3d-cube.cjs"
  # "benchmarks/sunspider/3d-morph.cjs"
  # "benchmarks/sunspider/3d-raytrace.cjs"
  # "benchmarks/sunspider/access-binary-trees.cjs"
  # "benchmarks/sunspider/access-fannkuch.cjs"
  # "benchmarks/sunspider/access-nbody.cjs"
  # "benchmarks/sunspider/access-nsieve.cjs"
  # "benchmarks/sunspider/bitops-3bit-bits-in-byte.cjs"
  # "benchmarks/sunspider/bitops-bits-in-byte.cjs"
  # "benchmarks/sunspider/bitops-bitwise-and.cjs"
  # "benchmarks/sunspider/bitops-nsieve-bits.cjs"
  # "benchmarks/sunspider/controlflow-recursive.cjs"
  # "benchmarks/sunspider/crypto-aes.cjs"
  # "benchmarks/sunspider/crypto-md5.cjs"
  # "benchmarks/sunspider/crypto-sha1.cjs"
  # "benchmarks/sunspider/date-format-tofte.cjs"
  # "benchmarks/sunspider/date-format-xparb.cjs"
  # "benchmarks/sunspider/math-cordic.cjs"
  # "benchmarks/sunspider/math-partial-sums.cjs"
  # "benchmarks/sunspider/math-spectral-norm.cjs"
  # "benchmarks/sunspider/regexp-dna.cjs"
  # "benchmarks/sunspider/string-base64.cjs"
  # "benchmarks/sunspider/string-fasta.cjs"
  # "benchmarks/sunspider/string-tagcloud.cjs"
  # "benchmarks/sunspider/string-unpack-code.cjs"
  # "benchmarks/sunspider/string-validate-input.cjs"
)

KRAKEN=(
  "benchmarks/kraken-1.0/kraken-1.0-ai-astar.cjs"
  "benchmarks/kraken-1.0/kraken-1.0-audio-beat-detection.cjs"
  "benchmarks/kraken-1.0/kraken-1.0-audio-dft.cjs"
  "benchmarks/kraken-1.0/kraken-1.0-audio-fft.cjs"
  "benchmarks/kraken-1.0/kraken-1.0-audio-oscillator.cjs"
  "benchmarks/kraken-1.0/kraken-1.0-imaging-darkroom.cjs"
  "benchmarks/kraken-1.0/kraken-1.0-imaging-desaturate.cjs"
  "benchmarks/kraken-1.0/kraken-1.0-imaging-gaussian-blur.cjs"
  "benchmarks/kraken-1.0/kraken-1.0-json-parse-financial.cjs"
  "benchmarks/kraken-1.0/kraken-1.0-json-stringify-tinderbox.cjs"
  "benchmarks/kraken-1.0/kraken-1.0-stanford-crypto-aes.cjs"
  "benchmarks/kraken-1.0/kraken-1.0-stanford-crypto-ccm.cjs"
  "benchmarks/kraken-1.0/kraken-1.0-stanford-crypto-pbkdf2.cjs"
  "benchmarks/kraken-1.0/kraken-1.0-stanford-crypto-sha256-iterative.cjs"
)

V8=(
    "benchmarks/v8/combined.cjs"
)

ALL=("${SUNSPIDER[@]}" "${KRAKEN[@]}" "${V8[@]}")

cd ..

iridir=`pwd`
qjsdir="/home/meetesh/wd/quickjs"

for test in "${SUNSPIDER[@]}"; do
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
  # time ./script.sh "$js3_file"

  if [[ -n "$json_file" ]]; then
    time ./tiri.sh "$json_file"
  fi

done
