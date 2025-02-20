import { BB } from "../../BB.ts";
import { LiteralNode, Valid_Stack_To_Heap_Pointees } from "./nodes.ts";

export const getStackQualifiedName = (lookupID: string, currBB: BB): string => {
  const declaredEnv = currBB.env.findEnvContaining(lookupID);
  return "ENV" + declaredEnv.idx + "$" + lookupID;
};

export const getHeapQualifiedName = (
  heapID: string,
  currBBIDx: string,
  stackInstOffset: number,
): string => {
  return "BB" + currBBIDx + "$" + stackInstOffset + "$" + heapID;
};

export const dissernPointees = (ns: Array<Valid_Stack_To_Heap_Pointees>) => {
  const res: Set<string> = new Set();
  for (const n of ns) {
    //  OrdinaryObject | OrdinaryFunctionObject | GlobalNode | ImportNode | LiteralNode;
    if (n instanceof LiteralNode) res.add(n.id);
    else res.add("*");
  }
  return res;
};
