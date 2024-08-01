import fs from 'fs'
import path from 'path'
import assert from 'node:assert/strict'
import t from "@babel/types"

import { EdgeProp, ImportsGraph, NodeProp } from './ImportsGraph.js'
import { ProjectFile } from './ProjectFile.js'
import debugConfig from '../configs/debug.js'

import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';


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

  async processImportsGraph() {
    const analyzePath = this.analyzePath
    const projectBase: string = this.base
    const importsGraph: ImportsGraph = this.importsGraph
    const processNewImport = this.#handleFileImport
    const oldFiles: Files = new Map(this.files)
    const result: Files = this.files
    debugConfig.logger.log("[Processing imports graph]")

    // Parallelize file load
    if (debugConfig.enableParallelizedImportsGraphCreation) {
      debugConfig.logger.log("[Parallelizing imports graph file load]");

      const setOfResolvedPaths = new Set<string>();

      for (const [, file] of oldFiles) {
        for (const [, [, resolvedPath]] of file.resolvedModuleImports) {
          if (!result.has(resolvedPath))
            setOfResolvedPaths.add(resolvedPath);
        }

        for (const [, [, resolvedPath]] of file.resolvedRequireImports) {
          if (!result.has(resolvedPath))
            setOfResolvedPaths.add(resolvedPath);
        }
      }

      debugConfig.logger.log(`[Parallelizing imports graph file load] Loaded all filepaths: ${setOfResolvedPaths.size} files`);
      const startTime = process.hrtime();

      const workerPromises: Array<Promise<void>> = new Array<Promise<void>>();
      const workerPath = '/home/meetesh/wd/Iridium/classes/worker/workerScript.js'; // Path to the worker file


      for (const resolvedPath of setOfResolvedPaths) {
        workerPromises.push(new Promise<void>((resolve, reject) => {
          const worker = new Worker(workerPath, { workerData: { results: result, file: resolvedPath, projectBase, analyzePath } });

          worker.on('message', (msg) => {
            debugConfig.logger.log("Worker message", msg)
            resolve()
          });

          worker.on('error', (e) => {
            debugConfig.logger.error("Worker responded [error]", [e])
            reject()
          });
          worker.on('exit', (code) => {
            if (code !== 0) {
              debugConfig.logger.error(`Worker stopped with error code ${code}`)
              reject(new Error(`Worker stopped with exit code ${code}`));
            }
          });
        }));
      }

      debugConfig.logger.log(`[Parallelizing imports graph file load] Spawned (${workerPromises.length}) worker(s), waiting for completion`);

      try {
        await Promise.all(workerPromises);
      } catch (error) {
        debugConfig.logger.error(error);
      }

      const endTime = process.hrtime(startTime); // End time in [seconds, nanoseconds]
      const timeTaken = endTime[0] + endTime[1] / 1e9; // Convert to seconds

      debugConfig.logger.log(`[Completed FileLoad]: Time Taken ${timeTaken} seconds`);
    }

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

      // Process imports
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

      // Process requires
      for (const [, [specifier, resolvedPath]] of file.resolvedRequireImports) {
        // Ignore library imports for now
        if (isLibraryImport(resolvedPath) || isUselessImport(resolvedPath)) {
          importsGraph.addEdge(file.uname, specifier)

          const eProp = importsGraph.getEdgeProp(file.uname, specifier)
          if (eProp) {
            eProp.style = "dashed"
          } else assert(false)

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
          const eProp = importsGraph.getEdgeProp(file.uname, i.uname)
          if (eProp) {
            eProp.style = "dashed"
          } else assert(false)
        } else {
          debugConfig.logger.error(`Failed to process import "${resolvedPath}" included in file "${file.uname}"`)
          assert(false)
        }
      }

      // Process unresolved nodes
      for (const [, unresolvedPath] of file.unresolvedModuleImports) {
        importsGraph.addEdge(file.uname, unresolvedPath)

        // Mark leaf node as red
        const nProp = importsGraph.getNodeProp(unresolvedPath)
        if (nProp) {
          nProp.fillcolor = "red"
          nProp.style = "rounded,filled"
        } else assert(false)
      }

      // Process unresolved nodes
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
    }

    if (result.size !== oldFiles.size) { // Recurse until all imports have been processed
      debugConfig.logger.log(`[Expanding import scope] ${oldFiles.size} -> ${result.size}`)
      return this.processImportsGraph()
    }
  }

  printStats() {
    const loadedFiles = this.files
    let LOC = 0
    let failed: Set<string> | string[] = new Set()


    for (const [, pFile] of loadedFiles) {
      LOC += pFile.loc
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
