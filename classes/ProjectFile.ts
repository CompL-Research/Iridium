import babel from '@babel/core'

import _generate from "@babel/generator"
import { ParseResult } from '@babel/parser'
import t, { Program } from '@babel/types'
import fs from 'fs'
import assert from 'node:assert/strict'

import debugConfig from "#debugConfig"
import { resolveModuleImport } from "#utils"
import { isImportDeclaration } from '@babel/types'
const generate = _generate["default"];


export class ProjectFile {
  absoluteFilePath
  projectBasePath
  relativeFilePath
  analysisPath
  uname
  isRelative
  extension
  resolvedModuleImports = new Map<t.Node, readonly [string, string]>
  unresolvedModuleImports = new Map<t.Node, string>
  parseResult: ParseResult<t.File> | undefined = undefined
  parsedSourceCode: string | null = null
  unparsedSourceCode: string = ""
  sourceMap
  filename
  loc = 0

  constructor(absoluteFilePath, projectBasePath, analysisPath) {
    assert(absoluteFilePath !== null)
    assert(projectBasePath !== null)
    assert(analysisPath !== null)
    if (absoluteFilePath.startsWith(projectBasePath) === false) {
      debugConfig.logger.error("File path does not start with project base path")
      debugConfig.logger.error("File path: ", absoluteFilePath)
      debugConfig.logger.error("Base path: ", projectBasePath)
    }
    assert(absoluteFilePath.startsWith(projectBasePath) === true)

    this.absoluteFilePath = absoluteFilePath
    this.projectBasePath = projectBasePath
    this.relativeFilePath = absoluteFilePath.substr(projectBasePath.length + 1)
    this.analysisPath = analysisPath
    this.uname = this.relativeFilePath.replace(/\//g, '_')
    this.isRelative = true
    this.extension = absoluteFilePath.split('.').pop()
    this.filename = absoluteFilePath.replace(/^.*[\\/]/, '')
  }

  #transformImports(program: Program) {
    for (const stmtNode of program.body) {
      if (isImportDeclaration(stmtNode)) {
        const importSpecifier = stmtNode.source.value
        const resolved = resolveModuleImport(importSpecifier, this.absoluteFilePath, this.projectBasePath)
        if (!resolved) {
          this.unresolvedModuleImports.set(stmtNode, importSpecifier)
          debugConfig.logger.error(`[Failed module import] ${importSpecifier}`)
        } else {
          this.resolvedModuleImports.set(stmtNode, [importSpecifier, resolved])
        }
      }
    }
  }

  // Loads the file and creates an AST
  init() {
    const that = this
    debugConfig.logger.log(`[Initializing Project File] ${this.filename}`)
    // This will return a promise
    return new Promise<void>((resolve, reject) => {
      fs.readFile(this.absoluteFilePath, 'utf-8', function (err, unparsedSourceCode) {
        if (err) {
          debugConfig.logger.error(`[Failed To Read File] ${that.filename}`, [err])
          reject(`Failed To Read ${that.filename}`)
        } else {
          // The source code, useful when creating source maps
          that.unparsedSourceCode = unparsedSourceCode
          that.loc = unparsedSourceCode.split(/\r\n|\r|\n/).length

          let presets: Array<Array<string | {}>> = [
            ["@babel/preset-env", { targets: "last 2 Chrome versions", modules: false }],
            // ['@babel/preset-react', { runtime: "automatic", importSource: true }]
          ]

          if (that.extension === 'ts' || that.extension === 'tsx') {
            presets.push(['@babel/preset-typescript'])
          }

          const options = {
            cwd: that.projectBasePath,
            filename: that.filename,
            ast: true,
            presets,
            sourceMaps: true,
            plugins: [
              "@babel/plugin-syntax-jsx"
            ],
          }

          babel.transformAsync(unparsedSourceCode, options).then(result => {
            that.parsedSourceCode = result.code
            that.parseResult = result.ast
            that.sourceMap = result.map

            // Resolve imports using the loaded file's AST
            that.#transformImports(that.parseResult.program)

            debugConfig.logger.log(`[Initialized File: ${that.filename}] ${that.resolvedModuleImports.size} imports resolved, ${that.unresolvedModuleImports.size} imports unresolved`)
            for (const [node, importSpecifier] of that.unresolvedModuleImports) {
              debugConfig.logger.error(`[Failed to resolve import ${importSpecifier}]`, [node])

            }
            resolve()
          }).catch(err => {
            debugConfig.logger.error(`[Failed To Transform] ${that.filename}`, [err])
            reject(`Failed To Transform ${that.filename}`)
          })
        }
      });
    });

    // // Transform AST to resolve imports
    // this.#transformImports(parsed.program)

    // // Save generated code
    // const output = generate(
    //   parsed,
    //   {
    //     filename: this.uname
    //   },
    //   parsed.code
    // );

    // this.parseResult = parsed

    // if (debugConfig.saveBabelTransforms) {
    //   // DEBUG
    //   fs.writeFile(debugConfig.outputsPath + "/" + this.uname, output.code, 'utf8', (err) => {
    //     if (err) {
    //       debugConfig.logger.error('Error writing to file', [err]);
    //     }
    //   });
    // }
  }
}