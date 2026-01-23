rm -rf FINAL_RESULTS
mkdir -p FINAL_RESULTS

echo "[BM1] Performance Evaluation"
echo "1. Running benchmarks"
python3 bm.py
python3 bm_plot.py
python3 bm_table.py

echo "[BM2] Qualitative Analysis"
node qualitative.js > FINAL_RESULTS/BM2_Results

echo "[BM3] Ablation Studies"
python3 bm_ablation.py
python3 bm_ablation_plot.py

echo "[BM4] JIT Experiment (remote binding ops marked safe)"
bash remoteEnvMarkedSafe.sh > FINAL_RESULTS/BM4_Results
