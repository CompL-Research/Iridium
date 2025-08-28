import re
import sys
import matplotlib.pyplot as plt

# def parse_log(filepath):
#     with open(filepath) as f:
#         text = f.read()

#     # Regex patterns
#     test_pattern = re.compile(r"Running Test (.+)")
#     time_pattern = re.compile(r"real\s+0m([\d.]+)s")

#     lines = text.splitlines()
#     benchmarks = {}
#     i = 0
#     while i < len(lines):
#         line = lines[i]
#         m = test_pattern.match(line)
#         if m:
#             bench_name = m.group(1).split("/")[-1].replace(".cjs", "")
            
#             # baseline time (quickjs)
#             while i < len(lines) and not time_pattern.search(lines[i]):
#                 i += 1
#             baseline_time = float(time_pattern.search(lines[i]).group(1))

#             # advance to iridium section
#             while i < len(lines) and not lines[i].startswith("running iridium"):
#                 i += 1
#             while i < len(lines) and not time_pattern.search(lines[i]):
#                 i += 1
#             iridium_time = float(time_pattern.search(lines[i]).group(1))

#             benchmarks[bench_name] = (baseline_time, iridium_time)
#         i += 1
#     return benchmarks

def parse_log(filepath):
    with open(filepath) as f:
        text = f.read()

    # Regex patterns
    test_pattern = re.compile(r"Running Test (.+)")
    time_pattern = re.compile(r"real\s+(\d+)m([\d.]+)s")  # any minutes

    lines = text.splitlines()
    benchmarks = {}
    i = 0
    while i < len(lines):
        line = lines[i]
        m = test_pattern.match(line)
        if m:
            bench_name = m.group(1).split("/")[-1].replace(".cjs", "")
            
            # baseline time (quickjs)
            while i < len(lines) and not time_pattern.search(lines[i]):
                i += 1
            minutes, seconds = map(float, time_pattern.search(lines[i]).groups())
            baseline_time = minutes * 60 + seconds

            # advance to iridium section
            while i < len(lines) and not lines[i].startswith("running iridium"):
                i += 1
            while i < len(lines) and not time_pattern.search(lines[i]):
                i += 1
            minutes, seconds = map(float, time_pattern.search(lines[i]).groups())
            iridium_time = minutes * 60 + seconds

            benchmarks[bench_name] = (baseline_time, iridium_time)
        i += 1
    return benchmarks


def plot_speedup(benchmarks, outfile="speedup.png"):
    names = list(benchmarks.keys())
    baseline_times = [benchmarks[b][0] for b in names]
    iridium_times = [benchmarks[b][1] for b in names]

    # Compute percent change (QuickJS = baseline)
    values = [(baseline/iridium - 1) * 100 for baseline, iridium in zip(baseline_times, iridium_times)]

    plt.figure(figsize=(12,6))
    bars = plt.bar(
        names,
        values,
        color=["green" if v > 0 else "red" for v in values]
    )
    plt.axhline(0.0, color="black", linestyle="--")
    plt.ylabel("Baseline / Iridium")
    plt.title("Iridium vs QuickJS")
    plt.xticks(rotation=60, ha="right")

    # Add text labels: "X faster/slower"
    for bar, base, iri in zip(bars, baseline_times, iridium_times):
        factor = iri / base
        if factor > 1:
            label = f"{factor:.1f}×"
        else:
            label = f"{1/factor:.1f}×"
        plt.text(
            bar.get_x() + bar.get_width()/2,
            bar.get_height() + (2 if bar.get_height() >= 0 else -1),
            label,
            ha="center", va="bottom" if bar.get_height() >= 0 else "top",
            fontsize=10, rotation=0
        )

    plt.tight_layout()
    plt.savefig(outfile, dpi=200)
    print(f"Plot saved to {outfile}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python plot_speedup.py benchmark_log.txt [output.png]")
        sys.exit(1)

    filepath = sys.argv[1]
    outfile = sys.argv[2] if len(sys.argv) > 2 else "speedup.png"
    data = parse_log(filepath)
    plot_speedup(data, outfile)