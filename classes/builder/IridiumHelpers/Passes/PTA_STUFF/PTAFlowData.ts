import debugConfig from "#debugConfig";
import { Map as IMap, Set as ISet } from "immutable";

//
// PTA FLOW DATA and related functions
//
export type PTANODEID = string;
export type PTAEDGEID = string;
export type PTAFlowData = IMap<PTANODEID, ISet<PTAEDGEID>>; // PTANODEID -----> FIELD::FLAG::PTANODEID
export const NewPTAFlowData = (): IMap<PTANODEID, ISet<PTAEDGEID>> => IMap(); // Construct Flow Value

export const unionAllPTAFlowData = (
  ...flowDataList: PTAFlowData[]
): PTAFlowData => {
  return flowDataList.reduce(
    (acc, curr) => acc.mergeWith((setA, setB) => setA.union(setB), curr),
    IMap<PTANODEID, ISet<PTAEDGEID>>(),
  );
};

export const arePTAFlowDataEqual = (
  a: PTAFlowData,
  b: PTAFlowData,
): boolean => {
  return a.equals(b);
};

export const addPTANode = (CURR: PTAFlowData, node: PTAFlowNode) => {
  if (!GLOBAL_NODE_MAP.has(node.id)) GLOBAL_NODE_MAP.set(node.id, node);
  if (!CURR.has(node.id)) CURR.set(node.id, ISet());
};

export const assertPTANode = (CURR: PTAFlowData, node: PTAFlowNode) => {
  if (!GLOBAL_NODE_MAP.has(node.id))
    debugConfig.logger.throwIriError(`PTA Node not found: ${node.id}`);
  if (!CURR.has(node.id))
    debugConfig.logger.throwIriError(
      `PTA Node not found in FLOWDATA: ${node.id}`,
    );
};

export const ensureNodeIDAndGetPTANode = (
  CURR: PTAFlowData,
  nodeID: string,
) => {
  if (!GLOBAL_NODE_MAP.has(nodeID))
    debugConfig.logger.throwIriError(`PTA Node not found for ID: ${nodeID}`);
  else {
    const currPTANode = GLOBAL_NODE_MAP.get(nodeID);
    assertPTANode(CURR, currPTANode);
    return currPTANode;
  }
  return undefined;
};

export const addStackEdges = (
  CURR: PTAFlowData,
  u: StackNode,
  vs: Set<HeapNode>,
) => {
  assertPTANode(CURR, u);
  if (!CURR.has(u.id)) CURR.set(u.id, ISet());
  for (const v of vs) {
    assertPTANode(CURR, v);
    if (!CURR.has(u.id)) CURR.set(v.id, ISet());
    const e = PTAEdge.constructStackEdge(u.id, v.id);
    CURR.get(v.id).add(e.getPTAEdge());
  }
};

export const getPointees = (CURR: PTAFlowData, u: StackNode) => {
  assertPTANode(CURR, u);
  if (!CURR.has(u.id)) CURR.set(u.id, ISet());
  const res: Set<PTANODEID> = new Set();
  const outEdges = CURR.get(u.id);
  const outVs: ISet<PTAFlowNode> = outEdges.map((e) =>
    ensureNodeIDAndGetPTANode(CURR, PTAEdge.from(u.id, e).v),
  );
  outVs.forEach((v) => res.add(v.id));
  return res;
};

//
// All Nodes are maintained globally in a mutable data structure
// called GLOBAL_NODE_MAP which maintains a mapping from PTANODEID ---> PTAFlowNode
//
export const GLOBAL_NODE_MAP: Map<PTANODEID, PTAFlowNode> = new Map();

//
// Helper functions to ensure, assert, etc PTANodes...
//

//
// A helper class to construct PTAEdge
//
export class PTAEdge {
  u: string;
  field: string;
  flag: string;
  v: string;
  constructor(u: string, field: string, flag: string, v: string) {
    this.u = u;
    this.field = field;
    this.flag = flag;
    this.v = v;
  }

  static from(u: string, e: string) {
    const [field, flag, v] = e.split("::");
    return new PTAEdge(u, field, flag, v);
  }

  static constructStackEdge(u: string, v: string): PTAEdge {
    return new PTAEdge(u, "$S", "$S", v);
  }

  getPTAEdge(): PTAEDGEID {
    return `${this.field}::${this.flag}::${this.v}`;
  }
}

//
// Hierarchy of nodes in the PTA graph
//

export class PTAFlowNode {
  id: string;
}

export class StackNode extends PTAFlowNode {}

export class HeapNode extends PTAFlowNode {}
