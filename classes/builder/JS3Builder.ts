import debugConfig from "#debugConfig";
import babel from "@babel/core";
// import babelGen from "@babel/generator";
import fs from "node:fs";
import path from "node:path";
import { ProjectFile } from "../ProjectFile";
import { handleProgram } from "./JS3Helpers/HandleProgram";
import { generateJS3File } from "./JS3Helpers/JS3Constructors";
import {
  JS3AllowedBlockStatement,
  JS3File,
  JS3Program_body,
} from "./JS3Helpers/JS3Types";

// // @ts-ignore
// const generate = babelGen.default;

const babell = babel

export type JS3BuilderUtils = {
  getNewTemporary: (prefix: string | undefined) => string;
  debugTrace: Array<string>;
  iridiumArgContext: boolean;
  others?: {
    holder: JS3Program_body | Array<JS3AllowedBlockStatement> | null;
    prefix?: string;
    bindingsToMake?: Array<string>;
    isNamedEvalContext?: string; // This is very error prone, I added it only to break down sequence expressions while retaining named property of anon func/classes...
  };
};

export default class JS3Builder {
  static varIdx: number = 0;
  projectFile: ProjectFile;
  generatedAST: JS3File | null;
  generatedCode: string | null = null;
  sourceMap: any

  utils: JS3BuilderUtils = {
    getNewTemporary: (prefix: string | undefined) =>
      `${prefix ? "js3$" + prefix : "js3"}$${++JS3Builder.varIdx}`,
    debugTrace: new Array<string>(),
    iridiumArgContext: false
  };

  constructor(file: ProjectFile) {
    if (file.initData.parseStatus !== "parsed") {
      throw new Error(
        "JS3 Builder requires a parsed file as input, found unparsed file",
      );
    }
    this.projectFile = file;
    this.generatedAST = null;
  }

  build() {
    const file = this.projectFile.initData.parseResult;
    if (!file) throw new Error("File is undefined");
    const program = file.program;
    const js3Program = handleProgram(program, this.utils);
    this.generatedAST = generateJS3File(js3Program, file);
    this.saveGeneratedFile();
  }

  getCodeString(): string {
    if (this.generatedCode) return this.generatedCode;
    if (!this.generatedAST) throw new Error("Generated AST is nullish");
    if (!this.projectFile.initData.sourceCode) throw new Error("Source code not found, empty files are not supported");
    const result = babel.transformFromAstSync(this.generatedAST, this.projectFile.initData.sourceCode, { sourceMaps: "inline" });
    if (!result) throw new Error("BABEL transform from AST failed");
    if (!result.code) throw new Error("BABEL transformed code not found");
    return result.code;
  }

  saveGeneratedFile() {
    if (debugConfig.cli.tout)
      return;

    const filePath = debugConfig.cli.outputsPath + "/" + path.basename(this.projectFile.uname, this.projectFile.extension) + ".js3";
    fs.writeFileSync(
      filePath,
      this.getCodeString()
    );
  }
}
