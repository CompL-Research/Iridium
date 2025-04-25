import debugConfig from "#debugConfig";
import {
  ensurePathExists,
  hasPackageJson,
  initializeOutputsPath,
  saveDependencyGraph,
} from "#utils";
import chalk from "chalk";
import {
  buildDependencyGraph,
  DEPENDENCY_GRAPH,
  IRIDIUM_CONTAINER_MAP,
} from "classes/builder/IridiumHelpers/DependencyGraph.ts";
import { I_Container } from "classes/builder/IridiumHelpers/I_GENERAL/I_Container.ts";
import JS3Builder from "classes/builder/JS3Builder.ts";
import { ProjectFile } from "classes/ProjectFile.ts";
import commandLineArgs from "command-line-args";
import commandLineUsage from "command-line-usage";
import fs from "fs";
import ora from "ora";
import path from "path";
import {
  handleLangWithSupport,
  handleOutputsPath,
  handleSaveFlowGraph,
  handleSavePTAGraph,
  handleSourceType,
  handleTest262,
  iriUsageInfo,
  js3UsageInfo,
  printDefaultUsage,
  printIRIUsage,
  printJS3Usage,
} from "./configs/printUsage.ts";
import { projectStats, VERSION } from "./configs/projectStats.ts";
import { IRIDIUMV2 } from "classes/builder/IridiumV2/IRIDIUMV2.ts";
import { FileSEXP } from "classes/builder/IridiumV2/Types.ts";
import { dumpSEXP } from "classes/builder/IridiumV2/PP.ts";


const directories = ["./classes", "./configs", "./docs", "./playground/src"];

debugConfig.versionNumber = `Iridium ${VERSION}`;

const header = `
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░        ░░       ░░░        ░░       ░░░        ░░  ░░░░  ░░  ░░░░  ░
▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒  ▒▒   ▒▒   ▒
▓▓▓▓  ▓▓▓▓▓       ▓▓▓▓▓▓  ▓▓▓▓▓  ▓▓▓▓  ▓▓▓▓▓  ▓▓▓▓▓  ▓▓▓▓  ▓▓        ▓
████  █████  ███  ██████  █████  ████  █████  █████  ████  ██  █  █  █
█        ██  ████  ██        ██       ███        ███      ███  ████  █
██████████████████████████████████████████████████████████████████████
Iridium Version: ${chalk.red(VERSION)}
`;

function js3(filePath) {
  if (!debugConfig.cli.test262)
    initializeOutputsPath();
  
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

    console.log(builder.generatedCode);
    process.exit(0);
  } catch (e) {
    console.error("Failed to generate JS3: ", e);
    process.exit(1);
  }
}

function iri(filePath) {
  // debugConfig.logger.printToConsole = false;

  try {
    initializeOutputsPath();
    if (debugConfig.cli.savePTAGraph) {
      const PTAPATH = debugConfig.cli.outputsPath + "/PTA";
      ensurePathExists(PTAPATH);
    }
    // 1. Loading The File
    const projectFile = new ProjectFile(filePath, debugConfig.cli.projectBase);
    projectFile.initSync(debugConfig.cli.sourceType);
    if (projectFile.initData.parseStatus !== "parsed")
      debugConfig.logger.throwJS3Error(
        "JS3: Failed to parse input file (there might be syntax errors or sourceType is set incorrectly)",
      );

    // 2. Constructing JS3
    const js3Builder = new JS3Builder(projectFile);
    js3Builder.build();
    const fileNode = js3Builder.generatedAST;
    const programNode = fileNode.program;

    const iridiumV2Builder = new IRIDIUMV2(js3Builder);
    iridiumV2Builder.build();

    iridiumV2Builder.saveGeneratedFile();

    // const jsonString = JSON.stringify(iridiumV2Builder.serialize());
    // const encodedJson = encodeURIComponent(jsonString);
    // debugConfig.logger.log(`https://jsoneditoronline.org/#left=json.${encodedJson}`);

    debugConfig.logger.log("" + dumpSEXP(iridiumV2Builder.container));

    // // 3. Constructing Iridium
    // const directives: Array<string> = [];
    // programNode.directives.forEach((d) => directives.push(d.value.value));
    // const sourceType = programNode.sourceType;
    // const iri_container = new I_Container(
    //   fileNode,
    //   projectFile,
    //   js3Builder,
    //   js3Builder.utils,
    //   directives,
    //   sourceType,
    //   debugConfig.cli.projectBase,
    // );
    // IRIDIUM_CONTAINER_MAP.set(projectFile.uname, iri_container);
    // iri_container.build(false);

    // let spinner = ora("[Building Dependency Graph]").start();
    // let clock = performance.now();
    // buildDependencyGraph(iri_container, js3Builder.utils);
    // clock = performance.now() - clock;
    // spinner.stopAndPersist({ prefixText: `✅ ${clock.toPrecision(3)} ms` });

    // spinner = ora("[Saving Dependency Graph]").start();
    // clock = performance.now();
    // saveDependencyGraph(DEPENDENCY_GRAPH);
    // clock = performance.now() - clock;
    // spinner.stopAndPersist({ prefixText: `✅ ${clock.toPrecision(3)} ms` });

    // // spinner = ora('[Computing PTA]').start();
    // // clock = performance.now();
    // // iri_container.module.performPTA(true);
    // // clock = performance.now() - clock;
    // // spinner.stopAndPersist({ prefixText: `✅ ${clock.toPrecision(3)} ms` });

    // // for(const [key, values] of PTA_WORLD_CURRMUTABLE_DATA.entries()) {
    // //   if (values.length !== 0) debugConfig.logger.throwIriError(`Expected world stack to be 0, found: ${values.length}`);
    // // }

    // // if (debugConfig.cli.savePTAGraph) {
    // //   for(const [key, value] of PTA_WORLD.entries()) {
    // //     saveFlowDataToFile(key, value);
    // //     // debugConfig.logger.warn(`PTA Flow Data for ${key}`);
    // //     // printPTAFlowData(value);
    // //   }
    // // }

    // // iri_container.module.saveRenderTree()
  } catch (e) {
    debugConfig.logger.throwIriError(`Failed to generate Iridium: ${e}`);
    process.exit(1);
  }
}

const getFirstCommand = [{ name: "command", defaultOption: true }];
const mainOptions = commandLineArgs(getFirstCommand, {
  stopAtFirstUnknown: true,
});
const mainCommand = mainOptions.command;

// Initialize default outputs path
debugConfig.cli.outputsPath = path.resolve("./outputs");

if (mainCommand === "js3") {
  debugConfig.operationMode = "js3";
  let argv = mainOptions._unknown || [];
  if (argv.length === 0) {
    printJS3Usage(header);
    process.exit(0);
  }
  const js3MainOptions = commandLineArgs(getFirstCommand, {
    argv,
    stopAtFirstUnknown: true,
  });
  argv = js3MainOptions._unknown || [];
  if (js3MainOptions.command === "help") {
    printJS3Usage(header);
    process.exit(0);
  }
  const PATH_TO_JS = path.resolve(js3MainOptions.command);
  if (!fs.existsSync(PATH_TO_JS)) {
    console.error(chalk.red(`[ERROR] File does not exist: ${PATH_TO_JS}`));
    process.exit(1);
  }
  debugConfig.throwJS3Errors = true;
  if (argv.length > 0) {
    const options = commandLineArgs(js3UsageInfo[1].optionList, { argv });
    if ("outputs-path" in options) handleOutputsPath(options);
    if ("test-262" in options) handleTest262();
    if ("source-type" in options) handleSourceType(options);
    if ("allow-lang-with-support" in options) handleLangWithSupport();
  }
  js3(PATH_TO_JS);
} else if (mainCommand === "iri") {
  debugConfig.operationMode = "iri";
  let argv = mainOptions._unknown || [];
  if (argv.length === 0) {
    printIRIUsage(header);
    process.exit(0);
  }
  const iriMainOptions = commandLineArgs(getFirstCommand, {
    argv,
    stopAtFirstUnknown: true,
  });
  argv = iriMainOptions._unknown || [];
  if (iriMainOptions.command === "help") {
    printIRIUsage(header);
    process.exit(0);
  }
  const PATH_TO_JS = path.resolve(iriMainOptions.command);
  if (!fs.existsSync(PATH_TO_JS)) {
    console.error(chalk.red(`[ERROR] File does not exist: ${PATH_TO_JS}`));
    process.exit(1);
  }

  const subOptions = commandLineArgs(getFirstCommand, {
    argv,
    stopAtFirstUnknown: true,
  });
  const PATH_TO_PROJECT = path.resolve(subOptions.command);
  argv = subOptions._unknown || [];

  if (!hasPackageJson(PATH_TO_PROJECT)) {
    console.error(
      chalk.red(`[ERROR] package.json not found in the project root`),
    );
    process.exit(1);
  }

  // Initialize Projecy Base
  debugConfig.cli.projectBase = PATH_TO_PROJECT;
  debugConfig.throwJS3Errors = true;
  debugConfig.throwIRIErrors = true;
  if (argv.length > 0) {
    const options = commandLineArgs(iriUsageInfo[1].optionList, { argv });
    if ("outputs-path" in options) handleOutputsPath(options);
    if ("test-262" in options) handleTest262();
    if ("source-type" in options) handleSourceType(options);
    if ("allow-lang-with-support" in options) handleLangWithSupport();
    if ("save-pta-graph" in options) handleSavePTAGraph();
    if ("save-flow-graph" in options) handleSaveFlowGraph();
  }
  iri(PATH_TO_JS);
} else if (mainCommand === "version") {
  console.log(`Iridium Version: ${chalk.red(VERSION)}`);
} else if (mainCommand === "stats") {
  const sections = [
    {
      header: chalk.red(`Iridium ${VERSION} Stats`),
    },
  ];
  const usage = commandLineUsage(sections);
  console.log(usage);
  projectStats(directories);
} else {
  printDefaultUsage(header);
}
//
// TODO...
//
// else if (mainCommand === 'analyze') {
//   debugConfig.operationMode = "analyze"
//   let argv = mainOptions._unknown || []
//   if (argv.length === 0) {
//     printAnalyzeUsage(header)
//     process.exit(0)
//   }
//   const analyzeMainOptions = commandLineArgs(getFirstCommand, { argv, stopAtFirstUnknown: true })
//   argv = analyzeMainOptions._unknown || []
//   if (analyzeMainOptions.command === "help") {
//     printAnalyzeUsage(header)
//     process.exit(0)
//   }
//   const PATH_TO_PROJECT = path.resolve(analyzeMainOptions.command)
//   let ANALYZE_PATH = PATH_TO_PROJECT
//   if (!fs.existsSync(PATH_TO_PROJECT)) {
//     console.error(chalk.red(`[ERROR] Project path does not exist: ${PATH_TO_PROJECT}`))
//     process.exit(1)
//   }
//   if (argv.length > 0) {
//     const options = commandLineArgs(analyzeUsageInfo[1].optionList, { argv })
//     if ("outputs-path" in options) handleOutputsPath(options);
//     if ("test-262" in options) handleTest262();
//     if ("folder" in options) {
//       if (options.folder === null) {
//         console.log(chalk.red("Folder path not provided"))
//         process.exit(1)
//       }
//       try {
//         ANALYZE_PATH = path.resolve(PATH_TO_PROJECT + "/" + options.folder)
//       } catch (e) {
//         console.log(chalk.red(`Invalid Path: ${ANALYZE_PATH}`))
//         process.exit(1)
//       }
//       if (!fs.existsSync(ANALYZE_PATH)) {
//         console.warn(`[INFO] Project Path: ${PATH_TO_PROJECT}`)
//         console.warn(`[INFO] Analysis Folder: ${ANALYZE_PATH}`)
//         console.error(`[ERROR] Analysis path does not exist: ${ANALYZE_PATH}`)
//         process.exit(1)
//       }
//     }
//     if ("module-graph-png" in options) {
//       debugConfig.cli.printModuleGraphPng = true
//     }
//     if ("enable-playground" in options) {
//       debugConfig.enablePlayground = true
//     }
//     if ("playground-port" in options) {
//       debugConfig.playgroundPort = options["playground-port"]
//     }
//     if ("allow-lang-with-support" in options) handleLangWithSupport();
//   }
//   if (fs.existsSync(debugConfig.cli.outputsPath)) {
//     fs.rmSync(debugConfig.cli.outputsPath, { recursive: true, force: true });
//   }
//   fs.mkdirSync(debugConfig.cli.outputsPath);
//   analyze(PATH_TO_PROJECT, ANALYZE_PATH)
// }

// function analyze(mainProjectPath, analyzePath) {
//   initializeOutputsPath();
//   debugConfig.logger.log(`[IRIDIUM STARTING] ${mainProjectPath}`)

//   // Iridium Playground
//   if (debugConfig.enablePlayground) {
//     const port = debugConfig.playgroundPort
//     const io = new Server();

//     const clientList = {}

//     io.on("connection", (socket) => {
//       debugConfig.logger.log(`[IRIDIUM PLAYGROUND] Connected to a remote client ${socket.id}`)
//       clientList[socket.id] = true

//       socket.on('disconnect', function () {
//         clientList[socket.id] = false
//         let activeClients = Object.values(clientList).filter(e => e == true).length

//         debugConfig.logger.log(`[IRIDIUM PLAYGROUND] Client disconnected ${socket.id} [${activeClients} active]`)
//       });

//       socket.on("get-file-listing", (dataLen: number) => {
//         // Send the list of files loaded in the project...
//       });

//       socket.on("get-log-data", (dataLen: number) => {
//         const dataToSend = debugConfig.logger.logData.slice(dataLen)
//         let finalData: any = []

//         dataToSend.forEach(o => {
//           finalData.push({ ...o, objects: o.objects.length > 0 ? ["unresolved"] : ["none"] })
//         })
//         socket.emit("log-data-delivery", finalData)
//       });

//       socket.on("get-log-object", (dataIdx: number) => {
//         const dataItem = debugConfig.logger.logData[dataIdx]
//         console.log("Sending Requested Log Data: ", dataIdx, dataItem)
//         socket.emit("log-object-delivery", { dataIdx, data: dataItem.objects })
//       });

//       socket.on("get-imports-graph", (dataLen) => {
//         if (project.importsGraphProcessed) {
//           const res = project.importsGraph.getDOT()
//           socket.emit("imports-graph-delivery", res)
//         } else {
//           debugConfig.logger.warn("Imports graph is not yet ready!")
//           socket.emit("imports-graph-not-ready")
//         }
//       });

//     });

//     io.listen(port);
//     debugConfig.logger.log(`[IRIDIUM PLAYGROUND] Listening on port: ${port}`)
//   }

//   const project = new Project(mainProjectPath, analyzePath)
//   project.init();

//   const fileInitPromises = new Array<Promise<void>>()

//   // Initialize all project files
//   for (const [, projectFile] of project.files) {
//     fileInitPromises.push(projectFile.initAsync())
//   }

//   Promise.all(fileInitPromises).then(() => {
//     debugConfig.logger.log("[All Project Files Were Initialized]")
//     project.printStats()

//     project.processImportsGraph()
//     project.importsGraph.generateRootNodes()
//     project.importsGraph.dumpDOT();

//     for (const [f, file] of project.files) {
//       if (file.initData.status === "loaded" && file.initData.parseStatus === "parsed") {

//         try {
//           const js3Builder = new JS3Builder(file)
//           js3Builder.build()
//           js3Builder.saveGeneratedFile()
//           const uri = js3Builder.uri
//           debugConfig.logger.log(`[JS3Builder] Processed ${file.filename}`)
//           debugConfig.logger.printToConsole = false
//           debugConfig.logger.log(`${uri}`)
//           debugConfig.logger.printToConsole = true
//         } catch (e) {
//           debugConfig.logger.error(`[JS3Builder] Failed to process ${file.filename}`, [e])
//         }
//       } else {
//         debugConfig.logger.error(`[JS3Builder] Skipping ${file.uname} -- Status: ${file.initData.status}, ParseStatus: ${file.initData.parseStatus} `)
//       }
//     }
//   })
// }
