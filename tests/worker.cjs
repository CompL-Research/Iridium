// 
// Inspired by babel-262 runner: https://github.com/babel/babel-test262-runner
// 
const path = require("path");
const IRIAgent = require("./iri-agent.cjs");
const { transpile, transpileJS3 } = require("./transpile.cjs");

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

exports.getBaseline = async function (test) {
  let { attrs, contents, file } = test;
  const isModule = attrs.flags.module;

  try {
    contents = await transpile(contents, { features: attrs.features, isModule, isStrict: false });
  } catch (error) {
    return { result: "parser error", error };
  }

  let result;
  let ret;
  try {
    result = await Promise.race([
      agent.evalScript({
        attrs,
        contents,
        file: path.join(testRoot, file),
      }, { module: isModule ? isModule : undefined }),
      timeout(file),
    ]);
  } catch (error) {
    agent.stop(); // kill process avoid 100% cpu usage

    return { result: "timeout error", error };
  }

  if (result.error) {
    ret = { result: "runtime error", error: result.error, contents };
  } else {
    ret = { result: "success", output: result.stdout };
  }

  return ret;
};

exports.runTest = async function (test) {
  let { attrs, contents, file } = test;
  const isModule = attrs.flags.module;

  try {
    contents = await transpileJS3(contents, { features: attrs.features, isModule, isStrict: false }, path.basename(file));
  } catch (error) {
    return { result: "parser error", error };
  }

  let result;
  let ret;
  try {
    result = await Promise.race([
      agent.evalScript({
        attrs,
        contents,
        file: path.join(testRoot, file),
      }, { module: isModule ? isModule : undefined }),
      timeout(file),
    ]);
  } catch (error) {
    agent.stop(); // kill process avoid 100% cpu usage

    return { result: "timeout error", error };
  }

  if (result.error) {
    ret = { result: "runtime error", error: result.error, contents };
  } else {
    ret = { result: "success", output: result.stdout };
  }

  return ret;
};
