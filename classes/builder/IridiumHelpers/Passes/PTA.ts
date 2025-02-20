// 
// Combine all return statements in functions
// 

import debugConfig from "#debugConfig";
import { generateContextKey, hashGraph, popSet } from "#utils";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { IS_ClassStaticPropInit } from "../ALL_IS/IS_ClassStaticPropInit.ts";
import { IS_AExport, IS_BExport, IS_BImport, IS_CExport, IS_DExport, IS_EExport } from "../ALL_IS/IS_Imports_Exports.ts";
import { IS1_AssignmentStmt, IS1_DeclarationStmt } from "../ALL_IS/IS_VarDecl.ts";
import { BB } from "../BB.ts";
import { IRIDIUM_FG } from "../IRIDIUM.ts";

import GLIB from "#graphlib";
import { Environment } from "../I_GENERAL/I_Environment.ts";
import { handleSimpleAssignmentStatement } from "./PTA/handleAssignments.ts";
import { DummyObject, GlobalNode, ImportNode, KnownFunctionNode, ModuleExportsNode, StackNode } from "./PTA/nodes.ts";
import { PTAGraph } from "./PTA/PTAGraph.ts";
import { PTARecorder } from "./PTA/PTARecorder.ts";
import { handleRVals } from "./PTA/rvalHandler.ts";
import { getHeapQualifiedName, getStackQualifiedName } from "./PTA/util.ts";
import { IV_StringLiteral } from "../ALL_RVal/IV_Literals.ts";

const STATE_CURBING: boolean = true;

type BBIdx = string;
let getBBIdx = (bb: BB): BBIdx => '' + bb.idx;

const FLOW_CONTEXT: Map<string, PTAGraph | null> = new Map();

export const PTA_IN_RES : Map<string, PTAGraph> = new Map();
export const PTA_OUT_RES : Map<string, PTAGraph> = new Map();

export function startPTA(rootFG: IRIDIUM_FG) {
  // Initialize Boundary PTA
  let BOUNDARY_PTAGRAPH = new PTAGraph()
  for (let [o, _] of rootFG.rootBB.env.parent.bindings) {
    let stackNode = new StackNode("ENV0$" + o);
    BOUNDARY_PTAGRAPH.declareNode(stackNode);
    let heapNode = new GlobalNode(o);
    BOUNDARY_PTAGRAPH.declareNode(heapNode);
    BOUNDARY_PTAGRAPH.drawStackToHeapEdge(stackNode, [heapNode]);
  }

  let reactDomNode = new ImportNode("react-dom/client", new IV_StringLiteral(undefined, "react-dom/client"), true);
  BOUNDARY_PTAGRAPH.declareNode(reactDomNode);

  let createRoot = new KnownFunctionNode("createRoot", 0);
  BOUNDARY_PTAGRAPH.declareNode(createRoot);

  BOUNDARY_PTAGRAPH.drawHeapToHeapEdge([reactDomNode], [createRoot], ['createRoot'], true);

  let exports = new ModuleExportsNode("EXPORT");
  BOUNDARY_PTAGRAPH.declareNode(exports);

  ContextualPTAHandler("$", "$", BOUNDARY_PTAGRAPH, rootFG)
}

const curbStateContext = (rootState: Environment, fg: PTAGraph) => {
  // 
  // envs from future that are children of the rootState must not be curbed, this will cause unnecessary computation to take place
  // 

  let toRemove: Array<StackNode> = new Array();
  let checkReachableDown = (currEnv: Environment, targetEnvIdx: number) => {
    if (!currEnv) return false;
    if (currEnv.idx === targetEnvIdx) return true;
    return checkReachableDown(currEnv.parent, targetEnvIdx)
  }

  let checkReachableUp = (currEnv: Environment, targetEnvIdx: number) => {
    if (!currEnv) return false;
    if (currEnv.idx === targetEnvIdx) return true;
    for (let c of currEnv.children) {
      if (checkReachableUp(c, targetEnvIdx)) return true;
    }
    return false;
  }

  for (let n of fg.nodeMap.values()) {
    if (n instanceof StackNode) {
      let envID = parseInt(n.id.split("$")[0].slice(3));
      if (checkReachableDown(rootState, envID) === false && checkReachableUp(rootState, envID) === false) {
        toRemove.push(n);
      }
    }
  }
  toRemove.forEach(n => fg.removePTANode(n))
}

export function ContextualPTAHandler(objContext: string, iContext: string, incomingFG: PTAGraph, fg: IRIDIUM_FG) {
  if (STATE_CURBING) curbStateContext(fg.rootBB.env, incomingFG);

  let graphHash = hashGraph(incomingFG);
  let contextKey = generateContextKey(objContext, iContext, graphHash);

  if (!FLOW_CONTEXT.has(contextKey)) {
    FLOW_CONTEXT.set(contextKey, null);
    let result = PTA(fg, incomingFG);
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
  if (rootFG.sources().length !== 1) debugConfig.logger.throwIriError("Expected exactly one root inside a flowgraph")

  // Initialize flowMap and worklist
  let worklist: Set<BBIdx> = new Set()
  let flowMap: Map<BBIdx, PTAGraph> = new Map()
  rootFG.nodes().forEach((bbIdx: BBIdx) => flowMap.set(bbIdx, new PTAGraph()));

  let recorder = new PTARecorder()
  let step = 1

  // Do one pass in DTree order, this will ensure all defs dominate uses...
  let dTree = GLIB.alg.dominatorTarjan(rootFG, '' + rootFG.rootBB.idx, false)

  let visited = new Set();
  let dfsOrder: Array<string> = []
  // DFS function
  let visitDFS = (node) => {
    visited.add(node); // Mark node as visited
    dfsOrder.push(node);

    // Visit successors in DFS
    let successors = dTree.successors(node);
    if (successors) {
      for (let succ of successors) {
        if (visited.has(succ)) continue; // Skip already visited nodes
        visitDFS(succ); // Recursive DFS call
      }
    }
  }

  visitDFS('' + rootFG.rootBB.idx)

  let doWorklist = (currBBIDx: string) => {
    step++;
    // Incoming Set
    let nextGraph: PTAGraph = new PTAGraph()
    let preds = rootFG.predecessors(currBBIDx)
    if (preds && preds.length > 0) {
      // Node has predecessors
      nextGraph.union(...preds.map((bbIdx: BBIdx) => flowMap.get(bbIdx)))
    } else {
      nextGraph.union(...[BOUNDARY_PTAGRAPH])
    }

    let inGraph = new PTAGraph()
    inGraph.union(nextGraph)
    PTA_IN_RES.set(currBBIDx, inGraph)

    // Flow Function 
    flowFunction(rootFG, nextGraph, currBBIDx, step);

    PTA_OUT_RES.set(currBBIDx, nextGraph)

    // Add successors to worklist if there was a change
    if (!flowMap.has(currBBIDx)) throw new Error("Expected flowmap to have a graph for each node");
    let oldGraph = flowMap.get(currBBIDx)
    if (!oldGraph.equals(nextGraph)) {
      flowMap.set(currBBIDx, nextGraph);
      let succ = rootFG.successors(currBBIDx)
      if (succ) succ.forEach((bbIdx: BBIdx) => worklist.add(bbIdx))
    }
  }

  for (let currBBIDx of dfsOrder) {
    doWorklist(currBBIDx);
  }

  // Start working on the worklist
  while (worklist.size > 0) {
    doWorklist(popSet(worklist));
  }

  // Send back the sink, we need it to merge closures!!!!
  let sinks = rootFG.sinks();
  if (sinks.length !== 1) debugConfig.logger.throwIriError("Expected exactly one sink in PTA!!")
  let sinkPTA = flowMap.get(sinks[0])
  return sinkPTA;
}

function flowFunction(rootFG: IRIDIUM_FG, nextGraph: PTAGraph, currBBIDx: BBIdx, step: number) {
  let currBB = rootFG.getBBNode(currBBIDx)
  let stackInstOffset = 0
  for (let i of currBB.statements) {
    stackInstOffset++;
    if (i instanceof IS_BImport) {
      // import { remote as local } from FROM
      let stackID = getStackQualifiedName(i.local.lookupName(), currBB);
      let stackNode = new StackNode(stackID);
      nextGraph.declareNode(stackNode);

      // 
      // ImportNode
      // 
      let heapNode = new ImportNode(i.FROM.value, i.FROM, true);
      nextGraph.declareNode(heapNode);
      nextGraph.clearSuccessors(stackNode.id);

      let remoteLookupID = i.remote instanceof IV_Identifier ? i.remote.lookupName() : i.remote.value;

      if (i.FROM.value === "react-dom/client" && remoteLookupID === "createRoot") {
        console.log("Skipping adding createRoot --> react-dom/client DUMMY")
        nextGraph.drawStackToHeapEdge(stackNode, [nextGraph.getPTANode("createRoot")]);
      } else {
        if (!nextGraph.hasField(heapNode.id, remoteLookupID)) nextGraph.addField(heapNode.id, remoteLookupID);
        let remoteDummyNode = new DummyObject(getHeapQualifiedName(remoteLookupID, currBBIDx, stackInstOffset));
        nextGraph.declareNode(remoteDummyNode);
  
        nextGraph.drawHeapToHeapEdge([heapNode], [remoteDummyNode], [remoteLookupID], true);
        nextGraph.drawStackToHeapEdge(stackNode, [remoteDummyNode]);
      }
      
    } else if (i instanceof IS_ClassStaticPropInit) {
      debugConfig.logger.throwIriError("PTA TODO: IS_ClassStaticPropInit")
      // // obj[prop] = rval
      // // obj.prop = rval
      // let rValID = getStackQualifiedName(i.RVal.lookupName(), currBB)
      // nextGraph.ensureNode(rValID)

      // let rValPointees = nextGraph.getPointees(rValID)

      // // handleMemberAssignment(nextGraph, i.obj.lookupName(), rValPointees, i.prop.lookupName(), i.computed);
    } else if (i instanceof IS1_DeclarationStmt) {
      let qualifiedLVal = getStackQualifiedName(i.LVal.lookupName(), currBB)
      handleSimpleAssignmentStatement(nextGraph, qualifiedLVal, handleRVals(nextGraph, i.RVal, currBB, currBBIDx, stackInstOffset))
    } else if (i instanceof IS1_AssignmentStmt) {
      if (i.LVal instanceof IV_Identifier) {
        let qualifiedLVal = getStackQualifiedName(i.LVal.lookupName(), currBB)
        handleSimpleAssignmentStatement(nextGraph, qualifiedLVal, handleRVals(nextGraph, i.RVal, currBB, currBBIDx, stackInstOffset))
      } else {
        debugConfig.logger.throwIriError("PTA TODO: Assignment with destructured assignment")
      }
    } else if (i instanceof IS_AExport) {
      // export default ID
      let heapNode = nextGraph.getPTANode("EXPORT");
      let pointees = nextGraph.getPointees(getStackQualifiedName(i.id.lookupName(), currBB));
      nextGraph.drawHeapToHeapEdge([heapNode], pointees, ["default"], true);
    } else if (i instanceof IS_BExport) {
      // Export local as remote
      let pointees = nextGraph.getPointees(getStackQualifiedName(i.local.lookupName(), currBB));
      let heapNode = nextGraph.getPTANode("EXPORT");

      let remote : string;
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