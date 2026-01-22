
import pandas as pd
import numpy as np
from pathlib import Path

CSV_PATH = "FINAL_RESULTS/BM1_data.csv"
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
