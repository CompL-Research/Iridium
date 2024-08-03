import debugConfig from '#debugConfig';
import { isImportDeclaration, isVariableDeclaration, Statement } from '@babel/types';
import assert from "node:assert";
import { ProjectFile } from "../ProjectFile";
import { handleImportDeclaration } from './JS3Helpers/ImportDeclarationHandler';
import { handleVariableDeclaration } from './JS3Helpers/VariableDeclarationHandler'
import { JS3_VERSION, JS3Program, JS3Statement } from "./JS3Instructions";

export type JS3BuilderUtils = {
  getNewTemporary: (string) => string
}

export default class JS3Builder {
  projectFile: ProjectFile
  parsedProgram: JS3Program | null
  #varIdx : number = 0
  utils: JS3BuilderUtils = {
    getNewTemporary: (prefix: string = "js3$") => `${prefix}${++this.#varIdx}`,
  }

  constructor(file: ProjectFile) {
    assert(file.parseResult !== undefined)
    this.projectFile = file
    this.parsedProgram = null
  }

  start() {

    const program = this.projectFile.parseResult?.program
    assert(program !== undefined)

    const js3Program = { ...program } as JS3Program
    const oldStatements: Array<Statement> = js3Program.body
    js3Program.body = new Array<JS3Statement>
    js3Program.js3version = JS3_VERSION

    for (const stmt of oldStatements) {
      if (isImportDeclaration(stmt)) {
        if (this.projectFile.resolvedModuleImports.has(stmt)) {
          const resolvedPath = this.projectFile.resolvedModuleImports.get(stmt);
          assert(resolvedPath !== undefined)
          handleImportDeclaration(stmt, js3Program.body, resolvedPath[1])
        } else {
          handleImportDeclaration(stmt, js3Program.body)
        }
      }
      else if (isVariableDeclaration(stmt)) {
        handleVariableDeclaration(stmt, js3Program.body, this.utils)
      }
      else {
        debugConfig.logger.error(`TODO // Handle stmt: ${stmt.type} @ JS3Builder.ts`)
      }
    }

    this.parsedProgram = js3Program
  }


}