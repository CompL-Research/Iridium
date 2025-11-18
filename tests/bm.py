#!/usr/bin/env python3
import subprocess
import csv
from pathlib import Path
import matplotlib.pyplot as plt
import pandas as pd
from datetime import datetime
import shutil

# ======================
# Configuration
# ======================
RUNS = 10                     # Number of runs per benchmark
GRID_COLS = 5                 # Number of columns in the final boxplot grid
IRIDIUM_DIR = Path("..").resolve()
QJS_DIR = Path("/home/anirudh/wd/quickjs")

# --- Directory Configuration ---
RESULTS_DIR = Path("results").resolve()
JSON_BENCHMARK_DIR = Path("json_benchmark").resolve()
JS3_BENCHMARK_DIR = Path("js3_benchmark").resolve()


SUNSPIDER = [
    "benchmarks/sunspider/3d-cube.cjs",
    "benchmarks/sunspider/3d-morph.cjs",
    "benchmarks/sunspider/3d-raytrace.cjs",
    "benchmarks/sunspider/access-binary-trees.cjs",
    "benchmarks/sunspider/access-fannkuch.cjs",
    "benchmarks/sunspider/access-nbody.cjs",
    "benchmarks/sunspider/access-nsieve.cjs",
    "benchmarks/sunspider/bitops-3bit-bits-in-byte.cjs",
    "benchmarks/sunspider/bitops-bits-in-byte.cjs",
    "benchmarks/sunspider/bitops-bitwise-and.cjs",
    "benchmarks/sunspider/bitops-nsieve-bits.cjs",
    "benchmarks/sunspider/controlflow-recursive.cjs",
    # "benchmarks/sunspider/crypto-aes.cjs",
    "benchmarks/sunspider/crypto-md5.cjs",
    "benchmarks/sunspider/crypto-sha1.cjs",
    "benchmarks/sunspider/date-format-xparb.cjs",
    "benchmarks/sunspider/math-cordic.cjs",
    "benchmarks/sunspider/math-partial-sums.cjs",
    "benchmarks/sunspider/math-spectral-norm.cjs",
    "benchmarks/sunspider/regexp-dna.cjs",
    "benchmarks/sunspider/string-base64.cjs",
    "benchmarks/sunspider/string-fasta.cjs",
    "benchmarks/sunspider/string-tagcloud.cjs",
    "benchmarks/sunspider/string-unpack-code.cjs",
    "benchmarks/sunspider/string-validate-input.cjs",
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
    "benchmarks/ML/ML_load.cjs",
    "benchmarks/Octane2/Regexpbenchmark.cjs",
    "benchmarks/SeaMonster/gaussian-blur.cjs",
    "benchmarks/UniPoker/benchmark.cjs",
]


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

# ======================
# Utilities
# ======================
def run_timed(cmd, cwd=None):
    """Run a command and return elapsed time (seconds)."""
    result = subprocess.run(
        ["/usr/bin/time", "-f", "%e", *cmd],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
        text=True,
        cwd=cwd,
    )
    try:
        return float(result.stderr.strip().split()[-1])
    except (IndexError, ValueError):
        print(f"⚠️  Could not execute or parse time for: {' '.join(map(str, cmd))}")
        return float("inf")


def run_multiple(cmd, runs=RUNS, cwd=None):
    """Run command multiple times and return list of times."""
    return [run_timed(cmd, cwd) for _ in range(runs)]


# ======================
# Main Benchmark Loop
# ======================
def main():
    timestamp = datetime.now().strftime("%d-%m-%Y-%H-%M-%S")
    run_output_dir = RESULTS_DIR / timestamp
    run_output_dir.mkdir(parents=True, exist_ok=True)
    JSON_BENCHMARK_DIR.mkdir(exist_ok=True)
    JS3_BENCHMARK_DIR.mkdir(exist_ok=True)

    results_csv_path = run_output_dir / "benchmark_results.csv"
    plot_png_path = run_output_dir / "benchmark_grid_boxplots.png"

    all_results = []

    for test in SUNSPIDER:
        # Add flush=True to all print statements for immediate output
        print(f"\n=== Running {test} ===", flush=True)
        test_path = IRIDIUM_DIR / "tests" / test
        benchmark_name = Path(test).name

        target_json_path = JSON_BENCHMARK_DIR / f"{benchmark_name}.json"
        target_js3_path = JS3_BENCHMARK_DIR / f"{benchmark_name}.js3"
        
        if target_json_path.exists() and target_js3_path.exists():
            print(f"  ↪️ Using cached files for {benchmark_name}", flush=True)
            json_file = target_json_path
            js3_file = target_js3_path
        else:
            print(f"  ▷ Cache miss. Compiling {benchmark_name} with Iridium...", flush=True)
            
            compile_result = subprocess.run(
                ["./iridium", "iri", "--ljson", ".", str(test_path)],
                cwd=IRIDIUM_DIR,
                capture_output=True,
                text=True
            )

            if compile_result.returncode != 0:
                print(f"  ❌ Iridium compilation FAILED for {benchmark_name}. Skipping.", flush=True)
                print(f"  Stderr: {compile_result.stderr.strip()}", flush=True)
                continue

            outputs_dir = IRIDIUM_DIR / "outputs"
            
            generated_json = next(outputs_dir.glob("*.json"), None)
            if generated_json:
                shutil.move(str(generated_json), str(target_json_path))
                json_file = target_json_path
            else:
                print(f"  ⚠️ Could not find generated JSON for {benchmark_name}", flush=True)
                json_file = None

            generated_js3 = next(outputs_dir.glob("*.js3"), None)
            if generated_js3:
                shutil.move(str(generated_js3), str(target_js3_path))
                js3_file = target_js3_path
            else:
                print(f"  ⚠️ Could not find generated JS3 for {benchmark_name}", flush=True)
                js3_file = None

        configs = {
            "QJS+SOURCE": ["./script.sh", str(test_path)],
            "QJS+JS3": ["./script.sh", str(js3_file)] if js3_file else None,
            "IRIDIUM": ["./tiri.sh", str(json_file)] if json_file else None,
        }

        for name, cmd in configs.items():
            if not cmd:
                print(f"→ Skipping {name} (no input file found)", flush=True)
                continue
            print(f"→ {name}", flush=True)
            times = run_multiple(cmd, cwd=QJS_DIR)
            for t in times:
                all_results.append((test, name, t))

    if not all_results:
        print("\nNo results were generated. Exiting.", flush=True)
        return
        
    with open(results_csv_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["benchmark", "config", "time_sec"])
        writer.writerows(all_results)
    print(f"\n✅ Results written to {results_csv_path}", flush=True)

    plot_grid(all_results, plot_png_path)
    print(f"📊 Plot saved to {plot_png_path}", flush=True)


# ======================
# Grid Plot
# ======================
def plot_grid(results, output_path):
    df = pd.DataFrame(results, columns=["benchmark", "config", "time_sec"])
    benchmarks = sorted(df["benchmark"].unique())

    ncols = GRID_COLS
    nrows = (len(benchmarks) + ncols - 1) // ncols
    fig, axes = plt.subplots(
        nrows, ncols, 
        figsize=(4 * ncols, 3 * nrows), 
        constrained_layout=True  # Better than tight_layout
    )
    axes = axes.flatten()

    colors = {"QJS+SOURCE": "#fdae61", "QJS+JS3": "#abd9e9", "IRIDIUM": "#2c7bb6"}
    config_order = ["QJS+SOURCE", "QJS+JS3", "IRIDIUM"]
    labels = ["QJS+SRC", "QJS+JS3", "IRIDIUM"]

    for i, bm in enumerate(benchmarks):
        ax = axes[i]
        sub = df[df["benchmark"] == bm]
        
        data = [sub[sub["config"] == c]["time_sec"] for c in config_order]

        if all(d.empty for d in data):
            ax.axis("off")
            continue

        # FIX: Changed 'labels' to 'tick_labels' to remove the warning
        bp = ax.boxplot(data, patch_artist=True, tick_labels=labels)
        
        for patch, config_name in zip(bp["boxes"], config_order):
             patch.set_facecolor(colors.get(config_name, "#cccccc"))

        ax.set_title(Path(bm).name, fontsize=8)
        ax.tick_params(axis="x", labelrotation=45, labelsize=7)
        ax.grid(axis="y", linestyle="--", alpha=0.5)

    for j in range(len(benchmarks), len(axes)):
        axes[j].axis("off")

    fig.suptitle("Benchmark Runtime Comparison", fontsize=14)
    plt.savefig(output_path, dpi=200)
    plt.close()


if __name__ == "__main__":
    main()