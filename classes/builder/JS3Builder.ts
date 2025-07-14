import debugConfig from "#debugConfig";
// import babel from "@babel/core";
import babelGen from "@babel/generator";
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

// @ts-ignore
const generate = babelGen.default;

export type JS3BuilderUtils = {
  getNewTemporary: (prefix: string | undefined) => string;
  debugTrace: Array<string>;
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

  utils: JS3BuilderUtils = {
    getNewTemporary: (prefix: string | undefined) =>
      `${prefix ? prefix : "js3"}$${++JS3Builder.varIdx}`,
    debugTrace: new Array<string>(),
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

    this.generatedCode = generate(this.generatedAST, { comments: debugConfig.cli.comments }).code;
    if (!this.generatedCode) throw new Error("Generated code is not a string");
    return this.generatedCode;
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
