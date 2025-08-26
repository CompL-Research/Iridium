import debugConfig from "#debugConfig";
import {
  initializeOutputsPath
} from "#utils";
import chalk from "chalk";
import { IridiumBuildContext, IRIDIUMV2 } from "./classes/builder/IridiumV2/IRIDIUMV2";
import JS3Builder from "./classes/builder/JS3Builder";
import { ProjectFile } from "./classes/ProjectFile";
import { initIRI, initJS3, initPIKA } from "./configs/argparse";
import fs from "fs";
import path from "path";
import {
  getNextCommand,
  printDefaultUsage,
  printProjectStats
} from "./configs/printUsage";
import { VERSION } from "./configs/projectStats";

debugConfig.versionNumber = `Iridium ${VERSION}`;

const header = `
██╗██████╗ ██╗██████╗ ██╗██╗   ██╗███╗   ███╗
██║██╔══██╗██║██╔══██╗██║██║   ██║████╗ ████║
██║██████╔╝██║██║  ██║██║██║   ██║██╔████╔██║
██║██╔══██╗██║██║  ██║██║██║   ██║██║╚██╔╝██║
██║██║  ██║██║██████╔╝██║╚██████╔╝██║ ╚═╝ ██║
╚═╝╚═╝  ╚═╝╚═╝╚═════╝ ╚═╝ ╚═════╝ ╚═╝     ╚═╝
                                             
Iridium Version: ${chalk.red(VERSION)}
`;

// FilePath -> JS3Builder
function js3(filePath: string, printToConsole = false): JS3Builder {
  debugConfig.logger.printToConsole = false;
  const file = new ProjectFile(filePath, path.dirname(filePath));
  try {
    if (debugConfig.cli.sourceType === "unambiguous" || debugConfig.cli.sourceType === "script" || debugConfig.cli.sourceType === "module") {
      file.initSync(debugConfig.cli.sourceType);
    } else {
      throw new Error("JS3: supplied source type is invalid");
    }

    if (file.initData.parseStatus !== "parsed")
      throw new Error("JS3: Failed to parse input file (there might be syntax errors or sourceType is set incorrectly)");

    const builder = new JS3Builder(file);
    builder.build();

    if (printToConsole)
      console.log(builder.getCodeString());

    return builder;
  } catch (e) {
    throw new Error(`Failed to generate JS3: ${e}`);
  }
}

function iri(filePath: string, printToConsole = false): IRIDIUMV2 {
  try {
    const js3Builder = js3(filePath, false);
    const iridiumV2Builder = new IRIDIUMV2(js3Builder);
    iridiumV2Builder.build();

    if (!iridiumV2Builder.container) throw new Error("Iridium container is undefined");

    if (debugConfig.cli.iridiumPP) {
      console.log(iridiumV2Builder.container.toString());
    }

    if (printToConsole) {
      // @ts-ignore
      process.stdout.write(iridiumV2Builder.result);
    }
    else
    {
      iridiumV2Builder.saveToDisk()
    }

    return iridiumV2Builder;
  } catch (e) {
    throw new Error(`Failed to generate Iridium: ${e}`);
  }
}

function pika(files: Array<string>, printToConsole = false) {
  const finalRes = [];
  for (let i = 0; i < files.length; i++) {
    finalRes.push(iri(files[i], false).result);
    IridiumBuildContext.resetBuildContext();
  }

  const finalStr = JSON.stringify({ pika: finalRes });

  if (printToConsole)
    console.log(finalStr);
  else {
    const filePath = debugConfig.cli.outputsPath + "/" + "bundle.pika";
    fs.writeFileSync(
      filePath,
      finalStr);
  }
}

function main() {
  let [mainCommand, argv] = getNextCommand();

  debugConfig.cli.outputsPath = path.resolve("./outputs");

  switch (mainCommand) {
    case "iri": {
      const IRIPATH = initIRI(header, argv);
      if (!debugConfig.cli.tout) initializeOutputsPath();
      iri(IRIPATH, debugConfig.cli.tout);
      break;
    }
    case "js3": {
      const JS3PATH = initJS3(header, argv);
      if (!debugConfig.cli.tout) initializeOutputsPath();
      js3(JS3PATH, debugConfig.cli.tout);
      break;
    }
    case "pika": {
      const paths = initPIKA(header, argv);
      if (!debugConfig.cli.tout) initializeOutputsPath();
      pika(paths, debugConfig.cli.tout);
      break;
    }

    case "stats": {
      printProjectStats(header);
      break;
    }

    default: printDefaultUsage(header);
  }
}

main();