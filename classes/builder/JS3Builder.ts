import debugConfig from "#debugConfig";
import babel from "@babel/core";
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
  projectFile: ProjectFile;
  generatedAST: JS3File | null;
  static varIdx: number = 0;
  generatedCode: string = "";
  sourceMap: string = "";
  uri: string = "";

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
    this.generatedCode = "// NOPE";
  }

  build() {
    const file = this.projectFile.initData.parseResult;
    const program = this.projectFile.initData.parseResult.program;
    assert(program, assertMessage(import.meta.url, `😂 JS3 builder, program node is undefined`));
    const js3Program = handleProgram(program, this.utils);
    this.generatedAST = generateJS3File(js3Program, file);
    this.generateCode();
    this.saveGeneratedFile();
  }

  generateCode() {
    // More finetuned
    const presets: Array<Array<string | object>> = [
      [
        "@babel/preset-env",
        { targets: "last 2 Chrome versions", modules: false },
      ],
      ["@babel/preset-typescript"]
    ];

    if (debugConfig.cli.test262)
      this.generatedAST.trailingComments = this.generatedAST.comments;

    const { code, map, ast } = babel.transformFromAstSync(
      this.generatedAST,
      this.projectFile.initData.sourceCode,
      {
        filename: this.projectFile.uname,
        ast: true,
        presets,
        sourceMaps: "inline",
        plugins: ["@babel/plugin-syntax-jsx"],
      },
    );

    this.generatedCode = code;
    this.sourceMap = JSON.stringify(map);
    this.generatedAST = ast;
  }

  saveGeneratedFile() {
    const filePath = debugConfig.cli.outputsPath + "/" + path.basename(this.projectFile.uname, this.projectFile.extension) + ".js3";
    fs.writeFile(
      filePath,
      this.generatedCode
      , (e) => {
        if (e) debugConfig.logger.error(`[Failed to save JS3]: ${path.basename(this.projectFile.uname, this.projectFile.extension)}`);
        else debugConfig.logger.success(`[Saved JS3]: ${this.projectFile.uname}`);
      }
    );
  }
}
