// 
// Inspired by babel-262 runner: https://github.com/babel/babel-test262-runner
// 
const fs = require("fs");
const childProcess = require('child_process');

const IRIDIUM_BIN = "/home/meetesh/wd/Iridium/iridium";
exports.transpileJS3 = async function transpileJS3(code, { features, isModule, isStrict } = {}, fName) {
  if (isStrict && !isModule && !/^\s*['"]use strict['"]/.test(code)) {
    // eval("") === undefined
    code = `"use strict";\nundefined;\n${code}`;
  }

  const UID = Math.random().toString(36).substring(2, 15)
  const fPath = `./tmp/${UID}_${fName}`
  fs.writeFileSync(fPath, code)

  const sourceType = isModule ? "module" : "script"
  const cmd = `${IRIDIUM_BIN} js3 ${fPath} --allow-lang-with-support -s ${sourceType} 2>/dev/null`;

  const ret = await childProcess.execSync(cmd, { encoding: "utf-8" });

  const fPathJS3 = `./tmp/${UID}_JS3${fName}`
  fs.writeFileSync(fPathJS3, ret)

  return code;
};

exports.transpile = async function transpile(code, { features, isModule, isStrict } = {}) {
  if (isStrict && !isModule && !/^\s*['"]use strict['"]/.test(code)) {
    // eval("") === undefined
    code = `"use strict";\nundefined;\n${code}`;
  }
  return code
};
