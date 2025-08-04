import debugConfig from "#debugConfig";
import { CommentBlock, CommentLine } from "@babel/types";
import fs from "fs";
import path from "path";
import ts from "typescript";
import { IridiumPrimitives } from "./builder/IridiumV2/Types/index";

export const printIriSpace = (times: number | undefined = 0) => {
  if (!times) times = 0;
  let res = [];
  for (let i = 0; i < times; i++) {
    if (i % 2 == 0) {
      res.push("░");
    } else {
      res.push(" ");
    }
  }
  return res.join('');
};

export const printFlagString = (flags: Array<[string, IridiumPrimitives]>) => {
  if (flags.length === 0) return "";
  return `[${flags.map(e => e[1] !== null ? `${e[0]} : ${e[1]}` : `${e[0]}`).join(", ")}]`
}

export const hasPackageJson = (folderPath: string) => {
  return fs.existsSync(path.join(folderPath, "package.json"));
};

export function untilFirstMatch<T>(arr: T[], predicate: (item: T, index: number, array: T[]) => boolean): T[] {
  const index = arr.findIndex(predicate);
  return index === -1 ? arr.slice() : arr.slice(0, index);
}

export const ensurePathExists = (path: string) => {
  if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
  }
  fs.mkdirSync(path);
};

export const initializeOutputsPath = () => {
  if (!debugConfig.cli.outputsPath) throw new Error("Outputs path not initialized");
  ensurePathExists(debugConfig.cli.outputsPath);
};

export function generateCommentLine(comment: string): CommentLine {
  return {
    type: "CommentLine",
    value: comment,
  } as CommentLine;
}

export function generateCommentBlock(comment: string): CommentBlock {
  return {
    type: "CommentBlock",
    value: comment,
  } as CommentBlock;
}


export function resolveModuleImport(
  importPath: string,
  currentFile: string,
  basePath: string,
): string | undefined {
  const options = {
    esModuleInterop: true,
    jsx: "react",
    lib: ["es2020", "dom", "esnext"],
    skipLibCheck: true,
    sourceMap: true,
    target: "ES2020",
    module: "es2020",
    noUnusedLocals: true,
    noUnusedParameters: true,
    downlevelIteration: true,
    strict: false,
    resolveJsonModule: true,
    plugins: [{ name: "typescript-strict-plugin" }],
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    baseUrl: basePath,
  };

  // @ts-ignore
  const result = ts.resolveModuleName(importPath, currentFile, options, ts.sys);

  if (result.resolvedModule) {
    const { resolvedFileName, extension } = result.resolvedModule;

    // Prioritize JS/TS files over .d.ts
    if (extension !== ts.Extension.Dts) {
      return resolvedFileName;
    }

    // Attempt to find the corresponding JS/TS file
    const possibleExtensions = ['.js', '.jsx', '.ts', '.tsx', '/index.js'];
    for (const ext of possibleExtensions) {
      const jsFile = resolvedFileName.replace(/\.d\.ts$/, ext);
      if (ts.sys.fileExists(jsFile)) {
        return jsFile;
      }
    }

    // Fallback to the .d.ts file if nothing else is found
    return undefined;

  } else {
    // debugConfig.logger.error(
    //   `Failed to resolve import: ${importPath} @ ${currentFile}: ${JSON.stringify(result)}`,
    // );
    return undefined;
  }
}