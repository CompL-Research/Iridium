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

const VERSION = "0.2a"
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

function main(mainProjectPath, analyzePath) {
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

  // Ensure outputs directory
  if (fs.existsSync(debugConfig.outputsPath)) {
    fs.rmSync(debugConfig.outputsPath, { recursive: true, force: true });
  }

  debugConfig.iridiumDebugPath = path.resolve(debugConfig.outputsPath + "/Iridium");
  debugConfig.js3DebugPath = path.resolve(debugConfig.outputsPath + "/JS3");
  fs.mkdirSync(debugConfig.outputsPath);
  fs.mkdirSync(debugConfig.iridiumDebugPath);
  fs.mkdirSync(debugConfig.js3DebugPath);

  const project = new Project(mainProjectPath, analyzePath)
  project.init();


  const fileInitPromises = new Array<Promise<void>>()
  // Initialize all project files
  for (const [, projectFile] of project.files) {
    fileInitPromises.push(projectFile.initAsync())
  }

  Promise.all(fileInitPromises).then(() => {
    debugConfig.logger.log("[All Project Files Were Initialized]")

    project.processImportsGraph()
    project.importsGraph.generateRootNodes()
    project.printStats()

    for (const [f, file] of project.files) {
      // const importsGraphProp = project.importsGraph.getNodeProp(f); 
      // assert(importsGraphProp);
      // if (!importsGraphProp.sourceFile) {
      //   debugConfig.logger.log(`Skipping: ${importsGraphProp.}`)
      // } 
      // const file = importsGraphProp.sourceFile

      if (file.initData.status === "loaded" && file.initData.parseStatus === "parsed") {
        const js3Builder = new JS3Builder(file)
        js3Builder.build()
        const uri = js3Builder.generateURI()
        if (uri) {
          debugConfig.logger.log(`[JS3 ${file.filename}]`)
          debugConfig.logger.log(`${uri}`)
        } else {
          debugConfig.logger.error(`[Failed to generate JS3 URI for ${file.filename}]`)
        }
      } else {
        debugConfig.logger.error(`[Not generating JS3 for ${file.uname}, Status: ${file.initData.status}, ParseStatus: ${file.initData.parseStatus}]`)
      }
    }
  })


  // debugConfig.logger.log("[Starting to process imports graph]")
  // project.generateImportsGraph()
  // project.importsGraph.generateRootNodes()

  // project.printStats()

  // if (debugConfig.dontColorRootNodes === false) {
  //   project.importsGraph.colorRootNodes()
  // }
  // project.importsGraphProcessed = true

  // debugConfig.logger.log("[Processing imports graph completed]")

  // project.importsGraph.dumpDOT();

  // const builder = new IridiumBuilder(project)
  // builder.start()

}

function genJS3(filePath) {
  debugConfig.logger.printToConsole = false

  const file = new ProjectFile(filePath, path.dirname(filePath))

  try {
    file.initSync(debugConfig.js3SourceType)
    if (file.initData.parseStatus !== "parsed") 
      debugConfig.logger.throwJS3Error("JS3: Failed to parse input file (there might be syntax errors or sourceType is set incorrectly)")
      
    const builder = new JS3Builder(file)
    builder.build()
    builder.generateCode()
    console.log(builder.generatedCode)
    process.exit(0)
  } catch (e) {
    console.error("Failed to generated JS3: ", e)
    process.exit(1)
  }
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
    // @ts-ignore
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
      { name: 'js3', summary: 'Generate JS3 file and print to stdout' },
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
    name: 'js3-result-path',
    description: 'Path to save the generated JS3 file (only works with the js3 command).',
    alias: 'j',
    type: String,
    typeLabel: '{underline path} ...'
  },
  {
    name: 'enable-playground',
    description: `Enable interactive playground for Iridium (default: ${debugConfig.enablePlayground})`,
    alias: 'p',
    type: Boolean,
  },
  {
    name: 'module-graph-png',
    description: `Save the generated module graph as a png (default: ${debugConfig.printModuleGraphPng})`,
    type: Boolean,
  },
  {
    name: 'port',
    description: `The port used by Iridium backend server (Default: ${debugConfig.playgroundPort})`,
    type: Number,
  }
]

const analyzeDefinitions = [
  {
    header: 'Options',
    optionList: analyzeDefinitionsOptionList
  }
]

const js3DefinitionsOptionList: Array<DefinitionsOption> = [
  {
    name: 'outputs-path',
    description: 'Path to outputs directory (relative to cwd).',
    alias: 'o',
    type: String,
    typeLabel: '{underline path} ...'
  },
  {
    name: 'source-type',
    description: 'Source Type ("module" | "script" | "unambigious" (default)).',
    alias: 's',
    type: String
  }
]

const js3Definitions = [
  {
    header: 'Options',
    optionList: js3DefinitionsOptionList
  }
]

type UsageOptions = typeof analyzeDefinitions;

type UsageHeader = {
  header: string,
  content: string[]
}

function printUsage(altHeader: undefined | UsageHeader = undefined, otherOpts: UsageOptions = []) {
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

  if (otherOpts || altHeader) {
    // assert(typeof altHeader !== "undefined");
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

  // Initialize Output path
  debugConfig.outputsPath = path.resolve("./outputs")

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



    if ("outputs-path" in analyzeOptions) {
      if (analyzeOptions["outputs-path"] === null) {
        console.log(chalk.red("Outputs path not provided"))
        process.exit(1)
      }
      debugConfig.outputsPath = path.resolve("./" + analyzeOptions["outputs-path"])
    }

    if ("module-graph-png" in analyzeOptions) {
      debugConfig.printModuleGraphPng = true
    }


    if ("enable-playground" in analyzeOptions) {
      debugConfig.enablePlayground = true
    }

    if ("playground-port" in analyzeOptions) {
      debugConfig.playgroundPort = analyzeOptions["playground-port"]
    }
  }

  main(projectPath, analyzePath)

} else if (mainOptions.command === 'version') {
  console.log(`Iridium Version: ${chalk.red(VERSION)}`)
} else if (mainOptions.command === 'help') {
  printUsage()
} else if (mainOptions.command === "js3") {
  const mainDefs = [
    { name: 'command', defaultOption: true }
  ]

  if (argv.length === 0) {
    printUsage(
      {
        header: "=== Error: Please provide a file path for js3 builder ===",
        content: [
          `$ ./iridium js3 <js-file-path>`
        ]
      }, js3Definitions)
    process.exit(0)
  }

  const js3MainOptions = commandLineArgs(mainDefs, { argv, stopAtFirstUnknown: true })
  const js3Argv = js3MainOptions._unknown || []

  if (js3MainOptions.command === "help") {
    printUsage(
      {
        header: "=== Analyze Usage ===",
        content: [
          `$ ./iridium js3 <js-file-path>`
        ]
      }, js3Definitions)
    process.exit(0)
  }

  debugConfig.throwJS3Errors = true

  if (js3Argv.length > 0) {
    const js3Options = commandLineArgs(js3DefinitionsOptionList, { argv: js3Argv })

    if ("js3-result-path" in js3Options) {
      if (js3Options["js3-result-path"] === null) {
        console.log(chalk.red("JS3 result path not provided"))
        process.exit(1)
      }
      debugConfig.js3ResultPath = path.resolve(js3Options["js3-result-path"])
    }

    if ("source-type" in js3Options) {
      if (js3Options["source-type"] === null) {
        console.log(chalk.red("JS3 mode is not provided"))
        process.exit(1)
      }
      debugConfig.js3SourceType = js3Options["source-type"]
    }
  }

  // Process options if they were passed
  const filePath = path.resolve(js3MainOptions.command)
  genJS3(filePath)
} else if (mainOptions.command === "stats") {
  const sections = [
    {
      header: chalk.red(`Iridium ${VERSION} Stats`),
    }
  ]
  const usage = commandLineUsage(sections)
  console.log(usage)
  analyzeFiles(directories);
} else {
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
