import chalk from 'chalk'
import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import fs from 'fs'
import path from 'path'
import { Server } from "socket.io"

import debugConfig from "#debugConfig"
import JS3Builder from 'classes/builder/JS3Builder.ts'
import { ProjectFile } from 'classes/ProjectFile.ts'
import { Project } from './classes/Project.ts'
import { projectStats } from './configs/projectStats.ts'
import { analyzeUsageInfo, js3UsageInfo, printAnalyzeUsage, printDefaultUsage, printIRIUsage, printJS3Usage } from './configs/printUsage.ts'
import { IridiumBuilder } from 'classes/builder/IridiumBuilder.ts'

const VERSION = "0.3a"
const directories = ['./classes', './configs', './docs'];

debugConfig.versionNumber = `Iridium ${VERSION}`

const header = `
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░        ░░       ░░░        ░░       ░░░        ░░  ░░░░  ░░  ░░░░  ░
▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒  ▒▒   ▒▒   ▒
▓▓▓▓  ▓▓▓▓▓       ▓▓▓▓▓▓  ▓▓▓▓▓  ▓▓▓▓  ▓▓▓▓▓  ▓▓▓▓▓  ▓▓▓▓  ▓▓        ▓
████  █████  ███  ██████  █████  ████  █████  █████  ████  ██  █  █  █
█        ██  ████  ██        ██       ███        ███      ███  ████  █
██████████████████████████████████████████████████████████████████████
Iridium Version: ${chalk.red(VERSION)}
`

function analyze(mainProjectPath, analyzePath) {
  debugConfig.logger.log(`[IRIDIUM STARTING] ${mainProjectPath}`)

  // Iridium Playground
  if (debugConfig.enablePlayground) {
    const port = debugConfig.playgroundPort
    const io = new Server();

    const clientList = {}

    io.on("connection", (socket) => {
      debugConfig.logger.log(`[IRIDIUM PLAYGROUND] Connected to a remote client ${socket.id}`)
      clientList[socket.id] = true

      socket.on('disconnect', function () {
        clientList[socket.id] = false
        let activeClients = Object.values(clientList).filter(e => e == true).length

        debugConfig.logger.log(`[IRIDIUM PLAYGROUND] Client disconnected ${socket.id} [${activeClients} active]`)
      });

      socket.on("get-file-listing", (dataLen: number) => {
        // Send the list of files loaded in the project...
      });

      socket.on("get-log-data", (dataLen: number) => {
        const dataToSend = debugConfig.logger.logData.slice(dataLen)
        let finalData: any = []

        dataToSend.forEach(o => {
          finalData.push({ ...o, objects: o.objects.length > 0 ? ["unresolved"] : ["none"] })
        })
        socket.emit("log-data-delivery", finalData)
      });

      socket.on("get-log-object", (dataIdx: number) => {
        const dataItem = debugConfig.logger.logData[dataIdx]
        console.log("Sending Requested Log Data: ", dataIdx, dataItem)
        socket.emit("log-object-delivery", { dataIdx, data: dataItem.objects })
      });

      socket.on("get-imports-graph", (dataLen) => {
        if (project.importsGraphProcessed) {
          const res = project.importsGraph.getDOT()
          socket.emit("imports-graph-delivery", res)
        } else {
          debugConfig.logger.warn("Imports graph is not yet ready!")
          socket.emit("imports-graph-not-ready")
        }
      });

    });

    io.listen(port);
    debugConfig.logger.log(`[IRIDIUM PLAYGROUND] Listening on port: ${port}`)
  }

  const project = new Project(mainProjectPath, analyzePath)
  project.init();


  const fileInitPromises = new Array<Promise<void>>()

  // Initialize all project files
  for (const [, projectFile] of project.files) {
    fileInitPromises.push(projectFile.initAsync())
  }

  Promise.all(fileInitPromises).then(() => {
    debugConfig.logger.log("[All Project Files Were Initialized]")
    project.printStats()

    project.processImportsGraph()
    project.importsGraph.generateRootNodes()
    project.importsGraph.dumpDOT();

    for (const [f, file] of project.files) {
      if (file.initData.status === "loaded" && file.initData.parseStatus === "parsed") {

        try {
          const js3Builder = new JS3Builder(file)
          js3Builder.build()
          js3Builder.saveGeneratedFile()
          const uri = js3Builder.uri
          debugConfig.logger.log(`[JS3Builder] Processed ${file.filename}`)
          debugConfig.logger.printToConsole = false
          debugConfig.logger.log(`${uri}`)
          debugConfig.logger.printToConsole = true          
        } catch (e) { 
          debugConfig.logger.error(`[JS3Builder] Failed to process ${file.filename}`, [e])
        }
        
        
      } else {
        debugConfig.logger.error(`[JS3Builder] Skipping ${file.uname} -- Status: ${file.initData.status}, ParseStatus: ${file.initData.parseStatus} `)
      }
    }
  })
}

function js3(filePath) {
  debugConfig.logger.printToConsole = false
  const file = new ProjectFile(filePath, path.dirname(filePath))
  try {
    file.initSync(debugConfig.js3SourceType)
    if (file.initData.parseStatus !== "parsed") 
      debugConfig.logger.throwJS3Error("JS3: Failed to parse input file (there might be syntax errors or sourceType is set incorrectly)")
      
    const builder = new JS3Builder(file)
    builder.build()
    if (debugConfig.outputsPath !== "") {
      builder.saveGeneratedFile()
    }
    
    console.log(builder.generatedCode)
    process.exit(0)
  } catch (e) {
    console.error("Failed to generated JS3: ", e)
    process.exit(1)
  }
}

function iri(filePath) {
  debugConfig.logger.printToConsole = false
  const file = new ProjectFile(filePath, path.dirname(filePath))
  try {
    file.initSync(debugConfig.js3SourceType)
    if (file.initData.parseStatus !== "parsed") 
      debugConfig.logger.throwJS3Error("JS3: Failed to parse input file (there might be syntax errors or sourceType is set incorrectly)")
      
    const js3Builder = new JS3Builder(file)
    js3Builder.build()
    if (debugConfig.outputsPath !== "") {
      js3Builder.saveGeneratedFile()
    }
    
    const iriBuilder = new IridiumBuilder(js3Builder.generatedProgram)
    iriBuilder.build()
    console.log(iriBuilder.toString())
    process.exit(0)
  } catch (e) {
    console.error("Failed to generated JS3: ", e)
    process.exit(1)
  }
}

const getFirstCommand = [{ name: 'command', defaultOption: true }]
const mainOptions = commandLineArgs(getFirstCommand, { stopAtFirstUnknown: true })
const mainCommand = mainOptions.command

if (mainCommand === 'analyze') {
  debugConfig.operationMode = "analyze"
  let argv = mainOptions._unknown || []
  if (argv.length === 0) {
    printAnalyzeUsage(header)
    process.exit(0)
  }
  const analyzeMainOptions = commandLineArgs(getFirstCommand, { argv, stopAtFirstUnknown: true })
  argv = analyzeMainOptions._unknown || []
  if (analyzeMainOptions.command === "help") {
    printAnalyzeUsage(header)
    process.exit(0)
  }
  const PATH_TO_PROJECT = path.resolve(analyzeMainOptions.command)
  let ANALYZE_PATH      = PATH_TO_PROJECT
  if (!fs.existsSync(PATH_TO_PROJECT)) {
    console.error(chalk.red(`[ERROR] Project path does not exist: ${PATH_TO_PROJECT}`))
    process.exit(1)
  }
  debugConfig.outputsPath = path.resolve("./outputs")
  if (argv.length > 0) {
    const options = commandLineArgs(analyzeUsageInfo[1].optionList, { argv })
    if ("outputs-path" in options) {
      if (options["outputs-path"] === null) {
        console.log(chalk.red("Outputs path not provided"))
        process.exit(1)
      }
      debugConfig.outputsPath = path.resolve("./" + options["outputs-path"])
    }
    if ("folder" in options) {
      if (options.folder === null) {
        console.log(chalk.red("Folder path not provided"))
        process.exit(1)
      }
      try {
        ANALYZE_PATH = path.resolve(PATH_TO_PROJECT + "/" + options.folder)
      } catch (e) {
        console.log(chalk.red(`Invalid Path: ${ANALYZE_PATH}`))
        process.exit(1)
      }
      if (!fs.existsSync(ANALYZE_PATH)) {
        console.warn(`[INFO] Project Path: ${PATH_TO_PROJECT}`)
        console.warn(`[INFO] Analysis Folder: ${ANALYZE_PATH}`)
        console.error(`[ERROR] Analysis path does not exist: ${ANALYZE_PATH}`)
        process.exit(1)
      }
    }
    if ("module-graph-png" in options) {
      debugConfig.printModuleGraphPng = true
    }
    if ("enable-playground" in options) {
      debugConfig.enablePlayground = true
    }
    if ("playground-port" in options) {
      debugConfig.playgroundPort = options["playground-port"]
    }
    if ("allow-lang-with-support" in options) {
      debugConfig.allowLangWithSupport = true
    }
  }
  if (fs.existsSync(debugConfig.outputsPath)) {
    fs.rmSync(debugConfig.outputsPath, { recursive: true, force: true });
  }
  fs.mkdirSync(debugConfig.outputsPath);
  analyze(PATH_TO_PROJECT, ANALYZE_PATH)
} else if (mainCommand === "js3") {
  debugConfig.operationMode = "js3"
  let argv = mainOptions._unknown || []
  if (argv.length === 0) {
    printJS3Usage(header)
    process.exit(0)
  }
  const js3MainOptions = commandLineArgs(getFirstCommand, { argv, stopAtFirstUnknown: true })
  argv = js3MainOptions._unknown || []
  if (js3MainOptions.command === "help") {
    printJS3Usage(header)
    process.exit(0)
  }
  const PATH_TO_JS = path.resolve(js3MainOptions.command)
  if (!fs.existsSync(PATH_TO_JS)) {
    console.error(chalk.red(`[ERROR] File does not exist: ${PATH_TO_JS}`))
    process.exit(1)
  }
  debugConfig.throwJS3Errors = true
  if (argv.length > 0) {
    const options = commandLineArgs(js3UsageInfo[1].optionList, { argv })
    if ("outputs-path" in options) {
      if (options["outputs-path"] === null) {
        console.log(chalk.red("JS3 result path not provided"))
        process.exit(1)
      }
      debugConfig.outputsPath = path.resolve(options["outputs-path"])
      if (fs.existsSync(debugConfig.outputsPath)) {
        fs.rmSync(debugConfig.outputsPath, { recursive: true, force: true });
      }
      fs.mkdirSync(debugConfig.outputsPath);
    }
    if ("source-type" in options) {
      if (options["source-type"] === null) {
        console.log(chalk.red("JS3 mode is not provided"))
        process.exit(1)
      }
      debugConfig.js3SourceType = options["source-type"]
    }
    if ("allow-lang-with-support" in options) {
      debugConfig.allowLangWithSupport = true
    }
  }
  js3(PATH_TO_JS)
} else if (mainCommand === "iri") {
  debugConfig.operationMode = "iri"
  let argv = mainOptions._unknown || []
  if (argv.length === 0) {
    printIRIUsage(header)
    process.exit(0)
  }
  const iriMainOptions = commandLineArgs(getFirstCommand, { argv, stopAtFirstUnknown: true })
  argv = iriMainOptions._unknown || []
  if (iriMainOptions.command === "help") {
    printIRIUsage(header)
    process.exit(0)
  }
  const PATH_TO_JS = path.resolve(iriMainOptions.command)
  if (!fs.existsSync(PATH_TO_JS)) {
    console.error(chalk.red(`[ERROR] File does not exist: ${PATH_TO_JS}`))
    process.exit(1)
  }
  debugConfig.throwJS3Errors = true
  if (argv.length > 0) {
    const options = commandLineArgs(js3UsageInfo[1].optionList, { argv })
    if ("outputs-path" in options) {
      if (options["outputs-path"] === null) {
        console.log(chalk.red("JS3 result path not provided"))
        process.exit(1)
      }
      debugConfig.outputsPath = path.resolve(options["outputs-path"])
      if (fs.existsSync(debugConfig.outputsPath)) {
        fs.rmSync(debugConfig.outputsPath, { recursive: true, force: true });
      }
      fs.mkdirSync(debugConfig.outputsPath);
    }
    if ("source-type" in options) {
      if (options["source-type"] === null) {
        console.log(chalk.red("JS3 mode is not provided"))
        process.exit(1)
      }
      debugConfig.js3SourceType = options["source-type"]
    }
    if ("allow-lang-with-support" in options) {
      debugConfig.allowLangWithSupport = true
    }
  }
  iri(PATH_TO_JS)
} else if (mainCommand === 'version') {
  console.log(`Iridium Version: ${chalk.red(VERSION)}`)
} else if (mainCommand === "stats") {
  const sections = [
    {
      header: chalk.red(`Iridium ${VERSION} Stats`),
    }
  ]
  const usage = commandLineUsage(sections)
  console.log(usage)
  projectStats(directories);
} else {
  printDefaultUsage(header)
}