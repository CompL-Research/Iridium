import { File, isImportDeclaration, Program, Statement } from '@babel/types';
import assert from "node:assert";
import { ProjectFile } from "../ProjectFile";
import { JS3_VERSION, JS3Program, JS3Statement } from "./JS3Instructions";
import { handleImportDeclaration } from './JS3Helpers/ImportDeclarationHandler';
import debugConfig from '#debugConfig'

export default class JS3Builder {
  projectFile: ProjectFile
  parsedProgram: JS3Program | null 

  constructor(file: ProjectFile) {
    assert(file.parseResult !== undefined)
    this.projectFile = file
    this.parsedProgram = null
  }

  start() {

    const program = this.projectFile.parseResult?.program
    assert(program !== undefined)

    const js3Program = {...program} as JS3Program
    const oldStatements: Array<Statement> = js3Program.body
    js3Program.body = new Array<JS3Statement>
    js3Program.js3version = JS3_VERSION

    for (const stmt of oldStatements) {
      if (isImportDeclaration(stmt)) {
        handleImportDeclaration(stmt, js3Program.body)
      }
      else {
        debugConfig.logger.error(`TODO // Handle stmt: ${stmt.type} @ JS3Builder.ts`)
      }
    }

    this.parsedProgram = js3Program
  }
  
  
}