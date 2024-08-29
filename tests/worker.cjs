const path = require("path");
const childProcess = require('child_process');

const createScenarios = require('test262-stream/lib/create-scenarios.js');
const builder = require('test262-stream/lib/builder.js');


const fs = require('fs');

const IRIAgent = require("./iri-agent.cjs");

const TEST_TIMEOUT = 60 * 1000; // 1 minute
const NODE = "/home/meetesh/.nvm/versions/node/v20.16.0/bin/node"

function timeout(file, waitMs = TEST_TIMEOUT) {
  return new Promise((_resolve, reject) =>
    setTimeout(
      () => reject(new Error(`test ${file} timed out after ${waitMs} ms`)),
      waitMs
    )
  );
}

let agent, testRoot;

exports.setup = function (opts) {
  agent = new IRIAgent(opts);
  testRoot = opts.testRoot;
};

const IRIDIUM_BIN = "/home/meetesh/wd/Iridium/iridium";
const TESTS = path.resolve('./test262');

exports.runTest = async function (test) {

  const fPath = `${TESTS}/${test}`
  const folderName = `folder_${Math.random().toString(36).substring(2, 15)}`;
  

  // 
  // Original Result
  // 
  let originalResult;
  {
    let result;
    let ret;
    try {
      const content = fs.readFileSync(`${TESTS}/${test}`,
        { encoding: 'utf8', flag: 'r' });
      let { attrs, contents, file } = builder(fPath, content, { hostPath: NODE, shortName: "$262", testRoot: TESTS, test262Dir: TESTS })
      result = await Promise.race([
        agent.evalScript({
          attrs,
          contents,
          file: fPath,
        }),
        timeout(file),
      ]);
      if (result.error) {
        ret = { result: "runtime error", msg: result.error, contents };
      } else {
        ret = { result: "success", contents };
      }
    } catch (error) {
      agent.stop(); // kill process avoid 100% cpu usage
      ret = { result: "timeout error", msg: error, contents };
    }
    originalResult = ret
  }

  // 
  // Replace code with JS3
  // 
  const cmd = `${IRIDIUM_BIN} js3 ${fPath} -o ${folderName} -j ${fPath}`;
  try {
    await childProcess.execSync(cmd);
  } catch (e) {
    return { result: "js3 error", msg: e, expected: originalResult }
  }

  // 
  // JS3 Result
  // 
  let js3Result;
  {
    let result;
    let ret;
    try {
      const content = fs.readFileSync(`${TESTS}/${test}`,
        { encoding: 'utf8', flag: 'r' });
      let { attrs, contents, file } = builder(fPath, content, { hostPath: NODE, shortName: "$262", testRoot: TESTS, test262Dir: TESTS })
      result = await Promise.race([
        agent.evalScript({
          attrs,
          contents,
          file: fPath,
        }),
        timeout(file),
      ]);
      if (result.error) {
        ret = { result: "runtime error", msg: result.error, contents };
      } else {
        ret = { result: "success", contents };
      }
    } catch (error) {
      agent.stop(); // kill process avoid 100% cpu usage
      ret = { result: "timeout error", msg: error, expected: originalResult };
    }
    js3Result = ret
  }

  let finalRes
  if (js3Result.result === originalResult.result) {
    finalRes = { result: "success" };
  } else {
    finalRes = { result: "failed", expected: originalResult, actual: js3Result };
  }

  return finalRes;
};
