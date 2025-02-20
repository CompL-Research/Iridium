import debugConfig from "#debugConfig";
import { printScopedSpace } from "#utils";
import JS3Builder from "classes/builder/JS3Builder.ts";
import { JS3File } from "classes/builder/JS3Helpers/JS3Types.ts";
import { ProjectFile } from "classes/ProjectFile.ts";
import fs from "node:fs";
import path from "node:path";
import { default as IRIDIUM, default as IRIDIUM_MODULE } from "../IRIDIUM.ts";

export class I_Container {
  node: JS3File
  projectFile: ProjectFile
  module: IRIDIUM
  js3Builder: JS3Builder
  directives: Array<string>
  sourceType: "script" | "module"

  constructor(node: JS3File, projectFile: ProjectFile, js3Builder: JS3Builder, directives: Array<string>, sourceType: "script" | "module") {
    this.node = node;
    this.projectFile = projectFile;
    this.module = null;
    this.js3Builder = js3Builder;
    this.directives = directives;
    this.sourceType = sourceType;
  }

  build() {
    const iri_module: IRIDIUM_MODULE = new IRIDIUM_MODULE(this.js3Builder);
    iri_module.build();
    this.module = iri_module;
    this.saveGeneratedFile()
  }

  saveGeneratedFile() {
    fs.writeFileSync(debugConfig.cli.outputsPath + "/" + path.basename(this.projectFile.uname, path.extname(this.projectFile.uname)) + ".iri", this.toString(0));
  }

  toString(space = 0) {
    if (!this.module.fg) debugConfig.logger.throwIriError("IRIDIUM Flowgraph not yet initialized!!!");

    let stmts = []
    stmts.push(`${printScopedSpace(space)}🍁${this.projectFile.toString()}`)
    stmts.push(this.module.fg.saveIridiumToString(space + 2))
    stmts.push(`${printScopedSpace(space)}🍁`)
    return stmts.join("\n")
  }

  toDOT(space = 0) {
    if (!this.module.fg) debugConfig.logger.throwIriError("IRIDIUM Flowgraph not yet initialized!!!");

    let stmts = []
    debugConfig.DOTContext = new Set()
    stmts.push("digraph Iridium {")
    stmts.push("  node [fontname=\"Noto Mono\"];");
    stmts.push("  graph [nodesep=1.0, ranksep=1.5]; // Adjust separation")
    stmts.push("  subgraph cluster {")
    stmts.push("    label=\"code\";")
    stmts.push(this.module.fg.saveIridiumToDOT(space + 2))
    stmts.push("  }")

    let i = 0
    for (let c of debugConfig.DOTContext) {
      stmts.push(`  subgraph cluster_${i} {`);
      stmts.push(`    label=\"closure_${i}\";`);
      stmts.push(c.saveIridiumToDOT(4));
      stmts.push("  }");
      i++;
    }

    stmts.push(`  subgraph cluster_${i++} {`)
    stmts.push("    label=\"environment\";")
    stmts.push(this.module.fg.rootBB.env.parent.toDOT(space + 4))
    stmts.push("  }")

    stmts.push(this.module.fg.saveEnvToDOT(space + 2))
    for (let c of debugConfig.DOTContext) {
      stmts.push(c.saveEnvToDOT(space + 2))
    }


    stmts.push("}")
    return stmts.join("\n")
  }
}