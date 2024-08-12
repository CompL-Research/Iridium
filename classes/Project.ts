import fs from 'fs'
import assert from 'node:assert/strict'
import path from 'path'

import debugConfig from "#debugConfig"
import { ImportsGraph } from './ImportsGraph.js'
import { ProjectFile } from './ProjectFile.js'



type Files = Map<string, ProjectFile>

const excludedFolders = ['.git', 'node_modules']

export class Project {
  base: string
  analyzePath: string
  importsGraph: ImportsGraph = new ImportsGraph()
  importsGraphProcessed: boolean = false
  files: Files = new Map()
  constructor(projectBasePath: string, analyzePath: string) {
    this.base = projectBasePath;
    this.analyzePath = analyzePath
  }

  init() {
    debugConfig.logger.log(`[Initializing Project]`)
    this.#populateJSFiles(this.files, this.analyzePath, this.base)
    debugConfig.logger.log(`[Finished Initializing Project] Loaded ${this.files.size} files`)
  }

  #handleFileImport = (results: Files, file: string, projectBase: string): ProjectFile | undefined => {
    if (results.has(file)) return results.get(file)
    const pf = new ProjectFile(file, projectBase)
    results.set(file, pf)
    return pf
  }


  #populateJSFiles = (results: Files, dir: string, projectBase: string) => {
    const list: string[] = fs.readdirSync(dir);
    list.forEach((file: string) => {
      file = path.resolve(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        const folderName = path.basename(file)
        if (!excludedFolders.includes(folderName)) {
          this.#populateJSFiles(results, file, projectBase)
        } else {
          debugConfig.logger.warn(`[Skipping folder ${folderName}]`)
        }
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
      importsGraph.addNode(file.uname)
      const nProp = importsGraph.getNodeProp(file.uname); assert(nProp);
      nProp.sourceFile = file
      if (file.initData.status === "uninitialized") {
        nProp.fillcolor = "yellow"
        nProp.style = "filled"
      } else if (file.initData.status === "failed") {
        nProp.fillcolor = "red"
        nProp.style = "filled"
      } else if (file.initData.parseStatus === "failed") {
        nProp.fillcolor = "orange"
        nProp.style = "filled"
      }

      if (file.initData.status === "loaded" && file.initData.parseStatus === "parsed") {
        for (const [node, resolvedPath] of file.initData.moduleImports) {
          const specifier = node.source.value

          if (!resolvedPath) {
            importsGraph.addEdge(file.uname, specifier)
            const eProp = importsGraph.getEdgeProp(file.uname, specifier); assert(eProp);
            eProp.style = "dashed"
            const nProp = importsGraph.getNodeProp(specifier); assert(nProp);
            nProp.fillcolor = "red"
            nProp.style = "rounded,filled"
            continue;
          }

          let i = processNewImport(result, resolvedPath, projectBase)
          importsGraph.addEdge(file.uname, i.uname)
        }
      }
    }

    if (result.size !== oldFiles.size) { // Recurse until all imports have been processed
      debugConfig.logger.log(`[Expanding import scope] ${oldFiles.size} -> ${result.size}`)
      return this.processImportsGraph()
    }
    this.importsGraphProcessed = true
  }

  printStats() {
    const loadedFiles = this.files
    let loaded = 0
    let LOC = 0
    let failed: Set<string> | string[] = new Set()


    for (const [, pFile] of loadedFiles) {
      if (pFile.initData.status === "loaded" && pFile.initData.parseStatus === "parsed") {
        loaded++;
        LOC += pFile.initData.loc
        for (const [n, failedImport] of pFile.initData.moduleImports) {
          if (!failedImport) {
            failed.add(n.source.value)
          }
        }
      }
    }

    failed = Array.from(failed)
    failed = failed.filter((f) => {
      const ext = f.split('.').pop();
      if (typeof ext === "string") { // we don't care about certain types of imports
        return !['ico', 'css', 'json'].includes(ext)
      }
    })

    debugConfig.logger.log(`Loaded: ${loaded} files (LOC: ${LOC})`)
    debugConfig.logger.error(`Failed to process ${failed.length} imports`, failed)
  }
}
