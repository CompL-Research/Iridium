import debugConfig from "#debugConfig";
import { isImportDeclaration, isProgram, isVariableDeclaration } from '@babel/types';
import assert from "node:assert";
import { ProjectFile } from "../ProjectFile";
import { handleImportDeclaration } from "./JS3Helpers/ImportDeclarationHandler";
import { handleVariableDeclaration } from "./JS3Helpers/VariableDeclarationHandler";
import { Comment } from "./JS3Instructions";
import { JS3Module } from "./JS3Module";
import { tryStatement } from "@babel/types";
import { handleTryStatement } from "./JS3Helpers/TryStatementHandler";
import { isTryStatement } from "@babel/types";


export default class JS3Builder {
  projectFile: ProjectFile
  module: JS3Module
  constructor(file: ProjectFile) {
    assert(file.parseResult !== undefined)
    this.projectFile = file
  }

  start() {
    const projectFile = this.projectFile
    assert(this.projectFile.parseResult !== undefined)
    const program = this.projectFile.parseResult.program
    assert(isProgram(program))
    const module = this.module = new JS3Module(this.projectFile)

    // Generate Import Statements
    module.addStatement(new Comment(`Transformed by ${debugConfig.versionNumber}\n`))

    // Iterate over body
    for (const node of program.body) {
      if (isImportDeclaration(node)) {
        handleImportDeclaration(node, module, projectFile)
      } else if (isVariableDeclaration(node)) {
        handleVariableDeclaration(node, module, projectFile)
      } else if (isTryStatement(node)) {
        handleTryStatement(node, module, projectFile)
      } else {
        debugConfig.logger.error(`// TODO PROGRAM: ${node.type}`, [node]);
      }
    }

    module.dumpIR()

  }
  
  
}