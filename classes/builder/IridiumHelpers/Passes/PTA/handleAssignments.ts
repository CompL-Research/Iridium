import { PTANode, StackNode, SymbolNode } from "./nodes.ts";
import { PTAGraph } from "./PTAGraph.ts";
import { dissernPointees, getStackQualifiedName } from "./util.ts";

// // Handle assignment statements...
// export const handleMemberAssignment = (nextGraph: PTAGraph, lVal: string, rValPointees: Array<PTANode>, prop: string, computed: boolean) => {
//   let receiverObjID = getStackQualifiedName(lVal)
//   nextGraph.ensureNode(receiverObjID)

//   let receiverPointees = nextGraph.getPointees(receiverObjID)

//   let dissernedProps: Set<string> = new Set();
//   if (computed) {
//     let propID = getStackQualifiedName(prop)
//     nextGraph.ensureNode(propID)
//     let propPointees = nextGraph.getPointees(propID)
//     dissernedProps = dissernPointees(propPointees)
//   } else {
//     if (!nextGraph.hasNode(prop)) nextGraph.addPTANode(new SymbolNode(prop));
//     dissernedProps.add(prop)
//   }

//   nextGraph.drawHeapToHeapEdge(receiverPointees, rValPointees, [...dissernedProps])
// }

// export const handleMemberLookup = (receiverObj: string, prop: string, computed: boolean) => {
//   let receiverObjID = getStackQualifiedName(receiverObj)
//   nextGraph.ensureNode(receiverObjID)

//   let receiverPointees = nextGraph.getPointees(receiverObjID)
//   let dissernedProps: Set<string> = new Set();
//   if (computed) {
//     let propID = getStackQualifiedName(prop)
//     nextGraph.ensureNode(propID)
//     let propPointees = nextGraph.getPointees(propID)
//     dissernedProps = dissernPointees(propPointees)
//   } else {
//     if (!nextGraph.hasNode(prop)) nextGraph.addPTANode(new SymbolNode(prop));
//     dissernedProps.add(prop)
//   }

//   let res: Set<PTANode> = new Set();

//   for (let r of receiverPointees)
//     for (let p of dissernedProps)
//       nextGraph.getHeapPointees(r.id, p).forEach(e => res.add(e))

//   return [...res];
// }

// Handle Simple Assignment Statement
export const handleSimpleAssignmentStatement = (nextGraph: PTAGraph, qualifiedStackId: string, rVal: Array<PTANode>) => {
  let stackNode = new StackNode(qualifiedStackId)
  nextGraph.declareNode(stackNode)
  nextGraph.clearSuccessors(qualifiedStackId)
  nextGraph.drawStackToHeapEdge(stackNode, rVal)
}

// TODO: Handle Array Assignment Pattern
// TODO: Handle Object Assignment Pattern
