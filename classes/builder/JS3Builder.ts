import debugConfig from "#debugConfig";
import babel from '@babel/core';
import _generator from "@babel/generator";
import { ImportDeclaration, Node } from "@babel/types";
import assert from "node:assert";
import fs from "node:fs";
import { ProjectFile } from "../ProjectFile.ts";
import { handleProgram } from "./JS3Helpers/HandleProgram.ts";
import { JS3AllowedBlockStatement, JS3File, JS3Program, JS3Program_body } from "./JS3Helpers/JS3Types.ts";
import { generateJS3File } from "./JS3Helpers/JS3Constructors.ts";
import { transform as hoistImportsAndFnDecls } from 'classes/builder/JS3Helpers/passes/HoistImportsAndFnDeclarations.ts'
import { transform as hoistVarDeclarations } from 'classes/builder/JS3Helpers/passes/HoistVarDeclarations.ts'


const generator = _generator["default"]

export type JS3BuilderUtils = {
  getNewTemporary: (prefix: string | undefined) => string
  isResolvedModuleImport: (node: Node) => string | null
  debugTrace: Array<string>
  others?: {
    holder: JS3Program_body | Array<JS3AllowedBlockStatement> | null,
    prefix?: string,
    bindingsToMake?: Array<String>,
    isNamedEvalContext?: string // This is very error prone, I added it only to break down sequence expressions while retaining named property of anon func/classes...
  }
}

export default class JS3Builder {
  projectFile: ProjectFile
  generatedProgram: JS3File | null
  #varIdx: number = 0
  generatedCode: string = ""
  sourceMap: any = ""
  uri: string = ""

  utils: JS3BuilderUtils = {
    getNewTemporary: (prefix: string | undefined) => `${prefix ? prefix : "js3"}$${++this.#varIdx}`,
    isResolvedModuleImport: (node: ImportDeclaration) => {
      const resolvedImport = this.projectFile.initData.moduleImports.has(node);
      return resolvedImport ? this.projectFile.initData.moduleImports.get(node) : null
    },
    debugTrace: new Array<string>()
  }

  constructor(file: ProjectFile) {
    if (file.initData.parseStatus !== "parsed") {
      debugConfig.logger.throwJS3Error("JS3 Builder requires a parsed file as input, found unparsed file")
    }
    assert(file.initData.parseStatus === "parsed")
    this.projectFile = file
    this.generatedProgram = null
    this.generatedCode = "// NOPE"
  }

  build() {
    const file = this.projectFile.initData.parseResult
    const program = this.projectFile.initData.parseResult.program
    assert(program)
    const js3Program = handleProgram(program, this.utils)
    this.generatedProgram = generateJS3File(js3Program, file)
    this.generateCode()
    this.generateURI()

    hoistImportsAndFnDecls(this.generatedProgram)
    hoistVarDeclarations(this.generatedProgram)
    this.generateCode()
    this.generateURI()
  }

  generateCode() {
    // More finetuned 
    let presets: Array<Array<string | {}>> = [
      ["@babel/preset-env", { targets: "last 2 Chrome versions", modules: false }],
      // ['@babel/preset-react', { runtime: "automatic", importSource: true }]
    ]

    if (this.projectFile.extension === 'ts' || this.projectFile.extension === 'tsx') {
      presets.push(['@babel/preset-typescript'])
    }

    if (debugConfig.test262) 
      this.generatedProgram.trailingComments = this.generatedProgram.comments

    const transformedCode = babel.transformFromAst(this.generatedProgram, this.projectFile.initData.sourceCode, {
      // cwd: this.projectFile.projectBasePath,
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
  }

  generateURI() {
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
    if (ast) {
      const sourceMapUrl = getSourceMapUrl(
        this.generatedCode,
        JSON.stringify(this.sourceMap),
      );
      this.uri = sourceMapUrl
    }
  }

  saveGeneratedFile() {

    if (debugConfig.operationMode === "js3") {
      fs.writeFile(debugConfig.outputsPath, this.generatedCode, 'utf8', (err) => {
        if (err) {
          debugConfig.logger.error(`[JS3 Builder] Error writing to file at path: ${debugConfig.outputsPath}`, [err]);
        }
      });
    }

    // if (debugConfig.js3ResultPath) {
    //   // DEBUG
    //   fs.writeFile(debugConfig.js3ResultPath, this.generatedCode, 'utf8', (err) => {
    //     if (err) {
    //       debugConfig.logger.error('Error writing to file[1]', [err]);
    //     }
    //   });
    // }

    // // DEBUG
    // fs.writeFile(debugConfig.js3DebugPath + "/JS3" + this.projectFile.uname, this.generatedCode, 'utf8', (err) => {
    //   if (err) {
    //     debugConfig.logger.error('Error writing to file[2]', [err]);
    //   }
    // });

    // // DEBUG
    // fs.writeFile(debugConfig.js3DebugPath + "/JS3" + this.projectFile.uname + ".map", this.sourceMap, 'utf8', (err) => {
    //   if (err) {
    //     debugConfig.logger.error('Error writing to file[3]', [err]);
    //   }
    // });
  }

}