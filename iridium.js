import fs from 'fs'
import path from 'path'
import assert from 'node:assert/strict'
import chalk from 'chalk'
import commandLineUsage from 'command-line-usage'
import commandLineArgs from 'command-line-args'

import debugConfig from './configs/debug.js'
import {Project} from './classes/Project.js'

const VERSION = "0.1a"


function main(mainProjectPath, analyzePath) {
  let project = new Project(mainProjectPath, analyzePath)
  project.processImportsGraph()
}

const header = `
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░        ░░       ░░░        ░░       ░░░        ░░  ░░░░  ░░  ░░░░  ░
▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒  ▒▒   ▒▒   ▒
▓▓▓▓  ▓▓▓▓▓       ▓▓▓▓▓▓  ▓▓▓▓▓  ▓▓▓▓  ▓▓▓▓▓  ▓▓▓▓▓  ▓▓▓▓  ▓▓        ▓
████  █████  ███  ██████  █████  ████  █████  █████  ████  ██  █  █  █
█        ██  ████  ██        ██       ███        ███      ███  ████  █
██████████████████████████████████████████████████████████████████████
`

const mainDefinitions = [
  { name: 'command', defaultOption: true }
]

const mainOptions = commandLineArgs(mainDefinitions, { stopAtFirstUnknown: true })
const argv = mainOptions._unknown || []

const commandList = [
  {
    header: 'Command List',
    content: [
      { name: 'help', summary: 'Display help information about iridium.' },
      { name: 'analyze', summary: 'Run static analysis over a project.' },
      { name: 'version', summary: 'Print the version.' }
    ]
  },
]

const analyzeDefinitionsOptionList = [
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
  }
]

const analyzeDefinitions = [
  {
    header: 'Options',
    optionList: analyzeDefinitionsOptionList
  }
]

function printUsage(altHeader = undefined, otherOpts = []) {
  let sections = [
    {
      content: chalk.red(header),
      raw: true
    },
    {
      header: 'About',
      content: [
        'This project provides infrastructure to allow static analysis of {italic react} based applications.',
        '$ node iridium.js <command> [OPTIONS]',
        '$ node iridium.js help',
        '$ node iridium.js analyze help'
      ]
    },
    ...commandList,
  ]

  if (otherOpts.length > 0) {
    assert(altHeader !== undefined)
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

if (mainOptions.command === 'analyze') {
  const analyzemainDefinitions = [
    { name: 'command', defaultOption: true }
  ]

  if (argv.length === 0) {
    printUsage(
      {
        header: "=== Error: Please provide a path to the project to analyze ===",
        content: [
          `$ node iridium.js analyze <path-to-project> [OPTIONS]`
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
          `$ node iridium.js analyze <path-to-project> [OPTIONS]`
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
  }

  // Ensure outputs directory
  if (fs.existsSync(debugConfig.outputsPath)) {
    fs.rmSync(debugConfig.outputsPath, { recursive: true, force: true });
  }

  fs.mkdirSync(debugConfig.outputsPath);

  if (!fs.existsSync(debugConfig.outputsPath)) {
    console.warn(`[INFO] Project Path: ${projectPath}`)
    console.warn(`[INFO] Analysis Folder: ${analyzePath}`)
    console.warn(`[INFO] Output Folder: ${analyzeOptions["outputs-path"]}`)
    console.error(`[ERROR] Creating output folder failed: ${debugConfig.outputsPath}`)
    process.exit(1)
  }
  console.warn(`[IRIDIUM STARTING] ${projectPath}` )

  main(projectPath, analyzePath)
  
} else if (mainOptions.command === 'version') {
  console.log(`Iridium Version: ${chalk.red(VERSION)}`)
} else if (mainOptions.command === 'help') {
  printUsage()
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
