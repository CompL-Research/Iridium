import { IV_StringLiteral } from "../../ALL_RVal/IV_Literals.ts";
import { BB } from "../../BB.ts";
import { LiteralNode, PTAFlowNode } from "./PTAFlowData.ts";

//
// All references are qualified from the environmen they load from
//
export const getStackQualifiedName = (lookupID: string, currBB: BB): string => {
  const declaredEnv = currBB.env.findEnvContaining(lookupID);
  if (!declaredEnv) {
    console.error(`declared Env not found for: ${lookupID}`);
  }
  return "ENV" + declaredEnv.idx + "$" + lookupID;
};

//
// All heap objects are given a UID... Allocation site abstraction
//
export const getHeapQualifiedName = (
  heapID: string,
  currBBIDx: string,
  stackInstOffset: number,
): string => {
  return "BB" + currBBIDx + "$" + stackInstOffset + "$" + heapID;
};

//
// Whatever pointees we can resolve to literals, we resolve statically
//
export const dissernPointees = (ns: Array<PTAFlowNode> | Set<PTAFlowNode>) => {
  const res: Set<string> = new Set();
  for (const n of ns) {
    if (n instanceof LiteralNode) {
      if (n.node instanceof IV_StringLiteral) res.add(n.node.value)
      else res.add(n.id);
    }
    else res.add("*");
  }
  if (res.size === 0) res.add("*");
  return res;
};
