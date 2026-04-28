import debugConfig from "#debugConfig";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import {
  getNextCommand,
  handleOptionsFromArgv,
  iriUsageInfo,
  js3UsageInfo,
  printIRIUsage,
  printJS3Usage,
} from "./printUsage";

// Args -> FilePath

const genericHandler = (
  operationMode: "iri" | "js3",
  header: string,
  origArgv: Array<string>,
) => {
  let [command, argv] = ["", origArgv];
  debugConfig.operationMode = operationMode;

  if (argv.length === 0) {
    if (operationMode === "js3") printJS3Usage(header);
    else printIRIUsage(header);
    process.exit(0);
  }

  if (operationMode === "js3") {
    argv = handleOptionsFromArgv(argv, js3UsageInfo[1].optionList);
  } else {
    argv = handleOptionsFromArgv(argv, iriUsageInfo[1].optionList);
  }

  if (argv.length === 0) {
    if (operationMode === "js3") printJS3Usage(header);
    else printIRIUsage(header);
    process.exit(0);
  }

  [command, argv] = getNextCommand(argv);

  const PATH_TO_JS = path.resolve(command);
  if (!fs.existsSync(PATH_TO_JS)) {
    console.error(
      chalk.red(
        `[${operationMode.toUpperCase()} Init] File does not exist: ${PATH_TO_JS}`,
      ),
    );
    process.exit(1);
  }

  return PATH_TO_JS;
};

export const initJS3 = (header: string, origArgv: Array<string>): string => {
  return genericHandler("js3", header, origArgv);
};

// Args -> FilePath
export const initIRI = (header: string, origArgv: Array<string>): string => {
  return genericHandler("iri", header, origArgv);
};
