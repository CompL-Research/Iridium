import assert from "node:assert";
import { ProjectFile } from "../ProjectFile.ts";
import { JS3Program } from "./JS3Helpers/JS3Types.ts";
import { handleProgram } from "./JS3Helpers/HandleProgram.ts"
import debugConfig from "#debugConfig"
import { Node } from "@babel/types"

export type JS3BuilderUtils = {
  getNewTemporary: (prefix: string | undefined) => string
  isResolvedModuleImport: (node: Node) => string | null
  others?: any
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
    }
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
    // const js3Program = { ...program } as JS3Program
    // const oldStatements: Array<Statement> = js3Program.body
    // js3Program.body = new Array<JS3Statement>
    // js3Program.js3version = JS3_VERSION

    // for (const stmt of oldStatements) {
    //   if (isImportDeclaration(stmt)) {
    //     if (this.projectFile.resolvedModuleImports.has(stmt)) {
    //       const resolvedPath = this.projectFile.resolvedModuleImports.get(stmt);
    //       assert(resolvedPath !== undefined)
    //       handleImportDeclaration(stmt, js3Program.body, resolvedPath[1])
    //     } else {
    //       handleImportDeclaration(stmt, js3Program.body)
    //     }
    //   }
    //   else if (isVariableDeclaration(stmt)) {
    //     handleVariableDeclaration(stmt, js3Program.body, this.utils)
    //   }
    //   else if (isExportDefaultDeclaration(stmt)) {
    //     handleExportDefaultDeclaration(stmt, js3Program.body, this.utils)
    //   }
    //   else {
    //     debugConfig.logger.error(`TODO // Handle stmt: ${stmt.type} @ JS3Builder.ts`)
    //     // throw new JS3GenerationError(`TODO // Handle stmt: ${stmt.type} @ JS3Builder.ts`);
    //   }
    // }

    // this.parsedProgram = js3Program
  }


}