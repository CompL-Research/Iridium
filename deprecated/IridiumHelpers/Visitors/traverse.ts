//
// Utilities for Traversal
//

import { ALL_IS } from "../ALL_IS/ALL_IS.ts";
import { BB } from "../BB.ts";
import { IRIDIUM_FG } from "../I_GENERAL/IRIDIUM_FG.ts";

// We can add more things here when we add new visitors
export type InstTraversalContext = { bb: BB };

//
// Given a flowgraph, traverse all its instructions recursively
//
export function traverseInstructionRecDepthFirst(
  fg: IRIDIUM_FG,
  callback: (inst: ALL_IS, bb: BB, fgContext: IRIDIUM_FG) => void,
) {
  // Traverse over all BBs
  traverseBBLexical(fg, (bb: BB, fgContext: IRIDIUM_FG) => {
    // For each BB, we visit all the instructions
    for (const i of bb.statements) {
      callback(i, bb, fgContext);
    }
  });
}

//
// Given a flowgraph, traverse all its instructions
//
export function traverseInstruction(
  fg: IRIDIUM_FG,
  callback: (inst: ALL_IS, bb: BB) => void,
) {
  // Traverse over all BBs
  traverseBB(fg, (bb: BB) => {
    // For each BB, we visit all the instructions
    for (const i of bb.statements) {
      callback(i, bb);
    }
  });
}

//
// Given a flowgraph, traverse all its lexical flowgraps
//
export function traverseFGLexical(
  fg: IRIDIUM_FG,
  callback: (fg: IRIDIUM_FG) => void,
) {
  callback(fg);
  traverseBB(fg, (bb: BB) => {
    for (const i of bb.statements) {
      const declaredClosures: Array<IRIDIUM_FG> | undefined =
        i.declaredClosure();
      if (declaredClosures) {
        for (const declaredClosure of declaredClosures)
          traverseFGLexical(declaredClosure, callback);
      }
    }
  });
}

//
// Given a flowgraph, traverse all its BBs and the BB's of its inner closures as-well
//
export function traverseBBLexical(
  fg: IRIDIUM_FG,
  callback: (bb: BB, fg: IRIDIUM_FG) => void,
) {
  traverseBB(fg, (bb: BB) => {
    callback(bb, fg);
    for (const i of bb.statements) {
      const declaredClosures: Array<IRIDIUM_FG> | undefined =
        i.declaredClosure();
      if (declaredClosures) {
        for (const declaredClosure of declaredClosures)
          traverseBBLexical(declaredClosure, callback);
      }
    }
  });
}

//
// Given a flowgraph, traverse all its BBs
//
export function traverseBB(fg: IRIDIUM_FG, callback: (bb: BB) => void) {
  for (const n of fg.nodes()) {
    // Iterate over BB's
    if (fg.hasNode(n)) callback(fg.node(n));
  }
}
