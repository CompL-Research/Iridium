SUNSPIDER=(
  "benchmarks/sunspider/sunspider-1.0-3d-cube.js"
  "benchmarks/sunspider/sunspider-1.0-3d-morph.js"
  "benchmarks/sunspider/sunspider-1.0-3d-raytrace.js"
  "benchmarks/sunspider/sunspider-1.0-access-binary-trees.js"
  "benchmarks/sunspider/sunspider-1.0-access-fannkuch.js"
  "benchmarks/sunspider/sunspider-1.0-access-nbody.js"
  "benchmarks/sunspider/sunspider-1.0-access-nsieve.js"
  "benchmarks/sunspider/sunspider-1.0-bitops-3bit-bits-in-byte.js"
  "benchmarks/sunspider/sunspider-1.0-bitops-bits-in-byte.js"
  "benchmarks/sunspider/sunspider-1.0-bitops-bitwise-and.js"
  "benchmarks/sunspider/sunspider-1.0-bitops-nsieve-bits.js"
  "benchmarks/sunspider/sunspider-1.0-controlflow-recursive.js"
  "benchmarks/sunspider/sunspider-1.0-crypto-aes.js"
  "benchmarks/sunspider/sunspider-1.0-crypto-md5.js"
  "benchmarks/sunspider/sunspider-1.0-crypto-sha1.js"
  "benchmarks/sunspider/sunspider-1.0-date-format-tofte.js"
  "benchmarks/sunspider/sunspider-1.0-date-format-xparb.js"
  "benchmarks/sunspider/sunspider-1.0-math-cordic.js"
  "benchmarks/sunspider/sunspider-1.0-math-partial-sums.js"
  "benchmarks/sunspider/sunspider-1.0-math-spectral-norm.js"
  "benchmarks/sunspider/sunspider-1.0-regexp-dna.js"
  "benchmarks/sunspider/sunspider-1.0-string-base64.js"
  "benchmarks/sunspider/sunspider-1.0-string-fasta.js"
  "benchmarks/sunspider/sunspider-1.0-string-tagcloud.js"
  "benchmarks/sunspider/sunspider-1.0-string-unpack-code.js"
  "benchmarks/sunspider/sunspider-1.0-string-validate-input.js"
)
KRAKEN1=(
  # "benchmarks/kraken-1.0/kraken-1.0-ai-astar.cjs"
  # "benchmarks/kraken-1.0/kraken-1.0-audio-beat-detection.cjs"
  # "benchmarks/kraken-1.0/kraken-1.0-audio-dft.cjs"
  # "benchmarks/kraken-1.0/kraken-1.0-audio-fft.cjs"
  # "benchmarks/kraken-1.0/kraken-1.0-audio-oscillator.cjs"
  # "benchmarks/kraken-1.0/kraken-1.0-imaging-darkroom.cjs"
  "benchmarks/kraken-1.0/kraken-1.0-imaging-desaturate.cjs"
  # "benchmarks/kraken-1.0/kraken-1.0-imaging-gaussian-blur.cjs"
  # "benchmarks/kraken-1.0/kraken-1.0-json-parse-financial.cjs"
  # "benchmarks/kraken-1.0/kraken-1.0-json-stringify-tinderbox.cjs"
  # "benchmarks/kraken-1.0/kraken-1.0-stanford-crypto-aes.cjs"
  # "benchmarks/kraken-1.0/kraken-1.0-stanford-crypto-ccm.cjs"
  # "benchmarks/kraken-1.0/kraken-1.0-stanford-crypto-pbkdf2.cjs"
  # "benchmarks/kraken-1.0/kraken-1.0-stanford-crypto-sha256-iterative.cjs"
)

# KRAKEN2=(
#   "benchmarks/kraken-1.1/ai-astar-data.cjs"
#   "benchmarks/kraken-1.1/ai-astar.cjs"
#   "benchmarks/kraken-1.1/audio-beat-detection-data.cjs"
#   "benchmarks/kraken-1.1/audio-beat-detection.cjs"
#   "benchmarks/kraken-1.1/audio-dft-data.cjs"
#   "benchmarks/kraken-1.1/audio-dft.cjs"
#   "benchmarks/kraken-1.1/audio-fft-data.cjs"
#   "benchmarks/kraken-1.1/audio-fft.cjs"
#   "benchmarks/kraken-1.1/audio-oscillator-data.cjs"
#   "benchmarks/kraken-1.1/audio-oscillator.cjs"
#   "benchmarks/kraken-1.1/imaging-darkroom-data.cjs"
#   "benchmarks/kraken-1.1/imaging-darkroom.cjs"
#   "benchmarks/kraken-1.1/imaging-desaturate-data.cjs"
#   "benchmarks/kraken-1.1/imaging-desaturate.cjs"
#   "benchmarks/kraken-1.1/imaging-gaussian-blur-data.cjs"
#   "benchmarks/kraken-1.1/imaging-gaussian-blur.cjs"
#   "benchmarks/kraken-1.1/json-parse-financial-data.cjs"
#   "benchmarks/kraken-1.1/json-parse-financial.cjs"
#   "benchmarks/kraken-1.1/json-stringify-tinderbox-data.cjs"
#   "benchmarks/kraken-1.1/json-stringify-tinderbox.cjs"
#   "benchmarks/kraken-1.1/stanford-crypto-aes-data.cjs"
#   "benchmarks/kraken-1.1/stanford-crypto-aes.cjs"
#   "benchmarks/kraken-1.1/stanford-crypto-ccm-data.cjs"
#   "benchmarks/kraken-1.1/stanford-crypto-ccm.cjs"
#   "benchmarks/kraken-1.1/stanford-crypto-pbkdf2-data.cjs"
#   "benchmarks/kraken-1.1/stanford-crypto-pbkdf2.cjs"
#   "benchmarks/kraken-1.1/stanford-crypto-sha256-iterative-data.cjs"
#   "benchmarks/kraken-1.1/stanford-crypto-sha256-iterative.cjs"
# )

V8=(
    "benchmarks/v8/combined.cjs"
)

cd ..

iridir=`pwd`
qjsdir="/home/meetesh/wd/quickjs"

for test in "${V8[@]}"; do
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
