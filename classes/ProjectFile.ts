import babel from '@babel/core'

import _generate from "@babel/generator"
import { ParseResult } from '@babel/parser'
import t, { ImportDeclaration, Program } from '@babel/types'
import fs from 'fs'
import assert from 'node:assert/strict'
import path from 'path'

import debugConfig from "#debugConfig"
import { resolveModuleImport } from "#utils"
import { isImportDeclaration } from '@babel/types'
const generate = _generate["default"];


export class InitData {
  status: "loaded" | "failed" | "uninitialized" = "uninitialized"
  sourceCode: string | null = null
  loc: number | null = null

  parseStatus: "parsed" | "failed" = "failed"
  parseResult: ParseResult<t.File> | null = null
  sourceMap: any | null = null

  moduleImports: Map<ImportDeclaration, string | null> = new Map()
}

export class ProjectFile {
  absoluteFilePath: string
  projectBasePath: string
  uname: string
  extension: string
  filename: string
  filepath: string
  initData: InitData

  constructor(absoluteFilePath, projectBasePath) {
    assert(absoluteFilePath !== null)
    assert(projectBasePath !== null)
    if (absoluteFilePath.startsWith(projectBasePath) === false) {
      debugConfig.logger.error("File path: ", absoluteFilePath)
      debugConfig.logger.error("Base path: ", projectBasePath)
      debugConfig.logger.thrownError("File path does not start with project base path")
    }
    assert(absoluteFilePath.startsWith(projectBasePath) === true)

    this.absoluteFilePath = absoluteFilePath
    this.projectBasePath = projectBasePath
    const relativeFilePath = absoluteFilePath.substr(projectBasePath.length + 1)
    this.uname = relativeFilePath.replace(/\//g, '_')
    this.extension = path.extname(absoluteFilePath)
    this.filename = path.basename(absoluteFilePath)
    this.filepath = path.dirname(absoluteFilePath)
    this.initData = new InitData()

    debugConfig.logger.log(`[Created Project File ${this.filename}]`)
  }

  #transformImports(program: Program, result: Map<t.Node, string | null>) {
    for (const stmtNode of program.body) {
      if (isImportDeclaration(stmtNode)) {
        const importSpecifier = stmtNode.source.value
        // if (importSpecifier === "true/jsx-runtime") continue;
        const resolved = resolveModuleImport(importSpecifier, this.absoluteFilePath, this.projectBasePath)
        if (!resolved) {
          result.set(stmtNode, null)
          debugConfig.logger.error(`[Failed module import] ${importSpecifier}`)
        } else {
          result.set(stmtNode, resolved)
        }
      }
    }
  }

  // Loads the file and creates an AST
  init() {
    const that = this
    // This will return a promise
    return new Promise<void>((resolve,) => {
      fs.readFile(this.absoluteFilePath, 'utf-8', function (err, sourceCode) {
        if (err) {
          debugConfig.logger.error(`[Failed To Read File] ${that.filename}`, [err])
          resolve()
        } else {
          // 1. Load Source Code
          that.initData.status = "loaded"
          that.initData.sourceCode = sourceCode
          that.initData.loc = sourceCode.split(/\r\n|\r|\n/).length
          let sourceType = sourceCode.includes('noStrict') ? "script" : "unambiguous";
          sourceType = sourceCode.includes('flags: [module') ? "module" : sourceType;
          sourceType = sourceCode.includes('flags: [generated, module]') ? "module" : sourceType;

          // 2. Parse Source Code
          let presets: Array<Array<string | {}>> = [
            ["@babel/preset-env", { targets: "last 2 Chrome versions", modules: false }],
            // ['@babel/preset-react', { runtime: "automatic" }]
          ]

          if (that.extension === 'ts' || that.extension === 'tsx') presets.push(['@babel/preset-typescript'])

          const options = {
            cwd: that.projectBasePath,
            filename: that.filename,
            sourceType,
            ast: true,
            presets,
            sourceMaps: true,
            plugins: [
              "@babel/plugin-syntax-jsx"
            ],
          }

          babel.transformAsync(sourceCode, options).then(result => {
            that.initData.parseStatus = "parsed"
            that.initData.parseResult = result.ast
            that.initData.sourceMap = result.map

            // Resolve imports using the loaded file's AST
            that.#transformImports(result.ast.program, that.initData.moduleImports)

            debugConfig.logger.log(`[Loaded file] ${that.filename}`, [err])

            fs.writeFileSync(debugConfig.outputsPath + "/" + that.uname, result.code)

            resolve()
          }).catch(err => {
            debugConfig.logger.error(`[Failed To Transform] ${that.filename}`, [err])
            resolve()
          })
        }
      });
    });
  }
}