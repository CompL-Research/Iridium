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
  #varIdx : number = 0
  
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
  }

  build() {
    const program = this.projectFile.parseResult?.program
    assert(program !== undefined)
    try {
      this.generatedProgram = handleProgram(program, this.utils)
    } catch(e) {
      debugConfig.logger.error("[JS3 Builder] failed to generate JS3...")
    }
  }

  saveGeneratedFile() {
    let generatedCode : string
    try {
      generatedCode = generator(this.generatedProgram).code
    } catch {
      generatedCode = "// JS3 GENERATION FAILED"
    }

    // DEBUG
    fs.writeFile(debugConfig.js3DebugPath + "/" + this.projectFile.uname, generatedCode, 'utf8', (err) => {
      if (err) {
        debugConfig.logger.error('Error writing to file', [err]);
      }
    });
  }

}