import debugConfig from "#debugConfig";
// import babel from "@babel/core";
import babelGen from "@babel/generator";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { ProjectFile } from "../ProjectFile.ts";
import { handleProgram } from "./JS3Helpers/HandleProgram.ts";
import { generateJS3File } from "./JS3Helpers/JS3Constructors.ts";
import {
  JS3AllowedBlockStatement,
  JS3File,
  JS3Program_body,
} from "./JS3Helpers/JS3Types.ts";
import { assertMessage } from "#utils";

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
  generatedCode: string = null;

  utils: JS3BuilderUtils = {
    getNewTemporary: (prefix: string | undefined) =>
      `${prefix ? prefix : "js3"}$${++JS3Builder.varIdx}`,
    debugTrace: new Array<string>(),
  };

  constructor(file: ProjectFile) {
    if (file.initData.parseStatus !== "parsed") {
      debugConfig.logger.throwJS3Error(
        "JS3 Builder requires a parsed file as input, found unparsed file",
      );
    }
    assert(file.initData.parseStatus === "parsed", assertMessage(import.meta.url, `😂 Expected parseStatus to be "parsed"`));
    this.projectFile = file;
    this.generatedAST = null;
  }

  build() {
    const file = this.projectFile.initData.parseResult;
    const program = this.projectFile.initData.parseResult.program;
    assert(program, assertMessage(import.meta.url, `😂 JS3 builder, program node is undefined`));
    const js3Program = handleProgram(program, this.utils);
    this.generatedAST = generateJS3File(js3Program, file);
    this.saveGeneratedFile();
  }

  getCodeString() {
    if (this.generatedCode) return this.generatedCode;

    this.generatedCode = generate(this.generatedAST, { comments: debugConfig.cli.comments }).code;
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
