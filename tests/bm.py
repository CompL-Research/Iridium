#!/usr/bin/env python3
import subprocess
import csv
from pathlib import Path
import matplotlib.pyplot as plt
import pandas as pd
from datetime import datetime
import shutil
import re
import os

USE_CACHE = False
RUNS = 15
GRID_COLS = 4
IRIDIUM_DIR = Path("..").resolve()
QJS_DIR = Path("../externalDeps/quickjs").resolve()
RESULTS_DIR = Path("FINAL_RESULTS").resolve()
JSON_BENCHMARK_DIR = Path("FINAL_RESULTS/BM1_JSON_CACHE").resolve()
JS3_BENCHMARK_DIR = Path("FINAL_RESULTS/BM1_JS3_CACHE").resolve()

OUTPUT_CSV_NAME="BM1_data.csv"
OUTPUT_PARSE_PNG="BM1_parse_times(raw).png"
OUTPUT_EXEC_PNG="BM1_exec_times(raw).png"

OOPSLA_FINAL = [
    "benchmarks/sunspider/3d-cube.cjs",
    "benchmarks/sunspider/3d-morph.cjs",
    "benchmarks/sunspider/access-fannkuch.cjs",
    "benchmarks/sunspider/bitops-bitwise-and.cjs",
    "benchmarks/sunspider/math-spectral-norm.cjs",
    "benchmarks/sunspider/string-fasta.cjs",
    "benchmarks/kraken-1.0/kraken-1.0-ai-astar.cjs",
    "benchmarks/kraken-1.0/kraken-1.0-audio-beat-detection.cjs",
    "benchmarks/kraken-1.0/kraken-1.0-imaging-darkroom.cjs",
    "benchmarks/kraken-1.0/kraken-1.0-imaging-desaturate.cjs",
    "benchmarks/kraken-1.0/kraken-1.0-imaging-gaussian-blur.cjs",
    "benchmarks/kraken-1.0/kraken-1.0-stanford-crypto-pbkdf2.cjs",
    "benchmarks/ML/ML_load.cjs",
    "benchmarks/Octane2/Regexpbenchmark.cjs",
    "benchmarks/SeaMonster/gaussian-blur.cjs",
    "benchmarks/UniPoker/benchmark.cjs",
]

IRI_CS_BRREACHED = [
    "benchmarks/kraken-1.0/kraken-1.0-ai-astar.cjs",
    "benchmarks/kraken-1.0/kraken-1.0-audio-beat-detection.cjs"
]

def run_timed(cmd, cwd=None):
    """Run a command and extract parse and execution times (ms)."""
    result = subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        cwd=cwd,
    )

    parse_time = None
    exec_time = None

    output = result.stdout + "\n" + result.stderr

    print(output)

    parse_match = re.search(r"Parse time\s*:\s*([\d.]+)\s*ms", output)
    exec_match = re.search(r"Execution time\s*:\s*([\d.]+)\s*ms", output)

    if parse_match:
        parse_time = float(parse_match.group(1))
    if exec_match:
        exec_time = float(exec_match.group(1))

    return parse_time, exec_time


def run_multiple(cmd, runs=RUNS, cwd=None):
    """Run command multiple times and return list of times."""
    return [run_timed(cmd, cwd) for _ in range(runs)]

def main():
    start_time = datetime.now()
    print(f"--- Script started at: {start_time.strftime('%Y-%m-%d %H:%M:%S')} ---", flush=True)

    run_output_dir = RESULTS_DIR
    run_output_dir.mkdir(parents=True, exist_ok=True)
    JSON_BENCHMARK_DIR.mkdir(exist_ok=True)
    JS3_BENCHMARK_DIR.mkdir(exist_ok=True)

    results_csv_path = run_output_dir / OUTPUT_CSV_NAME

    all_results = []

    for test in OOPSLA_FINAL:
        print(f"\n=== Running {test} ===", flush=True)
        test_path = IRIDIUM_DIR / "tests" / test
        benchmark_name = Path(test).name

        target_json_path = JSON_BENCHMARK_DIR / f"{benchmark_name}.json"
        target_js3_path = JS3_BENCHMARK_DIR / f"{benchmark_name}.js3"
        
        if USE_CACHE and target_json_path.exists() and target_js3_path.exists():
            print(f"  ↪️ Using cached files for {benchmark_name}", flush=True)
            json_file = target_json_path
            js3_file = target_js3_path
        else:
            print(f"  ▷ Cache miss. Compiling {benchmark_name} with Iridium...", flush=True)
            
            myEnv = os.environ.copy()
            if test in IRI_CS_BRREACHED:
                myEnv["IRI_CS_BRREACHED"] = "1"

            compile_result = subprocess.run(
                ["./iridium", "iri", "--ljson", "-s", "script", ".", str(test_path)],
                env=myEnv,
                cwd=IRIDIUM_DIR,
                capture_output=True,
                text=True
            )

            print(compile_result)

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
            results = run_multiple(cmd, cwd=QJS_DIR)
            for parse_time, exec_time in results:
                all_results.append((test, name, parse_time, exec_time))

    if not all_results:
        print("\nNo results were generated. Exiting.", flush=True)
        return
        
    with open(results_csv_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["benchmark", "config", "parse_time_ms", "exec_time_ms"])
        writer.writerows(all_results)
    print(f"\n✅ Results written to {results_csv_path}", flush=True)

    plot_grid(all_results, run_output_dir)
    
    end_time = datetime.now()
    total_runtime = end_time - start_time
    print(f"\n--- Script finished at: {end_time.strftime('%Y-%m-%d %H:%M:%S')} ---", flush=True)
    print(f"--- Total runtime: {total_runtime} ---", flush=True)

def plot_grid(results, output_dir):
    """
    Create two separate boxplot grids: one for parse time, one for execution time.
    """
    df = pd.DataFrame(results, columns=["benchmark", "config", "parse_time_ms", "exec_time_ms"])

    def plot_metric(metric_col, title, filename):
        benchmarks_in_results = df["benchmark"].unique()
        benchmarks = [bm for bm in OOPSLA_FINAL if bm in benchmarks_in_results]

        ncols = GRID_COLS
        nrows = (len(benchmarks) + ncols - 1) // ncols
        fig, axes = plt.subplots(nrows, ncols, figsize=(4 * ncols, 3 * nrows), constrained_layout=True)
        axes = axes.flatten()

        colors = {"QJS+SOURCE": "#fdae61", "QJS+JS3": "#abd9e9", "IRIDIUM": "#2c7bb6"}
        config_order = ["QJS+SOURCE", "QJS+JS3", "IRIDIUM"]
        labels = ["QJS+SRC", "QJS+JS3", "IRIDIUM"]

        for i, bm in enumerate(benchmarks):
            ax = axes[i]
            sub = df[df["benchmark"] == bm]
            
            data = [sub[sub["config"] == c][metric_col].dropna() for c in config_order]

            if all(d.empty for d in data):
                ax.axis("off")
                continue
            
            bp = ax.boxplot(data, patch_artist=True, labels=labels)
            
            for patch, config_name in zip(bp["boxes"], config_order):
                patch.set_facecolor(colors.get(config_name, "#cccccc"))

            ax.set_title(Path(bm).name, fontsize=8)
            ax.set_ylabel("Time (ms)")
            ax.tick_params(axis="x", labelrotation=45, labelsize=7)
            ax.grid(axis="y", linestyle="--", alpha=0.5)

        for j in range(len(benchmarks), len(axes)):
            axes[j].axis("off")

        fig.suptitle(title, fontsize=14)
        plot_path = output_dir / filename
        fig.savefig(plot_path, dpi=200)
        plt.close(fig)
        print(f"📊 Plot saved to {plot_path}", flush=True)

    plot_metric("parse_time_ms", "Benchmark Parse Time Comparison (ms)", OUTPUT_PARSE_PNG)
    plot_metric("exec_time_ms", "Benchmark Execution Time Comparison (ms)", OUTPUT_EXEC_PNG)

if __name__ == "__main__":
    main()