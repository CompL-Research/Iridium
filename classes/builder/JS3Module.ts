// import assert from 'node:assert/strict'
import t from "@babel/types"
import { ProjectFile } from "../ProjectFile"
import * as js3 from "./JS3Instructions"
import assert from "node:assert"
import { writeFileSync } from "node:fs"
import fs from "fs"
import debugConfig from "../../configs/debug"

export class JS3Module {
  code: Array<js3.JS3Stmt>
  projectFile: ProjectFile

  constructor(file: ProjectFile) {
    this.code = new Array<js3.JS3Stmt>()
    this.projectFile = file
  }

  addStatement(stmt: js3.JS3Stmt) {
    this.code.push(stmt)
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