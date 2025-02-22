//
// Combine all return statements in functions
//

import debugConfig from "#debugConfig";
import { generateContextKey, hashGraph, popSet } from "#utils";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { IS_ClassStaticPropInit } from "../ALL_IS/IS_ClassStaticPropInit.ts";
import {
  IS_AExport,
  IS_BExport,
  IS_BImport,
  IS_CExport,
  IS_DExport,
  IS_EExport,
} from "../ALL_IS/IS_Imports_Exports.ts";
import {
  IS1_AssignmentStmt,
  IS1_DeclarationStmt,
} from "../ALL_IS/IS_VarDecl.ts";

import GLIB from "#graphlib";
import { IV_StringLiteral } from "../ALL_RVal/IV_Literals.ts";
import { Environment } from "../I_GENERAL/I_Environment.ts";
import {
  handleBImportNode,
  handleSimpleAssignmentStatement,
} from "./PTA/handlers.ts";
import { IRIDIUM_FG } from "./PTA/IRIDIUM_FG.ts";
import {
  GlobalNode,
  ImportNode,
  KnownFunctionNode,
  ModuleExportsNode,
  StackNode,
} from "./PTA/nodes.ts";
import { PTAGraph } from "./PTA/PTAGraph.ts";
import { handleRVals } from "./PTA/rvalHandler.ts";
import { getStackQualifiedName } from "./PTA/util.ts";

const STATE_CURBING: boolean = true;

type BBIdx = string;

const FLOW_CONTEXT: Map<string, PTAGraph | null> = new Map();

export const PTA_IN_RES: Map<string, PTAGraph> = new Map();
export const PTA_OUT_RES: Map<string, PTAGraph> = new Map();

export function startPTA(rootFG: IRIDIUM_FG) {
  const rootBBIdx: string = "" + rootFG.rootBB.idx;
  if (PTA_IN_RES.has(rootBBIdx)) {
    const BOUNDARY_PTAGRAPH = PTA_IN_RES.get(rootBBIdx);
    ContextualPTAHandler(rootBBIdx, "$", BOUNDARY_PTAGRAPH, rootFG);
  } else {
    // Initialize Boundary PTA
    const BOUNDARY_PTAGRAPH = new PTAGraph();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [o, _] of rootFG.rootBB.env.parent.bindings) {
      const stackNode = new StackNode("ENV0$" + o);
      BOUNDARY_PTAGRAPH.declareNode(stackNode);
      const heapNode = new GlobalNode(o);
      BOUNDARY_PTAGRAPH.declareNode(heapNode);
      BOUNDARY_PTAGRAPH.drawStackToHeapEdge(stackNode, [heapNode]);
    }

    const reactDomNode = new ImportNode(
      "react-dom/client",
      new IV_StringLiteral(undefined, "react-dom/client"),
      true,
    );
    BOUNDARY_PTAGRAPH.declareNode(reactDomNode);

    const createRoot = new KnownFunctionNode("createRoot", 0);
    BOUNDARY_PTAGRAPH.declareNode(createRoot);

    BOUNDARY_PTAGRAPH.drawHeapToHeapEdge(
      [reactDomNode],
      [createRoot],
      ["createRoot"],
      true,
    );

    const exports = new ModuleExportsNode("EXPORT");
    BOUNDARY_PTAGRAPH.declareNode(exports);

    ContextualPTAHandler(rootBBIdx, "$", BOUNDARY_PTAGRAPH, rootFG);
  }
}

const curbStateContext = (rootState: Environment, fg: PTAGraph) => {
  //
  // envs from future that are children of the rootState must not be curbed, this will cause unnecessary computation to take place
  //

  const toRemove: Array<StackNode> = [];
  const checkReachableDown = (currEnv: Environment, targetEnvIdx: number) => {
    if (!currEnv) return false;
    if (currEnv.idx === targetEnvIdx) return true;
    return checkReachableDown(currEnv.parent, targetEnvIdx);
  };

  const checkReachableUp = (currEnv: Environment, targetEnvIdx: number) => {
    if (!currEnv) return false;
    if (currEnv.idx === targetEnvIdx) return true;
    for (const c of currEnv.children) {
      if (checkReachableUp(c, targetEnvIdx)) return true;
    }
    return false;
  };

  for (const n of fg.nodeMap.values()) {
    if (n instanceof StackNode) {
      const envID = parseInt(n.id.split("$")[0].slice(3));
      if (
        checkReachableDown(rootState, envID) === false &&
        checkReachableUp(rootState, envID) === false
      ) {
        toRemove.push(n);
      }
    }
  }
  toRemove.forEach((n) => fg.removePTANode(n));
};

export function ContextualPTAHandler(
  objContext: string,
  iContext: string,
  incomingFG: PTAGraph,
  fg: IRIDIUM_FG,
) {
  if (STATE_CURBING) curbStateContext(fg.rootBB.env, incomingFG);

  const graphHash = hashGraph(incomingFG);
  const contextKey = generateContextKey(objContext, iContext, graphHash);

  if (!FLOW_CONTEXT.has(contextKey)) {
    FLOW_CONTEXT.set(contextKey, null);
    const result = PTA(fg, incomingFG);
    FLOW_CONTEXT.set(contextKey, result);
    return result;
  } else if (FLOW_CONTEXT.get(contextKey) === null) {
    return incomingFG;
  } else {
    return FLOW_CONTEXT.get(contextKey);
  }
}

export function PTA(rootFG: IRIDIUM_FG, BOUNDARY_PTAGRAPH: PTAGraph) {
  // Assert that there is only one source in the flowgraph
  if (rootFG.sources().length !== 1)
    debugConfig.logger.throwIriError(
      "Expected exactly one root inside a flowgraph",
    );

  // Initialize flowMap and worklist
  const worklist: Set<BBIdx> = new Set();
  const flowMap: Map<BBIdx, PTAGraph> = new Map();
  rootFG.nodes().forEach((bbIdx: BBIdx) => flowMap.set(bbIdx, new PTAGraph()));

  let step = 0;

  // Do one pass in DTree order, this will ensure all defs dominate uses...
  const dTree = GLIB.alg.dominatorTarjan(rootFG, "" + rootFG.rootBB.idx, false);

  const visited = new Set();
  const dfsOrder: Array<string> = [];
  // DFS function
  const visitDFS = (node) => {
    visited.add(node); // Mark node as visited
    dfsOrder.push(node);

    // Visit successors in DFS
    const successors = dTree.successors(node);
    if (successors) {
      for (const succ of successors) {
        if (visited.has(succ)) continue; // Skip already visited nodes
        visitDFS(succ); // Recursive DFS call
      }
    }
  };

  visitDFS("" + rootFG.rootBB.idx);

  const doWorklist = (currBBIDx: string) => {
    step++;
    // Incoming Set
    const nextGraph: PTAGraph = new PTAGraph();
    const preds = rootFG.predecessors(currBBIDx);
    if (preds && preds.length > 0) {
      // Node has predecessors
      nextGraph.union(...preds.map((bbIdx: BBIdx) => flowMap.get(bbIdx)));
    } else {
      nextGraph.union(...[BOUNDARY_PTAGRAPH]);
    }

    const inGraph = new PTAGraph();
    inGraph.union(nextGraph);
    PTA_IN_RES.set(currBBIDx, inGraph);

    // Flow Function
    flowFunction(rootFG, nextGraph, currBBIDx, step);

    PTA_OUT_RES.set(currBBIDx, nextGraph);

    // Add successors to worklist if there was a change
    if (!flowMap.has(currBBIDx))
      throw new Error("Expected flowmap to have a graph for each node");
    const oldGraph = flowMap.get(currBBIDx);
    if (!oldGraph.equals(nextGraph)) {
      flowMap.set(currBBIDx, nextGraph);
      const succ = rootFG.successors(currBBIDx);
      if (succ) succ.forEach((bbIdx: BBIdx) => worklist.add(bbIdx));
    }
  };

  for (const currBBIDx of dfsOrder) {
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
}

function flowFunction(
  rootFG: IRIDIUM_FG,
  nextGraph: PTAGraph,
  currBBIDx: BBIdx,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _step: number,
) {
  const currBB = rootFG.getBBNode(currBBIDx);
  let stackInstOffset = 0;
  for (const i of currBB.statements) {
    stackInstOffset++;
    if (i instanceof IS_BImport) {
      handleBImportNode(nextGraph, i, currBB, currBBIDx, stackInstOffset);
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
      handleSimpleAssignmentStatement(
        nextGraph,
        qualifiedLVal,
        handleRVals(nextGraph, i.RVal, currBB, currBBIDx, stackInstOffset),
      );
    } else if (i instanceof IS1_AssignmentStmt) {
      if (i.LVal instanceof IV_Identifier) {
        const qualifiedLVal = getStackQualifiedName(
          i.LVal.lookupName(),
          currBB,
        );
        handleSimpleAssignmentStatement(
          nextGraph,
          qualifiedLVal,
          handleRVals(nextGraph, i.RVal, currBB, currBBIDx, stackInstOffset),
        );
      } else {
        debugConfig.logger.error("Assignment with destructured assignment");
      }
    } else if (i instanceof IS_AExport) {
      // export default ID
      const heapNode = nextGraph.getPTANode("EXPORT");
      const pointees = nextGraph.getPointees(
        getStackQualifiedName(i.id.lookupName(), currBB),
      );
      nextGraph.drawHeapToHeapEdge([heapNode], pointees, ["default"], true);
    } else if (i instanceof IS_BExport) {
      // Export local as remote
      const pointees = nextGraph.getPointees(
        getStackQualifiedName(i.local.lookupName(), currBB),
      );
      const heapNode = nextGraph.getPTANode("EXPORT");

      let remote: string;
      if (i.remote instanceof IV_Identifier) remote = i.remote.lookupName();
      else remote = i.remote.value;

      nextGraph.drawHeapToHeapEdge([heapNode], pointees, [remote], true);
    } else if (i instanceof IS_CExport) {
      debugConfig.logger.throwIriError("PTA: IS_CExport not yet supported");
    } else if (i instanceof IS_DExport) {
      debugConfig.logger.throwIriError("PTA: IS_DExport not yet supported");
    } else if (i instanceof IS_EExport) {
      debugConfig.logger.throwIriError("PTA: IS_EExport not yet supported");
    }
  }
}
