const path = require("path");
const childProcess = require('child_process');

const createScenarios = require('test262-stream/lib/create-scenarios.js');
const builder = require('test262-stream/lib/builder.js');

const fs = require('fs');

const IRIAgent = require("./iri-agent.cjs");

const TEST_TIMEOUT = 60 * 1000; // 1 minute
const NODE = "/home/meetesh/wd/babel-test262-runner/engine/node/bin/node"

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


async function getExecutionResults(scenarios, fPath) {
  // Do execution under each scenario and record the result
  const results = []
  for (const scene of scenarios) {
    let { attrs, contents, file } = scene
    try {
      const r = await Promise.race([
        agent.evalScript({
          attrs,
          contents,
          file: fPath,
        }),
        timeout(file),
      ]);

      if (r.error) {
        results.push({ result: "runtime error", r: JSON.stringify(r), name: r.error.name, fPath });
      } else {
        if (attrs.negative && attrs.negative.phase === "parse") {
          results.push({ result: "parse error", fPath, r });
        } else {
          results.push({ result: "success", attrs: JSON.stringify(attrs), fPath, r });
        }
      }
    } catch (e) {
      agent.stop(); // kill process avoid 100% cpu usage
      results.push({ result: "timeout error", fPath, msg: e })
    }
  }

  return results
}

exports.runTest = async function (test) {

  const fPath = `${TESTS}/${test}`

  // Read source file
  let fileContent;
  try {
    fileContent = fs.readFileSync(fPath, { encoding: 'utf8', flag: 'r' });
  } catch (e) {
    return { result: "file read error", fPath, msg: e };
  }

  // Generate Execution Scenarios
  let scenarios;
  try {
    scenarios = createScenarios(builder(fPath, fileContent, { hostPath: NODE, shortName: "$262", testRoot: TESTS, test262Dir: TESTS }))
  } catch (e) {
    return { result: "failed to create scenarios", fPath, msg: e };
  }


  // Get results for each scenario
  const originalResults = await getExecutionResults(scenarios, fPath)

  if (!Array.isArray(originalResults)) {
    return originalResults
  }

  if (originalResults.length !== scenarios.length) {
    return { result: "Number of scenarios and number of results must be the same", originalResults, scenarios, fPath };
  }


  // Generate JS3Scenarios
  for (let i = 0; i < originalResults.length; i++) {
    const scenario = scenarios[i]
    const originalResult = originalResults[i]

    let sourceType = "unambiguous"

    if (scenario.attrs.flags.onlyStrict || scenario.attrs.flags.module) {
      sourceType = "module"
    } else if (scenario.attrs.flags.noStrict) {
      sourceType = "script"
    }

    const cmd = `${IRIDIUM_BIN} js3 ${fPath} -s ${sourceType}`;

    if (originalResult.result === "parse error" || ( originalResult.result === "runtime error" && originalResult.name === "SyntaxError")) {
      // JS3 should also give a syntax error under these scenarios, otherwise throw JS3 Error
      try {
        await childProcess.execSync(cmd, { st });

        return { result: "JS3: Expected syntax error, not thrown!", fPath, scenario };
      } catch (e) {
        // This is expected
      }
    } else {

      let js3Scenario;
      
      try {
        const js3Content = await childProcess.execSync(cmd, { encoding: "utf-8" });
        js3Scenario = builder(fPath, js3Content, { hostPath: NODE, shortName: "$262", testRoot: TESTS, test262Dir: TESTS })
        js3Scenario.cmd = cmd
        js3Scenario.js3content = js3Content
      } catch (e) {
        return { result: "JS3: Failed to generate for the scenario!", originalResult, fPath, scenario, msg: e, cmd, attrs: JSON.stringify(scenario.attrs)  };
      }

      const js3Result = await getExecutionResults([js3Scenario], fPath)
            
      if (originalResult.result !== js3Result[0].result) {
        return { result: "results mismatch", fPath, originalResults, js3Result, js3Scenario: {...js3Scenario, attrs: JSON.stringify(js3Scenario.attrs)}, scenario: {...scenario, attrs: JSON.stringify(scenario)} };
      } else {
        return { result: "success" };
      }
    }
  }

  return { result: "success" };
};
