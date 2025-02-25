import { resolveModuleImport } from "#utils";
import { DummyObject, ImportNode, PTANode } from "./Passes/PTA/nodes.ts";
import { PTAGraph } from "./Passes/PTA/PTAGraph.ts";
import debugConfig from "#debugConfig";
import { RESOLUTION_CACHE } from "./IRIDIUM.ts";
import { ProjectFile } from "classes/ProjectFile.ts";
import JS3Builder from "../JS3Builder.ts";
import { I_Container } from "./I_GENERAL/I_Container.ts";

export const successorPTAClosure = (
  pta: PTAGraph,
  root: string,
  result: Set<string> = new Set(),
) => {
  result.add(root);
  const outEdges = pta.outEdges(root);
  if (outEdges)
    for (const e of outEdges)
      if (!result.has(e.w)) successorPTAClosure(pta, e.w, result);
  return result;
};

export const predecessorPTAClosure = (
  pta: PTAGraph,
  root: string,
  result: Set<string> = new Set(),
) => {
  result.add(root);
  const inEdges = pta.inEdges(root);
  if (inEdges)
    for (const e of inEdges)
      if (!result.has(e.v)) predecessorPTAClosure(pta, e.v, result);
  return result;
};

export const resolveSources = (
  rootSet: Array<PTANode> | Set<PTANode>,
  pta: PTAGraph,
) => {
  const res: Set<ImportNode> = new Set();

  for (const node of rootSet) {
    const r = node.id;
    const closure: Array<PTANode> = [...successorPTAClosure(pta, r)].map((e) =>
      pta.getPTANode(e),
    );
    const importNodes = closure.filter((n) => n instanceof ImportNode);
    const dummies = closure.filter((n) => n instanceof DummyObject);
    const dummyClosure: Set<string> = new Set();
    for (const d of dummies) {
      predecessorPTAClosure(pta, d.id).forEach((n) => dummyClosure.add(n));
    }

    dummyClosure.forEach((n) => {
      const curr = pta.getPTANode(n);
      if (curr instanceof ImportNode && !importNodes.includes(curr))
        importNodes.push(curr);
    });

    importNodes.forEach((n) => res.add(n));
  }
  return res;
};

export const handleResolvedSources = (
  resolvedSources: Set<ImportNode> | Array<ImportNode>,
  absFilePath: string,
  projBasePath: string,
  updateResolvedNode: (iNode: ImportNode, container: I_Container) => void,
  level: number,
) => {
  for (const iSource of resolvedSources) {
    const resolvedPath = resolveModuleImport(
      iSource.FROM.value,
      absFilePath,
      projBasePath,
    );
    try {
      if (
        resolvedPath.includes(
          "/home/meetesh/wd/Iridium/temp/frontendViz/node_modules/@mui/material/node/index.js",
        ) ||
        resolvedPath.includes("/@mui/material/node/styles/index.js") ||
        resolvedPath.includes("react-redux")
      ) {
        debugConfig.logger.log(`Skipping: ${resolvedPath}`);
        continue;
      }
      if (RESOLUTION_CACHE.has(resolvedPath)) {
        debugConfig.logger.log(`[CACHED]: ${resolvedPath}`);
        updateResolvedNode(iSource, RESOLUTION_CACHE.get(resolvedPath));
      } else {
        debugConfig.logger.log(
          `Resolving: ${iSource.FROM} --> ${resolvedPath}`,
        );
        // 1. Loading The File
        const projectFile = new ProjectFile(resolvedPath, projBasePath);
        projectFile.initSync(debugConfig.cli.sourceType);
        if (projectFile.initData.parseStatus !== "parsed")
          debugConfig.logger.throwJS3Error(
            "JS3: Failed to parse input file (there might be syntax errors or sourceType is set incorrectly)",
          );

        // 2. Constructing JS3
        const js3Builder = new JS3Builder(projectFile);
        js3Builder.build();
        const fileNode = js3Builder.generatedAST;
        const programNode = fileNode.program;

        // 3. Constructing Iridium
        const directives: Array<string> = [];
        programNode.directives.forEach((d) => directives.push(d.value.value));
        const sourceType = programNode.sourceType;
        const iri_container = new I_Container(
          fileNode,
          projectFile,
          js3Builder,
          directives,
          sourceType,
          debugConfig.cli.projectBase,
        );
        iri_container.build(level + 1);

        RESOLUTION_CACHE.set(resolvedPath, iri_container);

        updateResolvedNode(iSource, iri_container);
      }
    } catch (e) {
      debugConfig.logger.error("Failed to generate Iridium: ", e);
      process.exit(1);
    }
  }
};
