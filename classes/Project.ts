import fs from 'fs'
import assert from 'node:assert/strict'
import path from 'path'

import debugConfig from "#debugConfig"
import { ImportsGraph } from './ImportsGraph.js'
import { ProjectFile } from './ProjectFile.js'



type Files = Map<string, ProjectFile>

const excludedFolders = ['.git', 'node_modules', 'node_modules1']
const supportedExtensions = ['.js', '.jsx', '.ts', '.tsx']

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
    debugConfig.logger.log(`[Loaded Filed] Loaded ${this.files} files`)
  }

  #handleFileImport = (results: Files, file: string, projectBase: string): ProjectFile | undefined => {
    const ext = path.extname(file)

    if (!supportedExtensions.includes(ext)) {
      debugConfig.logger.warn(`[Skipping file] unsupported extension: ${file}`)
      return undefined
    }

    if (results.has(file)) return results.get(file)

    try {
      const pf = new ProjectFile(file, projectBase, this.analyzePath)
      if (!pf) {
        debugConfig.logger.error("[Invalid Project File]", [pf])
        return undefined;
      }
      results.set(file, pf)
      return pf
    } catch (e) {
      debugConfig.logger.error(`[Failed to Load] ${file}`, [e])
    }

    return undefined;
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
    const analyzePath = this.analyzePath
    const projectBase: string = this.base
    const importsGraph: ImportsGraph = this.importsGraph
    const processNewImport = this.#handleFileImport
    const oldFiles: Files = new Map(this.files)
    const result: Files = this.files
    debugConfig.logger.log("[Processing imports graph]")

    // Resume old code

    const isLibraryImport = (source: string) => {
      return source.includes("node_modules")
    }

    const uselessImports = [".css"]
    const isUselessImport = (source: string) => {
      const ext = path.extname(source)
      if (uselessImports.includes(ext)) return true
      return false
    }

    for (const [, file] of oldFiles) {
      // debugConfig.logger.log(`[Processing file] ${file.absoluteFilePath}`)
      importsGraph.addNode(file.uname)

      // Add a node mapping in the imports graph
      const importsGraphProp = importsGraph.getNodeProp(file.uname)
      if (importsGraphProp) {
        importsGraphProp.sourceFile = file
      } else assert(false)

      // Process resolved imports
      for (const [, [specifier, resolvedPath]] of file.resolvedModuleImports) {
        // Ignore library imports for now
        if (isLibraryImport(resolvedPath) || isUselessImport(resolvedPath)) {
          importsGraph.addEdge(file.uname, specifier)
          const nProp = importsGraph.getNodeProp(specifier)
          if (nProp) {
            nProp.fillcolor = "yellow"
            nProp.style = "rounded,filled"
          } else assert(false)
          continue;
        }

        // Resolve import path
        let i = processNewImport(result, resolvedPath, projectBase)
        if (i) {
          importsGraph.addEdge(file.uname, i.uname)
        } else {
          debugConfig.logger.error(`Failed to process import "${resolvedPath}" included in file "${file.uname}"`)
          assert(false)
        }
      }

      // Process unresolved imports
      for (const [, unresolvedPath] of file.unresolvedModuleImports) {
        importsGraph.addEdge(file.uname, unresolvedPath)

        // Mark leaf node as red
        const nProp = importsGraph.getNodeProp(unresolvedPath)
        if (nProp) {
          nProp.fillcolor = "red"
          nProp.style = "rounded,filled"
        } else assert(false)
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
    let LOC = 0
    let failed: Set<string> | string[] = new Set()


    for (const [, pFile] of loadedFiles) {
      LOC += pFile.loc
      for (const [, failedImport] of pFile.unresolvedModuleImports) {
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
