import { IS_BImport } from "../../ALL_IS/IS_Imports_Exports.ts";
import {
  PTAFlowData,
  PTAFlowNode,
  StackNode,
  addStackPTANode,
  addStackEdges,
  GLOBAL_RESOLUTION_MAP,
  addPTANode,
  GLOBAL_NODE_MAP,
  RemoteNode,
} from "./PTAFlowData.ts";
import { BB } from "../../BB.ts";
import { getHeapQualifiedName, getStackQualifiedName } from "./util.ts";
import debugConfig from "#debugConfig";
import assert from "node:assert";

// a = [POINTEES]
export const handleSimpleAssignmentStatement = (
  mutableFlowData: PTAFlowData,
  qualifiedStackId: string,
  vs: Array<PTAFlowNode> | Set<PTAFlowNode>,
) => {
  const u = GLOBAL_NODE_MAP.has(qualifiedStackId)
    ? GLOBAL_NODE_MAP.get(qualifiedStackId)
    : new StackNode(qualifiedStackId);
  assert(u instanceof StackNode);
  addStackPTANode(mutableFlowData, u);
  addStackEdges(mutableFlowData, u, vs);
};

// import { remote as local } from FROM
export const handleBImportNode = (
  mutableFlowData: PTAFlowData,
  i: IS_BImport,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
) => {
  const stackID = getStackQualifiedName(i.local.lookupName(), currBB);
  const stackNode = GLOBAL_NODE_MAP.has(stackID)
    ? GLOBAL_NODE_MAP.get(stackID)
    : new StackNode(stackID);
  assert(stackNode instanceof StackNode);
  addPTANode(mutableFlowData, stackNode);

  const heapID = getHeapQualifiedName("IMPORT", currBBIDx, stackInstOffset);
  const remoteNode = GLOBAL_NODE_MAP.has(heapID)
    ? GLOBAL_NODE_MAP.get(heapID)
    : new RemoteNode(heapID);

  assert(remoteNode instanceof RemoteNode);
  addPTANode(mutableFlowData, remoteNode);

  if (GLOBAL_RESOLUTION_MAP.has(heapID)) {
    debugConfig.logger.throwIriError("TODO: Handle resolved nodes");
  } else {
    addStackEdges(mutableFlowData, stackNode, [remoteNode]);
  }
};
