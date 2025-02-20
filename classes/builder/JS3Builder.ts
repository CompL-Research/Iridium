import debugConfig from "#debugConfig";
import babel from "@babel/core";
import _generator from "@babel/generator";
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generator = _generator["default"];

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
  #varIdx: number = 0;
  generatedCode: string = "";
  sourceMap: string = "";
  uri: string = "";

  utils: JS3BuilderUtils = {
    getNewTemporary: (prefix: string | undefined) =>
      `${prefix ? prefix : "js3"}$${++this.#varIdx}`,
    debugTrace: new Array<string>(),
  };

  constructor(file: ProjectFile) {
    if (file.initData.parseStatus !== "parsed") {
      debugConfig.logger.throwJS3Error(
        "JS3 Builder requires a parsed file as input, found unparsed file",
      );
    }
    assert(file.initData.parseStatus === "parsed");
    this.projectFile = file;
    this.generatedAST = null;
    this.generatedCode = "// NOPE";
  }

  build() {
    const file = this.projectFile.initData.parseResult;
    const program = this.projectFile.initData.parseResult.program;
    assert(program);
    const js3Program = handleProgram(program, this.utils);
    this.generatedAST = generateJS3File(js3Program, file);
    this.generateCode();
    this.generateURI();
    this.saveGeneratedFile();
  }

  generateCode() {
    // More finetuned
    const presets: Array<Array<string | object>> = [
      [
        "@babel/preset-env",
        { targets: "last 2 Chrome versions", modules: false },
      ],
      // ['@babel/preset-react', { runtime: "automatic", importSource: true }]
    ];

    if (
      this.projectFile.extension === "ts" ||
      this.projectFile.extension === "tsx"
    ) {
      presets.push(["@babel/preset-typescript"]);
    }

    if (debugConfig.cli.test262)
      this.generatedAST.trailingComments = this.generatedAST.comments;

    const { code, map, ast } = babel.transformFromAstSync(
      this.generatedAST,
      this.projectFile.initData.sourceCode,
      {
        // cwd: this.projectFile.projectBasePath,
        filename: this.projectFile.uname,
        // inputSourceMap: this.projectFile.sourceMap,
        ast: true,
        presets,
        sourceMaps: true,
        plugins: ["@babel/plugin-syntax-jsx"],
      },
    );

    this.generatedCode = code;
    this.sourceMap = JSON.stringify(map);
    this.generatedAST = ast;
  }

  generateURI() {
    // https://github.com/facebook/react
    function utf16ToUTF8(s: string): string {
      return unescape(encodeURIComponent(s));
    }

    function getSourceMapUrl(code: string, map: string): string | null {
      code = utf16ToUTF8(code);
      map = utf16ToUTF8(map);
      return `https://evanw.github.io/source-map-visualization/#${btoa(
        `${code.length}\0${code}${map.length}\0${map}`,
      )}`;
    }

    const ast = this.generatedAST;
    if (ast) {
      const sourceMapUrl = getSourceMapUrl(
        this.generatedCode,
        JSON.stringify(this.sourceMap),
      );
      this.uri = sourceMapUrl;
    }
  }

  saveGeneratedFile() {
    fs.writeFileSync(
      debugConfig.cli.outputsPath +
        "/" +
        path.basename(this.projectFile.uname, this.projectFile.extension) +
        ".js3",
      this.generatedCode,
    );
  }
}
