# plot_generator.py

import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path
import seaborn as sns

# ================================================================
# Configuration - ✏️ EDIT THESE VALUES
# ================================================================

# 1. Path to your CSV file
CSV_FILE_PATH = Path("/root/Iridium/tests/results/21-01-2026-19-12-58/benchmark_results.csv")

# 2. Directory to save the output plots
OUTPUT_DIR = Path("./plots")

# 3. Number of columns in the plot grid
GRID_COLS = 4

# 4. Mapping from benchmark file path to a shorter, display name for the plot title.
#    Add or change entries here to customize the titles on your plots.
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

# ================================================================
# Plotting Logic
# ================================================================

def plot_metric_grid(df, metric_col, title, filename):
    """
    Creates and saves a boxplot grid for a given metric ('parse_time_ms' or 'exec_time_ms').
    """
    print(f"Generating plot for {metric_col}...", flush=True)

    # Ensure the output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Filter benchmarks to only those present in both the CSV and the name map
    benchmarks_in_csv = df["benchmark"].unique()
    benchmarks_to_plot = [bm for bm in BENCHMARK_NAME_MAP.keys() if bm in benchmarks_in_csv]

    if not benchmarks_to_plot:
        print("  ❌ Error: No matching benchmarks found between CSV and BENCHMARK_NAME_MAP. Please check paths.")
        return

    # --- Plotting Setup ---
    ncols = GRID_COLS
    nrows = (len(benchmarks_to_plot) + ncols - 1) // ncols
    fig, axes = plt.subplots(nrows, ncols, figsize=(4 * ncols, 3.5 * nrows), constrained_layout=True)
    axes = axes.flatten()

    # --- Plotting Customization ---
    colors = {"QJS+SOURCE": "#fdae61", "QJS+JS3": "#abd9e9", "IRIDIUM": "#2c7bb6"}
    config_order = ["QJS+SOURCE", "QJS+JS3", "IRIDIUM"]
    labels = ["QJS+SRC", "QJS+JS3", "IRIDIUM"]

    for i, bm_path in enumerate(benchmarks_to_plot):
        ax = axes[i]
        subset = df[df["benchmark"] == bm_path]

        # Prepare data for boxplot in the specified order
        data = [subset[subset["config"] == c][metric_col].dropna() for c in config_order]

        if all(d.empty for d in data):
            ax.axis("off")
            continue

        bp = ax.boxplot(data, patch_artist=True, labels=labels)

        # Apply colors to boxes
        for patch, config_name in zip(bp["boxes"], config_order):
            patch.set_facecolor(colors.get(config_name, "#cccccc"))

        # Set titles and labels from the map
        ax.set_title(BENCHMARK_NAME_MAP.get(bm_path, bm_path), fontsize=10)
        ax.set_ylabel("Time (ms)")
        ax.tick_params(axis="x", labelrotation=45, labelsize=8)
        ax.grid(axis="y", linestyle="--", alpha=0.6)

    # Hide any unused subplots
    for j in range(len(benchmarks_to_plot), len(axes)):
        axes[j].axis("off")

    fig.suptitle(title, fontsize=16, weight='bold')
    plot_path = OUTPUT_DIR / filename
    fig.savefig(plot_path, dpi=250)
    plt.close(fig)
    print(f"  ✅ Plot saved to {plot_path}", flush=True)


# def plot_metric_grid(df, metric_col, title, filename):
#     sns.set_theme(style="whitegrid") # Clean background
    
#     # 1. Filter and Prepare
#     benchmarks_to_plot = [bm for bm in BENCHMARK_NAME_MAP.keys() if bm in df["benchmark"].unique()]
    
#     ncols = GRID_COLS
#     nrows = (len(benchmarks_to_plot) + ncols - 1) // ncols
    
#     fig, axes = plt.subplots(nrows, ncols, figsize=(16, 4 * nrows))
#     axes = axes.flatten()

#     # Define a custom palette: Gray for baselines, Brand color for IRIDIUM
#     palette = {"QJS+SOURCE": "#95a5a6", "QJS+JS3": "#bdc3c7", "IRIDIUM": "#e74c3c"}

#     for i, bm_path in enumerate(benchmarks_to_plot):
#         ax = axes[i]
#         subset = df[df["benchmark"] == bm_path].copy()
        
#         # 2. Add 'Swarm' points over the boxplot to show individual run variance
#         sns.boxplot(
#             data=subset, x="config", y=metric_col, 
#             order=["QJS+SOURCE", "QJS+JS3", "IRIDIUM"],
#             palette=palette, ax=ax, width=0.6, fliersize=0
#         )
#         sns.stripplot(
#             data=subset, x="config", y=metric_col, 
#             order=["QJS+SOURCE", "QJS+JS3", "IRIDIUM"],
#             color=".3", size=3, alpha=0.5, ax=ax
#         )

#         # 3. Clean up labels
#         ax.set_title(BENCHMARK_NAME_MAP[bm_path], fontweight='bold', fontsize=12)
#         ax.set_xlabel("")
#         ax.set_ylabel("Time (ms)" if i % ncols == 0 else "") # Only label outer Y-axis
#         ax.set_xticklabels(["SRC", "JS3", "IRIDIUM"], fontsize=9)
        
#         sns.despine(ax=ax) # Remove top/right spines

#     # Final layout adjustments
#     plt.tight_layout(rect=[0, 0.03, 1, 0.95])
#     fig.suptitle(title, fontsize=20, fontweight='bold', y=0.98)
#     fig.savefig(OUTPUT_DIR / filename, dpi=300)
#     plt.close()

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
        title="Benchmark Parse Time Comparison",
        filename="benchmark_parse_times.png"
    )

    plot_metric_grid(
        df,
        metric_col="exec_time_ms",
        title="Benchmark Execution Time Comparison",
        filename="benchmark_exec_times.png"
    )
    print("\nAll plots generated successfully.")


if __name__ == "__main__":
    main()