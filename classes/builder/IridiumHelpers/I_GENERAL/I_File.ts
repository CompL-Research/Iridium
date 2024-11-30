import { JS3File, JS3Program } from "classes/builder/JS3Helpers/JS3Types.ts";
import IRIDIUM, { IRIDIUM_FG, printScopedSpace } from "../IRIDIUM.ts";


export class I_File {
  node: JS3File

  program: I_Program

  constructor(node: JS3File) {
    this.node = node;
    this.program = new I_Program(node.program)
  }

  toString(space = 0) {
    let stmts = []
    stmts.push(`${printScopedSpace(space)}I_File:`)
    stmts.push(this.program.toString(space + 2))
    return stmts.join("\n")
  }
}

export class I_Program {
  node: JS3Program

  body: IRIDIUM_FG
  directives: Array<string>
  sourceType: "script" | "module"

  constructor(node: JS3Program) {
    // Directives
    let directives = new Array<string>()
    node.directives.forEach((d) => directives.push(d.value.value))

    // Build CFG
    let builder = new IRIDIUM(node)

    this.node = node
    this.body = builder.build()
    this.directives = directives
    this.sourceType = node.sourceType
  }

  toString(space = 0) {
    let stmts = []
    stmts.push(`${printScopedSpace(space)}I_Program:`)
    stmts.push(this.body.bb.toString(space + 2))
    return stmts.join("\n")
  }

}