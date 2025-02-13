import { BB } from "../../BB.ts"
import { PTANode, DecimalNode, BigIntNode, StringNode, NumericNode, NullNode, BooleanNode, SymbolNode } from "./nodes.ts"

export const getStackQualifiedName = (lookupID: string, currBB: BB): string => {
  let declaredEnv = currBB.env.findEnvContaining(lookupID)
  return "ENV" + declaredEnv.idx + "$" + lookupID
}

export const getHeapQualifiedName = (heapID: string, currBBIDx: string, stackInstOffset: number): string => {
  return "BB" + currBBIDx + "$" + stackInstOffset + "$" + heapID
}

export const dissernPointees = (ns: Array<PTANode>) => {
  let res: Set<string> = new Set();
  for (let n of ns) {
    if (n instanceof DecimalNode) res.add(n.id)
    else if (n instanceof BigIntNode) res.add(n.id)
    else if (n instanceof StringNode) res.add(n.id)
    else if (n instanceof NumericNode) res.add(n.id)
    else if (n instanceof NullNode) res.add(n.id)
    else if (n instanceof BooleanNode) res.add(n.id)
    else if (n instanceof SymbolNode) res.add(n.id)
    // TODO: Recursion case??? 
    else res.add("*")
  }
  return res
}