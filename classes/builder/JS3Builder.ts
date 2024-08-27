import debugConfig from "#debugConfig";
import babel from '@babel/core';
import _generator from "@babel/generator";
import { ImportDeclaration, Node } from "@babel/types";
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
  sourceMap: any = ""

  utils: JS3BuilderUtils = {
    getNewTemporary: (prefix: string | undefined) => `${prefix ? prefix : "js3"}$${++this.#varIdx}`,
    isResolvedModuleImport: (node: ImportDeclaration) => {
      const resolvedImport = this.projectFile.initData.moduleImports.has(node);
      return resolvedImport ? this.projectFile.initData.moduleImports.get(node) : null
    },
    debugTrace: new Array<string>()
  }

  constructor(file: ProjectFile) {
    assert(file.initData.parseStatus === "parsed")
    this.projectFile = file
    this.generatedProgram = null
    this.generatedCode = "// NOPE"
  }

  build() {
    const program = this.projectFile.initData.parseResult.program
    assert(program)
    try {
      this.generatedProgram = handleProgram(program, this.utils)
    } catch (e) {
      this.generatedProgram = null;
      debugConfig.logger.error("[JS3 Builder] failed to generate JS3...", [e])
    }
  }

  generateURI() : null | string {
    // https://github.com/facebook/react
    function utf16ToUTF8(s: string): string {
      return unescape(encodeURIComponent(s));
    }

    function getSourceMapUrl(code: string, map: string): string | null {
      code = utf16ToUTF8(code);
      map = utf16ToUTF8(map);
      return `https://evanw.github.io/source-map-visualization/#${btoa(
        `${code.length}\0${code}${map.length}\0${map}`,
      )}`;
    }

    const ast = this.generatedProgram
    const source = this.projectFile.initData.sourceCode
    const sourceFileName = this.projectFile.filename

    if (ast) {
      const generated = generator(
        ast,
        { sourceMaps: true, sourceFileName },
        source,
      );
      const sourceMapUrl = getSourceMapUrl(
        generated.code,
        JSON.stringify(generated.map),
      );
      return sourceMapUrl
    }

    return null
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

      const transformedCode = babel.transformFromAst(this.generatedProgram, this.projectFile.initData.sourceCode, {
        cwd: this.projectFile.projectBasePath,
        filename: this.projectFile.uname,
        // inputSourceMap: this.projectFile.sourceMap,
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

    if (debugConfig.js3ResultPath) {
      // DEBUG
      fs.writeFile(debugConfig.js3ResultPath, this.generatedCode, 'utf8', (err) => {
        if (err) {
          debugConfig.logger.error('Error writing to file', [err]);
        }
      });  
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