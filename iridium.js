import fs from 'fs'
import path from 'path'
import babel from '@babel/core'
import parser from '@babel/parser'

import _traverse from "@babel/traverse";
const traverse = _traverse.default;

// const traverse = require('@babel/traverse').default;

import t from '@babel/types'

import assert from 'node:assert/strict'
// const generate = require("@babel/generator").default;

import _generate from "@babel/generator";
const generate = _generate.default;


import shell from 'shelljs'
import chalk from 'chalk'

import commandLineUsage from 'command-line-usage'
import commandLineArgs from 'command-line-args'

const OUTPUTS_FOLDER = "outputs"
const VERSION = "0.1a"

class ProjectFile {
  imports = []
  absoluteFilePath
  projectBasePath
  relativeFilePath
  uname
  isRelative
  extension
  ast = null
  transformedCode = null
  filename
  loc = 0
  
  constructor(absoluteFilePath, projectBasePath) {
    assert(absoluteFilePath !== null)
    assert(projectBasePath !== null)
    if (absoluteFilePath.startsWith(projectBasePath) === false) {
      console.error("File path does not start with project base path")
      console.error("File path: ", absoluteFilePath)
      console.error("Base path: ", projectBasePath)
    }
    assert(absoluteFilePath.startsWith(projectBasePath) === true)
    
    this.absoluteFilePath = absoluteFilePath
    this.projectBasePath  = projectBasePath
    this.relativeFilePath = absoluteFilePath.substr(projectBasePath.length + 1)
    this.uname = this.relativeFilePath.replace(/\//g, '_')

    this.isRelative = true
    this.extension = absoluteFilePath.split('.').pop()
    this.filename = absoluteFilePath.replace(/^.*[\\/]/, '')

    this.transformAndParse()
  }

  transformAndParse() {
    const code = fs.readFileSync(this.absoluteFilePath, 'utf-8');

    let presets = [["@babel/preset-env", { "modules": false }], ['@babel/preset-react', { runtime: "automatic", importSource: true }]]
    let plugins = ['jsx']

    if (this.extension === 'ts' || this.extension === 'tsx') {
      presets.push('@babel/preset-typescript')
      plugins.push(["typescript", { disallowAmbiguousJSXLike: true }])
    }

    this.loc = code.split(/\r\n|\r|\n/).length

    const transformedCode = babel.transformSync(code, {
      cwd: this.projectBasePath,
      filename: this.filename,
      presets,
    });

    const ast = parser.parse(transformedCode.code, {
      sourceType: 'module',
      plugins: plugins,
    });

    

    const isValidPath = (path) => {
      try {
        return fs.statSync(path).isFile()
      } catch {
        return false;
      }
    }

    const resolvePath = (source) => {
      if (source.startsWith('@/')) {
        let res =  path.resolve(source.replace('@/', `${this.projectBasePath}/`));
        if (isValidPath(res)) {
          return res;
        } else {
          for(const extension of ['.js', '.jsx', '.ts', '.tsx']) {
            const resolved = path.resolve(`${res}${extension}`);

            if (isValidPath(resolved)) {
              return resolved
            }
          }
        }
        return source
      } else if (source.startsWith('.')) {
        // Extract folder path
        const folderPath = path.dirname(this.absoluteFilePath);

        // let res =  source.replace('./', `${folderPath}/`);
        let res = path.resolve(`${folderPath}/${source}`)
        if (isValidPath(res)) {
          return res;
        } else {
          for(const extension of ['.js', '.jsx', '.ts', '.tsx']) {
            const resolved = path.resolve(`${res}${extension}`);

            if (isValidPath(resolved)) {
              return resolved
            }
          }
          return source
        }
      } else {
        // TODO: handle libraries

        // let res =  path.resolve(this.projectBasePath + "/node_modules/" + source)
        // if (isValidPath(res)) {
        //   return res;
        // } else {
        //   for(const extension of ['.js', '.jsx', '.ts', '.tsx']) {
        //     const resolved = path.resolve(`${res}${extension}`);

        //     if (isValidPath(resolved)) {
        //       return resolved
        //     }
        //   }
        // }
      }
      return source;
    };    

    // Translate imports
    traverse(ast, {
      ImportDeclaration({ node }) {
        node.source.value = resolvePath(node.source.value);
      },
      CallExpression({ node }) {
        if (node.callee.name === 'require' && node.arguments[0] && node.arguments[0].type === 'StringLiteral') {
          node.arguments[0].value = resolvePath(node.arguments[0].value);
        }
      },
    });

    const output = generate(
      ast,
      {
        /* options */
      },
      code
    );

    this.transformedCode = output.code
    this.ast = ast
    
    // DEBUG
    fs.writeFile(OUTPUTS_FOLDER + "/" + this.uname, output.code, 'utf8', (err) => {
      if (err) {
        console.error('Error writing to file', err);
      }
    });
  }

  toString() {
    if (this.isRelative) return this.relativePath
    else this.path
  }
}

class ImportsGraph {
  #nodes
  #edges
  constructor() {
    this.#nodes = new Set()
    this.#edges = {}
  }

  getNodes() {
    return this.#nodes
  }

  getEdges() {
    return this.#edges
  }

  addNode(n) {
    // console.log("Adding Node", n)
    this.#nodes.add(n)
  }

  addEdge(n, m) {
    // console.log("Adding Edge: ", n, m)
    this.#nodes.add(n); this.#nodes.add(m); // Ensure the nodes are declared
    if (n in this.#edges) {
      this.#edges[n].add(m)
    } else {
      this.#edges[n] = new Set()
      this.#edges[n].add(m)
    }
  }

  dumpDOT() {

    var stream = fs.createWriteStream(OUTPUTS_FOLDER + "/" + 'moduleGraph.DOT', {flags: 'w'});
    stream.write("digraph {\n")
    this.#nodes.forEach(n => {
      stream.write(`  "${n}";\n`)
    })

    for (let key in this.#edges) {
      if (this.#edges.hasOwnProperty(key)) { // Ensure it's not iterating over prototype properties
        let nn = this.#edges[key]
        nn.forEach(m => stream.write(`  "${key}" -> "${m}";\n`))
      }
    }
    

    stream.write("}")

    stream.close(() => {
      shell.exec(`dot -Grankdir=TB -Gnodesep=1.0 -Granksep=1.0 -Gconcentrate=true -Gsplines=true -Tpng ${OUTPUTS_FOLDER + "/" + 'moduleGraph.DOT'} > ${OUTPUTS_FOLDER + "/" + 'moduleGraph.png'}`)
    });

  }
}

class Project {
  base
  analyzePath
  importsGraph = new ImportsGraph()
  processedFilePaths = new Set()
  files = {}
  usesJSConfigRelativeImports
  failedImports = new Set()
  constructor(projectBasePath, analyzePath) {
    this.base = projectBasePath;
    this.analyzePath = analyzePath
    this.usesJSConfigRelativeImports = false

    // Generate an output folder for intermediate outputs
    if (fs.existsSync(OUTPUTS_FOLDER)) {
      fs.rmSync(OUTPUTS_FOLDER, { recursive: true, force: true });
    }

    fs.mkdirSync(OUTPUTS_FOLDER);

    // Load up all the files from analyze path
    this.#populateJSFiles(this.files, this.analyzePath, this.base)
  }

  #handleFileImport = (results, file, projectBase) => {
    if (['js', 'jsx', 'ts', 'tsx'].includes(file.split('.').pop())) {
      // // Ignore d.ts files
      // if (!file.endsWith('d.ts')) {
        if (!(file in results)) {
          results[file] = new ProjectFile(file, projectBase)
          return results[file]
        } else {
          return results[file]
        }
      // }
    }
    if (!['ico', 'css', 'json'].includes(file.split('.').pop()) && file !== "true/jsx-runtime") {
      this.failedImports.add(file)    }
    return null
  }

  #populateJSFiles = (results, dir, projectBase) => {
    const list = fs.readdirSync(dir);
    
    list.forEach((file) => {
      file = path.resolve(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        this.#populateJSFiles(results, file, projectBase)
      } else {
        this.#handleFileImport(results, file, projectBase)
      }
    });
  };

  processImportsGraph() {
    const projectBase = this.base
    const importsGraph = this.importsGraph
    const processNewImport = this.#handleFileImport
    const oldFiles = {...this.files}
    const result = this.files 

    for (const key in oldFiles) {
      const file = oldFiles[key]
      if (file in result) continue;
      traverse(file.ast, {
        enter(nodePath) {
          importsGraph.addNode(file.uname)
          if (nodePath.isImportDeclaration()) {
            const importPath = nodePath.node.source.value;
            let i = processNewImport(result, importPath, projectBase)
            if (i) {
              importsGraph.addEdge(file.uname, i.uname)
            } else {
              // importsGraph.addEdge(file.uname, importPath)
            }
          }
        }
      })
    }

    const newSet = Object.keys(result)
    const oldSet = Object.keys(oldFiles)
    
    if (newSet.length !== oldSet.length) {
      return this.processImportsGraph()
    }
    console.warn(`Loaded: ${newSet.length} files`)
    let LOC = 0
    for (const [key, value] of Object.entries(result)) {
      console.warn(`  ├── ${value.uname}: ${value.loc}`);
      LOC += value.loc
    }
    console.warn(`  └── LOC: ${LOC}`)
    console.warn("Failed to import: ")
    this.failedImports.forEach(f => console.warn(`  ├── ${f}`))
    console.warn(`  └── Total: ${this.failedImports.size}`)
    importsGraph.dumpDOT();
  }
}

function main(mainProjectPath, analyzePath) {
  let project = new Project(mainProjectPath, analyzePath)
  project.processImportsGraph()
}





// main(absolutePath, analyzePath)

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
    description: 'Path to outputs directory.',
    alias: 'o',
    type: String,
    typeLabel: '{underline path} ...'
  },
  {
    name: 'print-module-graph',
    description: 'Save the generated module graph.',
    alias: 'm',
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
      }
      if (!fs.existsSync(analyzePath)) {
        console.warn(`[INFO] Project Path: ${projectPath}`)
        console.warn(`[INFO] Analysis Folder: ${analyzeOptions.folder}`)
        console.error(`[ERROR] Analysis path does not exist: ${analyzePath}`)
        process.exit(1)
      }
    }

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

process.exit(0)


const optionDefinitions = [
  {
    name: 'outputs-path',
    description: 'Path to outputs directory.',
    alias: 'o',
    type: String,
    typeLabel: '{underline path} ...'
  },
  {
    name: 'print-module-graph',
    description: 'Save the generated module graph.',
    alias: 'm',
    type: Boolean,
  },
  {
    name: 'help',
    description: 'Display this usage guide.',
    alias: 'h',
    type: Boolean
  },
]


const options = commandLineArgs(optionDefinitions)

console.log(options)

let projectPath = process.argv[2];
let analyzePath = process.argv[3]
if (!projectPath) {
  projectPath = "tests/next-shadcn-dashboard-starter/";
  analyzePath = "tests/next-shadcn-dashboard-starter/app";
}

projectPath = path.resolve(projectPath);
analyzePath = path.resolve(analyzePath);

// const usage = commandLineUsage(sections)
// console.log(usage)
