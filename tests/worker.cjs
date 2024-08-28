const path = require("path");
const childProcess = require('child_process');

const IRIAgent = require("./iri-agent.cjs");

const TEST_TIMEOUT = 60 * 1000; // 1 minute

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
  let { attrs, contents, file } = test;

  // Compile js3 inplace
  const folderName = `folder_${Math.random().toString(36).substring(2, 15)}`;
  const cmd = `${IRIDIUM_BIN} js3 ${TESTS}/${test.file} -o ${folderName} -j ${TESTS}/${test.file}`;
  try {
    await childProcess.execSync(cmd);
  } catch (e) {
    return { result: "js3 error", msg: e }
  }

  // Execute the test and return the result
  let result;
  let ret;
  try {
    result = await Promise.race([
      agent.evalScript({
        attrs,
        contents,
        file: path.join(testRoot, file),
      }),
      timeout(file),
    ]);
  } catch (error) {
    agent.stop(); // kill process avoid 100% cpu usage

    return { result: "timeout error", msg: error };
  }

  if (result.error) {
    ret = { result: "runtime error", msg: result.error };
  } else {
    ret = { result: "success", msg: result.stdout };
  }

  return ret;
};
