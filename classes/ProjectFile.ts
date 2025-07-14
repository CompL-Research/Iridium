import babel from "@babel/core";

import { ParseResult } from "@babel/parser";
import t from "@babel/types";
import fs from "fs";
import assert from "node:assert/strict";
import path from "path";

import debugConfig from "#debugConfig";
import { assertMessage } from "#utils";
import babelStripComments from "./babelStripComments.ts";


export class InitData {
  status: "loaded" | "failed" | "uninitialized" = "uninitialized";
  sourceCode: string | null = null;
  loc: number | null = null;

  parseStatus: "parsed" | "failed" = "failed";
  parseResult: ParseResult<t.File> | null = null;
  sourceMap: object | null = null;

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

  constructor(absoluteFilePath, projectBasePath) {
    assert(absoluteFilePath !== null, assertMessage(import.meta.url, "🐖 absoluteFilePath is null"));
    assert(projectBasePath !== null, assertMessage(import.meta.url, "🐖 projectBasePath is null"));
    const validPaths = absoluteFilePath.startsWith(projectBasePath)
    if (!validPaths) {
      debugConfig.logger.error(`File path: ${absoluteFilePath}`);
      debugConfig.logger.error(`Base path: ${projectBasePath}`);
      debugConfig.logger.throwJS3Error(
        "File path does not start with project base path",
      );
    }
    assert(validPaths, assertMessage(import.meta.url, "🐖 File path does not start with project base path"));

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

  initSync(sourceType = "unambiguous", plugins = []) {
    const sourceCode = fs.readFileSync(this.absoluteFilePath, "utf-8");
    // 1. Load Source Code
    this.initData.status = "loaded";
    this.initData.sourceCode = sourceCode;
    this.initData.loc = sourceCode.split(/\r\n|\r|\n/).length;

    // 2. Parse Source Code
    const presets: Array<Array<string | object>> = [
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
      ["@babel/preset-typescript"]
    ];

    plugins = ["@babel/plugin-syntax-jsx", ...plugins];

    if (!debugConfig.cli.comments) {
      plugins = [babelStripComments, ...plugins];
    }
    const options = {
      filename: this.filename,
      sourceType,
      ast: true,
      comments: debugConfig.cli.comments,
      presets,
      plugins,
    };

    const result = babel.transformSync(sourceCode, options);
    this.initData.parseStatus = "parsed";
    this.initData.parseResult = result.ast;
    this.initData.sourceMap = result.map;
  }
}
