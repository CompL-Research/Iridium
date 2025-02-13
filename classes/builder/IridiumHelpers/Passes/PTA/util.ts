import { BB } from "../../BB.ts"
import { PTANode, DecimalNode, BigIntNode, StringNode, NumericNode, NullNode, BooleanNode, SymbolNode, Valid_Stack_To_Heap_Pointees, LiteralNode } from "./nodes.ts"

export const getStackQualifiedName = (lookupID: string, currBB: BB): string => {
  let declaredEnv = currBB.env.findEnvContaining(lookupID)
  return "ENV" + declaredEnv.idx + "$" + lookupID
}

export const getHeapQualifiedName = (heapID: string, currBBIDx: string, stackInstOffset: number): string => {
  return "BB" + currBBIDx + "$" + stackInstOffset + "$" + heapID
}

export const dissernPointees = (ns: Array<Valid_Stack_To_Heap_Pointees>) => {
  let res: Set<string> = new Set();
  for (let n of ns) {
    //  OrdinaryObject | OrdinaryFunctionObject | GlobalNode | ImportNode | LiteralNode;
    if (n instanceof LiteralNode) res.add(n.id)
    else res.add("*")
  }
  return res
}