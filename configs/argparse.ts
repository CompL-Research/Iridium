import debugConfig from "#debugConfig";
import { hasPackageJson } from "#utils";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { getNextCommand, handleOptionsFromArgv, iriUsageInfo, js3UsageInfo, pikaUsageInfo, printIRIUsage, printJS3Usage, printPikaUsage } from "./printUsage";


// Args -> FilePath
export const initJS3 = (header: string, origArgv: Array<string>): string => {
  let [command, argv] = ["", origArgv];
  debugConfig.operationMode = "js3";

  if (argv.length === 0) {
    printJS3Usage(header);
    process.exit(0);
  }

  argv = handleOptionsFromArgv(argv, js3UsageInfo[1].optionList);

  if (argv.length === 0) {
    printJS3Usage(header);
    process.exit(0);
  }

  [command, argv] = getNextCommand(argv);

  const PATH_TO_JS = path.resolve(command);
  if (!fs.existsSync(PATH_TO_JS)) {
    console.error(chalk.red(`[3JS Init] File does not exist: ${PATH_TO_JS}`));
    process.exit(1);
  }

  return PATH_TO_JS;
}

// Args -> FilePath
export const initIRI = (header: string, origArgv: Array<string>): string => {
  let [command, argv] = ["", origArgv];
  debugConfig.operationMode = "iri";

  if (argv.length === 0) {
    printIRIUsage(header);
    process.exit(0);
  }

  argv = handleOptionsFromArgv(argv, iriUsageInfo[1].optionList);

  if (argv.length === 0) {
    console.error(
      chalk.red(`[IRI Init] Project base path not provided`),
    );
    process.exit(1);
  }

  [command, argv] = getNextCommand(argv);
  const PATH_TO_PROJECT = path.resolve(command);

  if (!hasPackageJson(PATH_TO_PROJECT)) {
    console.error(
      chalk.red(`[IRI Init] Project Base Path is invalid, package.json not found`),
    );
    process.exit(1);
  }

  if (argv.length === 0) {
    console.error(
      chalk.red(`[IRI Init] Project file path not provided`),
    );
    process.exit(1);
  }

  [command, argv] = getNextCommand(argv);
  const PATH_TO_JS = path.resolve(command);

  if (!fs.existsSync(PATH_TO_JS)) {
    console.error(chalk.red(`[IRI Init] Project File does not exist: ${PATH_TO_JS}`));
    process.exit(1);
  }

  // Initialize Project Base
  debugConfig.cli.projectBase = PATH_TO_PROJECT;

  return PATH_TO_JS;
}

// Args -> [FilePath]
export const initPIKA = (header: string, origArgv: Array<string>): Array<string> => {
  let [command, argv] = ["", origArgv];
  debugConfig.operationMode = "pika";

  if (argv.length === 0) {
    printPikaUsage(header);
    process.exit(0);
  }

  argv = handleOptionsFromArgv(argv, pikaUsageInfo[1].optionList);

  if (argv.length === 0) {
    console.error(
      chalk.red(`[Pika Init] Project base path not provided`),
    );
    process.exit(1);
  }

  [command, argv] = getNextCommand(argv);

  let PATH_TO_PROJECT = path.resolve(command);

  if (argv.length === 0) {
    console.error(
      chalk.red(`[Pika Init] Expected atleast one file to be provided`),
    );
    process.exit(1);
  }

  const PROJECT_FILES: Array<string> = [];

  while (argv.length > 0) {
    [command, argv] = getNextCommand(argv);
    PROJECT_FILES.push(path.resolve(command));
  }

  // Initialize Project Base
  debugConfig.cli.projectBase = PATH_TO_PROJECT;

  return PROJECT_FILES;
}

