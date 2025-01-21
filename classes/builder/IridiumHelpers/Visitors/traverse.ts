

// 
// Utilities for Traversal
// 

import { ALL_IS } from "../ALL_IS/ALL_IS.ts";
import { BB } from "../BB.ts";


// We can add more things here when we add new visitors
export type InstTraversalContext = { bb: BB }

export function traverseInstructionLexical(currBB: BB, callback: (inst: ALL_IS, context: InstTraversalContext) => void) {
  
  // Traverse over all BBs
  traverseBB(currBB, (bb: BB, _) => {    
    // For each BB, we visit all the instructions
    for (let i of bb.statements) {
      let instContext : InstTraversalContext = { bb }
      callback(i, instContext)
      
      let declaredClosure : BB | undefined = i.declaredClosure()
      if (declaredClosure) {
        traverseInstructionLexical(declaredClosure, callback)
      }
    }
  
  })
}

export function traverseInstruction(currBB: BB, callback: (inst: ALL_IS, context: InstTraversalContext) => void) {
  
  // Traverse over all BBs
  traverseBB(currBB, (bb: BB, _) => {
    
    // For each BB, we visit all the instructions
    for (let i of bb.statements) {
      let instContext : InstTraversalContext = { bb }
      callback(i, instContext)
    }
  
  })
}


// We can add more things here when we add new visitors
export type BBTraversalContext = { }

export function traverseBB(currBB: BB, callback: (bb: BB, context: BBTraversalContext) => void, visited: Set<BB> = new Set()) {
  if (visited.has(currBB)) return
  else visited.add(currBB)

  // Traversal context
  let context = { }

  // Iterate over BB's
  callback(currBB, context)
  
  // Recurse over successors
  let successors = currBB.terminal.getSuccessors()
  for (let s of successors) {
    traverseBB(s, callback, visited)
  }
}