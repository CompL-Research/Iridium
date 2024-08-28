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

function getFirstContinuousComments(jsFileContent) {
  // Regular expression to match full-line comments
  const fullLineCommentPattern = /^\s*(\/\/.*|\/\*[\s\S]*?\*\/)\s*$/gm;

  // Split the content by lines
  const lines = jsFileContent.split('\n');
  const firstCommentBlock = [];

  // Iterate over each line
  for (let line of lines) {
    if (fullLineCommentPattern.test(line)) {
      firstCommentBlock.push(line.trim());
    } else {
      break; // Stop when a non-comment line is found
    }
  }

  // Combine the comments into a single string with line breaks
  return firstCommentBlock.join('\n');
}

exports.runTest = async function (test) {
  let { attrs, contents, file } = test;
  let js3Content = "TODO"

  // Compile js3 inplace
  const folderName = `folder_${Math.random().toString(36).substring(2, 15)}`;
  const cmd = `${IRIDIUM_BIN} js3 ${TESTS}/${test.file} -o ${folderName} -j ${TESTS}/${test.file}`;
  try {
    js3Content = getFirstContinuousComments(contents) + await childProcess.execSync(cmd);
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
        contents: js3Content,
        file: path.join(testRoot, file),
      }),
      timeout(file),
    ]);
  } catch (error) {
    agent.stop(); // kill process avoid 100% cpu usage

    return { result: "timeout error", msg: error, js3: js3Content };
  }

  if (result.error) {
    ret = { result: "runtime error", msg: result.error, js3: js3Content };
  } else {
    ret = { result: "success", msg: result.stdout, js3: js3Content };
  }

  return ret;
};
