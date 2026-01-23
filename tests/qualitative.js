import { readFile } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function runInDirectory(cmd, cwd = ".") {
  try {
    const { stdout } = await execPromise(cmd, { cwd });
    console.log(stdout);
  } catch (err) {
    console.error('Command failed:', err.message);
  }
}

const QJS_BIN="../externalDeps/quickjs/build/qjs_new"

const config = {
  "ML_LOAD": {
    baselineSrc: "benchmarks/ML/ML_load.cjs",
    iridiumSrc: "FINAL_RESULTS/BM1_JSON_CACHE/ML_load.cjs.json"
  },
  "Octane2_Regexp": {
    baselineSrc: "benchmarks/Octane2/Regexpbenchmark.cjs",
    iridiumSrc: "FINAL_RESULTS/BM1_JSON_CACHE/Regexpbenchmark.cjs.json"
  },
  "UniPoker": {
    baselineSrc: "benchmarks/UniPoker/benchmark.cjs",
    iridiumSrc: "FINAL_RESULTS/BM1_JSON_CACHE/benchmark.cjs.json"
  },
  "KrakenDesaturate": {
    baselineSrc: "benchmarks/kraken-1.0/kraken-1.0-imaging-desaturate.cjs",
    iridiumSrc: "FINAL_RESULTS/BM1_JSON_CACHE/kraken-1.0-imaging-desaturate.cjs.json"
  },
};

const bytecodeClassification = {
  "C-SITE": {
    "Least Optimized": ["OP_call", "OP_call_method", "OP_return"],
    "Moderately Optimized": [],
    "Highly Optimized": ["OP_return_undef"],
    "Most Optimized": ["OP_call0", "OP_call1", "OP_call2", "OP_call3", "OP_tail_call", "OP_tail_call_method"],
  },
  "CFLOW": {
    "Least Optimized": ["OP_if_false", "OP_if_true", "OP_goto"],
    "Moderately Optimized": [],
    "Highly Optimized": ["OP_goto16"],
    "Most Optimized": ["OP_if_false8", "OP_if_true8", "OP_goto8"],
  },
  "STKOP": {
    "Least Optimized": ["OP_get_loc_check", "OP_put_loc_check", "OP_put_loc_check_init", "OP_get_var_ref_check", "OP_put_var_ref_check", "OP_put_var_ref_check_init"],
    "Moderately Optimized": ["OP_get_loc", "OP_put_loc", "OP_set_loc", "OP_get_arg", "OP_put_arg", "OP_set_arg", "OP_get_var_ref", "OP_put_var_ref", "OP_set_var_ref", "OP_get_loc8", "OP_put_loc8", "OP_set_loc8"],
    "Highly Optimized": ["OP_get_loc0", "OP_get_loc1", "OP_get_loc2", "OP_get_loc3", "OP_put_loc0", "OP_put_loc1", "OP_put_loc2", "OP_put_loc3", "OP_get_arg0", "OP_get_arg1", "OP_get_arg2", "OP_get_arg3", "OP_put_arg0", "OP_put_arg1", "OP_put_arg2", "OP_put_arg3", "OP_get_var_ref0", "OP_get_var_ref1", "OP_get_var_ref2", "OP_get_var_ref3", "OP_put_var_ref0", "OP_put_var_ref1", "OP_put_var_ref2", "OP_put_var_ref3"],
    "Most Optimized": ["OP_get_loc0_loc1", "OP_set_arg0", "OP_set_arg1", "OP_set_arg2", "OP_set_arg3", "OP_set_var_ref0", "OP_set_var_ref1", "OP_set_var_ref2", "OP_set_var_ref3", "OP_set_loc0", "OP_set_loc1", "OP_set_loc2", "OP_set_loc3"],
  },
  "OBJOP": {
    "Least Optimized": ["OP_get_array_el", "OP_to_propkey", "OP_to_propkey2"],
    "Moderately Optimized": ["OP_put_field", "OP_get_field"],
    "Highly Optimized": [],
    "Most Optimized": ["OP_get_array_el2", "OP_get_field2", "OP_get_length"],
  }
};

async function executeAndCollectData(cmd, baselineResPath) {
  await runInDirectory(cmd);

  const finalRes = {};
  for (let cat of Object.keys(bytecodeClassification)) {
    for (let cc of Object.keys(bytecodeClassification[cat])) {
      let finalCount = 0;
      for (let op of bytecodeClassification[cat][cc]) {
        let count = await getWordCount(baselineResPath, op)
        finalCount += count;
      }
      if (!(cat in finalRes)) finalRes[cat] = {}
      if (!(cc in finalRes[cat])) finalRes[cat][cc] = {}
      finalRes[cat][cc] = finalCount;
    }
  }
  return finalRes;
}

try {
  for (let bm of Object.keys(config)) {
    const baselineResPath = `FINAL_RESULTS/qualitative_${bm}_QJS`;
    const baselineRes = await executeAndCollectData(`${QJS_BIN} -D1 -C ${config[bm].baselineSrc} > ${baselineResPath}`, baselineResPath)
    console.log(`QJS::${bm}::`, baselineRes)

    await runInDirectory(`bash count_bc_size.sh ${baselineResPath}`);
    
    const iridiumResPath = `FINAL_RESULTS/qualitative_${bm}_IRI`;
    const iridiumRes = await executeAndCollectData(`${QJS_BIN} -D1 -X ${config[bm].iridiumSrc} > ${iridiumResPath}`, iridiumResPath)
    console.log(`IRI::${bm}::`, iridiumRes)

    await runInDirectory(`bash count_bc_size.sh ${iridiumResPath}`);
  }
} catch(e) {
  console.error("Failed to get bytecode for ML_Load");
  console.error(e);
}

async function getWordCount(filePath, targetWord) {
  try {
    const content = await readFile(filePath, 'utf8');    
    const regex = new RegExp(`\\b${targetWord}\\b`, 'gi');
    const matches = content.match(regex);
    return matches ? matches.length : 0;
  } catch (err) {
    console.error(`Error: Could not read file at ${filePath}`);
    return 0;
  }
}