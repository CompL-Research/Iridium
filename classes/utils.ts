import debugConfig from "#debugConfig";
import { CommentBlock, CommentLine } from "@babel/types";
import fs from "fs";
import path from "path";
import ts from "typescript";

export const hasPackageJson = (folderPath: string) => {
  return fs.existsSync(path.join(folderPath, "package.json"));
};

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

// Function to visit nodes in post-order (inward from leaves)
export const postOrderTraversal = (graph: Graph, startNode: string): string[] => {
  const visited = new Set<string>();
  const result: string[] = [];

  function dfs(node: string) {
    if (visited.has(node)) return;
    visited.add(node);

    for (const neighbor of graph.successors(node) || []) {
      dfs(neighbor);
    }

    result.push(node); // Post-order: add after visiting all children
  }

  dfs(startNode);
  return result;
}

export const reversePostOrder = (graph: Graph, startNode: string): string[] => {
  return postOrderTraversal(graph, startNode).reverse(); // reverse post-order
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