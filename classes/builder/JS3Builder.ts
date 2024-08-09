import babel from '@babel/core';
import debugConfig from "#debugConfig";
import _generator from "@babel/generator";
import { Node } from "@babel/types";
import assert from "node:assert";
import fs from "node:fs";
import { ProjectFile } from "../ProjectFile.ts";
import { handleProgram } from "./JS3Helpers/HandleProgram.ts";
import { JS3AllowedBlockStatement, JS3Program, JS3Program_body } from "./JS3Helpers/JS3Types.ts";


const generator = _generator["default"]

export type JS3BuilderUtils = {
  getNewTemporary: (prefix: string | undefined) => string
  isResolvedModuleImport: (node: Node) => string | null
  debugTrace: Array<string>
  others?: {
    holder: JS3Program_body | Array<JS3AllowedBlockStatement> | null,
    prefix?: string
  }
}

export default class JS3Builder {
  projectFile: ProjectFile
  generatedProgram: JS3Program | null
  #varIdx: number = 0
  generatedCode: string = ""
  sourceMap : any = ""

  utils: JS3BuilderUtils = {
    getNewTemporary: (prefix: string | undefined) => `${prefix ? prefix : "js3"}$${++this.#varIdx}`,
    isResolvedModuleImport: (node: Node) => {
      const resolvedImport = this.projectFile.resolvedModuleImports.has(node);
      return resolvedImport ? this.projectFile.resolvedModuleImports.get(node)[1] : null
    },
    debugTrace: new Array<string>()
  }

  constructor(file: ProjectFile) {
    assert(file.parseResult !== undefined)
    this.projectFile = file
    this.generatedProgram = null
    this.generatedCode = "// NOPE"
  }

  build() {
    const program = this.projectFile.parseResult?.program
    assert(program !== undefined)
    try {
      this.generatedProgram = handleProgram(program, this.utils)
    } catch (e) {
      debugConfig.logger.error("[JS3 Builder] failed to generate JS3...")
    }
  }

  saveGeneratedFile() {
    if (this.generatedProgram !== null) {
      // More finetuned 
      let presets: Array<Array<string | {}>> = [
        ["@babel/preset-env", { targets: "last 2 Chrome versions", modules: false }],
        // ['@babel/preset-react', { runtime: "automatic", importSource: true }]
      ]

      if (this.projectFile.extension === 'ts' || this.projectFile.extension === 'tsx') {
        presets.push(['@babel/preset-typescript'])
      }

      const transformedCode = babel.transformFromAst(this.generatedProgram, this.projectFile.parsedSourceCode, {
        cwd: this.projectFile.projectBasePath,
        filename: this.projectFile.uname,
        inputSourceMap: this.projectFile.sourceMap,
        ast: true,
        presets,
        sourceMaps: true,
        plugins: [
          "@babel/plugin-syntax-jsx"
        ],
      });

      this.generatedCode = transformedCode.code;
      this.sourceMap = JSON.stringify(transformedCode.map)
    } else {
      this.generatedCode = "// JS3 generated AST is null"
      debugConfig.logger.log(`[JS3 no code to save] JS3 generated AST is null`)
    }

    // DEBUG
    fs.writeFile(debugConfig.js3DebugPath + "/JS3" + this.projectFile.uname, this.generatedCode, 'utf8', (err) => {
      if (err) {
        debugConfig.logger.error('Error writing to file', [err]);
      }
    });

    // DEBUG
    fs.writeFile(debugConfig.js3DebugPath + "/JS3" + this.projectFile.uname + ".map", this.sourceMap, 'utf8', (err) => {
      if (err) {
        debugConfig.logger.error('Error writing to file', [err]);
      }
    });
  }

}