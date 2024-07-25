import _traverse from "@babel/traverse"
import fs from 'fs'
import path from 'path'
import debugConfig from '../configs/debug.js'
import { ImportsGraph } from './ImportsGraph.js'
import { ProjectFile } from './ProjectFile.js'

const traverse = _traverse['default'];

export class Project {
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
      this.failedImports.add(file)
    }
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
    const oldFiles = { ...this.files }
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
              if (debugConfig.includeLibrariesInComponentGraph) {
                importsGraph.addLibraryNode(importPath)
                importsGraph.addEdge(file.uname, importPath)
              }
            }
          } else if (nodePath.isCallExpression()) {
            if (nodePath.node.callee.name === 'require' && nodePath.node.arguments[0] && nodePath.node.arguments[0].type === 'StringLiteral') {
              const importPath = nodePath.node.arguments[0].value;
              let i = processNewImport(result, importPath, projectBase)
              if (i) {
                importsGraph.addEdge(file.uname, i.uname)
              } else {
                if (debugConfig.includeLibrariesInComponentGraph) {
                  importsGraph.addLibraryNode(importPath)
                  importsGraph.addEdge(file.uname, importPath)
                }
              }
            } else if (nodePath.node.callee.name === 'require') {
              this.failedImports.add(nodePath.node)
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
    for (const [, value] of Object.entries(result)) {
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
