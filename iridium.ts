import debugConfig from "#debugConfig";
import {
  initializeOutputsPath
} from "#utils";
import chalk from "chalk";
import { IridiumBuildContext, IRIDIUMV2 } from "./classes/builder/IridiumV2/IRIDIUMV2.ts";
import JS3Builder from "./classes/builder/JS3Builder.ts";
import { ProjectFile } from "./classes/ProjectFile.ts";
import { initIRI, initJS3, initPIKA } from "./configs/argparse.ts";
import fs from "fs";
import path from "path";
import {
  getNextCommand,
  printDefaultUsage,
  printProjectStats
} from "./configs/printUsage.ts";
import { VERSION } from "./configs/projectStats.ts";

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
function js3(filePath, printToConsole = false): JS3Builder {
  debugConfig.logger.printToConsole = false;
  const file = new ProjectFile(filePath, path.dirname(filePath));
  try {
    file.initSync(debugConfig.cli.sourceType);
    if (file.initData.parseStatus !== "parsed")
      debugConfig.logger.throwJS3Error(
        "JS3: Failed to parse input file (there might be syntax errors or sourceType is set incorrectly)",
      );

    const builder = new JS3Builder(file);
    builder.build();

    if (printToConsole)
      console.log(builder.getCodeString());

    return builder;
  } catch (e) {
    console.error("Failed to generate JS3: ", e);
    process.exit(1);
  }
}

function iri(filePath, printToConsole = false): IRIDIUMV2 {
  try {
    const js3Builder = js3(filePath);
    const iridiumV2Builder = new IRIDIUMV2(js3Builder);
    iridiumV2Builder.build();

    if (printToConsole)
      console.log(iridiumV2Builder.container.toString());

    debugConfig.logger.log(iridiumV2Builder.container.toString());
    return iridiumV2Builder;
  } catch (e) {
    debugConfig.logger.throwIriError(`Failed to generate Iridium: ${e}`);
    process.exit(1);
  }
}

function pika(files: Array<string>) {
  const finalRes = [];
  for (let i = 0; i < files.length; i++) {
    finalRes.push(iri(files[i]).serialize());
    IridiumBuildContext.resetBuildContext();
  }

  const filePath = debugConfig.cli.outputsPath + "/" + "bundle.pika";
  fs.writeFile(
    filePath,
    JSON.stringify({ pika: finalRes })
    , (e) => {
      if (e) debugConfig.logger.error(`[Failed to save Pika bundle]: ${e.message}`);
    }
  );
}

function main() {
  let [mainCommand, argv] = getNextCommand();

  debugConfig.cli.outputsPath = path.resolve("./outputs");

  switch (mainCommand) {
    case "iri": {
      const IRIPATH = initIRI(header, argv);
      initializeOutputsPath();
      iri(IRIPATH);
      break;
    }
    case "js3": {
      const JS3PATH = initJS3(header, argv);
      initializeOutputsPath();
      js3(JS3PATH);
      break;
    }
    case "pika": {
      const paths = initPIKA(header, argv);
      initializeOutputsPath();
      pika(paths);
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