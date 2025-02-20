import debugConfig from "#debugConfig";
import { IV_Identifier } from "../../ALL_AMP/ALL_AMP.ts";
import { IV_CTHIS } from "../../ALL_RVal/IV_NonLang.ts";
import { BB } from "../../BB.ts";
import { ContextualPTAHandler } from "../PTA.ts";
import {
  PTANode,
  SetSpecialClosure,
  StackNode,
  Valid_Stack_To_Heap_Pointees,
} from "./nodes.ts";
import { PTAGraph } from "./PTAGraph.ts";
import { getStackQualifiedName } from "./util.ts";

// Handle Simple Assignment Statement
export const handleSimpleAssignmentStatement = (
  nextGraph: PTAGraph,
  qualifiedStackId: string,
  rVal: Array<PTANode>,
) => {
  const stackNode = new StackNode(qualifiedStackId);
  nextGraph.declareNode(stackNode);
  nextGraph.clearSuccessors(qualifiedStackId);
  nextGraph.drawStackToHeapEdge(stackNode, rVal);
};

export const handleMemberAssignment = (
  origNextGraph: PTAGraph,
  us: Array<Valid_Stack_To_Heap_Pointees>,
  vs: Array<PTANode>,
  ps: Set<string>,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
) => {
  let closureResults: Array<PTAGraph> = [];
  const pendingClosures = origNextGraph.drawHeapToHeapEdge(us, vs, ps, true);
  const iContext = "BB" + currBBIDx + ":" + stackInstOffset;

  closureResults = pendingClosures.map((e) => {
    const clos: SetSpecialClosure = e[0];
    const objContext: Valid_Stack_To_Heap_Pointees = e[1];
    const arg: Valid_Stack_To_Heap_Pointees = e[2];
    const nextGraph = new PTAGraph();
    nextGraph.union(origNextGraph);

    // set THIS pointer to objContext
    const cThisLookupName = getStackQualifiedName(
      IV_CTHIS.lookupName(),
      clos.meth.funBody.rootBB,
    );
    const contextualThis = new StackNode(cThisLookupName);
    nextGraph.addPTANode(contextualThis);
    nextGraph.drawStackToHeapEdge(contextualThis, [objContext]);

    // set argument to v
    if (clos.meth.params.length !== 1)
      debugConfig.logger.throwIriError(
        "Expected setters to have exactly one argument!!",
      );

    const param1 = clos.meth.params[0];
    let paramLookupName;

    if (param1 instanceof IV_Identifier)
      paramLookupName = getStackQualifiedName(
        param1.lookupName(),
        clos.meth.funBody.rootBB,
      );
    else
      paramLookupName = getStackQualifiedName(
        param1.arg.lookupName(),
        clos.meth.funBody.rootBB,
      );

    const paramNode = new StackNode(paramLookupName);
    nextGraph.addPTANode(paramNode);
    nextGraph.drawStackToHeapEdge(paramNode, [arg]);

    return ContextualPTAHandler(
      objContext.id,
      iContext,
      nextGraph,
      clos.meth.funBody,
    );
  });

  // Union of closure results must be merged back into the nextGraph...
  origNextGraph.union(...closureResults);
};

// TODO: Handle Array Assignment Pattern
// TODO: Handle Object Assignment Pattern
