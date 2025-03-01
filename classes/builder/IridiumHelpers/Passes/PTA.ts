import { IRIDIUM_FG } from "../I_GENERAL/IRIDIUM_FG.ts";
import {
  arePTAFlowDataEqual,
  NewPTAFlowData,
  PTAFlowData,
  unionAllPTAFlowData,
} from "./PTA_STUFF/PTAFlowData.ts";
import debugConfig from "#debugConfig";
import GLIB from "#graphlib";
import { popSet } from "#utils";

//
// A world can be in three states:
//  1. !PTA_WORLD.has            ===> Not Seen Before
//  2. !PTA_WORLD.has && isNull  ===> Under Process
//  3. !PTA_WORLD.has && !isNull ===> Processed
//
export const PTA_WORLD: Map<string, PTAFlowData> = new Map();
export const PTA_WORLD_CURRMUTABLE_DATA: Map<string, PTAFlowData> = new Map();

export const initializeWorld = (uname: string, fg: IRIDIUM_FG) => {
  const worldData: PTAFlowData = NewPTAFlowData();
  PTA_WORLD.set(uname, null);
  PTA(uname, fg, worldData);
  PTA_WORLD.set(uname, worldData);
};

type BBIdx = string;
export const PTA = (
  uname: string,
  rootFG: IRIDIUM_FG,
  BOUNDARY_PTAGRAPH: PTAFlowData,
) => {
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
    let inGraph: PTAFlowData;
    const preds = rootFG.predecessors(currBBIDx);
    if (preds && preds.length > 0) {
      inGraph = unionAllPTAFlowData(
        ...preds.map((bbIdx: BBIdx) => flowMap.get(bbIdx)),
      );
    } else {
      inGraph = unionAllPTAFlowData(...[BOUNDARY_PTAGRAPH]);
    }

    // Flow Function
    const outGraph = inGraph.withMutations(function (
      mutableFlowData: PTAFlowData,
    ) {
      PTA_WORLD_CURRMUTABLE_DATA.set(uname, mutableFlowData);
      flowFunction(uname, rootFG, mutableFlowData, currBBIDx, step);
    });

    // Add successors to worklist if there was a change
    if (!flowMap.has(currBBIDx))
      throw new Error("Expected flowmap to have a graph for each node");
    const oldGraph = flowMap.get(currBBIDx);
    if (!arePTAFlowDataEqual(outGraph, oldGraph)) {
      flowMap.set(currBBIDx, outGraph);
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
};

// Flow Functions operates on a mutable data structure,
// this is done to allow batch to the otherwise immutable dataflow data.
export const flowFunction = (
  uname: string,
  rootFG: IRIDIUM_FG,
  mutableFlowData: PTAFlowData,
  currBBIDx: string,
  step: number,
) => {};
