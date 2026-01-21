
import pandas as pd
import numpy as np

CSV_PATH = "/root/Iridium/tests/results/21-01-2026-19-12-58/benchmark_results.csv"
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

speedups.to_csv("iridium_speedups_per_benchmark.csv")
overall_speedup.to_frame(name="overall_speedup").to_csv(
    "iridium_speedups_overall.csv"
)
