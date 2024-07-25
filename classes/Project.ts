import _traverse from "@babel/traverse"
import fs from 'fs'
import path from 'path'
import assert from 'node:assert/strict'
import t, { isCallExpression, isImportDeclaration } from "@babel/types"

import debugConfig from '../configs/debug.ts'
import { ImportsGraph } from './ImportsGraph.js'
import { ProjectFile } from './ProjectFile.js'

const traverse = _traverse['default'];

type Files = {
  [key: string]: ProjectFile;
}

export class Project {
  base: string
  analyzePath: string
  importsGraph: ImportsGraph = new ImportsGraph()
  files: Files = {}
  failedImports: Set<string> = new Set()
  ignoredImports: Set<string> = new Set()
  constructor(projectBasePath: string, analyzePath: string) {
    this.base = projectBasePath;
    this.analyzePath = analyzePath

    // Load up all the files from analyze path
    this.#populateJSFiles(this.files, this.analyzePath, this.base)
  }

  #handleFileImport = (results: Files, file: string, projectBase: string): ProjectFile | null => {
    const ext = file.split('.').pop();
    if (typeof ext === "string") { // This is more or less redundant, but the typesystem cant determine that this is not required
      if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) {
        if (!(file in results)) {
          results[file] = new ProjectFile(file, projectBase)
          return results[file]
        } else {
          return results[file]
        }
      }
    }
    if (typeof ext === "string") { // This is more or less redundant, but the typesystem cant determine that this is not required
      if (['ico', 'css', 'json'].includes(ext) && file !== "true/jsx-runtime") {
        this.ignoredImports.add(file) // These were deliberately ignored
      } else {
        this.failedImports.add(file)
      }
      return null
    }
    assert(false) // Unreachable
  }

  #populateJSFiles = (results: Files, dir: string, projectBase: string) => {
    const list: string[] = fs.readdirSync(dir);

    list.forEach((file: string) => {
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
    const projectBase: string = this.base
    const importsGraph: ImportsGraph = this.importsGraph
    const processNewImport = this.#handleFileImport
    const oldFiles: Files = { ...this.files }
    const result: Files = this.files

    for (const key in oldFiles) {
      const file: ProjectFile = oldFiles[key]
      const AST: t.Node | undefined = file.ast

      importsGraph.addNode(file.uname)
      
      // Assert that the AST node isn't null
      assert(typeof AST !== "undefined")
      traverse(AST, {
        enter(nodePath) {
          const node: t.Node = nodePath.node
          if (isImportDeclaration(node)) {
            const importPath = node.source.value;
            let i = processNewImport(result, importPath, projectBase)
            if (i) {
              importsGraph.addEdge(file.uname, i.uname)
            } else {
              if (debugConfig.includeLibrariesInComponentGraph) {
                importsGraph.addLibraryNode(importPath)
                importsGraph.addEdge(file.uname, importPath)
              }
            }
          } else if (isCallExpression(node)) {
            const callNode : t.CallExpression = node;
            // const calleeName = callNode.callee.
            if (callNode.callee.name === 'require' && nodePath.node.arguments[0] && nodePath.node.arguments[0].type === 'StringLiteral') {
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

    const newSet: string[] = Object.keys(result)
    const oldSet: string[] = Object.keys(oldFiles)

    if (newSet.length !== oldSet.length) { // Recurse until all imports have been processed
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
    console.warn("Ignored imports: ")
    this.ignoredImports.forEach(f => console.warn(`  ├── ${f}`))
    console.warn(`  └── Total: ${this.ignoredImports.size}`)
    importsGraph.dumpDOT();
  }
}
