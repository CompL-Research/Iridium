import { exec } from 'child_process';
import cliProgress from 'cli-progress';
import fs from 'fs';
import path from 'path';

import { glob } from 'glob';
import pLimit from 'p-limit';
import { promisify } from 'util';


const execAsync = promisify(exec);

const IRIDIUM_BIN = "/home/meetesh/wd/Iridium/iridium";
const CONCURRENCY_LIMIT = 32; // Adjust concurrency level as needed

if (process.argv.length < 3) {
  console.error('Usage: node runTests.js <json-files-path>');
  console.error('Example: node runTests.js .');
  process.exit(1);
}

const directoryPath = process.argv[2];



(async function main() {
  try {
    const files = fs.readdirSync(directoryPath);

    for (const file of files) {
      // Create full path of the file
      const fullPath = path.join(directoryPath, file);

      let PASSED = [];
      let FAILEDJS3 = [];
      let FAILEDEXEC = [];
      let SKIPPED = [];
      
      // Check if the current path is a file and ends with .json
      if (fs.lstatSync(fullPath).isFile() && path.extname(file).toLowerCase() === '.json') {
        
        console.log(`Working with file: ${path.basename(file)}`)
        
        // Read and parse JSON file
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        const failedData = {
          passed: []
        }

        try {
          const bar1 = new cliProgress.SingleBar({ stream: process.stdout }, cliProgress.Presets.shades_classic);
          bar1.start(data.passed.length, 0);

          const limit = pLimit(CONCURRENCY_LIMIT);

          const tasks = data.passed.map(o =>
            limit(async () => {
              bar1.increment();

              const folderName = `folder_${Math.random().toString(36).substring(2, 15)}`;

              const ext = path.extname(o.file)

              if (ext !== ".js") {
                SKIPPED.push(o)
                return;
              }

              // Generate JS3
              const cmd = `${IRIDIUM_BIN} js3 ${o.file} -o ${folderName}`;
              try {
                await execAsync(cmd);
              } catch (e) {
                console.error(`[Failed to generate JS3]`);
                console.error(`  JS3 CMD : ${cmd}`);
                console.error();
                console.error(e);
                console.error();

                failedData.passed.push(o)
                FAILEDJS3.push(o.file);
                return;
              }

              const pattern = `./${folderName}/JS3/*.js`;
              const files = await glob(pattern);
              if (files.length !== 1) {
                console.error(`Found more than one output file in JS3 path: JS3CMD: ${cmd}`, files);
                process.exit(1);
              }
              const myFile = files[0];
              const v8Cmd = `${o.cmd} ${myFile}`;
              try {
                await execAsync(v8Cmd);
                PASSED.push(o.file);
              } catch (e) {
                console.error(`[Failed to execute]`);
                console.error(`  JS3 CMD : ${cmd}`);
                console.error(`  V8CMD   : ${v8Cmd}`);
                console.error();
                console.error(e);
                console.error();

                failedData.passed.push(o)
                FAILEDEXEC.push(o.file);
              }
              await execAsync(`rm -rf ${folderName}`);
            })
          );

          await Promise.all(tasks);

          // stop the progress bar
          bar1.stop();

          console.log(`=== TEST SUMMARY (${data.passed.length} tests) ===`);
          console.log(`Passed           : ${PASSED.length}`);
          console.log(`Failed (JS3 Gen) : ${FAILEDJS3.length}`);
          console.log(`Failed (Runtime) : ${FAILEDEXEC.length}`);
          console.log(`Skipped (JSON)   : ${SKIPPED.length}`);

          console.log("Failed Exec: ", FAILEDEXEC)

          for (const fPath of FAILEDJS3) {
            await execAsync(`cp ${fPath} failing/${path.basename(fPath)}`);
          }

          for (const fPath of FAILEDEXEC) {
            await execAsync(`cp ${fPath} failing/${fPath.replace(/\//g, "_")}`);
          }

          await execAsync(`rm -rf folder_*`);

          fs.writeFileSync(`WIP_${file.replace(/\//g, "_")}`, JSON.stringify(failedData, null, 4))

        } catch (e) {

        }

      }
    }
  } catch (err) {
    console.error(`Failed to read directory: ${directoryPath}`, err);
    process.exit(1);
  }
})();
