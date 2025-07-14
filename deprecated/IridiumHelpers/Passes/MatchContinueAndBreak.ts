//
// For a given break/continue statement identify the dominating (relevant as per label context) LoopHeadBB | SwitchBodyBB.
// The LoopHeadBB contains information about handling Break and Continue Statements.
//

import { ALL_IS } from "../ALL_IS/ALL_IS.ts";
import { BB, LoopHeadBB, SwitchBodyBB } from "../BB.ts";
import {
  traverseFGLexical,
  traverseInstruction,
} from "../Visitors/traverse.ts";
import GLIB from "#graphlib";
import { IS_Break, IS_LBreak } from "../ALL_IS/IS_Break.ts";
import { IS_Continue, IS_LContinue } from "../ALL_IS/IS_Continue.ts";
import { IRIDIUM_FG } from "../I_GENERAL/IRIDIUM_FG.ts";

export function matchContinueAndBreak(rootFG: IRIDIUM_FG) {
  traverseFGLexical(rootFG, (fg: IRIDIUM_FG) => {
    const dTree = GLIB.alg.dominatorTarjan(fg, "" + fg.rootBB.idx, false);
    const recursivelyFindHead = (
      skipSwitch: boolean,
      curr: string,
      label: string | undefined = undefined,
    ) => {
      const currBB = fg.getBBNode(curr);
      if (currBB instanceof LoopHeadBB || currBB instanceof SwitchBodyBB) {
        if (currBB instanceof LoopHeadBB || skipSwitch === false) {
          if (!label) return currBB;
          if (currBB.label && currBB.label.name === label) return currBB;
        }
      }
      const preds = dTree.predecessors(curr);
      if (!preds)
        throw new Error("Expected successors to exist!! failed to match break");
      if (preds.length !== 1)
        throw new Error("A Dtree node must have exactly one predecessor");
      return recursivelyFindHead(skipSwitch, preds[0], label);
    };

    const updateSet: Set<BB> = new Set();

    traverseInstruction(fg, (inst: ALL_IS, bb: BB) => {
      if (inst instanceof IS_Break) {
        updateSet.add(bb);
        const headBB = recursivelyFindHead(false, "" + bb.idx);
        if (!headBB) throw new Error(`Failed to resolve: ${bb.idx}`);

        inst.bb = headBB.getBreakTarget();
      } else if (inst instanceof IS_Continue) {
        updateSet.add(bb);
        const headBB = recursivelyFindHead(true, "" + bb.idx);
        if (!headBB) throw new Error(`Failed to resolve: ${bb.idx}`);
        if (headBB instanceof SwitchBodyBB)
          throw new Error("Tried to match continue with Switch Statement");

        inst.bb = headBB.getContinueTarget();
      } else if (inst instanceof IS_LBreak) {
        updateSet.add(bb);
        const headBB = recursivelyFindHead(false, "" + bb.idx, inst.label.name);
        if (!headBB) throw new Error(`Failed to resolve: ${bb.idx}`);

        inst.bb = headBB.getBreakTarget();
      } else if (inst instanceof IS_LContinue) {
        updateSet.add(bb);
        const headBB = recursivelyFindHead(true, "" + bb.idx, inst.label.name);
        if (!headBB) throw new Error(`Failed to resolve: ${bb.idx}`);
        if (headBB instanceof SwitchBodyBB)
          throw new Error("Tried to match continue with Switch Statement");

        inst.bb = headBB.getContinueTarget();
      }
    });

    for (const bb of updateSet) {
      const bbInQuestion = "" + bb.idx;
      const stmts = [];
      let i = 0;
      while (true) {
        const curr = bb.statements[i++];
        stmts.push(curr);
        if (
          curr instanceof IS_Break ||
          curr instanceof IS_Continue ||
          curr instanceof IS_LBreak ||
          curr instanceof IS_LContinue
        ) {
          if (!curr.bb)
            throw new Error(
              `Tried patching an unresolved break/continue ${bbInQuestion}`,
            );
          const targetBB = "" + curr.bb.idx;
          const existingSuccBB = fg.successors(bbInQuestion);
          if (!existingSuccBB) throw new Error("Expected the node to exist");
          for (const b of existingSuccBB) {
            fg.removeEdge(bbInQuestion, b);
          }
          fg.setEdge(bbInQuestion, targetBB, "BP");
          break;
        }
      }
      bb.statements = stmts;
    }
  });
}
