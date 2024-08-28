#!/usr/bin/env node

import { exec, execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { cwd } from 'process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Set Paths
const TEST262_DIR = 'test262';
const REPO_URL = 'git@github.com:tc39/test262.git';
const V8_BIN = '/home/meetesh/wd/v8/v8/out/x64.release/d8';

let TESTS_TO_RUN; // = 'test/language/arguments-object';

const HARNESSES = [
  `${TEST262_DIR}/harness/sta.js`,
  `${TEST262_DIR}/harness/propertyHelper.js`,
  `${TEST262_DIR}/harness/doneprintHandle.js`,
  `${TEST262_DIR}/harness/assert.js`,
  `${TEST262_DIR}/harness/compareArray.js`,
  `${TEST262_DIR}/harness/tcoHelper.js`,
  
].join(' ');

// Logs

const finalResult = {
  skipped: [],
  passed: [],
  failed: [],
  cmd: `${V8_BIN} ${HARNESSES}`
}


const FAIL_LOG = 'failed_out.log';
// const SUCCESS_LOG = 'success_out.log';

const CWD = cwd();

// Helper Functions
async function checkGitRepo() {
  try {
    await execAsync(`git -C ${TEST262_DIR} status`);
    console.log('Git repository is valid. Pulling latest updates...');
    await execAsync(`git -C ${TEST262_DIR} pull`);
  } catch (error) {
    console.error('Repository is broken or not initialized correctly. Re-cloning...');
    await execAsync(`rm -rf ${TEST262_DIR}`);
    await execAsync(`git clone ${REPO_URL} ${TEST262_DIR}`);
  }
}

async function iterateOverFiles() {
  const TESTS_DIR = path.join(TEST262_DIR, TESTS_TO_RUN);
  if (!existsSync(TESTS_DIR)) {
    console.log(`Directory ${TESTS_DIR} does not exist.`);
    return;
  }

  console.log(`Iterating over all files in ${TESTS_DIR}:`);
  // Clear or create the output files
  // writeFileSync(SUCCESS_LOG, '');
  writeFileSync(FAIL_LOG, '');

  const files = execSync(`find ${TESTS_DIR} -type f`).toString().trim().split('\n');

  for (const file of files) {
    // if (readFileSync(file, 'utf8').includes('$DONOTEVALUATE()')) {
    //   console.log(`Skipping ${file} (contains $DONOTEVALUATE())`);
    //   finalResult.skipped.push(file)
    //   continue;
    // }

    if (readFileSync(file, 'utf8').includes('type: SyntaxError')) {
      finalResult.skipped.push({file, reason: "type: SyntaxError"})
      continue;
    }

    const fileContent = readFileSync(file, 'utf8');
    const flagsMatch = fileContent.match(/flags: \[([^\]]+)\]/);
    const FLAGS = flagsMatch ? flagsMatch[1].replace(/\s/g, '').replace(/,/g, ' ') : '';
    let MODULE = FLAGS.includes('onlyStrict') ? '--module ' : '';
    MODULE += FLAGS.includes('module') ? '--module' : '';

    const fileCMD = `${V8_BIN} ${HARNESSES} ${MODULE}`
    const cmd = `${fileCMD} ${file} >> ${FAIL_LOG}`

    writeFileSync(FAIL_LOG, `Testing ${file} : ${cmd}\n`, { flag: 'a' });

    try {
      await execAsync(cmd);
      finalResult.passed.push({ file, cmd: fileCMD })

      // writeFileSync(SUCCESS_LOG, `${file}\n`, { flag: 'a' });
      // await execAsync(`${cmd} >> ${SUCCESS_LOG}`);
    } catch (error) {
      finalResult.failed.push({ file, cmd: fileCMD })
    }
  }

  // Generate summary
  const SKIPPED_COUNT = finalResult.skipped.length
  const SUCCESS_COUNT = finalResult.passed.length
  const FAIL_COUNT = finalResult.failed.length;

  console.log('Summary of test results:');
  console.log(`Skipped tests     : ${SKIPPED_COUNT}`);
  console.log(`Successful tests  : ${SUCCESS_COUNT}`);
  console.log(`Failed tests      : ${FAIL_COUNT}`);
}

// Main Execution
(async function main() {


  if (process.argv.length < 3) {
    console.error('Usage: node filterTests.js <folder_path>');
    console.error('Example: node filterTests.js "test/language/arguments-object"');
    process.exit(1);
  }

  TESTS_TO_RUN = process.argv[2];

  const outputPath = TESTS_TO_RUN.replace(/\//g, '__') + ".json";


  if (!existsSync(TEST262_DIR)) {
    console.log(`Directory ${TEST262_DIR} does not exist. Cloning the repository...`);
    await execAsync(`git clone ${REPO_URL} ${TEST262_DIR}`);
  } else {
    await checkGitRepo();
  }

  await iterateOverFiles();

  writeFileSync(outputPath, JSON.stringify(finalResult, null, 4))
  // console.log(finalResult)
})();
