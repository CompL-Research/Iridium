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

// Force update pointees when making a stack node update
export const addStackPTANode = (CURR: PTAFlowData, node: PTAFlowNode) => {
  GLOBAL_NODE_MAP.set(node.id, node);
  CURR.set(node.id, ISet());
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
  vs: Set<PTAFlowNode> | Array<PTAFlowNode>,
) => {
  assertPTANode(CURR, u);
  if (!CURR.has(u.id)) CURR.set(u.id, ISet());
  for (const v of vs) {
    assertPTANode(CURR, v);
    if (!CURR.has(u.id)) CURR.set(v.id, ISet());
    const e = PTAEdge.constructStackEdge(u.id, v.id);

    // Mutations must be used when doing operations in the containing set's
    CURR.set(
      u.id,
      CURR.get(v.id).withMutations((data) => {
        data.add(e.getPTAEdge());
      }),
    );
  }
};

export const getPointees = (CURR: PTAFlowData, u: StackNode) => {
  assertPTANode(CURR, u);
  if (!CURR.has(u.id)) CURR.set(u.id, ISet());
  const outEdges = CURR.get(u.id);
  const outVs: ISet<PTAFlowNode> = outEdges.map((e) =>
    ensureNodeIDAndGetPTANode(CURR, PTAEdge.from(u.id, e).v),
  );
  return outVs;
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
  constructor(id: string) {
    this.id = id;
  }
}

export class StackNode extends PTAFlowNode {
  constructor(id: string) {
    super(id);
  }
}

export class HeapNode extends PTAFlowNode {
  constructor(id: string) {
    super(id);
  }
}

export class IRIDUM_GLOBAL extends PTAFlowNode {
  constructor(id: string) {
    super(id);
  }
}

//
// We keep a track of literal nodes so we can dissern the fields in cases
// in cases where we have computed field references.
//
export class LiteralNode extends HeapNode {
  constructor(id: string) {
    super(id);
  }
}
