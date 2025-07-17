const path = require("path");
const fs   = require("fs");

const EXEC_BIN          = "/home/meetesh/wd/quickjs/build/qjs";
const IRI_PATH          = "/home/meetesh/wd/Iridium";
const TEST262_PATH      = "/home/meetesh/wd/Iridium/tests/test262";
const TMP_PATH          = "/home/meetesh/wd/Iridium/tests/tmp";
const { execSync }      = require('child_process');


const TEST_TIMEOUT = 60 * 1000; // 1 minute

exports.runBaseline = async function (test) {
  const isModule = test.attrs.flags.module;
  let {result: baselineTestPath, error} = storeBaselineTest(test);
  if (error) {
    return { result: "store-fail", error };
  }
  try {
    execSync(`${EXEC_BIN} ${isModule ? '-m' : '-C'} ${baselineTestPath}`, { encoding: 'utf-8', stdio: 'pipe', timeout: TEST_TIMEOUT });
    return { result: "success", error: false };
  } catch (err) {
    return { result: "exec-fail", error: err.message };
  }
}

exports.runIridium = async function (test) {
  let {result: iriTestPath, error} = storeIridiumTest(test);

  if (error) {
    return { result: "store-fail", error };
  }

  try {
    execSync(`${EXEC_BIN} -X ${iriTestPath}`, { encoding: 'utf-8', stdio: 'pipe', timeout: TEST_TIMEOUT });
    return { result: "success", error: false };
  } catch (err) {
    return { result: "exec-fail", error: err.message };
  }
}

// 
// Utility Functions
// 

function timeout(file) {
  return new Promise((_resolve, reject) =>
    setTimeout(
      () => reject(new Error(`test ${file} timed out after ${TEST_TIMEOUT} ms`)),
      TEST_TIMEOUT
    )
  );
}

function storeBaselineTest(test) {
  let { attrs, contents, file, scenario } = test;
  const baseName = file.replace(/\//g, '_');
  const isModule = attrs.flags.module;
  const isStrict = scenario === "strict mode";
  const UID = Math.random().toString(36).substring(2, 15);
  const date = Date.now();
  const fPath = `${TMP_PATH}/${baseName}_baseline_${date}_${UID}.js`;

  try {
    if (isStrict && !isModule && !/^\s*['"]use strict['"]/.test(contents)) {
      contents = `"use strict";\nundefined;\n${contents}`;
    }
    fs.writeFileSync(fPath, contents);
  } catch (error) {
    return { result: "Failed to save baseline test", error };
  }

  return { result: fPath, error: false }
}

function storeIridiumTest(test) {
  let { attrs, contents, file, scenario } = test;
  const baseName = file.replace(/\//g, '_');
  const isModule = attrs.flags.module;
  const isStrict = scenario === "strict mode";
  const UID = Math.random().toString(36).substring(2, 15);
  const date = Date.now();
  const fPath = `${TMP_PATH}/${baseName}_iri_${date}_${UID}.js`;
  const fPathIri = `${TMP_PATH}/${baseName}_iri_${date}_${UID}.json`;

  try {
    if (isStrict && !isModule && !/^\s*['"]use strict['"]/.test(contents)) {
      contents = `"use strict";\nundefined;\n${contents}`;
    }
    fs.writeFileSync(fPath, contents);
    execSync(`./iridium iri -s ${isModule ? 'module' : 'script'} -t ${TEST262_PATH} ${fPath} > ${fPathIri}`, { cwd: IRI_PATH, encoding: 'utf-8', stdio: 'pipe' });
  } catch (error) {
    return { result: "Failed to save iridium test", error };
  }

  return { result: fPathIri, error: false }
}