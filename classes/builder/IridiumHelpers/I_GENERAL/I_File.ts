import { JS3File, JS3Program } from "classes/builder/JS3Helpers/JS3Types.ts";
import IRIDIUM, { IRIDIUM_FG, printScopedSpace, printSpace } from "../IRIDIUM.ts";
import JS3Builder from "classes/builder/JS3Builder.ts";
import debugConfig from "#debugConfig"

export class I_File {
  node: JS3File

  program: I_Program

  constructor(js3builder: JS3Builder) {
    this.node = js3builder.generatedAST;
    this.program = new I_Program(js3builder)
  }

  toString(space = 0) {
    let stmts = []
    stmts.push(`${printScopedSpace(space)}I_File:`)
    stmts.push(this.program.toString(space + 2))
    return stmts.join("\n")
  }

  toDOT(space = 0) {
    let stmts = []
    debugConfig.DOTContext = new Set()
    stmts.push("digraph Iridium {")
    stmts.push("  node [fontname=\"Noto Mono\"];");
    stmts.push("  graph [nodesep=1.0, ranksep=1.5]; // Adjust separation")

    stmts.push("  subgraph cluster {")
    stmts.push("    label=\"code\";")
    stmts.push(this.program.toDOT(space + 2))
    stmts.push("  }")

    let i = 0
    for (let c of debugConfig.DOTContext) {
      stmts.push(`  subgraph cluster_${i} {`)
      stmts.push(`    label=\"closure_${i++}\";`)
      stmts.push(c.toDOT(4))
      stmts.push("  }")
    }

    stmts.push(`  subgraph cluster_${i++} {`)
    stmts.push("    label=\"environment\";")
    // TODO
    stmts.push(this.program.body.rootBB.env.toDOT(space + 4))
    stmts.push("  }")

    // stmts.push(this.program.toDOTEnvEdges(space + 2))

    // for (let c of debugConfig.DOTContext) {
    //   stmts.push(c.toDOTEnvEdges(space + 2))
    // }


    stmts.push("}")
    return stmts.join("\n")
  }
}

export class I_Program {
  node: JS3Program

  body: IRIDIUM_FG
  directives: Array<string>
  sourceType: "script" | "module"

  constructor(js3builder: JS3Builder) {
    // Directives
    let directives = new Array<string>()
    let node = js3builder.generatedAST.program
    node.directives.forEach((d) => directives.push(d.value.value))

    // Build CFG
    let builder = new IRIDIUM(js3builder)

    this.node = node
    this.body = builder.build()
    this.directives = directives
    this.sourceType = node.sourceType
  }

  toString(space = 0) {
    let stmts = []
    stmts.push(`${printScopedSpace(space)}I_Program:`)

    // TODO
    // stmts.push(this.body.bb.toString(space + 2))
    stmts.push(this.body.saveIridiumToString())
    return stmts.join("\n")
  }

  toDOT(space = 0) {
    let stmts = []
    // TODO
    stmts.push(this.body.saveBBDot(space + 2))
    return stmts.join("\n")
  }

  toDOTEnvEdges(space = 0) {
    // TODO
    // return this.body.bb.toDOTEnvEdges(space + 2) 
    return ""
  }

}