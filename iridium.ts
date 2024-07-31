import fs from 'fs'
import path from 'path'
import assert from 'node:assert/strict'
import chalk from 'chalk'
import commandLineUsage from 'command-line-usage'
import commandLineArgs from 'command-line-args'
import { Server } from "socket.io";

import debugConfig from './configs/debug.ts'
import { Project } from './classes/Project.ts'
import { IridiumBuilder } from './classes/builder/IridiumBuilder.ts'

const VERSION = "0.2a"
const directories = ['./classes', './configs', './docs'];

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

function main(mainProjectPath, analyzePath) {

  // Ensure outputs directory
  if (fs.existsSync(debugConfig.outputsPath)) {
    fs.rmSync(debugConfig.outputsPath, { recursive: true, force: true });
  }

  debugConfig.iridiumDebugPath = debugConfig.outputsPath + "/Iridium";
  debugConfig.js3DebugPath = debugConfig.outputsPath + "/JS3";
  fs.mkdirSync(debugConfig.outputsPath);
  fs.mkdirSync(debugConfig.iridiumDebugPath);
  fs.mkdirSync(debugConfig.js3DebugPath);

  debugConfig.logger.log(`[IRIDIUM STARTING] ${mainProjectPath}`)
  const project = new Project(mainProjectPath, analyzePath)
  debugConfig.logger.log(`[IRIDIUM Project Created]`)
  // Iridium Playground
  if (debugConfig.enablePlayground) {
    const port = debugConfig.playgroundPort
    const io = new Server({
      connectionStateRecovery: {}
    });

    const clientList = { }

    io.on("connection", (socket) => {
      debugConfig.logger.log(`[IRIDIUM PLAYGROUND] Connected to a remote client ${socket.id}`)
      clientList[socket.id] = true

      socket.on('disconnect', function () {
        clientList[socket.id] = false
        let activeClients = Object.values(clientList).filter(e => e == true).length
        
        debugConfig.logger.log(`[IRIDIUM PLAYGROUND] Client disconnected ${socket.id} [${activeClients} active]`)
      });

      socket.on("get-log-data", (dataLen) => {
        if (dataLen === debugConfig.logger.logData.length) {
          console.log(`[IRIDIUM PLAYGROUND] Latest logdata on ${socket.id}`)
        } else {
          console.log(`[IRIDIUM PLAYGROUND] Sending logdata ==> ${socket.id}`)
          socket.emit("log-data-delivery", debugConfig.logger.logData)
        }
      });

      socket.on("get-imports-graph", (dataLen) => {
        if (project.importsGraphProcessed) {
          const res = project.importsGraph.getDOT()
          socket.emit("imports-graph-delivery", res)
        } else {
          debugConfig.logger.warn("Imports graph is not yet ready!")
        }
      });
      
    });

    io.listen(port);
    debugConfig.logger.log(`[IRIDIUM PLAYGROUND] Listening on port: ${port}`)
  }
  
  debugConfig.logger.log("[Starting to process imports graph]")
  project.processImportsGraph()
  project.importsGraphProcessed = true

  debugConfig.logger.log("[Processing imports graph completed]")

  project.importsGraph.generateRootNodes()
  
  project.printStats()

  if (debugConfig.dontColorRootNodes === false) {
    project.importsGraph.colorRootNodes()
  }
  project.importsGraph.dumpDOT();

  

  

  const builder = new IridiumBuilder(project)
  builder.start()




}



function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

function getFileExtension(fileName) {
  return path.extname(fileName).toLowerCase();
}

function isImageFile(extension) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'];
  return imageExtensions.includes(extension);
}


function countLinesInFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return fileContent.split('\n').length;
}

function analyzeFiles(filePaths) {
  let totalFiles = 0;
  let extensions = new Set();
  let totalLinesOfCode = 0;

  filePaths.forEach(filePath => {
    const files = getAllFiles(filePath);
    totalFiles += files.length;
    files.forEach(file => {
      const ext = getFileExtension(file);
      extensions.add(ext);
      if (!isImageFile(ext)) {
        totalLinesOfCode += countLinesInFile(file);
      }
    });
  });

  debugConfig.logger.log(`Total Files  : ${totalFiles}`);
  debugConfig.logger.log(`LOC          : ${totalLinesOfCode}`);
  debugConfig.logger.log(`Extensions   : ${Array.from(extensions).join(', ')}`);
}


const commandList = [
  {
    header: 'Command List',
    content: [
      { name: 'help', summary: 'Display help information about iridium.' },
      { name: 'analyze', summary: 'Run static analysis over a project.' },
      { name: 'sanity', summary: 'Run sanity tests.' },
      { name: 'stats', summary: 'Codespace stats.' },
      { name: 'version', summary: 'Print the version.' }
    ]
  },
]

type DefinitionsOption = {
  name: string,
  description: string,
  alias?: string,
  type: any,
  typeLabel?: string
}

const analyzeDefinitionsOptionList: Array<DefinitionsOption> = [
  {
    name: 'folder',
    description: 'Folder where the analysis should begin (relative path such as {italic ./app}, {italic ./src}, {italic ./src/pages/}).',
    alias: 'f',
    type: String,
    typeLabel: '{underline path} ...'
  },
  {
    name: 'outputs-path',
    description: 'Path to outputs directory (relative to cwd).',
    alias: 'o',
    type: String,
    typeLabel: '{underline path} ...'
  },
  {
    name: 'print-module-graph-png',
    description: 'Save the generated module graph as a png (DOT file is saved by default).',
    alias: 'm',
    type: Boolean,
  },
  {
    name: 'include-libraries-in-module-graph',
    description: 'Include libraries in the module graph.',
    alias: 'l',
    type: Boolean,
  },
  {
    name: 'resolve-imports-cjs',
    description: 'Resolve imports in commonJS format during babel translation.',
    alias: 'c',
    type: Boolean,
  },
  {
    name: 'print-transformed-imports',
    description: 'Print absolute paths for resolved imports (this is cosmetic, Iridium uses absolute addresses for processing)',
    alias: 'i',
    type: Boolean,
  },
  {
    name: 'enable-playground',
    description: `Enable interactive playground for Iridium (default: ${debugConfig.enablePlayground})`,
    alias: 'p',
    type: Boolean,
  },
  {
    name: 'playground-port',
    description: `The port used by Iridium backend server (Default: ${debugConfig.playgroundPort})`,
    type: Number,
  },
  {
    name: 'dont-color-root-nodes',
    description: 'Prevents coloring root nodes green',
    type: Boolean,
  }
]

const analyzeDefinitions = [
  {
    header: 'Options',
    optionList: analyzeDefinitionsOptionList
  }
]

type UsageOptions = typeof analyzeDefinitions;

type UsageHeader = {
  header: string,
  content: string[]
}

function printUsage(altHeader: undefined | UsageHeader = undefined, otherOpts: UsageOptions | undefined = undefined) {
  let sections: any = [ // Sometimes the type system is just annoying
    {
      content: chalk.red(header),
      raw: true
    },
    {
      header: 'About',
      content: [
        'This project provides infrastructure to allow static analysis of {italic react} based applications.',
        '$ ./iridium <command> [OPTIONS]',
        '$ ./iridium help',
        '$ ./iridium analyze help'
      ]
    },
    ...commandList,
  ]

  if (otherOpts) {
    assert(typeof altHeader !== "undefined");
    sections = [
      {
        content: chalk.red(header),
        raw: true
      },
      {
        ...altHeader,
      },
      ...otherOpts,
    ]
  }
  const usage = commandLineUsage(sections)
  console.log(usage)
}

////////////////////////////////////////// START //////////////////////////////////////////

const mainDefinitions = [
  { name: 'command', defaultOption: true }
]

const mainOptions = commandLineArgs(mainDefinitions, { stopAtFirstUnknown: true })
const argv = mainOptions._unknown || []


if (mainOptions.command === 'analyze') {
  const analyzemainDefinitions = [
    { name: 'command', defaultOption: true }
  ]

  if (argv.length === 0) {
    printUsage(
      {
        header: "=== Error: Please provide a path to the project to analyze ===",
        content: [
          `$ ./iridium analyze <path-to-project> [OPTIONS]`
        ]
      },
      analyzeDefinitions)
    process.exit(0)
  }

  const analyzeMainOptions = commandLineArgs(analyzemainDefinitions, { argv, stopAtFirstUnknown: true })
  const analyzeArgv = analyzeMainOptions._unknown || []

  if (analyzeMainOptions.command === "help") {
    printUsage(
      {
        header: "=== Analyze Usage ===",
        content: [
          `$ ./iridium analyze <path-to-project> [OPTIONS]`
        ]
      },
      analyzeDefinitions)
    process.exit(0)
  }

  // Process options if they were passed
  const projectPath = path.resolve(analyzeMainOptions.command)

  if (!fs.existsSync(projectPath)) {
    console.error(`[ERROR] Project path does not exist: ${projectPath}`)
    process.exit(1)
  }

  let analyzePath = analyzeMainOptions.command
  if (analyzeArgv.length > 0) {
    const analyzeOptions = commandLineArgs(analyzeDefinitionsOptionList, { argv: analyzeArgv })

    if ("folder" in analyzeOptions) {
      if (analyzeOptions.folder === null) {
        console.log(chalk.red("Folder path not provided"))
        process.exit(1)
      }
      try {
        analyzePath = path.resolve(projectPath + "/" + analyzeOptions.folder)
      } catch (e) {
        console.log(chalk.red(`Could not find folder path: ${projectPath + analyzeOptions.folder}`))
        process.exit(1)
      }
      if (!fs.existsSync(analyzePath)) {
        console.warn(`[INFO] Project Path: ${projectPath}`)
        console.warn(`[INFO] Analysis Folder: ${analyzeOptions.folder}`)
        console.error(`[ERROR] Analysis path does not exist: ${analyzePath}`)
        process.exit(1)
      }
    }

    debugConfig.outputsPath = path.resolve("./outputs")

    if ("outputs-path" in analyzeOptions) {
      if (analyzeOptions["outputs-path"] === null) {
        console.log(chalk.red("Outputs path not provided"))
        process.exit(1)
      }
      debugConfig.outputsPath = path.resolve("./" + analyzeOptions["outputs-path"])
    }

    if ("print-module-graph-png" in analyzeOptions) {
      debugConfig.printModuleGraphPng = true
    }

    if ("include-libraries-in-module-graph" in analyzeOptions) {
      debugConfig.includeLibrariesInComponentGraph = true
    }

    if ("resolve-imports-cjs" in analyzeOptions) {
      debugConfig.resolveImportsToCjs = true
    }

    if ("print-transformed-imports" in analyzeOptions) {
      debugConfig.printTransformedImports = true
    }

    if ("enable-playground" in analyzeOptions) {
      debugConfig.enablePlayground = true
    }

    if ("playground-port" in analyzeOptions) {
      debugConfig.playgroundPort = analyzeOptions["playground-port"]
    }

    if ("dont-color-root-nodes" in analyzeOptions) {
      debugConfig.dontColorRootNodes = true
    }

  }

  main(projectPath, analyzePath)

} else if (mainOptions.command === 'version') {
  console.log(`Iridium Version: ${chalk.red(VERSION)}`)
} else if (mainOptions.command === 'help') {
  printUsage()
} else if (mainOptions.command === 'sanity') {

  const projectPath = path.resolve("./sanity/test1")
  const analyzePath = path.resolve("./sanity/test1/src")

  debugConfig.printModuleGraphPng = true
  debugConfig.includeLibrariesInComponentGraph = true
  debugConfig.outputsPath = path.resolve("./output-sanity")

  main(projectPath, analyzePath)
} else if (mainOptions.command === "stats") {
  const sections = [
    {
      header: chalk.red(`Iridium ${VERSION} Stats`),
    }
  ]
  const usage = commandLineUsage(sections)
  console.log(usage)
  analyzeFiles(directories);
}

else {
  const sections = [
    {
      content: chalk.red(header),
      raw: true
    },
    {
      header: chalk.red('Unknown command used!'),
    },
    ...commandList
  ]
  const usage = commandLineUsage(sections)
  console.log(usage)
}
