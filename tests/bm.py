#!/usr/bin/env python3
import subprocess
import statistics
import csv
from pathlib import Path
import matplotlib.pyplot as plt
import pandas as pd

# ======================
# Configuration
# ======================
RUNS = 10                     # Number of runs per benchmark
GRID_COLS = 5                 # Number of columns in the final boxplot grid
IRIDIUM_DIR = Path("..").resolve()
QJS_DIR = Path("/home/meetesh/wd/quickjs")
RESULTS_CSV = Path("benchmark_results.csv")
PLOT_PNG = Path("benchmark_grid_boxplots.png")

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
    "benchmarks/sunspider/crypto-aes.cjs",
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
    # "benchmarks/kraken-1.0/kraken-1.0-ai-astar.cjs",
    # "benchmarks/kraken-1.0/kraken-1.0-audio-beat-detection.cjs",
    # "benchmarks/kraken-1.0/kraken-1.0-audio-dft.cjs",
    # "benchmarks/kraken-1.0/kraken-1.0-audio-fft.cjs",
    # "benchmarks/kraken-1.0/kraken-1.0-audio-oscillator.cjs",
    # "benchmarks/kraken-1.0/kraken-1.0-imaging-darkroom.cjs",
    # "benchmarks/kraken-1.0/kraken-1.0-imaging-desaturate.cjs",
    # "benchmarks/kraken-1.0/kraken-1.0-imaging-gaussian-blur.cjs",
    # "benchmarks/kraken-1.0/kraken-1.0-json-parse-financial.cjs",
    # "benchmarks/kraken-1.0/kraken-1.0-json-stringify-tinderbox.cjs",
    # "benchmarks/kraken-1.0/kraken-1.0-stanford-crypto-aes.cjs",
    # "benchmarks/kraken-1.0/kraken-1.0-stanford-crypto-ccm.cjs",
    # "benchmarks/kraken-1.0/kraken-1.0-stanford-crypto-pbkdf2.cjs",
    # "benchmarks/kraken-1.0/kraken-1.0-stanford-crypto-sha256-iterative.cjs"

]

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
    except Exception:
        print(f"⚠️ Failed to parse time for: {' '.join(cmd)}")
        return float("inf")


def run_multiple(cmd, runs=RUNS, cwd=None):
    """Run command multiple times and return list of times."""
    return [run_timed(cmd, cwd) for _ in range(runs)]


# ======================
# Main Benchmark Loop
# ======================
def main():
    all_results = []

    for test in SUNSPIDER:
        print(f"\n=== Running {test} ===")
        test_path = IRIDIUM_DIR / "tests" / test

        # Generate Iridium outputs
        subprocess.run(
            ["./iridium", "iri", "--ljson", ".", str(test_path)],
            cwd=IRIDIUM_DIR,
            check=True,
        )

        # Locate output files
        outputs_dir = IRIDIUM_DIR / "outputs"
        js3_file = None
        json_file = None
        for f in outputs_dir.glob("*"):
            if f.suffix == ".js3":
                js3_file = f
            elif f.suffix == ".json":
                json_file = f

        configs = {
            "QJS+SOURCE": ["./script.sh", str(test_path)],
            "QJS+JS3": ["./script.sh", str(js3_file)] if js3_file else None,
            "IRIDIUM": ["./tiri.sh", str(json_file)] if json_file else None,
        }

        for name, cmd in configs.items():
            if not cmd:
                continue
            print(f"→ {name}")
            times = run_multiple(cmd, cwd=QJS_DIR)
            for t in times:
                all_results.append((test, name, t))

    # Save to CSV
    with open(RESULTS_CSV, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["benchmark", "config", "time_sec"])
        writer.writerows(all_results)
    print(f"\n✅ Results written to {RESULTS_CSV}")

    plot_grid(all_results)
    print(f"📊 Plot saved to {PLOT_PNG}")


# ======================
# Grid Plot
# ======================
def plot_grid(results):
    df = pd.DataFrame(results, columns=["benchmark", "config", "time_sec"])
    benchmarks = sorted(df["benchmark"].unique())

    # Grid layout
    ncols = GRID_COLS
    nrows = (len(benchmarks) + ncols - 1) // ncols
    fig, axes = plt.subplots(nrows, ncols, figsize=(4 * ncols, 3 * nrows))
    axes = axes.flatten()

    colors = {"QJS+SOURCE": "#fdae61", "QJS+JS3": "#abd9e9", "IRIDIUM": "#2c7bb6"}

    for i, bm in enumerate(benchmarks):
        ax = axes[i]
        sub = df[df["benchmark"] == bm]
        data = [sub[sub["config"] == c]["time_sec"] for c in ["QJS+SOURCE", "QJS+JS3", "IRIDIUM"]]
        labels = ["QJS+SRC", "QJS+JS3", "IRIDIUM"]

        # skip if empty
        if all(len(d) == 0 for d in data):
            ax.axis("off")
            continue

        bp = ax.boxplot(data, patch_artist=True, labels=labels)
        for patch, label in zip(bp["boxes"], labels):
            patch.set_facecolor(colors.get(label, "#cccccc"))

        ax.set_title(Path(bm).name, fontsize=8)
        ax.tick_params(axis="x", labelrotation=30)
        ax.grid(axis="y", linestyle="--", alpha=0.3)

    # Hide unused axes
    for j in range(len(benchmarks), len(axes)):
        axes[j].axis("off")

    fig.suptitle("Benchmark Runtime Comparison", fontsize=14)
    plt.tight_layout(rect=[0, 0, 1, 0.97])
    plt.savefig(PLOT_PNG, dpi=200)
    plt.close()


if __name__ == "__main__":
    main()