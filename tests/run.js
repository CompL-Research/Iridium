// 
// USAGE:   node run.js [babel-tap-file] [filter-path]
// EXAMPLE: node run.js test262.tap test/language/arguments-object
// 
// 1. allTests = Get tests and filter
// 2. Print test metadata
// 
// 3. Get a clean test262 directory : `git stash -a`
// 
// 4. ? Compile all those fixtures in-place : `find test262/test/language/ -type f -name "*_FIXTURE.js"`
//    -- If any fixture fails, exit
// 
// 5. TOTAL=0, SUCCESS=0, JS3ERR=0, SEMANTICERR=0
// 6. for t of filteredTests: [parallelize in a thread pool]
//    a. oldResult = Execute test and get result
//    b. Compile JS3 inplace
//       -- If compilation error, JS3Error++
//    c. newResult = Execute test and get result 
//    d. oldResult == newResult
//       -- SUCCESS++
//       -- SEMANTICERR++
// 
// 7. Generate Test summary 
// 

import path from 'path';
import { execSync } from 'child_process';
import { Worker as JestWorker } from "jest-worker";

import fs from 'fs'

const IRIDIUM_BIN = "/home/meetesh/wd/Iridium/iridium";
const NODE = "/home/meetesh/wd/babel-test262-runner/engine/node/bin/node"
const TESTS = path.resolve('./test262');


if (process.argv.length !== 4) {
  console.error('USAGE:   node run.js [babel-tap-file] [filter-path]');
  console.error(`EXAMPLE: node run.js test262.tap test/language/arguments-object`);
  process.exit(1)
}

const babelTapFile = process.argv[2]; // 'test262.tap'
const fileFilter = process.argv[3]; // 'test/language/arguments-object'

const worker = new JestWorker(path.resolve("./worker.cjs"), {
  numWorkers: 64,
  exposedMethods: ["runTest"],
  enableWorkerThreads: true,
  setupArgs: [{ hostPath: NODE, shortName: "$262", testRoot: TESTS }],
});

worker.getStdout().pipe(process.stdout);
worker.getStderr().pipe(process.stderr);




function processTestResults(lines) {
  // const lines = data.split('\n');
  const results = [];
  let currentTest = null;
  let isHeaderSkipped = false;

  for (const line of lines) {
    if (!isHeaderSkipped) {
      // Skip the first few header lines
      if (line.startsWith('ok') || line.startsWith('not ok')) {
        isHeaderSkipped = true;
      } else {
        continue;
      }
    }

    if (line.startsWith('ok') || line.startsWith('not ok')) {
      if (currentTest) {
        results.push(currentTest);
      }
      const [status, id, path, mode, ...rest] = line.split(' ');
      currentTest = {
        status: status === 'ok' ? 'passed' : 'failed',
        id: parseInt(id, 10),
        path,
        mode,
        success: line.includes("(success)"),
        details: '',
      };
    } else if (currentTest && line.startsWith(' ')) {
      currentTest.details += `${line.trim()}\n`;
    }
  }

  if (currentTest) {
    results.push(currentTest);
  }

  return results;
}

// let tests = new Test262Stream(TESTS, {
//   paths: ["test/language", "test/harness", fileFilter],
// }).once("error", (err) => {
//   console.error(`Failed to create Test262Stream: ${err.message}`);
//   process.exit(1)
// });

// 1. Get known working tests from the artifact
async function getAllTests() {
  try {
    const output = fs.readFileSync(babelTapFile, 'utf-8')
      .split('\n')
      .filter(line => line.includes(fileFilter))

    const fileResults = processTestResults(output).filter(a => a.status === "passed")
    const finalRes = new Set()
    fileResults.map(a => a.path).forEach(a => {
      finalRes.add(a)
    })
    
    return [...finalRes]

  } catch (error) {
    console.error(`Error getting tests: ${error.message}`);
    process.exit(1)
  }
}

// 2. Compile all fixtures in-place
function compileFixtures() {
  try {
    let output = execSync(`find ${TESTS}/${fileFilter} -type f -name "*_FIXTURE.js"`, { encoding: 'utf-8' }).split('\n');
    if (output.length === 1 && output[0] === '') return
    for (const fixture of output) {
      const folderName = `folder_${Math.random().toString(36).substring(2, 15)}`;
      const processedPath = path.resolve(fixture)
      const cmd = `${IRIDIUM_BIN} js3 ${processedPath} -o ${folderName} -j ${processedPath}`;
      console.log(`Processing fixture: ${cmd}`)
      execSync(cmd);
    }
  } catch (err) {
    console.error('Fixture compilation failed:', err);
    execSync("rm -rf folder_*");
    process.exit(1);
  }
}

let TOTAL = 0, SUCCESS = 0, JS3ERR = 0, TIMEOUTERR = 0, SEMANTICERR = 0;

// 3. Execute and compile tests in parallel
async function executeTests(tests) {
  TOTAL = tests.length
  const promises = tests.map( test =>
    (async test => {
      const actual = await worker.runTest(test);
      if (actual.result === "success") {
        SUCCESS++;
      // } else if (actual.result === "js3 error") {
      //   JS3ERR++;
      //   console.error(test, actual)
      } else {
        if (actual.result === "results mismatch") {
          console.error(actual.js3Scenario.contents)
        }
        
        SEMANTICERR++;
        console.error(actual)
      }
    })(test)
  )
  await Promise.all(promises);
}

// 4. Generate Test summary
function generateSummary() {
  console.log(`Total Tests: ${TOTAL}`);
  console.log(`Successful: ${SUCCESS}`);
  console.log(`JS3 Errors: ${JS3ERR}`);
  console.log(`Semantic Errors: ${SEMANTICERR}`);
}

// Main
(async function () {
  execSync('rm -rf folder_*');
  execSync('git stash -a', { cwd: TESTS });
  const allTests = await getAllTests();
  console.log(`Test filter  : ${fileFilter}`)
  console.log(`Tests to run : ${allTests.length}`)
  compileFixtures()
  // console.log(`Compiling fixtures done`)
  await executeTests(allTests)
  generateSummary()
  execSync('rm -rf folder_*');
  process.exit(0)
})()