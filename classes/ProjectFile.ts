import babel from '@babel/core'

import _generate from "@babel/generator"
import { parse, ParseResult } from '@babel/parser'
import t, { Program } from '@babel/types'
import fs from 'fs'
import assert from 'node:assert/strict'

import debugConfig from "#debugConfig"
import { isImportDeclaration } from '@babel/types'
import { resolveModuleImport } from "#utils"
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
          if (debugConfig.printTransformedImports) {
            stmtNode.source.value = resolved
          }
        }
      }
    }
  }

  transformAndParse() {
    const code = fs.readFileSync(this.absoluteFilePath, 'utf-8');
    this.unparsedSourceCode = code

    // More finetuned 
    let presets : Array<Array<string | {}>> = [
      ["@babel/preset-env", { targets: "last 2 Chrome versions", modules: false }], 
      // ['@babel/preset-react', { runtime: "automatic", importSource: true }]
    ]

    if (this.extension === 'ts' || this.extension === 'tsx') {
      presets.push(['@babel/preset-typescript'])
    }

    this.loc = code.split(/\r\n|\r|\n/).length

    const transformedCode = babel.transformSync(code, {
      cwd: this.projectBasePath,
      filename: this.filename,
      ast: true,
      presets,
      sourceMaps: true,
      plugins: [
        "@babel/plugin-syntax-jsx"
      ],
    });
    
    const parsed = transformedCode.ast
    this.sourceMap = transformedCode.map

    this.loc = code.split(/\r\n|\r|\n/).length
    this.parseResult = parsed

    // Transform AST to resolve imports
    this.#transformImports(parsed.program)

    // Save generated code
    const output = generate(
      parsed,
      {
        filename: this.uname
      },
      parsed.code
    );

    this.parsedSourceCode = transformedCode.code
    this.parseResult = parsed

    if (debugConfig.saveBabelTransforms) {
      // DEBUG
      fs.writeFile(debugConfig.outputsPath + "/" + this.uname, output.code, 'utf8', (err) => {
        if (err) {
          debugConfig.logger.error('Error writing to file', [err]);
        }
      });
    }
  }
}