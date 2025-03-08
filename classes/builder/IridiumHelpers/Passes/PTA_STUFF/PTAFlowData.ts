import debugConfig from "#debugConfig";
import {
  IV_DecimalLiteral,
  IV_BigIntLiteral,
  IV_StringLiteral,
  IV_NumericLiteral,
  IV_NullLiteral,
  IV_BooleanLiteral,
} from "../../ALL_RVal/IV_Literals.ts";
import { ISP_ObjectMethod } from "../../ALL_RVal/ALL_ISP.ts";
import { IV_ArrowFunctionExpression } from "../../ALL_RVal/IV_ArrowFunctionExpression.ts";
import { IV_FunctionExpression } from "../../ALL_RVal/IV_FunctionExpression.ts";
import { PTA_WORLD, PTA_WORLD_CURRMUTABLE_DATA } from "../PTA.ts";

//
// Utility methods for printing
//
export const printPTAFlowData = (data: PTAFlowData) => {
  for (const ele of data) {
    console.warn(`${ele[0]} --> [${[...ele[1]].join(",")}]`);
  }
};

//
// PTA FLOW DATA and related functions
//
export type PTANODEID = string;
export type PTAEDGEID = string;
export type PTAFlowData = Map<PTANODEID, Set<PTAEDGEID>>; // PTANODEID -----> FIELD::FLAG::PTANODEID
export const NewPTAFlowData = (): Map<PTANODEID, Set<PTAEDGEID>> => new Map(); // Construct Flow Value

export const unionAllMutablePTAFlowData = (
  mutableFlowData: PTAFlowData,
  ...flowDataList: PTAFlowData[]
) => {
  for (const map2 of flowDataList) {
    for (const [key, set] of map2) {
      if (mutableFlowData.has(key)) {
        const combinedSet = new Set([...mutableFlowData.get(key), ...set]);
        mutableFlowData.set(key, combinedSet);
      } else {
        mutableFlowData.set(key, new Set(set));
      }
    }
  }
  return mutableFlowData;
};

export const unionAllPTAFlowData = (
  ...flowDataList: PTAFlowData[]
): PTAFlowData => {
  return unionAllMutablePTAFlowData(new Map(), ...flowDataList);
};

export const arePTAFlowDataEqual = (
  map1: PTAFlowData,
  map2: PTAFlowData,
): boolean => {
  if (map1.size !== map2.size) return false;

  for (const [key, set1] of map1) {
    const set2 = map2.get(key);
    if (!set2 || set1.size !== set2.size) return false;

    for (const value of set1) {
      if (!set2.has(value)) return false;
    }
  }

  return true;
};


// 
// Add PTAFlowNode to PTAFlowData and set pointees to a new set, also update GLOBAL_NODE_MAP. 
// 
export const addStackPTANode = (CURR: PTAFlowData, node: PTAFlowNode) => {
  GLOBAL_NODE_MAP.set(node.id, node);
  CURR.set(node.id, new Set());
};

// 
// Add a given PTAFlowNode to PTAFlowData to GLOBAL_NODE_MAP and PTAFlowDatam if it already exists, do nothing.
// 
export const addPTANode = (CURR: PTAFlowData, node: PTAFlowNode) => {
  if (!GLOBAL_NODE_MAP.has(node.id)) GLOBAL_NODE_MAP.set(node.id, node);
  if (!CURR.has(node.id)) CURR.set(node.id, new Set());
};

// 
// Ensure a given PTAFlowNode exists in the provided PTAFlowData
// 
export const assertPTANode = (CURR: PTAFlowData, node: PTAFlowNode) => {
  if (!GLOBAL_NODE_MAP.has(node.id))
    debugConfig.logger.throwIriError(`PTA Node not found: ${node.id}`);
  if (!CURR.has(node.id))
    debugConfig.logger.throwIriError(
      `PTA Node not found in FLOWDATA: ${node.id}`,
    );
};


// 
// Ensure that a given PTAFlowData has PTANode of nodeID and return it
// 
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

// 
// Ensure that a given PTAFlowData has StackNode of nodeID and return it
// 
export const ensureNodeIDAndGetStackNode = (
  CURR: PTAFlowData,
  nodeID: string,
): StackNode => {
  if (!GLOBAL_NODE_MAP.has(nodeID))
    debugConfig.logger.throwIriError(
      `Stack PTA Node not found for ID: ${nodeID}`,
    );
  else {
    const currPTANode = GLOBAL_NODE_MAP.get(nodeID);
    assertPTANode(CURR, currPTANode);
    if (currPTANode instanceof StackNode) return currPTANode;
    else
      debugConfig.logger.throwIriError(
        `Expected type StackNode for ID: ${nodeID}`,
      );
  }
  return undefined;
};

// 
// Reset pointees of the StackNode in the given PTAFlowData and set it to the provided set of PTAFlowNodes
// 
export const addStackEdges = (
  CURR: PTAFlowData,
  u: StackNode,
  vs: Set<PTAFlowNode> | Array<PTAFlowNode>,
) => {
  assertPTANode(CURR, u);
  CURR.set(u.id, new Set());

  const edgesContainer = CURR.get(u.id);

  for (const v of vs) {
    assertPTANode(CURR, v);
    const e = PTAEdge.constructStackEdge(u.id, v.id);
    edgesContainer.add(e.getPTAEdge());
  }
};

// 
// Return the pointees of a given StackNode in PTAFlowData
// 
export const getPointees = (CURR: PTAFlowData, u: StackNode) => {
  assertPTANode(CURR, u);
  if (!CURR.has(u.id)) CURR.set(u.id, new Set());
  const outEdges = CURR.get(u.id);
  const outVs: Set<PTAFlowNode> = new Set();
  
  outEdges.forEach((e) =>
    outVs.add(ensureNodeIDAndGetPTANode(CURR, PTAEdge.from(u.id, e).v))
  );
  return outVs;
};

export const ensureAndGetMutableWorldInstance = (nodeWorld: string): PTAFlowData => {
  if (!PTA_WORLD.has(nodeWorld) && !PTA_WORLD_CURRMUTABLE_DATA.has(nodeWorld)) debugConfig.logger.throwIriError(`World not found: ${nodeWorld}`);
  const hasMutableWorld = PTA_WORLD_CURRMUTABLE_DATA.has(nodeWorld) && PTA_WORLD_CURRMUTABLE_DATA.get(nodeWorld).length > 0;
  if (!hasMutableWorld) {
    debugConfig.logger.throwIriError("Expected a mutable instance to exist!!");
  }
  const closureWorldData = PTA_WORLD_CURRMUTABLE_DATA.get(nodeWorld)[PTA_WORLD_CURRMUTABLE_DATA.get(nodeWorld).length - 1];
  return closureWorldData;
}

// 
// Returns the latest mutable world instance for a given object
// 
export const getMutableWorldInstance = (nodeWorld: string): PTAFlowData => {
  if (!PTA_WORLD.has(nodeWorld) && !PTA_WORLD_CURRMUTABLE_DATA.has(nodeWorld)) debugConfig.logger.throwIriError(`World not found: ${nodeWorld}`);
  const hasMutableWorld = PTA_WORLD_CURRMUTABLE_DATA.has(nodeWorld) && PTA_WORLD_CURRMUTABLE_DATA.get(nodeWorld).length > 0;
  if (!hasMutableWorld) {
    if (!PTA_WORLD_CURRMUTABLE_DATA.has(nodeWorld)) PTA_WORLD_CURRMUTABLE_DATA.set(nodeWorld, []);
    const immutableInstance = PTA_WORLD.get(nodeWorld);
    const worldInstance = unionAllPTAFlowData(immutableInstance);
    PTA_WORLD_CURRMUTABLE_DATA.get(nodeWorld).push(worldInstance);
  }
  const closureWorldData = PTA_WORLD_CURRMUTABLE_DATA.get(nodeWorld)[PTA_WORLD_CURRMUTABLE_DATA.get(nodeWorld).length - 1];
  return closureWorldData;
}

// 
// TODO (update WORLD operation): Check if a given PTAFlowNode has a field
// 
export const hasFieldPTANode = (CURR: PTAFlowData, node: PTAFlowNode, field: string) => {
  assertPTANode(CURR, node);
  const nodeID = node.id;
  const worldInstance = getMutableWorldInstance(node.world);
  const outEdges = worldInstance.get(nodeID);
  for (const e of outEdges) {
    const pEdge = PTAEdge.from(nodeID, e);
    if (pEdge.field === field) return true;
  }
  return false;
};

// 
// TODO (update WORLD operation): Assert that a given field exists for an object
// 
export const assertFieldPTANode = (CURR: PTAFlowData, node: PTAFlowNode, field: string) => {
  assertPTANode(CURR, node);
  const nodeID = node.id;
  const worldInstance = getMutableWorldInstance(node.world);
  const outEdges = worldInstance.get(nodeID);
  for (const e of outEdges) {
    const pEdge = PTAEdge.from(nodeID, e);
    if (pEdge.field === field) return true;
  }
  debugConfig.logger.throwIriError(`Field missing: (${nodeID}, ${field})`);
  return false;
};


// 
// TODO (update WORLD operation): Ensure that a given PTAFlowData has StackNode of nodeID and return it
// 
export const addSelfLoop = (
  CURR: PTAFlowData,
  u: PTAFlowNode,
  enumerable: boolean = true,
) => {
  assertPTANode(CURR, u);
  const worldInstance = getMutableWorldInstance(u.world);
  assertPTANode(worldInstance, u);
  const e = PTAEdge.constructHeapEdge(
    u.id,
    "*",
    enumerable ? "E" : "H",
    u.id,
  );
  worldInstance.get(u.id).add(e.getPTAEdge());
};

// 
// TODO (update WORLD operation): Set the given field of PTAFlowNode to Set<PTAFlowNodes>
// 
export const addHeapEdges = (
  CURR: PTAFlowData,
  u: PTAFlowNode,
  field: string,
  vs: Set<PTAFlowNode> | Array<PTAFlowNode>,
  enumerable: boolean = true,
): Array<[SetClosureNode, PTAFlowNode, Array<PTAFlowNode> | Set<PTAFlowNode>]> => {
  assertPTANode(CURR, u);

  const worldInstance = getMutableWorldInstance(u.world);
  assertPTANode(worldInstance, u);

  const outEdges = worldInstance.get(u.id);

  const pendingClosures: Array<[SetClosureNode, PTAFlowNode, Array<PTAFlowNode> | Set<PTAFlowNode>]> = 
    [...outEdges.values()]
    .map((e) => PTAEdge.from(u.id, e))
    .filter((e) => e.field === field)
    .map((e) => ensureNodeIDAndGetPTANode(worldInstance, e.v))
    .filter((node) => node instanceof SetClosureNode)
    .map((node) => [node, u, vs])
  

  // Create new edges to vs
  for (const v of vs) {
    const e = PTAEdge.constructHeapEdge(
      u.id,
      field,
      enumerable ? "E" : "H",
      v.id,
    );
    addPTANode(worldInstance, v);
    outEdges.add(e.getPTAEdge());
  }

  pendingClosures.forEach((n) => addPTANode(CURR, n[0]));
  return pendingClosures;
};

// 
// TODO (update WORLD operation): Ensure that a given PTAFlowData has StackNode of nodeID and return it
// 
export const getFieldPointees = (CURR: PTAFlowData, u: PTAFlowNode, field: string, enumerable: boolean = true): [Array<PTAFlowNode>, Array<GetClosureNode>] => {
  assertPTANode(CURR, u);

  const worldInstance = getMutableWorldInstance(u.world);
  assertPTANode(worldInstance, u);


  const outNodes = 
    [...worldInstance.get(u.id)]
    .filter(
      (e) => (PTAEdge.from(u.id, e).field === field || PTAEdge.from(u.id, e).field === "*") && (enumerable && PTAEdge.from(u.id, e).flag === "E")
    )
    .map((e) => ensureNodeIDAndGetPTANode(worldInstance, PTAEdge.from(u.id, e).v));

  if (outNodes.length === 0) {
    const ukn = new UnknownNode("UNKNOWN", u.world);
    addPTANode(worldInstance, ukn);
    worldInstance.get(u.id).add(PTAEdge.constructHeapEdge(u.id, "*", "E", ukn.id).getPTAEdge())
    return [[ukn], []]
  }

  const outVs = 
    outNodes
    .filter((n) => !(n instanceof SetClosureNode || n instanceof GetClosureNode));

  const pendingClosures = 
    outNodes
    .filter((n) => (n instanceof GetClosureNode));

  outVs.forEach((v) => addPTANode(CURR, v));
  pendingClosures.forEach((v) => addPTANode(CURR, v));

  return [outVs, pendingClosures];
};

//
// All Nodes are maintained globally in a mutable data structure
// called GLOBAL_NODE_MAP which maintains a mapping from PTANODEID ---> PTAFlowNode
//
export const GLOBAL_NODE_MAP: Map<PTANODEID, PTAFlowNode> = new Map();
//
// Mapping from PTANODEID ---> uname (this is the resolved path for the import node)
//
export const GLOBAL_RESOLUTION_MAP: Map<PTANODEID, string> = new Map();
export const GLOBAL_RESOLUTION_SKIP_MAP: Set<PTANODEID> = new Set();

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

  static constructHeapEdge(
    u: string,
    field: string,
    flag: string,
    v: string,
  ): PTAEdge {
    return new PTAEdge(u, field, flag, v);
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
  world: string;
  color: string = "white";

  constructor(id: string, world: string) {
    this.id = id;
    this.world = world;
  }

  dotName(): string {
    debugConfig.logger.throwIriError("Extected a subclass to extend 'dotName'");
    return "";
  }

  dotNodeStyle(): string {
    debugConfig.logger.throwIriError("Extected a subclass to extend 'toDot'");
    return "";
  }
}

export class StackNode extends PTAFlowNode {
  
  constructor(id: string, world: string) {
    super(id, world);
  }

  dotName() {
    return `"${this.id.replace(/"/g, '\\"')}"`;
  }

  dotNodeStyle() {
    const shape = "plain";
    const style = "filled";
    return `[xlabel="${this.world}",shape="${shape}",style="${style}",fillcolor="${this.color}"]`;
  }
}

export class OrdinaryArrayNode extends PTAFlowNode {
  constructor(id: string, world: string) {
    super(id, world);
  }

  dotName() {
    return `"${this.id.replace(/"/g, '\\"')}"`;
  }

  dotNodeStyle() {
    const shape = "rectangle";
    const style = "filled";
    const color = "white";
    return `[xlabel="${this.world}",shape="${shape}",style="${style}",fillcolor="${color}"]`;
  }
}

export class OrdinaryObjectNode extends PTAFlowNode {
  constructor(id: string, world: string) {
    super(id, world);
  }

  dotName() {
    return `"${this.id.replace(/"/g, '\\"')}"`;
  }

  dotNodeStyle() {
    const shape = "rectangle";
    const style = "filled";
    const color = "white";
    return `[xlabel="${this.world}",shape="${shape}",style="${style}",fillcolor="${color}"]`;
  }
}

export type OrdinaryFunctionObject_meth =
  | ISP_ObjectMethod
  | IV_FunctionExpression
  | IV_ArrowFunctionExpression;
export class OrdinaryFunctionNode extends PTAFlowNode {
  meth: OrdinaryFunctionObject_meth;
  constructor(id: string, meth: OrdinaryFunctionObject_meth, world: string) {
    super(id, world);
    if (meth instanceof ISP_ObjectMethod && meth.kind !== "method") {
      debugConfig.logger.throwIriError(
        "Object methods that are not normal functions cannot occupy a ordinary function object",
      );
    }
    this.meth = meth;
  }

  dotName() {
    return `"${this.id.replace(/"/g, '\\"')}"`;
  }

  dotNodeStyle() {
    const shape = "note";
    const style = "filled";
    const color = "white";
    return `[xlabel="${this.world}",shape="${shape}",style="${style}",fillcolor="${color}"]`;
  }
}

export type SetSpecialClosure_meth = ISP_ObjectMethod;
export class SetClosureNode extends PTAFlowNode {
  meth: SetSpecialClosure_meth;
  constructor(id: string, meth: SetSpecialClosure_meth, world: string) {
    super(id, world);
    this.meth = meth;
  }

  dotName() {
    return `"${this.id.replace(/"/g, '\\"')}"`;
  }

  dotNodeStyle() {
    const shape = "note";
    const style = "filled";
    const color = "white";
    return `[xlabel="${this.world}",shape="${shape}",style="${style}",fillcolor="${color}"]`;
  }
}

export type GetSpecialClosure_meth = ISP_ObjectMethod;
export class GetClosureNode extends PTAFlowNode {
  meth: GetSpecialClosure_meth;
  constructor(id: string, meth: GetSpecialClosure_meth, world: string) {
    super(id, world);
    this.meth = meth;
  }

  dotName() {
    return `"${this.id.replace(/"/g, '\\"')}"`;
  }

  dotNodeStyle() {
    const shape = "note";
    const style = "filled";
    const color = "white";
    return `[xlabel="${this.world}",shape="${shape}",style="${style}",fillcolor="${color}"]`;
  }
}

export class RemoteNode extends PTAFlowNode {
  FROM: string;
  constructor(id: string, FROM: string, world: string) {
    super(id, world);
    this.FROM = FROM;
  }

  dotName() {
    return `"${this.id.replace(/"/g, '\\"')}"`;
  }

  dotNodeStyle() {
    const shape = "rectangle";
    const style = "filled";
    const color = "gray";
    return `[xlabel="${this.world}",shape="${shape}",style="${style}",fillcolor="${color}"]`;
  }
}

export class IRIDUM_GLOBAL extends PTAFlowNode {
  constructor(id: string, world: string) {
    super(id, world);
  }

  dotName() {
    return `"${this.id.replace(/"/g, '\\"')}"`;
  }

  dotNodeStyle() {
    const shape = "rectangle";
    const style = "filled";
    const color = "gray";
    return `[xlabel="${this.world}",shape="${shape}",style="${style}",fillcolor="${color}"]`;
  }
}

export class UnknownNode extends PTAFlowNode {
  constructor(id: string, world: string) {
    super(id, world);
  }

  dotName() {
    return `"${this.id.replace(/"/g, '\\"')}"`;
  }

  dotNodeStyle() {
    const shape = "rectangle";
    const style = "filled";
    const color = "red";
    return `[xlabel="${this.world}",shape="${shape}",style="${style}",fillcolor="${color}"]`;
  }
}

//
// We keep a track of literal nodes so we can dissern the fields in cases
// in cases where we have computed field references.
//
type IV_Literals =
  | IV_DecimalLiteral
  | IV_BigIntLiteral
  | IV_StringLiteral
  | IV_NumericLiteral
  | IV_NullLiteral
  | IV_BooleanLiteral;
export class LiteralNode extends PTAFlowNode {
  node: IV_Literals;
  constructor(id: string, node: IV_Literals, world: string) {
    super(id, world);
    this.node = node;
  }

  dotName() {
    return `"${this.id.replace(/"/g, '\\"')}"`;
  }

  dotNodeStyle() {
    const shape = "rectangle";
    const style = "filled";
    const color = "green";
    return `[xlabel="${this.world}",shape="${shape}",style="${style}",fillcolor="${color}"]`;
  }
}
