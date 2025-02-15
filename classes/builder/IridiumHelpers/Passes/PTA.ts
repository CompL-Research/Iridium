// 
// Combine all return statements in functions
// 

import debugConfig from "#debugConfig";
import { popSet } from "#utils";
import { execSync } from "node:child_process";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { IS_ClassStaticPropInit } from "../ALL_IS/IS_ClassStaticPropInit.ts";
import { IS_BImport } from "../ALL_IS/IS_Imports_Exports.ts";
import { IS1_AssignmentStmt, IS1_DeclarationStmt } from "../ALL_IS/IS_VarDecl.ts";
import { BB } from "../BB.ts";
import { IRIDIUM_FG } from "../IRIDIUM.ts";

import { handleSimpleAssignmentStatement } from "./PTA/handleAssignments.ts";
import { GlobalNode, ImportNode, StackNode } from "./PTA/nodes.ts";
import { PTAGraph } from "./PTA/PTAGraph.ts";
import { PTARecorder } from "./PTA/PTARecorder.ts";
import { handleRVals } from "./PTA/rvalHandler.ts";
import { getHeapQualifiedName, getStackQualifiedName } from "./PTA/util.ts";

import GLIB from "#graphlib";


type BBIdx = string;
let getBBIdx = (bb: BB): BBIdx => '' + bb.idx;

export function PTA(rootFG: IRIDIUM_FG, saveRecording: boolean, incomingFG: PTAGraph | undefined = undefined) {
  // Assert that there is only one source in the flowgraph
  if (rootFG.sources().length !== 1) debugConfig.logger.throwIriError("Expected exactly one root inside a flowgraph")

  // Initialize flowMap and worklist
  let worklist: Set<BBIdx> = new Set()
  let flowMap: Map<BBIdx, PTAGraph> = new Map()
  rootFG.nodes().forEach((bbIdx: BBIdx) => flowMap.set(bbIdx, new PTAGraph()));

  let recorder = new PTARecorder()

  let step = 1

  if (saveRecording) {
    try {
      execSync(`rm outputs/PTA/* 2>/dev/null`);
    } catch(e) {} finally {}
    recorder.init()
  }

  let BOUNDARY_PTAGRAPH : PTAGraph;

  // For handling closures
  if (!incomingFG) {
    // Initialize global objs
    BOUNDARY_PTAGRAPH = new PTAGraph()
    for (let [o, _] of rootFG.rootBB.env.parent.bindings) {
      BOUNDARY_PTAGRAPH.addPTANode((new GlobalNode("ENV0$" + o)))
    }
  } else {
    BOUNDARY_PTAGRAPH = incomingFG;
  }

  // Do one pass in DTree order, this will ensure all defs dominate uses...
  let dTree = GLIB.alg.dominatorTarjan(rootFG, '' + rootFG.rootBB.idx, false)

  let visited = new Set();
  let dfsOrder : Array<string> = []
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
        
    // Flow Function 
    flowFunction(rootFG, nextGraph, currBBIDx, step);

    if (saveRecording) {
      nextGraph.saveDotToFile(`outputs/PTA/BB${currBBIDx}_OUT`)
    }

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

  // if (saveRecording) {
  //   try {
  //     execSync(`rm outputs/PTA/*.DOT 2>/dev/null`);
  //   } catch(e) {} finally {}
  // }

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
      let stackID = getStackQualifiedName(i.local.lookupName(), currBB)
      let stackNode = new StackNode(stackID)
      nextGraph.declareNode(stackNode)
      let heapObj = getHeapQualifiedName(i.remote.lookupName(), currBBIDx, stackInstOffset)
      let heapNode = new ImportNode(heapObj, i.remote, i.FROM)
      nextGraph.declareNode(heapNode)
      nextGraph.clearSuccessors(stackNode.id)
      nextGraph.drawStackToHeapEdge(stackNode, [heapNode])
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
    }
  }
}