import { IV_CTHIS } from "../../ALL_RVal/IV_NonLang.ts";
import { IV_This } from "../../ALL_RVal/IV_This.ts";
import { BB } from "../../BB.ts";
import { PTANode, SetSpecialClosure, StackNode, SymbolNode, Valid_Stack_To_Heap_Pointees } from "./nodes.ts";
import { PTAGraph } from "./PTAGraph.ts";
import { dissernPointees, getStackQualifiedName } from "./util.ts";
import debugConfig from "#debugConfig";
import { IV_Identifier } from "../../ALL_AMP/ALL_AMP.ts";
import { ContextualPTAHandler, PTA } from "../PTA.ts";

// Handle Simple Assignment Statement
export const handleSimpleAssignmentStatement = (nextGraph: PTAGraph, qualifiedStackId: string, rVal: Array<PTANode>) => {
  let stackNode = new StackNode(qualifiedStackId)
  nextGraph.declareNode(stackNode)
  nextGraph.clearSuccessors(qualifiedStackId)
  nextGraph.drawStackToHeapEdge(stackNode, rVal)
}


export const handleMemberAssignment = (origNextGraph: PTAGraph, us : Array<Valid_Stack_To_Heap_Pointees>, vs : Array<PTANode>, ps: Set<string>, currBB: BB, currBBIDx: string, stackInstOffset: number) => {

  let closureResults : Array<PTAGraph> = new Array()
  let pendingClosures = origNextGraph.drawHeapToHeapEdge(us, vs, ps, true)
  let iContext = "BB" + currBBIDx + ":" + stackInstOffset;

  closureResults = pendingClosures.map(e => {
    let clos: SetSpecialClosure = e[0]
    let objContext: Valid_Stack_To_Heap_Pointees = e[1]
    let arg: Valid_Stack_To_Heap_Pointees = e[2]
    let nextGraph = new PTAGraph()
    nextGraph.union(origNextGraph)

    // set THIS pointer to objContext
    let cThisLookupName = getStackQualifiedName(IV_CTHIS.lookupName(), clos.meth.funBody.rootBB)
    let contextualThis = new StackNode(cThisLookupName)
    nextGraph.addPTANode(contextualThis)
    nextGraph.drawStackToHeapEdge(contextualThis, [objContext])

    // set argument to v 
    if (clos.meth.params.length !== 1) debugConfig.logger.throwIriError("Expected setters to have exactly one argument!!");
    
    let param1 = clos.meth.params[0]
    let paramLookupName;
    
    if (param1 instanceof IV_Identifier) paramLookupName = getStackQualifiedName(param1.lookupName(), clos.meth.funBody.rootBB);
    else paramLookupName = getStackQualifiedName(param1.arg.lookupName(), clos.meth.funBody.rootBB);

    let paramNode = new StackNode(paramLookupName)
    nextGraph.addPTANode(paramNode)
    nextGraph.drawStackToHeapEdge(paramNode, [arg])
    
    return ContextualPTAHandler(objContext.id, iContext, nextGraph, clos.meth.funBody);
  })

  // Union of closure results must be merged back into the nextGraph...
  origNextGraph.union(...closureResults)

}

// TODO: Handle Array Assignment Pattern
// TODO: Handle Object Assignment Pattern
