import fs from 'fs'
import path from 'path'
import assert from 'node:assert/strict'
import t from "@babel/types"

import { EdgeProp, ImportsGraph, NodeProp } from './ImportsGraph.js'
import { ProjectFile } from './ProjectFile.js'
import debugConfig from '../configs/debug.js'

type Files = Map<string, ProjectFile>

export class Project {
  base: string
  analyzePath: string
  importsGraph: ImportsGraph = new ImportsGraph()
  importsGraphProcessed: boolean = false
  files: Files = new Map()
  constructor(projectBasePath: string, analyzePath: string) {
    this.base = projectBasePath;
    this.analyzePath = analyzePath

    // Load up all the files from analyze path
    this.#populateJSFiles(this.files, this.analyzePath, this.base)
  }

  #handleFileImport = (results: Files, file: string, projectBase: string): ProjectFile | undefined => {
    const ext = file.split('.').pop();
    if (typeof ext === "string") { // This is more or less redundant, but the typesystem cant determine that this is not required
      if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) {
        if (!results.has(file)) {
          try {
            const pf = new ProjectFile(file, projectBase, this.analyzePath)
            if (!pf) {
              debugConfig.logger.error("[Invalid Project File]", pf)
            }
            results.set(file, pf)
          } catch (e) {
            return undefined
          }
          return results.get(file)
        } else {
          return results.get(file)
        }
      }
    }
    return undefined;
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
    const oldFiles: Files = new Map(this.files)
    const result: Files = this.files
    debugConfig.logger.log("[Processing imports graph]")
    for (const [, file] of oldFiles) {
      debugConfig.logger.log(`[Processing file] ${file.absoluteFilePath}`)
      importsGraph.addNode(file.uname)
      // Add a node mapping in the imports graph
      const importsGraphProp = importsGraph.getNodeProp(file.uname)
      if (importsGraphProp) {
        importsGraphProp.sourceFile = file
      } else assert(false)

      // Process resolved imports
      for (const [, [, resolvedPath]] of file.resolvedModuleImports) {
        debugConfig.logger.log(`[Processing import] ${resolvedPath}`)
        let i = processNewImport(result, resolvedPath, projectBase)
        if (i) {
          debugConfig.logger.log(`[Completed import] ${resolvedPath}`)
          importsGraph.addEdge(file.uname, i.uname)
        } else {
          debugConfig.logger.error(`Failed to process import "${resolvedPath}" included in file "${file.uname}"`)
          assert(false)
        }
      }

      // Process require imports
      for (const [, [, resolvedPath]] of file.resolvedRequireImports) {
        debugConfig.logger.log(`[Processing require import] ${resolvedPath}`)
        let i = processNewImport(result, resolvedPath, projectBase)
        if (i) {
          debugConfig.logger.log(`[Completed require import] ${resolvedPath}`)
          importsGraph.addEdge(file.uname, i.uname)

          // Edges via require are dashed
          const eProp = importsGraph.getEdgeProp(file.uname, resolvedPath)
          if (eProp) {
            eProp.style = "dashed"
          } else assert(false)

        } else {
          debugConfig.logger.error(`Failed to process require "${resolvedPath}" included in file "${file.uname}"`)
          assert(false)
        }
      }

      // Process unresolved nodes

      for (const [, unresolvedPath] of file.unresolvedModuleImports) {
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

      for (const [, unresolvedPath] of file.unresolvedRequireImports) {
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

      for (const [, unresolvedPath] of file.ignoredModuleImports) {
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

      for (const [, unresolvedPath] of file.ignoredRequireImports) {
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

    if (result.size !== oldFiles.size) { // Recurse until all imports have been processed
      debugConfig.logger.log(`[Processing Imports] ${oldFiles.size} -> ${result.size}`)
      return this.processImportsGraph()
    }
  }

  printStats() {
    const loadedFiles = this.files
    let LOC = 0
    let failed: Set<string> | string[] = new Set()


    for (const [, pFile] of loadedFiles) {
      LOC += pFile.loc
      for (const [, failedImport] of pFile.unresolvedModuleImports) {
        failed.add(failedImport)
      }
      for (const [, failedImport] of pFile.unresolvedRequireImports) {
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

    debugConfig.logger.log(`Loaded: ${loadedFiles.size} files (LOC: ${LOC})`)
    debugConfig.logger.error(`Failed to process ${failed.length} imports`, failed)
  }
}
