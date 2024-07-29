import fs from 'fs'
import path from 'path'
import assert from 'node:assert/strict'
import t from "@babel/types"

import { EdgeProp, ImportsGraph, NodeProp } from './ImportsGraph.js'
import { ProjectFile } from './ProjectFile.js'
import debugConfig from '../configs/debug.js'

type Files = {
  [key: string]: ProjectFile;
}

export class Project {
  base: string
  analyzePath: string
  importsGraph: ImportsGraph = new ImportsGraph()
  files: Files = {}
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
    return null;
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

      // Process normal imports
      for (const [resolvedNode, [oldPath, resolvedPath]] of file.resolvedModuleImports) {
        let i = processNewImport(result, resolvedPath, projectBase)
        if (i) {
          importsGraph.addEdge(file.uname, i.uname)
        } else {
          assert(false)
        }
      }

      if (debugConfig.includeLibrariesInComponentGraph) {
        // Process unresolved nodes
        for (const [resolvedNode, unresolvedPath] of file.unresolvedModuleImports) {
          importsGraph.addEdge(file.uname, unresolvedPath)

          // Mark edge as red
          const eProp = importsGraph.getEdgeProp(file.uname, unresolvedPath)
          if (eProp) {
            eProp.color = "gray"
          } else assert(false)
          
          // Mark leaf node as red
          const nProp = importsGraph.getNodeProp(unresolvedPath)
          if (nProp) {
            nProp.fillcolor = "gray"
            nProp.style = "rounded,filled"
          } else assert(false)
        }
      }

      // Process require imports
      for (const [resolvedNode, [oldPath, resolvedPath]] of file.resolvedRequireImports) {
        let i = processNewImport(result, resolvedPath, projectBase)
        if (i) {
          importsGraph.addEdge(file.uname, i.uname)

          // Edges via require are dashed
          const eProp = importsGraph.getEdgeProp(file.uname, resolvedPath)
          if (eProp) {
            eProp.style = "dashed"
          } else assert(false)

        } else {
          assert(false)
        }
      }

      if (debugConfig.includeLibrariesInComponentGraph) {
        // Process unresolved nodes
        for (const [resolvedNode, unresolvedPath] of file.unresolvedRequireImports) {
          importsGraph.addEdge(file.uname, unresolvedPath)

          // Mark edge as red
          const eProp = importsGraph.getEdgeProp(file.uname, unresolvedPath)
          if (eProp) {
            eProp.style = "dashed"
          } else assert(false)
          
          // Mark leaf node as red
          const nProp = importsGraph.getNodeProp(unresolvedPath)
          if (nProp) {
            nProp.fillcolor = "red"
            nProp.style = "rounded,filled"
          } else assert(false)
        }
      }

    }

    const newSet: string[] = Object.keys(result)
    const oldSet: string[] = Object.keys(oldFiles)

    if (newSet.length !== oldSet.length) { // Recurse until all imports have been processed
      return this.processImportsGraph()
    }
  }

  printStats() {
    const loadedFiles = this.files
    let LOC = 0
    let failed : Set<string> | string[] = new Set()


    for (const [, value] of Object.entries(loadedFiles)) {
      LOC += value.loc      
      for (const [, failedImport] of value.unresolvedModuleImports) {
        failed.add(failedImport)
      }
    }

    failed = Array.from(failed)
    failed = failed.filter((f) => {
      const ext = f.split('.').pop();
      if (typeof ext === "string") { // we don't care about certain types of imports
        return !['ico', 'css', 'json'].includes(ext)
      }
    })

    console.warn(`Loaded: ${Object.keys(loadedFiles).length} files`)
    console.warn(`  └── LOC: ${LOC}`)
    console.log(failed)
    console.warn(`Failed to process ${failed.length} imports`)
  }
}
