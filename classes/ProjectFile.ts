import babel, { TransformOptions } from "@babel/core";

import t from "@babel/types";
import fs from "fs";
import path from "path";

import debugConfig from "#debugConfig";
import babelStripComments from "./babelStripComments";

export class InitData {
  status: "loaded" | "failed" | "uninitialized" = "uninitialized";
  sourceCode: string | null = null;
  loc: number | null = null;

  parseStatus: "parsed" | "failed" = "failed";
  parseResult: t.File | undefined | null = null;
  sourceMap: object | undefined | null = null;

  toString() {
    return `{ "status": "${this.status}", "parseStatus": "${this.parseStatus}", "loc": ${this.loc ? this.loc : 0} }`;
  }

  toJSON() {
    return {
      status: this.status,
      parseStatus: this.parseStatus,
      loc: this.loc ? this.loc : 0
    };
  }
}

export const GLOBAL_UNAME_PATH_MAP: Map<string, string> = new Map();

export class ProjectFile {
  absoluteFilePath: string;
  projectBasePath: string;
  uname: string;
  extension: string;
  filename: string;
  filepath: string;
  initData: InitData;

  toString() {
    return ` { "absoluteFilePath": "${this.absoluteFilePath}", "uname": "${this.uname}", "initData": ${this.initData.toString()} }`;
  }

  toJSON() {
    return {
      absoluteFilePath: this.absoluteFilePath,
      uname: this.uname,
      initData: this.initData.toJSON()
    }
  }

  constructor(absoluteFilePath: string, projectBasePath: string) {
    const validPaths = absoluteFilePath.startsWith(projectBasePath)
    if (!validPaths) {
      throw new Error(
        "File path does not start with project base path",
      );
    }

    this.absoluteFilePath = absoluteFilePath;
    this.projectBasePath = projectBasePath;
    const relativeFilePath = absoluteFilePath.substr(
      projectBasePath.length + 1,
    );
    this.uname = path.basename(relativeFilePath.replace(/\//g, "_"));
    this.extension = path.extname(absoluteFilePath);
    this.filename = path.basename(absoluteFilePath);
    this.filepath = path.dirname(absoluteFilePath);
    this.initData = new InitData();

    GLOBAL_UNAME_PATH_MAP.set(this.uname, this.absoluteFilePath);
  }

  initSync(sourceType: "unambiguous" | "script" | "module" = "unambiguous", plugins: Array<any> = []) {
    const sourceCode = fs.readFileSync(this.absoluteFilePath, "utf-8");
    // 1. Load Source Code
    this.initData.status = "loaded";
    this.initData.sourceCode = sourceCode;
    this.initData.loc = sourceCode.split(/\r\n|\r|\n/).length;

    // 2. Parse Source Code
    let presets: Array<Array<string | object>> = [
      // [
      //   "@babel/preset-flow"
      // ],
      [
        "@babel/preset-env",
        { targets: "last 2 Chrome versions", modules: false },
      ],
      [
        "@babel/preset-react",
        {
          runtime: "classic",
          pragma: "###JSX###",
          pragmaFrag: "###JSXFRAG###",
        },
      ],
      [
        "@babel/preset-typescript"
      ]
    ];

    if (process.env.PRESET_FLOW) {
      presets = [["@babel/preset-flow"],...presets]
    }

    plugins = ["@babel/plugin-syntax-jsx", ...plugins];

    if (!debugConfig.cli.comments) {
      plugins = [babelStripComments, ...plugins];
    }
    // const options = {
    //   filename: this.filename,
    //   sourceType,
    //   ast: true,
    //   comments: debugConfig.cli.comments,
    //   presets,
    //   plugins,
    // };

    // const result = babel.transformSync(sourceCode, options);

    const optimalOptions: TransformOptions = {
      // --- 1. Core Output Control (Massive Speedup) ---
      ast: true,          // Essential: You need the AST for analysis.
      code: false,        // CRITICAL: Skips the entire code generation phase.
      sourceMaps: false,  // Saves memory and CPU by not tracking mappings.

      // --- 2. Memory & AST Optimizations ---
      cloneInputAst: false, // Prevents Babel from duplicating the AST in memory.
      comments: false,      // Strips comments during parsing, saving memory.

      // --- 3. I/O & Config Resolution Bypass ---
      configFile: false,    // Stops Babel from doing disk I/O to find babel.config.js.
      babelrc: false,       // Stops disk I/O for .babelrc files.
      browserslistConfigFile: false, // Skips checking for target environments.

      // --- 4. File Context ---
      filename: this.filename,
      sourceType: sourceType, // Pass "unambiguous", "script", or "module"

      // --- 5. Handlers ---
      presets: presets,
      plugins: plugins,
    };

    const result = babel.parseSync(sourceCode, optimalOptions);
    if (!result) throw new Error("babel.transformSync failed");

    this.initData.parseStatus = "parsed";
    this.initData.parseResult = result;
    this.initData.sourceMap = null;
  }
}
