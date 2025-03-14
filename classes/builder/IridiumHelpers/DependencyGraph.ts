import { Graph } from "#graphlib";
import { IS_AImport, IS_BImport, IS_CExport, IS_CImport, IS_DExport, IS_EExport } from "./ALL_IS/IS_Imports_Exports.ts";
import { I_Container } from "./I_GENERAL/I_Container.ts";
import { IRIDIUM_FG } from "./I_GENERAL/IRIDIUM_FG.ts";
import { traverseInstruction } from "./Visitors/traverse.ts";
import debugConfig from "#debugConfig";
import { resolveModuleImport } from "#utils";
import { ALL_IS } from "./ALL_IS/ALL_IS.ts";
import { ProjectFile } from "classes/ProjectFile.ts";
import JS3Builder, { JS3BuilderUtils } from "../JS3Builder.ts";

export const DEPENDENCY_GRAPH = new Graph();
export const IRIDIUM_CONTAINER_MAP: Map<string, I_Container | null> = new Map();

export const IMPORT_STATEMENT_TARGETS: Map<ALL_IS, I_Container | null> = new Map();


// export const buildDependencyGraph = (container: I_Container, parentUtils: JS3BuilderUtils) => {
//   debugConfig.logger.log(`[Dependency Graph Size] ${DEPENDENCY_GRAPH.nodeCount()}`)

//   const currUname = container.js3Builder.projectFile.uname;
//   const importFilePath = container.js3Builder.projectFile.absoluteFilePath;
//   const fg = container.module.fg;
//   // debugConfig.logger.warn(`Dependency Graph Working on ${currUname}`)

//   IRIDIUM_CONTAINER_MAP.set(currUname, container);
//   DEPENDENCY_GRAPH.setNode(currUname);

//   const handleSuccess = (resolvedUname: string, cont: I_Container, msg: string = "first resolution") => {
//     // debugConfig.logger.warn(`  Add Edge ${currUname} --> ${resolvedUname} (${msg})`)
//     IRIDIUM_CONTAINER_MAP.set(resolvedUname, cont);
//     DEPENDENCY_GRAPH.setNode(resolvedUname);
//     DEPENDENCY_GRAPH.setEdge(currUname, resolvedUname);
//   }

//   const handleFailure = (unresolvedImport: string) => {
//     // debugConfig.logger.warn(`  Add Edge ${currUname} --> ${unresolvedImport} (unresolved)`)
//     IRIDIUM_CONTAINER_MAP.set(unresolvedImport, null);
//     DEPENDENCY_GRAPH.setNode(unresolvedImport);
//     DEPENDENCY_GRAPH.setEdge(currUname, unresolvedImport);
//   }

//   traverseInstruction(fg, (inst, bb) => {
//     if (
//       inst instanceof IS_AImport ||
//       inst instanceof IS_BImport ||
//       inst instanceof IS_CImport ||
//       inst instanceof IS_CExport ||
//       inst instanceof IS_DExport ||
//       inst instanceof IS_EExport
//     ) {
//       const toResolve = inst.FROM;
//       const filePath = resolveModuleImport(toResolve.value, importFilePath, debugConfig.cli.projectBase);

//       if (!filePath) {
//         handleFailure(toResolve.value);
//         IMPORT_STATEMENT_TARGETS.set(inst, null);
//         return;
//       }

//       try {
//         // 1. Loading The File
//         const projectFile = new ProjectFile(filePath, debugConfig.cli.projectBase);
//         projectFile.initSync(debugConfig.cli.sourceType);
//         if (projectFile.initData.parseStatus !== "parsed") {
//           handleFailure(toResolve.value);
//           IMPORT_STATEMENT_TARGETS.set(inst, null);
//           return;
//         }

//         if (IRIDIUM_CONTAINER_MAP.has(projectFile.uname)) {
//           const targetContainer = IRIDIUM_CONTAINER_MAP.get(projectFile.uname);
//           handleSuccess(projectFile.uname, targetContainer, "already resolved");
//           IMPORT_STATEMENT_TARGETS.set(inst, targetContainer);
//           return;
//         }
//         // 2. Constructing JS3
//         const js3Builder = new JS3Builder(projectFile);
//         js3Builder.build();
//         const fileNode = js3Builder.generatedAST;
//         const programNode = fileNode.program;

//         // 3. Constructing Iridium
//         const directives: Array<string> = [];
//         programNode.directives.forEach((d) => directives.push(d.value.value));
//         const sourceType = programNode.sourceType;
//         const targetContainer = new I_Container(
//           fileNode,
//           projectFile,
//           js3Builder,
//           parentUtils,
//           directives,
//           sourceType,
//           debugConfig.cli.projectBase,
//         );

//         targetContainer.build();

//         handleSuccess(projectFile.uname, targetContainer);
//         IMPORT_STATEMENT_TARGETS.set(inst, targetContainer);

//         // Recurse Depth First: 
//         buildDependencyGraph(targetContainer, parentUtils);
//       } catch(e) {
//         handleFailure(toResolve.value);
//         IMPORT_STATEMENT_TARGETS.set(inst, null);
//       }
//     }
//   })

// }

export const buildDependencyGraph = async (container: I_Container, parentUtils: JS3BuilderUtils) => {
  const currUname = container.js3Builder.projectFile.uname;
  const importFilePath = container.js3Builder.projectFile.absoluteFilePath;
  const fg = container.module.fg;

  IRIDIUM_CONTAINER_MAP.set(currUname, container);
  DEPENDENCY_GRAPH.setNode(currUname);

  const handleSuccess = (resolvedUname: string, cont: I_Container, msg: string = "first resolution") => {
    IRIDIUM_CONTAINER_MAP.set(resolvedUname, cont);
    DEPENDENCY_GRAPH.setNode(resolvedUname);
    DEPENDENCY_GRAPH.setEdge(currUname, resolvedUname);
  };

  const handleFailure = (unresolvedImport: string) => {
    IRIDIUM_CONTAINER_MAP.set(unresolvedImport, null);
    DEPENDENCY_GRAPH.setNode(unresolvedImport);
    DEPENDENCY_GRAPH.setEdge(currUname, unresolvedImport);
  };

  const tasks: Promise<void>[] = [];

  traverseInstruction(fg, (inst, bb) => {
    if (
      inst instanceof IS_AImport ||
      inst instanceof IS_BImport ||
      inst instanceof IS_CImport ||
      inst instanceof IS_CExport ||
      inst instanceof IS_DExport ||
      inst instanceof IS_EExport
    ) {
      const toResolve = inst.FROM;
      const filePath = resolveModuleImport(toResolve.value, importFilePath, debugConfig.cli.projectBase);

      if (!filePath) {
        handleFailure(toResolve.value);
        IMPORT_STATEMENT_TARGETS.set(inst, null);
        return;
      }

      const task = (async () => {
        try {
          const projectFile = new ProjectFile(filePath, debugConfig.cli.projectBase);
          projectFile.initSync(debugConfig.cli.sourceType);
          if (projectFile.initData.parseStatus !== "parsed") {
            handleFailure(toResolve.value);
            IMPORT_STATEMENT_TARGETS.set(inst, null);
            return;
          }

          if (IRIDIUM_CONTAINER_MAP.has(projectFile.uname)) {
            const targetContainer = IRIDIUM_CONTAINER_MAP.get(projectFile.uname);
            handleSuccess(projectFile.uname, targetContainer, "already resolved");
            IMPORT_STATEMENT_TARGETS.set(inst, targetContainer);
            return;
          }

          const js3Builder = new JS3Builder(projectFile);
          js3Builder.build();
          const fileNode = js3Builder.generatedAST;
          const programNode = fileNode.program;

          const directives: Array<string> = [];
          programNode.directives.forEach((d) => directives.push(d.value.value));
          const sourceType = programNode.sourceType;

          const targetContainer = new I_Container(
            fileNode,
            projectFile,
            js3Builder,
            parentUtils,
            directives,
            sourceType,
            debugConfig.cli.projectBase,
          );

          targetContainer.build();
          handleSuccess(projectFile.uname, targetContainer);
          IMPORT_STATEMENT_TARGETS.set(inst, targetContainer);

          await buildDependencyGraph(targetContainer, parentUtils); // Recurse in parallel
        } catch (e) {
          handleFailure(toResolve.value);
          IMPORT_STATEMENT_TARGETS.set(inst, null);
        }
      })();

      tasks.push(task);
    }
  });

  await Promise.all(tasks); // Wait for all tasks to complete
};