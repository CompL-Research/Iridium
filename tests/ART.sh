mkdir -p FINAL_RESULTS

echo "Section 7.2: Performance Evaluation"
echo "1. Running benchmarks"
python3 bm.py

echo "2. Plotting the benchmarks"
python3 bm_plot.py

echo "3. Collating benchmark results"
python3 bm_table.py

echo "Section 7.3: Qualitative Analysis"
node qualitative.js > FINAL_RESULTS/QAResults

echo "Ablation Studies"
python3 bm_ablation.py

# 4. Running test262
# node run.cjs test/language/expressions/addition

