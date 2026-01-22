
import pandas as pd
import numpy as np
from pathlib import Path

RESULTS_DIR = Path("./results")
all_folders = [d for d in RESULTS_DIR.iterdir() if d.is_dir()]
LATEST_FOLDER = max(all_folders, key=lambda d: d.stat().st_mtime)
CSV_FILE_PATH = LATEST_FOLDER / "benchmark_results.csv"

CSV_PATH = CSV_FILE_PATH
OUTPUT_DIR = Path("./FINAL_RESULTS")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
metric = "exec_time_ms"

df = pd.read_csv(CSV_PATH)

means = (
    df.groupby(["benchmark", "config"], as_index=False)[metric]
      .mean()
)

pivot = means.pivot(
    index="benchmark",
    columns="config",
    values=metric
)

if "IRIDIUM" not in pivot.columns:
    raise ValueError("IRIDIUM config not found in CSV")

speedups = pivot.div(pivot["IRIDIUM"], axis=0)
speedups = speedups.drop(columns=["IRIDIUM"])

overall_speedup = speedups.apply(
    lambda col: np.exp(np.log(col.dropna()).mean())
)

pd.set_option("display.float_format", "{:.2f}×".format)

print("\nSpeedup of IRIDIUM over other configurations (per benchmark):\n")
print(speedups.sort_index())

print("\nOverall speedup of IRIDIUM (geometric mean across benchmarks):\n")
for config, value in overall_speedup.items():
    print(f"  IRIDIUM vs {config}: {value:.2f}×")

speedups.to_csv(f"{OUTPUT_DIR}/iridium_speedups_per_benchmark.csv")
overall_speedup.to_frame(name="overall_speedup").to_csv(f"{OUTPUT_DIR}/iridium_speedups_overall.csv")
