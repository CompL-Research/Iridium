import babel from "@babel/core";

import { ParseResult } from "@babel/parser";
import t from "@babel/types";
import fs from "fs";
import assert from "node:assert/strict";
import path from "path";

import debugConfig from "#debugConfig";

export class InitData {
  status: "loaded" | "failed" | "uninitialized" = "uninitialized";
  sourceCode: string | null = null;
  loc: number | null = null;

  parseStatus: "parsed" | "failed" = "failed";
  parseResult: ParseResult<t.File> | null = null;
  sourceMap: object | null = null;

  // moduleImports: Map<ImportDeclaration, string | null> = new Map()
  toString() {
    return `{ "status": "${this.status}", "parseStatus": "${this.parseStatus}", "loc": ${this.loc ? this.loc : 0} }`;
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

  constructor(absoluteFilePath, projectBasePath) {
    assert(absoluteFilePath !== null);
    assert(projectBasePath !== null);
    if (absoluteFilePath.startsWith(projectBasePath) === false) {
      debugConfig.logger.error("File path: ", absoluteFilePath);
      debugConfig.logger.error("Base path: ", projectBasePath);
      debugConfig.logger.throwJS3Error(
        "File path does not start with project base path",
      );
    }
    assert(absoluteFilePath.startsWith(projectBasePath) === true);

    this.absoluteFilePath = absoluteFilePath;
    this.projectBasePath = projectBasePath;
    const relativeFilePath = absoluteFilePath.substr(
      projectBasePath.length + 1,
    );
    this.uname = relativeFilePath.replace(/\//g, "_");
    this.extension = path.extname(absoluteFilePath);
    this.filename = path.basename(absoluteFilePath);
    this.filepath = path.dirname(absoluteFilePath);
    this.initData = new InitData();

    GLOBAL_UNAME_PATH_MAP.set(this.uname, this.absoluteFilePath);
  }

  // #transformImports(program: Program, result: Map<t.Node, string | null>) {
  //   for (const stmtNode of program.body) {
  //     if (isImportDeclaration(stmtNode)) {
  //       const importSpecifier = stmtNode.source.value
  //       // if (importSpecifier === "true/jsx-runtime") continue;
  //       const resolved = resolveModuleImport(importSpecifier, this.absoluteFilePath, this.projectBasePath)
  //       if (!resolved) {
  //         result.set(stmtNode, null)
  //         debugConfig.logger.error(`[Failed module import] ${importSpecifier}`)
  //       } else {
  //         result.set(stmtNode, resolved)
  //       }
  //     }
  //   }
  // }

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
    ];

    presets.push(["@babel/preset-typescript"]);

    const options = {
      // cwd: this.projectBasePath,
      filename: this.filename,
      sourceType,
      ast: true,
      presets,
      // sourceMaps: true,
      plugins: ["@babel/plugin-syntax-jsx", ...plugins],
    };

    const result = babel.transformSync(sourceCode, options);
    this.initData.parseStatus = "parsed";
    this.initData.parseResult = result.ast;
    this.initData.sourceMap = result.map;

    // // Resolve imports using the loaded file's AST
    // this.#transformImports(result.ast.program, this.initData.moduleImports)
  }

  // // Loads the file and creates an AST
  // initAsync(sourceType = "unambiguous", plugins = []) {
  //   const that = this;
  //   // This will return a promise
  //   return new Promise<void>((resolve) => {
  //     try {
  //       that.initSync(sourceType, plugins);
  //     } finally {
  //       resolve();
  //     }
  //   });
  // }
}
