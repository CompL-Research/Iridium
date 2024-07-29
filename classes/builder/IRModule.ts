// import assert from 'node:assert/strict'
import t from "@babel/types"
import { ProjectFile } from "../ProjectFile"
import * as i from "./Instructions"
import assert from "node:assert"
import { writeFileSync } from "node:fs"
import fs from "fs"
import debugConfig from "../../configs/debug"

export class IRModule {
  code: Array<i.IrStmt>
  projectFile: ProjectFile

  constructor(file: ProjectFile) {
    this.code = new Array<i.IrStmt>()
    this.projectFile = file
  }

  addStatement(stmt: i.IrStmt) {
    this.code.push(stmt)
  }

  dumpIR() {
    const removeExtension = filePath => filePath.substring(0, filePath.lastIndexOf('.')) || filePath;

    const fName = removeExtension(this.projectFile.uname) + ".iri"
    var stream = fs.createWriteStream(debugConfig.iridiumDebugPath + "/" + fName, { flags : 'w' });

    this.code.forEach(e => {
      stream.write(e.getString() + "\n")
    })

    stream.close(() => {
      // STUB
    });
  }
}