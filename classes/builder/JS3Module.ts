import debugConfig from "#debugConfig"
import fs from "fs"
import { ProjectFile } from "../ProjectFile"
import * as js3 from "./JS3Instructions"
import assert from "node:assert"

export class JS3Module {
  code: Array<js3.JS3Stmt>
  projectFile: ProjectFile
  #varIncrement : number = 0

  constructor(file: ProjectFile) {
    this.code = new Array<js3.JS3Stmt>()
    this.projectFile = file
  }

  getNewLocal() {
    return `iriLoc_${++this.#varIncrement}`
  }

  addStatement(stmt: js3.JS3Stmt) {
    this.code.push(stmt)
  }

  getIRString(indent: number) {
    let result = ""
    this.code.forEach(s => {
      result += " ".repeat(indent) + (s.getString() + "\n");
    })
    return result
  }

  dumpIR() {
    const removeExtension = filePath => filePath.substring(0, filePath.lastIndexOf('.')) || filePath;

    const fName = removeExtension(this.projectFile.uname) + ".js3"
    var stream = fs.createWriteStream(debugConfig.js3DebugPath + "/" + fName, { flags : 'w' });

    this.code.forEach(e => {
      stream.write(e.getString() + "\n")
    })

    stream.close(() => {
      // STUB
    });
  }
}

export class JS3Block extends JS3Module {
  parent: JS3Module
  
  constructor(parent: JS3Module) {
    super(parent.projectFile)
    this.parent = parent
  }

  getNewLocal() {
    return this.parent.getNewLocal()
  }

  addStatement(stmt: js3.JS3Stmt) {
    this.code.push(stmt)
  }

  getIRString(indent: number) {
    let result = "{\n"
    this.code.forEach(e => {
      result += " ".repeat(indent) + (e.getString() + "\n");
    })
    result += "}"
    return result
  }

  dumpIR() {
    debugConfig.logger.error("Tried to dump a JS3Block... this might have been a mistake!!", [this])
  }
}

export type CatchClauseParam = string | null // | TODO ArrayPattern and Object Pattern

export class JS3CatchClause extends JS3Module {
  parent: JS3Module
  param: CatchClauseParam
  
  constructor(parent: JS3Module, param: CatchClauseParam, block: JS3Block) {
    super(parent.projectFile)
    this.parent = parent
    this.param = param
    this.code = block.code
  }

  getNewLocal() {
    return this.parent.getNewLocal()
  }

  addStatement(stmt: js3.JS3Stmt) {
    this.code.push(stmt)
  }

  getIRString(indent: number) {
    let result = `catch (${this.param}){\n`
    this.code.forEach(e => {
      result += " ".repeat(indent) + (e.getString() + "\n");
    })
    result += "}"
    return result
  }

  dumpIR() {
    debugConfig.logger.error("Tried to dump a JS3Clause... this might have been a mistake!!", [this])
  }
}