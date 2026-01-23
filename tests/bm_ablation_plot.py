# plot_generator.py

import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path
import seaborn as sns

CSV_FILE_PATH = Path("FINAL_RESULTS/BM3_data.csv")
OUTPUT_PARSE_PNG="BM3_parse_times.png"
OUTPUT_EXEC_PNG="BM3_exec_times.png"

OUTPUT_DIR = Path("./FINAL_RESULTS")
GRID_COLS = 4
BENCHMARK_NAME_MAP = {
    "benchmarks/sunspider/3d-cube.cjs": "3D Cube",
    "benchmarks/sunspider/3d-morph.cjs": "3D Morph",
    "benchmarks/sunspider/access-fannkuch.cjs": "Fannkuch",
    "benchmarks/sunspider/bitops-bitwise-and.cjs": "Bitwise AND",
    "benchmarks/sunspider/math-spectral-norm.cjs": "Spectral Norm",
    "benchmarks/sunspider/string-fasta.cjs": "Fasta",
    "benchmarks/kraken-1.0/kraken-1.0-ai-astar.cjs": "Kraken: A*",
    "benchmarks/kraken-1.0/kraken-1.0-audio-beat-detection.cjs": "Kraken: Beat Detect",
    "benchmarks/kraken-1.0/kraken-1.0-imaging-darkroom.cjs": "Kraken: Darkroom",
    "benchmarks/kraken-1.0/kraken-1.0-imaging-desaturate.cjs": "Kraken: Desaturate",
    "benchmarks/kraken-1.0/kraken-1.0-imaging-gaussian-blur.cjs": "Kraken: Gaussian Blur",
    "benchmarks/kraken-1.0/kraken-1.0-stanford-crypto-pbkdf2.cjs": "Kraken: PBKDF2",
    "benchmarks/ML/ML_load.cjs": "ML Load",
    "benchmarks/Octane2/Regexpbenchmark.cjs": "Octane2: Regexp",
    "benchmarks/SeaMonster/gaussian-blur.cjs": "SeaMonster: G-Blur",
    "benchmarks/UniPoker/benchmark.cjs": "UniPoker",
}

def plot_metric_grid(df, metric_col, title, filename):
    """
    Creates and saves a boxplot grid for a given metric ('parse_time_ms' or 'exec_time_ms').
    """
    print(f"Generating plot for {metric_col}...", flush=True)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    benchmarks_in_csv = df["benchmark"].unique()
    benchmarks_to_plot = [bm for bm in BENCHMARK_NAME_MAP.keys() if bm in benchmarks_in_csv]

    if not benchmarks_to_plot:
        print("  ❌ Error: No matching benchmarks found between CSV and BENCHMARK_NAME_MAP. Please check paths.")
        return

    ncols = GRID_COLS
    nrows = (len(benchmarks_to_plot) + ncols - 1) // ncols
    fig, axes = plt.subplots(nrows, ncols, figsize=(4 * ncols, 3.5 * nrows), constrained_layout=True)
    axes = axes.flatten()

    # colors = {"QJS+SOURCE": "#fdae61", "QJS+JS3": "#abd9e9", "IRIDIUM": "#2c7bb6"}
    config_order = ["O0", "O1", "O2", "O3"]
    labels = ["O0", "O1", "O2", "O3"]

    for i, bm_path in enumerate(benchmarks_to_plot):
        ax = axes[i]
        subset = df[df["benchmark"] == bm_path]

        data = [subset[subset["config"] == c][metric_col].dropna() for c in config_order]

        if all(d.empty for d in data):
            ax.axis("off")
            continue
        
        all_values = [val for series in data for val in series]
        max_val = max(all_values) if all_values else 0
        
        unit = "ms"
        if max_val > 1000:
            data = [d / 1000 for d in data]
            unit = "s"

        bp = ax.boxplot(data, patch_artist=True, labels=labels, widths=0.5)

        ax.margins(y=0.1)
        for spine in ax.spines.values():
            spine.set_edgecolor('black')
            spine.set_linewidth(1)
            spine.set_visible(True)

        # for patch, config_name in zip(bp["boxes"], config_order):
        #     patch.set_facecolor(colors.get(config_name, "#cccccc"))

        ax.set_title(BENCHMARK_NAME_MAP.get(bm_path, bm_path), 
                     fontsize=12, fontweight='bold', pad=6, color='#333333')
        ax.set_ylabel(f"Time ({unit})", fontsize=14)

        ax.yaxis.set_label_coords(-0.15, 0.5)
        
        ax.tick_params(axis="x", labelsize=12)
        ax.tick_params(axis="y", labelsize=12, color='#cccccc')
        
        ax.set_axisbelow(True)
        ax.grid(axis="y", linestyle="--", alpha=0.6)

    for j in range(len(benchmarks_to_plot), len(axes)):
        axes[j].axis("off")

    fig.suptitle(title, fontsize=16, weight='bold')
    plot_path = OUTPUT_DIR / filename
    fig.savefig(plot_path, dpi=250)
    plt.close(fig)
    print(f"  ✅ Plot saved to {plot_path}", flush=True)

def main():
    """Main function to read data and generate plots."""
    if not CSV_FILE_PATH.exists():
        print(f"Error: The file was not found at {CSV_FILE_PATH}")
        return

    print(f"Reading data from {CSV_FILE_PATH}")
    df = pd.read_csv(CSV_FILE_PATH)

    plot_metric_grid(
        df,
        metric_col="parse_time_ms",
        title="",
        filename=OUTPUT_PARSE_PNG
    )

    plot_metric_grid(
        df,
        metric_col="exec_time_ms",
        title="",
        filename=OUTPUT_EXEC_PNG
    )
    print("\nAll plots generated successfully.")


if __name__ == "__main__":
    main()