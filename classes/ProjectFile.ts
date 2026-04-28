import babel, { TransformOptions } from "@babel/core";

import t from "@babel/types";
import fs from "fs";
import path from "path";
import { JS3File } from "./builder/JS3Helpers/JS3Types";
import { FileSEXP } from "./builder/IridiumV2/Types";

const presets: Array<Array<string | object>> = [
  ["@babel/preset-env", { targets: "last 2 Chrome versions", modules: false }],

  ["@babel/preset-typescript"],
];

export class ProjectFile {
  filepath: string;
  uname: string;

  info: {
    babel: "uninitialized" | "loaded" | "parsed";
    js3?: "uninitialized" | "transformed" | "parsed";
    iri?: "uninitialized" | "structural" | "normalized";
  };
  payload: {
    babel?: t.File
    js3?: JS3File
    js3CodeString?: string
    iriSEXP?: FileSEXP
    irix?: Array<any>
    iri?: string
  }
  errLog: Array<any> = [];

  constructor(absoluteFilePath: string) {
    this.filepath = absoluteFilePath;
    this.uname = path.basename(absoluteFilePath.replace(/\//g, "_"));
    this.info = { babel: "uninitialized" };
    this.payload = {  };
  }

  getBabelPayload(): t.File {
    if (this.payload.babel)
      return this.payload.babel;
    else throw new Error("getBabelPayload Error");
  }

  getJS3Payload(): JS3File {
    if (this.payload.js3)
      return this.payload.js3;
    else throw new Error("getJS3Payload Error");
  }

  getJS3CodeStringPayload(): string {
    if (this.payload.js3CodeString)
      return this.payload.js3CodeString;
    else throw new Error("getJS3CodeStringPayload Error");
  }

  getIRIXPayload(): Array<any> {
    if (this.payload.irix)
      return this.payload.irix;
    else throw new Error("getJS3CodeStringPayload Error");
  }

  getIRIPayload(): string {
    if (this.payload.iri)
      return this.payload.iri;
    else throw new Error("getIRIPayload Error");
  }

  initSync(
    sourceType: "unambiguous" | "script" | "module" = "unambiguous",
    plugins: Array<any> = [],
  ) {
    const info = this.info;
    const errLog = this.errLog;
    const payload = this.payload;

    let sourceCode: string = "";
    try {
      sourceCode = fs.readFileSync(this.filepath, "utf-8");
      info.babel = "loaded";
    } catch (e) {
      errLog.push(e);
      return;
    }

    const currPresets = [...presets];

    if (process.env.PRESET_FLOW) {
      currPresets.push(["@babel/preset-flow"]);
    }

    if (process.env.PRESET_REACT) {
      currPresets.push([
        "@babel/preset-react",
        {
          runtime: "classic",
          pragma: "###JSX###",
          pragmaFrag: "###JSXFRAG###",
        },
      ]);
      plugins = ["@babel/plugin-syntax-jsx", ...plugins];
    }

    const lightOpts: TransformOptions = {
      filename: this.uname,
      ast: true,
      code: false,
      sourceMaps: false,
      cloneInputAst: false,
      comments: false,
      configFile: false,
      babelrc: false,
      browserslistConfigFile: false,
      sourceType: sourceType,
      presets: presets,
      plugins: plugins,
    };

    const result = babel.parseSync(sourceCode, lightOpts);

    if (!result) {
      errLog.push(new Error("Babel parseSync Failed"));
      return;
    }

    info.babel = "parsed";
    payload.babel = result;
  }
}
