import debugConfig from "#debugConfig";
import { Map as IMap, Set as ISet } from "immutable";
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

// Graph Manipulation Methods
export const addStackEdges = (
  CURR: PTAFlowData,
  u: StackNode,
  vs: Set<PTAFlowNode> | Array<PTAFlowNode>,
) => {
  assertPTANode(CURR, u);
  if (!CURR.has(u.id)) CURR.set(u.id, ISet());

  // Mutations must be used when doing operations in the containing set's
  CURR.set(
    u.id,
    CURR.get(u.id).withMutations((data) => {
      for (const v of vs) {
        assertPTANode(CURR, v);
        const e = PTAEdge.constructStackEdge(u.id, v.id);
        data.add(e.getPTAEdge());
      }
    }),
  );
};

export const addHeapEdges = (
  CURR: PTAFlowData,
  u: PTAFlowNode,
  fields: Set<string> | Array<string>,
  vs: Set<PTAFlowNode> | Array<PTAFlowNode>,
  enumerable: boolean = true,
) => {
  assertPTANode(CURR, u);
  CURR.set(
    u.id,
    CURR.get(u.id).withMutations((data) => {
      for (const field of fields) {
        for (const v of vs) {
          assertPTANode(CURR, v);
          const e = PTAEdge.constructHeapEdge(
            u.id,
            field,
            enumerable ? "E" : "H",
            v.id,
          );
          data.add(e.getPTAEdge());
        }
      }
    }),
  );
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
// Mapping from PTANODEID ---> uname (this is the resolved path for the import node)
//
export const GLOBAL_RESOLUTION_MAP: Map<PTANODEID, string> = new Map();

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
  constructor(id: string) {
    this.id = id;
  }
}

export class StackNode extends PTAFlowNode {
  constructor(id: string) {
    super(id);
  }
}

export class OrdinaryObjectNode extends PTAFlowNode {
  constructor(id: string) {
    super(id);
  }
}

export type OrdinaryFunctionObject_meth =
  | ISP_ObjectMethod
  | IV_FunctionExpression
  | IV_ArrowFunctionExpression;
export class OrdinaryFunctionNode extends PTAFlowNode {
  meth: OrdinaryFunctionObject_meth;
  constructor(id: string, meth: OrdinaryFunctionObject_meth) {
    super(id);
    if (meth instanceof ISP_ObjectMethod && meth.kind !== "method") {
      debugConfig.logger.throwIriError(
        "Object methods that are not normal functions cannot occupy a ordinary function object",
      );
    }
    this.meth = meth;
  }
}

export type SetSpecialClosure_meth = ISP_ObjectMethod;
export class SetClosureNode extends PTAFlowNode {
  meth: SetSpecialClosure_meth;
  constructor(id: string, meth: SetSpecialClosure_meth) {
    super(id);
    this.meth = meth;
  }
}

export type GetSpecialClosure_meth = ISP_ObjectMethod;
export class GetClosureNode extends PTAFlowNode {
  meth: GetSpecialClosure_meth;
  constructor(id: string, meth: GetSpecialClosure_meth) {
    super(id);
    this.meth = meth;
  }
}

export class RemoteNode extends PTAFlowNode {
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
type IV_Literals =
  | IV_DecimalLiteral
  | IV_BigIntLiteral
  | IV_StringLiteral
  | IV_NumericLiteral
  | IV_NullLiteral
  | IV_BooleanLiteral;
export class LiteralNode extends PTAFlowNode {
  node: IV_Literals;
  constructor(id: string, node: IV_Literals) {
    super(id);
    this.node = node;
  }
}
