import debugConfig from "#debugConfig";
import GLIB from "#graphlib";
import { popSet } from "#utils";
import {
  isIdentifier
} from "@babel/types";
import { isJS3AssnObjectProperty, isJS3ObjectPattern } from "classes/builder/JS3Helpers/JS3Types.ts";
import assert from "node:assert";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { IS_ClassStaticPropInit } from "../ALL_IS/IS_ClassStaticPropInit.ts";
import {
  IS_AExport,
  IS_AImport,
  IS_BExport,
  IS_BImport,
  IS_CExport,
  IS_CImport,
  IS_DExport,
  IS_EExport,
} from "../ALL_IS/IS_Imports_Exports.ts";
import {
  IS1_AssignmentStmt,
  IS1_DeclarationStmt,
} from "../ALL_IS/IS_VarDecl.ts";
import { IRIDIUM_FG } from "../I_GENERAL/IRIDIUM_FG.ts";
import {
  addHeapEdges,
  addPTANode,
  addStackEdges,
  arePTAFlowDataEqual,
  ensureNodeIDAndGetPTANode,
  ensureNodeIDAndGetStackNode,
  getAllFields,
  getPointees,
  GLOBAL_NODE_MAP,
  IRIDUM_GLOBAL,
  NewPTAFlowData,
  OrdinaryObjectNode,
  PTAEdge,
  PTAFlowData,
  StackNode,
  unionAllPTAFlowData
} from "./PTA_STUFF/PTAFlowData.ts";
import {
  handleAExportNode,
  handleArrayDestructuringAssignmentStatement,
  handleBExportNode,
  handleBImportNode,
  handleCExportNode,
  handleCImportNode,
  handleEExportNode,
  handleFieldAssignmentStatement,
  handleFieldReference,
  handleObjectDestructuringAssignmentStatement,
  handleSimpleAssignmentStatement,
} from "./PTA_STUFF/PTAHandlers.ts";
import { handleRVals } from "./PTA_STUFF/RValHandlers.ts";
import { getHeapQualifiedName, getStackQualifiedName } from "./PTA_STUFF/util.ts";
import { IS_Noop } from "../ALL_IS/ALL_IS.ts";
import { traverseInstructionRecDepthFirst } from "../Visitors/traverse.ts";
import { IS_Throw } from "../ALL_IS/IS_Debugger_Return_Throw.ts";
import { IS_Break } from "../ALL_IS/IS_Break.ts";
import { IS_Continue } from "../ALL_IS/IS_Continue.ts";

// const assert = (val) => {
//   if (!val) {
//     console.log("Assertion Failed");
//   } 
// }

//
// A world can be in three states:
//  1. !PTA_WORLD.has()            ===> Not Seen Before
//  2. !PTA_WORLD.has() && isNull  ===> Under Process
//  3. !PTA_WORLD.has() && !isNull ===> Processed
//
export const PTA_WORLD: Map<string, PTAFlowData> = new Map();
export const PTA_WORLD_FG: Map<string, IRIDIUM_FG> = new Map();
export const PTA_WORLD_CURRMUTABLE_DATA: Map<string, Array<PTAFlowData>> = new Map();
export const PTA_HASH_MAP: Map<string, PTAFlowData> = new Map();

export const getEXPORTID = (uname: string) => { return `${uname}_EXPORT`; }

export const initializeWorld = (uname: string, fg: IRIDIUM_FG) => {
  PTA_WORLD.set(uname, null);
  PTA_WORLD_FG.set(uname, fg);
  const initialWorldData: PTAFlowData = NewPTAFlowData();
  const globalEnv = fg.rootBB.env.parent;

  for (const binding of globalEnv.bindings) {
    const globalNode = GLOBAL_NODE_MAP.has(binding[0])
      ? GLOBAL_NODE_MAP.get(binding[0])
      : new IRIDUM_GLOBAL(binding[0], uname);
    assert(globalNode instanceof IRIDUM_GLOBAL);
  
    addPTANode(initialWorldData, globalNode);
    initialWorldData.get(globalNode.id).add(PTAEdge.constructHeapEdge(globalNode.id, "*", "E", globalNode.id).getPTAEdge());

    const refToBinding = getStackQualifiedName(binding[0], fg.rootBB);
    const stackNode = GLOBAL_NODE_MAP.has(refToBinding)
      ? GLOBAL_NODE_MAP.get(refToBinding)
      : new StackNode(refToBinding, uname);
    assert(stackNode instanceof StackNode);
    addPTANode(initialWorldData, stackNode);

    addStackEdges(initialWorldData, stackNode, [globalNode]);
  }

  const exportID = getEXPORTID(uname);

  const exportNode = GLOBAL_NODE_MAP.has(exportID)
    ? GLOBAL_NODE_MAP.get(exportID)
    : new OrdinaryObjectNode(exportID, uname);
  assert(exportNode instanceof OrdinaryObjectNode);

  addPTANode(initialWorldData, exportNode);

  PTA_WORLD.set(uname, PTA(uname, fg, initialWorldData));
  PTA_WORLD_CURRMUTABLE_DATA.set(uname, []);
};

function reversePostOrder(graph: GLIB.Graph, root: string) {
  const visited: Set<string> = new Set();
  const result: Array<string> = [];

  function dfs(node) {
    if (visited.has(node)) return;
    visited.add(node);

    const neighbors = graph.successors(node) || [];
    for (const neighbor of neighbors) {
      dfs(neighbor);
    }
    
    result.push(node); // post-order: add after visiting children
  }

  dfs(root);
  return result.reverse(); // reverse post-order
}

type BBIdx = string;
export const PTA = (
  uname: string,
  rootFG: IRIDIUM_FG,
  BOUNDARY_PTAGRAPH: PTAFlowData,
) => {
  if (!PTA_WORLD_CURRMUTABLE_DATA.has(uname)) PTA_WORLD_CURRMUTABLE_DATA.set(uname, []);
  // Assert that there is only one source in the flowgraph
  if (rootFG.sources().length !== 1)
    debugConfig.logger.throwIriError(
      "Expected exactly one root inside a flowgraph",
    );

  // Initialize flowMap and worklist
  const worklist: Set<BBIdx> = new Set();
  const flowMap: Map<BBIdx, PTAFlowData> = new Map();
  rootFG
    .nodes()
    .forEach((bbIdx: BBIdx) => flowMap.set(bbIdx, NewPTAFlowData()));

  // Do one pass in DTree order, this will ensure all defs dominate uses...
  // const dTree = GLIB.alg.dominatorTarjan(rootFG, "" + rootFG.rootBB.idx, false);

  // const visited = new Set();
  // const dfsOrder: Array<string> = [];
  // // DFS function
  // const visitDFS = (node) => {
  //   visited.add(node); // Mark node as visited
  //   dfsOrder.push(node);

  //   // Visit successors in DFS
  //   const successors = dTree.successors(node);
  //   if (successors) {
  //     for (const succ of successors) {
  //       if (visited.has(succ)) continue; // Skip already visited nodes
  //       visitDFS(succ); // Recursive DFS call
  //     }
  //   }
  // };

  // visitDFS("" + rootFG.rootBB.idx);

  const doWorklist = (currBBIDx: string) => {
    // Incoming Set
    let nextGraph: PTAFlowData;
    const preds = rootFG.predecessors(currBBIDx);
    if (preds && preds.length > 0) {
      nextGraph = unionAllPTAFlowData(
        ...preds.map((bbIdx: BBIdx) => flowMap.get(bbIdx)),
      );
    } else {
      nextGraph = unionAllPTAFlowData(...[BOUNDARY_PTAGRAPH]);
    }

    PTA_WORLD_CURRMUTABLE_DATA.get(uname).push(nextGraph);
    flowFunction(uname, rootFG, nextGraph, currBBIDx);
    PTA_WORLD_CURRMUTABLE_DATA.get(uname).pop();

    // Add successors to worklist if there was a change
    if (!flowMap.has(currBBIDx))
      throw new Error("Expected flowmap to have a graph for each node");
    const oldGraph = flowMap.get(currBBIDx);
    if (!arePTAFlowDataEqual(nextGraph, oldGraph)) {
      flowMap.set(currBBIDx, nextGraph);
      const succ = rootFG.successors(currBBIDx);
      if (succ) succ.forEach((bbIdx: BBIdx) => worklist.add(bbIdx));
    }
  };

  // Visit all nodes in reverse post order
  const firstTraversalOrder = reversePostOrder(rootFG, "" + rootFG.rootBB.idx);

  for (const currBBIDx of firstTraversalOrder) {
    doWorklist(currBBIDx);
  }

  // Start working on the worklist
  while (worklist.size > 0) {
    doWorklist(popSet(worklist));
  }

  // Send back the sink, we need it to merge closures!!!!
  const sinks = rootFG.sinks();
  if (sinks.length !== 1)
    debugConfig.logger.throwIriError("Expected exactly one sink in PTA!!");
  const sinkPTA = flowMap.get(sinks[0]);
  return sinkPTA;
};



// Flow Functions operates on a mutable data structure,
// this is done to allow batch to the otherwise immutable dataflow data.
export const flowFunction = (
  uname: string,
  rootFG: IRIDIUM_FG,
  mutableFlowData: PTAFlowData,
  currBBIDx: string,
) => {
  const currBB = rootFG.getBBNode(currBBIDx);
  let stackInstOffset = 0;
  for (const i of currBB.statements) {
    // debugConfig.logger.error(`At stmt ${i.toString()}`);

    if (i instanceof IS_BImport) {
      handleBImportNode(uname, mutableFlowData, i, currBB, currBBIDx, stackInstOffset);
    } else if (i instanceof IS_CImport) {
      handleCImportNode(uname, mutableFlowData, i, currBB, currBBIDx, stackInstOffset);
    } else if (i instanceof IS_ClassStaticPropInit) {
      debugConfig.logger.throwIriError("PTA TODO: IS_ClassStaticPropInit");
      // // obj[prop] = rval
      // // obj.prop = rval
      // let rValID = getStackQualifiedName(i.RVal.lookupName(), currBB)
      // nextGraph.ensureNode(rValID)

      // let rValPointees = nextGraph.getPointees(rValID)

      // // handleMemberAssignment(nextGraph, i.obj.lookupName(), rValPointees, i.prop.lookupName(), i.computed);
    } else if (i instanceof IS1_DeclarationStmt) {
      const qualifiedLVal = getStackQualifiedName(i.LVal.lookupName(), currBB);
      const RValPointees = handleRVals(
        uname,
        mutableFlowData,
        i.RVal,
        currBB,
        currBBIDx,
        stackInstOffset,
      );
      if (RValPointees.length === 0) 
        debugConfig.logger.throwIriError("RValPointees can never be zero");
      handleSimpleAssignmentStatement(
        uname,
        mutableFlowData,
        qualifiedLVal,
        RValPointees,
      );
    } else if (i instanceof IS1_AssignmentStmt) {
      const RValPointees = handleRVals(
        uname,
        mutableFlowData,
        i.RVal,
        currBB,
        currBBIDx,
        stackInstOffset,
      );
      if (RValPointees.length === 0) 
        debugConfig.logger.throwIriError("RValPointees can never be zero");
      if (i.LVal instanceof IV_Identifier) {
        const lookupName = i.LVal.lookupName();
        const qualifiedLVal = getStackQualifiedName(lookupName, currBB);
        handleSimpleAssignmentStatement(
          uname,
          mutableFlowData,
          qualifiedLVal,
          RValPointees,
        );
      } else if (isJS3ObjectPattern(i.LVal)) {
        handleObjectDestructuringAssignmentStatement(
          uname,
          mutableFlowData,
          i.LVal.properties,
          RValPointees,
          currBB,
          currBBIDx,
          stackInstOffset
        );
      } else {
        handleArrayDestructuringAssignmentStatement(
          uname,
          mutableFlowData,
          i.LVal.elements,
          RValPointees,
          currBB,
          currBBIDx,
          stackInstOffset
        );
      }
    } else if (i instanceof IS_AExport) {
      handleAExportNode(uname, mutableFlowData, i, currBB);
    } else if (i instanceof IS_BExport) {
      handleBExportNode(uname, mutableFlowData, i, currBB);
    } else if (i instanceof IS_CExport) {
      handleCExportNode(uname, mutableFlowData, i, currBB, currBBIDx, stackInstOffset);
    } else if (i instanceof IS_DExport) {
      debugConfig.logger.throwIriError("PTA TODO: IS_DExport");
    } else if (i instanceof IS_EExport) {
      handleEExportNode(uname, mutableFlowData, i, currBB, currBBIDx, stackInstOffset);
    } else if (i instanceof IS_Noop) {
      /* NOOP */
    } else if (i instanceof IS_AImport) {
      /* NOOP */
    } else if (i instanceof IS_Throw) {
      /* NOOP */
    } else if (i instanceof IS_Break) {
      /* NOOP */
    } else if (i instanceof IS_Continue) {
      /* NOOP */
    }
    
    else {
      debugConfig.logger.throwIriError(`PTA TODO: UNHANDLED: ${i.toString()}`);
    }
    // debugConfig.logger.error(`After stmt ${i.toString()}`);
    // saveFlowDataToFile(`${currBBIDx}_${stackInstOffset}`, mutableFlowData)
    // printPTAFlowData(mutableFlowData);
    stackInstOffset++;
  }
};
