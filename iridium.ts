import debugConfig, { logger } from "#debugConfig";
import chalk from "chalk";
import { IRIDIUMV2 } from "./classes/builder/IridiumV2/IRIDIUMV2";
import { tick, tock, printReport } from "./classes/debugger/IRIPerf";
import JS3Builder from "./classes/builder/JS3Builder";
import { ProjectFile } from "./classes/ProjectFile";
import { initIRI, initJS3 } from "./configs/argparse";
import fs from "fs";
import {
  getNextCommand,
  printAuthorInfo,
  printDefaultUsage,
} from "./configs/printUsage";
import { VERSION } from "./configs/projectStats";
import { IridiumSEXP } from "./classes/builder/IridiumV2/Types";
import { execSync } from "child_process";

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
function js3(filePath: string): ProjectFile {
  tick("js3");
  const file = new ProjectFile(filePath);

  tick("babel");
  file.initSync(debugConfig.sourceType);
  tock("babel");

  if (file.info.babel !== "parsed") {
    logger.error(file.errLog, "Babel parsing failed");
    process.exit(1);
  }

  tick("build");
  const builder = new JS3Builder(file);
  builder.build();
  if (!file.info.js3 || file.info.js3 !== "parsed") {
    logger.error(file.errLog, "JS3 build failed");
    process.exit(1);
  }
  tock("build");

  if (debugConfig.dump.js3) {
    tick("save-to-disk");
    fs.writeFileSync(
      debugConfig.dump.out + "/" + file.uname + ".js3.js",
      file.getJS3CodeStringPayload(),
    );
    tock("save-to-disk");
  }

  if (debugConfig.operationMode === "js3") {
    if (debugConfig.rac) {
      const tempFile = "/tmp/" + file.uname + ".js3.js";
      try {
        tick("save-to-disk");
        fs.writeFileSync(tempFile, file.getJS3CodeStringPayload());
        tock("save-to-disk");
        tick("execute");
        const output: string = execSync(
          `./externalDeps/quickjs/build/qjs_new ${tempFile}`,
          { encoding: "utf-8" },
        );
        console.log(output);
        tock("execute");
      } catch (error: any) {
        // The error object contains stderr and the exit code
        console.error("Execution failed:", error.stderr?.toString());
        process.exit(1);
      } finally {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      }
    }
  }

  tock("js3");
  return file;
}

function iri(filePath: string): ProjectFile {
  tick("iri");
  const file = js3(filePath);
  const iridiumV2Builder = new IRIDIUMV2(file, { iridiumArgContext: false });
  tick("build");
  iridiumV2Builder.build();
  if (!file.info.iri || file.info.iri !== "normalized") {
    logger.error(file.errLog, "IRI build failed");
    process.exit(1);
  }
  tock("build");

  if (debugConfig.dump.irix) {
    tick("save-to-disk");
    fs.writeFileSync(
      debugConfig.dump.out + "/" + file.uname + ".iri.x",
      IridiumSEXP.dumpFlat(file.getIRIXPayload()).join("\n"),
    );
    tock("save-to-disk");
  }

  if (debugConfig.dump.iri) {
    tick("save-to-disk");
    fs.writeFileSync(
      debugConfig.dump.out + "/" + file.uname + ".iri",
      file.getIRIPayload(),
    );
    tock("save-to-disk");
  }

  if (debugConfig.operationMode === "iri") {
    if (debugConfig.rac) {
      const tempFile = "/tmp/" + file.uname + ".iri";
      try {
        tick("save-to-disk");
        fs.writeFileSync(tempFile, file.getIRIPayload());
        tock("save-to-disk");
        tick("execute");
        const output: string = execSync(
          `./externalDeps/quickjs/build/qjs_new -X ${tempFile}`,
          { encoding: "utf-8" },
        );
        console.log(output);
        tock("execute");
      } catch (error: any) {
        // The error object contains stderr and the exit code
        console.error("Execution failed:", error.stderr?.toString());
        process.exit(1);
      } finally {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      }
    }
  }

  tock("iri");
  return file;
}

function main() {
  tick("main");
  let [mainCommand, argv] = getNextCommand();

  switch (mainCommand) {
    case "iri": {
      const IRIPATH = initIRI(header, argv);
      iri(IRIPATH);
      break;
    }
    case "js3": {
      const JS3PATH = initJS3(header, argv);
      js3(JS3PATH);
      break;
    }

    case "author": {
      printAuthorInfo();
      break;
    }

    default:
      printDefaultUsage(header);
  }

  tock("main");
  printReport();
}

main();
