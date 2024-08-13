import { exec } from 'child_process';
import cliProgress from 'cli-progress';
import fs from 'fs';
import { glob } from 'glob';
import { promisify } from 'util';

const execAsync = promisify(exec);

const IRIDIUM_BIN = "/home/meetesh/wd/Iridium/iridium"

if (process.argv.length < 3) {
  console.error('Usage: node runTests.js <json-path>');
  console.error('Eaxmple: node runTests.js test__language__arguments-object.json');
  process.exit(1);
}

const filePath = process.argv[2];

let PASSED = [];
let FAILEDJS3 = [];
let FAILEDEXEC = [];

(async function main() {
  try {
    // Read the JSON file synchronously
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const bar1 = new cliProgress.SingleBar({ stream: process.stdout }, cliProgress.Presets.shades_classic);

    // start the progress bar with a total value of 200 and start value of 0
    bar1.start(data.passed.length, 0);

    for (const o of data.passed) {
      bar1.increment();

      // Generate JS3
      const cmd = `${IRIDIUM_BIN} js3 ${o.file}`
      try {
        await execAsync(cmd);
      } catch (e) {
        console.error(`[Failed to generate JS3]`)
        console.error(`  JS3 CMD : ${cmd}`)
        console.error()
        console.error(e)
        console.error()
        console.error()

        FAILEDJS3.push(o.file)
        continue;
      }
      const pattern = './outputs/JS3/*.js';
      const files = await glob(pattern)
      if (files.length !== 1) {
        console.error(`Found more than one output file in JS3 path`, files)
        process.exit(1)
      }
      const myFile = files[0];
      const v8Cmd = `${o.cmd} ${myFile}`;
      try {
        await execAsync(v8Cmd);
        PASSED.push(o.file)
      } catch (e) {
        console.error(`[Failed to execute]`)
        console.error(`  JS3 CMD : ${cmd}`)
        console.error(`  V8CMD   : ${v8Cmd}`)
        console.error()
        console.error(e)
        console.error()
        console.error()

        FAILEDEXEC.push(o.file)
      }
    }

    // stop the progress bar
    bar1.stop();

    console.log(`=== TEST SUMMARY (${data.passed.length} tests) ===`)
    console.log(`Passed           : ${PASSED.length}`)
    console.log(`Failed (JS3 Gen) : ${FAILEDJS3.length}`)
    console.log(`Failed (Runtime) : ${FAILEDEXEC.length}`)

  } catch (err) {
    console.error('Error reading or parsing file', err);
    process.exit(1)
  }



})();
