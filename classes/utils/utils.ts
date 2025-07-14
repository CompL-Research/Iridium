import debugConfig from "#debugConfig";
import { CommentBlock, CommentLine } from "@babel/types";
// import { execSync } from "child_process";
// import { I_Container } from "classes/builder/IridiumHelpers/I_GENERAL/I_Container.ts";
// import { IRIDIUM_FG } from "classes/builder/IridiumHelpers/I_GENERAL/IRIDIUM_FG.ts";
// import { ensureNodeIDAndGetPTANode, GLOBAL_NODE_MAP, GLOBAL_RESOLUTION_MAP, PTAEdge, PTAFlowData } from "classes/builder/IridiumHelpers/Passes/PTA_STUFF/PTAFlowData.ts";
// import { Graph } from "#graphlib";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import ts from "typescript";
// import { PTA_WORLD } from "classes/builder/IridiumHelpers/Passes/PTA.ts";
// import { IRIDIUM_CONTAINER_MAP } from "classes/builder/IridiumHelpers/DependencyGraph.ts";

type NodeData = {
  level: number;
  data: any; // Adjust "any" to whatever data type you're working with
};

// export const computeRefreshMap = (): [Set<string>, Map<string, Set<string>>] => {
//   const refreshTriggers: Set<string> = new Set();
//   const refreshMap: Map<string, Set<string>> = new Map();
//   for (const [currWorldWeAreLookingInto, currWorldData] of PTA_WORLD.entries()) {
//     for (const [nodeID, edges] of currWorldData) {
//       if (GLOBAL_RESOLUTION_MAP.has(nodeID)) {
//         refreshTriggers.add(nodeID);
//         // currWorldWeAreLookingInto needs to be refreshed, it has a resolveable node
//         const nodeWasBroughtFrom = GLOBAL_NODE_MAP.get(nodeID).world;
//         // If node was brought from myself, refresh myself
//         if (nodeWasBroughtFrom === currWorldWeAreLookingInto) {
//           if (!refreshMap.has(currWorldWeAreLookingInto)) refreshMap.set(currWorldWeAreLookingInto, new Set());
//         } else {
//           // Node was brought from a remote world, resolve that world first then resolve it
//           if (!refreshMap.has(currWorldWeAreLookingInto)) refreshMap.set(currWorldWeAreLookingInto, new Set());
//           refreshMap.get(currWorldWeAreLookingInto).add(nodeWasBroughtFrom);
//         }
//       }
//     }
//   }
//   return [refreshTriggers, refreshMap];
// }

export const assertMessage = (filePath: string, message: string) => {
  return "[FILEPATH]: " + filePath + "\n" + message;
}

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
  ensurePathExists(debugConfig.cli.outputsPath);
};

// export const hashGraph = (boundaryEnv: PTAFlowData, bbContext: number) => {
//   const nodes: Array<string> = [];
//   const edges: Array<string> = [];

//   for (const n of boundaryEnv.keys())
//     edges.push(n);

//   for (const es of boundaryEnv.values())
//     for (const e of es)
//       edges.push(e);

//   nodes.sort();
//   edges.sort();

//   const graphString = JSON.stringify({ nodes, edges, bbContext });
//   return crypto.createHash("sha256").update(graphString).digest("hex");
// };

// export const saveFlowDataToGraph = (flowData: PTAFlowData) => {
//   const res = [];
//   res.push("digraph gg {");
//   // res.push("  graph [nodesep=1.0, ranksep=1.5]; // Adjust separation")
//   for (const [u, es] of flowData.entries()) {
//     const ptaNode = ensureNodeIDAndGetPTANode(flowData, u);
//     res.push(`${ptaNode.dotName()}${ptaNode.dotNodeStyle()};`)
//     for (const e of es) {
//       const edge = PTAEdge.from(u, e)
//       const uNode = ensureNodeIDAndGetPTANode(flowData, edge.u);
//       const vNode = ensureNodeIDAndGetPTANode(flowData, edge.v);
//       res.push(
//         `${uNode.dotName()} -> ${vNode.dotName()}[ label="${edge.field.replace(/"/g, '\\"')}" ]`
//       );
//     }
//   }
//   res.push("}");
//   return res.join("\n");
// }

let idx = 0;

// export const saveRenderTreeDataToFile = (path: string, flowData: PTAFlowData) => {
//   path = `${debugConfig.cli.outputsPath}/` + idx++ + "_" + path;
//   try {
//     fs.writeFileSync(path + ".DOT", saveFlowDataToGraph(flowData));
//     // execSync(`dot -Tpng ${path + ".DOT"} -o ${path + ".png"}`);
//   } catch (err) {
//     console.error("File write failed:", err);
//   }
// }

// export const saveFlowDataToFile = (path: string, flowData: PTAFlowData) => {
//   path = `${debugConfig.cli.outputsPath}/PTA/` + idx++ + "_" + path;
//   try {
//     fs.writeFileSync(path + ".DOT", saveFlowDataToGraph(flowData));
//     // execSync(`dot -Tpng ${path + ".DOT"} -o ${path + ".png"}`);
//   } catch (err) {
//     console.error("File write failed:", err);
//   }
// }

// export const saveFlowGraphToFile = (path: string, flowGraph: I_Container) => {
//   path = `${debugConfig.cli.outputsPath}/FG_` + idx++ + "_" + path;
//   try {
//     fs.writeFileSync(path + ".DOT", flowGraph.toDOT());
//     // execSync(`dot -Tpng ${path + ".DOT"} -o ${path + ".png"}`);
//   } catch (err) {
//     console.error("File write failed:", err);
//   }
// }

// export const saveDependencyGraph = (depGraph: Graph) => {
//   const path = `${debugConfig.cli.outputsPath}/DEPENDENCY_GRAPH`;

//   let graphDOT = []
//   graphDOT.push("digraph DependencyGraph {");
//   graphDOT.push('  node [fontname="Noto Mono"];');

//   for (const n of depGraph.nodes()) {
//     const node = IRIDIUM_CONTAINER_MAP.get(n);
//     if (node === null) {
//       graphDOT.push(`  "${n}"[shape="rectangle",style="filled",fillcolor="red"];`);
//     } else {
//       graphDOT.push(`  "${n}"[shape="rectangle",style="filled",fillcolor="green"];`);
//     }
//   }
//   for (const e of depGraph.edges()) {
//     const resolvedNode = IRIDIUM_CONTAINER_MAP.get(e.v);
//     if (resolvedNode === null) {
//       graphDOT.push(`  "${e.v}" -> "${e.w}"[style="dashed"];`);
//     } else {
//       graphDOT.push(`  "${e.v}" -> "${e.w}";`);
//     }
//   }
//   graphDOT.push('}');

//   try {
//     fs.writeFileSync(path + ".DOT", graphDOT.join("\n"));
//     // execSync(`dot -Tpng ${path + ".DOT"} -o ${path + ".png"}`);
//   } catch (err) {
//     console.error("File write failed:", err);
//   }
// }

// export const saveFlowGraphToFileFromIRIDIUMFG = (path: string, flowGraph: IRIDIUM_FG) => {
//   path = `${debugConfig.cli.outputsPath}/FG_` + idx++ + "_" + path;
//   try {
//     fs.writeFileSync(path + ".DOT", flowGraph.saveDot());
//     // execSync(`dot -Tpng ${path + ".DOT"} -o ${path + ".png"}`);
//   } catch (err) {
//     console.error("File write failed:", err);
//   }
// }


// export const generateContextKey = (
//   objectContext: string,
//   instructionContext: string,
//   incomingPTAHash: string,
// ): string => {
//   return objectContext + instructionContext + incomingPTAHash;
// };

// export function popSet<T>(s: Set<T>): T {
//   for (const value of s) {
//     s.delete(value);
//     return value;
//   }
// }

export const printScopedSpace = (space: number) => {
  let res = "";
  for (let i = 0; i < space; i++) {
    res += i >= 2 && i % 2 === 0 ? "░" : " ";
  }
  return res;
};

export const printSpace = (space: number) => {
  let res = "";
  for (let i = 0; i < space; i++) {
    res += " ";
  }
  return res;
};

export function getRandomElement(set: Set<any>) {
  const array = Array.from(set);
  return array[Math.floor(Math.random() * array.length)];
}

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
    // paths: {
    //   "@assets/*": ["assets/*"],
    //   "@locale/*": ["locale/*"],
    //   "@dashboard/*": ["src/*"],
    //   "@test/*": ["testUtils/*"],
    // },
    // "paths": {
    //   "@excalidraw/excalidraw": ["packages/excalidraw/index.tsx"],
    //   "@excalidraw/utils": ["packages/utils/index.ts"],
    //   "@excalidraw/math": ["packages/math/index.ts"],
    //   "@excalidraw/excalidraw/*": ["packages/excalidraw/*"],
    //   "@excalidraw/utils/*": ["packages/utils/*"],
    //   "@excalidraw/math/*": ["packages/math/*"],
    // },
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

// export function resolveModuleImport(
//   source: string,
//   absoluteFilePath: string,
//   projectBasePath: string,
// ): string | undefined {
//   let nodeResolutionError;
//   // Try resolving using node.resolve
//   const command = `/home/meetesh/.nvm/versions/node/v20.18.0/bin/node -e "process.stdout.write(require.resolve('${source}', { paths: [ '${path.dirname(absoluteFilePath)}', '${projectBasePath}' ] }))" 2>/dev/null`;

//   try {
//     // Execute the command synchronously with the specified working directory
//     const result = execSync(command, {
//       cwd: projectBasePath,
//       encoding: "utf-8",
//     });
//     return result;
//   } catch (error) {
//     nodeResolutionError = error;
//   }
//   // Try resolution of possible NextJs aliased import
//   try {
//     const componentsData = fs.readFileSync(
//       `${projectBasePath}/components.json`,
//       "utf8",
//     );
//     const jsonData = JSON.parse(componentsData);
//     const declaredAliases = jsonData["aliases"];
//     const aliases = Object.keys(declaredAliases);
//     const performReplacement = (src, before, after) =>
//       src.startsWith(before) ? src.replace(before, `${after}`) : src;
//     let modifiedSource = source;
//     for (const key of aliases) {
//       const replacement = aliases[key];
//       if (modifiedSource.startsWith(key)) {
//         modifiedSource = performReplacement(modifiedSource, key, replacement);
//         break;
//       }
//     }
//     let final = performReplacement(modifiedSource, "@/", `${projectBasePath}/`);
//     // Handle relative imports
//     if (final.startsWith("./")) {
//       final = performReplacement(
//         final,
//         "./",
//         `${path.dirname(absoluteFilePath)}/`,
//       );
//       final = path.resolve(final);
//     }
//     // Handle relative imports
//     if (final.startsWith("../")) {
//       final = performReplacement(
//         final,
//         "../",
//         `${path.dirname(absoluteFilePath)}/../`,
//       );
//       final = path.resolve(final);
//     }
//     const searchDir = path.dirname(final);
//     const command = `find ${searchDir} -type f -name '${path.basename(final)}.*'`;
//     // Execute the command synchronously with the specified working directory
//     // console.log(`(${source}) Executed: ${command}`)
//     const result = execSync(command, {
//       cwd: projectBasePath,
//       encoding: "utf-8", // Get the output as a string
//     });
//     const parsedResult = result.split("\n");
//     // Preserve only valid candidates
//     const basename = path.basename(final);
//     const regex = new RegExp(`^${basename}\\.[^.]+$`);
//     const candidates = parsedResult.filter((item) =>
//       regex.test(path.basename(item)),
//     );
//     if (candidates.length !== 1) {
//       throw new Error(result);
//     }
//     // Ensure file exists
//     if (!fs.existsSync(candidates[0])) {
//       throw new Error();
//     }
//     return candidates[0];
//   } catch (e) {
//     // Log any errors or standard error output
//     debugConfig.logger.error(
//       `======================= IMPORT ERR =====================`,
//     );
//     debugConfig.logger.error(`command: ${command}`);
//     debugConfig.logger.error(`Working with: ${absoluteFilePath}`);

//     debugConfig.logger.error(
//       `Import resolution failed for specifier ${source}`,
//     );
//     if (nodeResolutionError.stderr) {
//       debugConfig.logger.error(
//         `Node ERR: ${nodeResolutionError.stderr.toString()}`,
//       );
//     }
//     debugConfig.logger.error(`NextJs ERR: ${e}`);
//     debugConfig.logger.error(
//       `======================= XXXXXXXXXX =====================`,
//     );
//   }
//   return undefined;
// }
