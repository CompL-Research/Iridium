#!/usr/bin/env python3
import subprocess
import csv
from pathlib import Path
import matplotlib.pyplot as plt
import pandas as pd
from datetime import datetime
import shutil
import re
from collections import Counter
import seaborn as sns

# ======================
# Configuration
# ======================
IRIDIUM_DIR = Path("..").resolve()
QJS_DIR = Path("/home/anirudh/wd/quickjs")

# --- Directory Configuration ---
RESULTS_BC_DIR = Path("results_bc").resolve()
JSON_BENCHMARK_DIR = Path("json_benchmark").resolve()
JS3_BENCHMARK_DIR = Path("js3_benchmark").resolve()


SUNSPIDER = [
    # "benchmarks/sunspider/3d-cube.cjs",
    # "benchmarks/sunspider/3d-morph.cjs",
    # "benchmarks/sunspider/3d-raytrace.cjs",
    # "benchmarks/sunspider/access-binary-trees.cjs",
    # "benchmarks/sunspider/access-fannkuch.cjs",
    # "benchmarks/sunspider/access-nbody.cjs",
    # "benchmarks/sunspider/access-nsieve.cjs",
    # "benchmarks/sunspider/bitops-3bit-bits-in-byte.cjs",
    # "benchmarks/sunspider/bitops-bits-in-byte.cjs",
    # "benchmarks/sunspider/bitops-bitwise-and.cjs",
    # "benchmarks/sunspider/bitops-nsieve-bits.cjs",
    # "benchmarks/sunspider/controlflow-recursive.cjs",
    # "benchmarks/sunspider/crypto-aes.cjs",
    # "benchmarks/sunspider/crypto-md5.cjs",
    # "benchmarks/sunspider/crypto-sha1.cjs",
    # "benchmarks/sunspider/date-format-xparb.cjs",
    # "benchmarks/sunspider/math-cordic.cjs",
    # "benchmarks/sunspider/math-partial-sums.cjs",
    # "benchmarks/sunspider/math-spectral-norm.cjs",
    # "benchmarks/sunspider/regexp-dna.cjs",
    # "benchmarks/sunspider/string-base64.cjs",
    # "benchmarks/sunspider/string-fasta.cjs",
    # "benchmarks/sunspider/string-tagcloud.cjs",
    # "benchmarks/sunspider/string-unpack-code.cjs",
    # "benchmarks/sunspider/string-validate-input.cjs",
    "benchmarks/kraken-1.0/kraken-1.0-ai-astar.cjs",
    "benchmarks/kraken-1.0/kraken-1.0-audio-beat-detection.cjs",
    "benchmarks/kraken-1.0/kraken-1.0-audio-dft.cjs",
    "benchmarks/kraken-1.0/kraken-1.0-audio-fft.cjs",
    "benchmarks/kraken-1.0/kraken-1.0-audio-oscillator.cjs",
    "benchmarks/kraken-1.0/kraken-1.0-imaging-darkroom.cjs",
    "benchmarks/kraken-1.0/kraken-1.0-imaging-desaturate.cjs",
    "benchmarks/kraken-1.0/kraken-1.0-imaging-gaussian-blur.cjs",
    "benchmarks/kraken-1.0/kraken-1.0-json-parse-financial.cjs",
    "benchmarks/kraken-1.0/kraken-1.0-json-stringify-tinderbox.cjs",
    "benchmarks/kraken-1.0/kraken-1.0-stanford-crypto-aes.cjs",
    "benchmarks/kraken-1.0/kraken-1.0-stanford-crypto-ccm.cjs",
    "benchmarks/kraken-1.0/kraken-1.0-stanford-crypto-pbkdf2.cjs",
    "benchmarks/kraken-1.0/kraken-1.0-stanford-crypto-sha256-iterative.cjs",
    # "benchmarks/ML/ML_load.js",
    # "benchmarks/octane/box2d_standalone.js",
    # "benchmarks/octane/code-load_standalone.js",
    # "benchmarks/octane/crypto_standalone.js",
    # "benchmarks/octane/deltablue_standalone.js",
    # "benchmarks/octane/earley-boyer_standalone.js",
    # "benchmarks/octane/gbemu_standalone.js",
    # "benchmarks/octane/mandreel_standalone.js",
    # "benchmarks/octane/navier-stokes_standalone.js",
    # "benchmarks/octane/pdfjs_standalone.js",
    # "benchmarks/octane/raytrace_standalone.js",
    # "benchmarks/octane/regexp_standalone.js",
    # "benchmarks/octane/richards_standalone.js",
    # "benchmarks/octane/splay_standalone.js",
    # "benchmarks/octane/typescript_standalone.js",
    # "benchmarks/octane/zlib_standalone.js",
]

# ======================
# Utilities
# ======================

def get_bytecode(cmd, cwd=None):
    """Runs a command and returns its stdout for parsing."""
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True,
            cwd=cwd,
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"⚠️  Command failed: {' '.join(map(str, cmd))}")
        print(f"   Stderr: {e.stderr.strip()}")
        return ""

def parse_and_count_opcodes(bytecode_text):
    """Parses text to find and count all bytecode opcodes."""
    # Regex to find lines like '   0:  get_var ...' and extract the opcode
    opcode_pattern = re.compile(r"^\s*\d+:\s+([a-zA-Z_]+)")
    opcodes = []
    for line in bytecode_text.splitlines():
        match = opcode_pattern.match(line)
        if match:
            opcodes.append(match.group(1))
    return Counter(opcodes)

def save_results(data, output_dir, file_prefix):
    """Converts collected data to a DataFrame, saves CSV, and generates a heatmap."""
    if not data:
        print(f"No data to save for {file_prefix}")
        return

    df = pd.DataFrame.from_dict(data, orient='index')
    df = df.fillna(0).astype(int)
    df = df.reindex(sorted(df.columns), axis=1) # Sort columns alphabetically

    # Save CSV
    csv_path = output_dir / f"{file_prefix}_bytecode_counts.csv"
    df.to_csv(csv_path)
    print(f"✅ Saved CSV to {csv_path}")

    # Generate and Save Heatmap
    if df.empty:
        print(f"Skipping heatmap for empty data in {file_prefix}")
        return
        
    heatmap_path = output_dir / f"{file_prefix}_bytecode_heatmap.png"
    plt.figure(figsize=(max(15, len(df.columns) * 0.5), max(8, len(df.index) * 0.5)))
    sns.heatmap(df, annot=True, fmt="d", cmap="viridis")
    plt.title(f"Bytecode Frequency Heatmap: {file_prefix.replace('_', ' ').title()}")
    plt.xlabel("Opcodes")
    plt.ylabel("Benchmarks")
    plt.xticks(rotation=45, ha='right')
    plt.yticks(rotation=0)
    plt.tight_layout()
    plt.savefig(heatmap_path, dpi=150)
    plt.close()
    print(f"📊 Saved Heatmap to {heatmap_path}")

# ======================
# Main Analysis Loop
# ======================
def main():
    timestamp = datetime.now().strftime("%d-%m-%Y-%H-%M-%S")
    run_output_dir = RESULTS_BC_DIR / timestamp
    run_output_dir.mkdir(parents=True, exist_ok=True)
    JSON_BENCHMARK_DIR.mkdir(exist_ok=True)
    JS3_BENCHMARK_DIR.mkdir(exist_ok=True)

    all_counts = {
        "QJS+Source": {},
        "JS3": {},
        "Iridium": {}
    }

    for test in SUNSPIDER:
        print(f"\n=== Analyzing {test} ===", flush=True)
        test_path = IRIDIUM_DIR / "tests" / test
        benchmark_name = Path(test).name

        target_json_path = JSON_BENCHMARK_DIR / f"{benchmark_name}.json"
        target_js3_path = JS3_BENCHMARK_DIR / f"{benchmark_name}.js3"
        
        # --- Caching Logic (from bm.py) ---
        if not (target_json_path.exists() and target_js3_path.exists()):
            print(f"  ▷ Cache miss. Compiling {benchmark_name} with Iridium...", flush=True)
            compile_result = subprocess.run(
                ["./iridium", "iri", "--ljson", ".", str(test_path)],
                cwd=IRIDIUM_DIR, capture_output=True, text=True
            )
            if compile_result.returncode != 0:
                print(f"  ❌ Iridium compilation FAILED. Skipping.", flush=True)
                continue

            outputs_dir = IRIDIUM_DIR / "outputs"
            generated_json = next(outputs_dir.glob("*.json"), None)
            if generated_json: shutil.move(str(generated_json), str(target_json_path))
            generated_js3 = next(outputs_dir.glob("*.js3"), None)
            if generated_js3: shutil.move(str(generated_js3), str(target_js3_path))

        json_file = target_json_path if target_json_path.exists() else None
        js3_file = target_js3_path if target_js3_path.exists() else None

        # --- Define configurations for bytecode generation ---
        configs = {
            "QJS+Source": ["./script_bc.sh", str(test_path)] if test_path.exists() else None,
            "JS3": ["./script_bc.sh", str(js3_file)] if js3_file else None,
            "Iridium": ["./tiri_bc.sh", str(json_file)] if json_file else None,
        }

        # --- Run analysis for each configuration ---
        for name, cmd in configs.items():
            if not cmd:
                print(f"→ Skipping {name} (no input file)")
                continue
            
            print(f"→ Generating bytecode for {name}...", flush=True)
            bytecode_text = get_bytecode(cmd, cwd=QJS_DIR)
            if bytecode_text:
                opcode_counts = parse_and_count_opcodes(bytecode_text)
                all_counts[name][benchmark_name] = opcode_counts

    # --- Save all results ---
    print("\n--- Aggregating and saving results ---")
    save_results(all_counts["Iridium"], run_output_dir, "iridium")
    save_results(all_counts["JS3"], run_output_dir, "js3")
    save_results(all_counts["QJS+Source"], run_output_dir, "qjs_source")

if __name__ == "__main__":
    main()