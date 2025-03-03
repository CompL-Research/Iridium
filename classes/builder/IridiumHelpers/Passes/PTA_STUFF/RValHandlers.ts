/* eslint-disable @typescript-eslint/no-unused-vars */
import debugConfig from "#debugConfig";
import { IV_Identifier } from "../../ALL_AMP/ALL_AMP.ts";
import { IV_ASSIGNABLE } from "../../ALL_RVal/ALL_RVal.ts";
import { IV_CTHIS, IV_NUBD, IV_STHIS } from "../../ALL_RVal/IV_NonLang.ts";
import { BB } from "../../BB.ts";
import {
  addPTANode,
  ensureNodeIDAndGetPTANode,
  getPointees,
  IRIDUM_GLOBAL,
  PTAFlowData,
  PTAFlowNode,
} from "./PTAFlowData.ts";
import { getStackQualifiedName } from "./util.ts";

// export const dissernProps = (
//   nextGraph: PTAGraph,
//   name: string,
//   stackQualifiedName: string,
//   computed: boolean,
// ): Set<string> => {
//   const res: Set<string> = new Set();
//   if (!computed) {
//     res.add(name);
//     return res;
//   }
//   //
//   // We have a computed prop, we must find all the literals it points to and see if we can resolve it.
//   //
//   nextGraph.ensureNode(stackQualifiedName);
//   const propPointees: Array<Valid_Stack_To_Heap_Pointees> =
//     nextGraph.getPointees(stackQualifiedName);
//   return dissernPointees(propPointees);
// };

// export const getSpreadPointees = (
//   nextGraph: PTAGraph,
//   node: PTANode,
//   iContext: string,
// ) => {
//   if (node instanceof OrdinaryObject || node instanceof OrdinaryArrayObject) {
//     const outwardEdges = nextGraph.outEdges(node.id);
//     const res: Set<PTANode> = new Set();
//     if (outwardEdges) {
//       for (const e of outwardEdges) {
//         const pointees = nextGraph.getFieldPointees(
//           node,
//           e.name,
//           iContext,
//           true,
//         );
//         pointees.forEach((p) => res.add(p));
//       }
//     }
//     return res;
//   } else {
//     return undefined;
//   }
// };

export const handleRVals = (
  mutableFlowData: PTAFlowData,
  rVal: IV_ASSIGNABLE,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
): Array<PTAFlowNode> => {
  const res: Set<PTAFlowNode> = new Set();

  // IS1_DeclarationStmt
  if (rVal instanceof IV_NUBD) {
    const nubdNode = new IRIDUM_GLOBAL("NUBD");
    addPTANode(mutableFlowData, nubdNode);
    return [ensureNodeIDAndGetPTANode(mutableFlowData, "NUBD")];
  } else if (rVal instanceof IV_Identifier && rVal.name === "undefined") {
    const nubdNode = new IRIDUM_GLOBAL("undefined");
    addPTANode(mutableFlowData, nubdNode);
    return [ensureNodeIDAndGetPTANode(mutableFlowData, "undefined")];
  } else if (rVal instanceof IV_CTHIS) {
    const cThis = ensureNodeIDAndGetPTANode(
      mutableFlowData,
      getStackQualifiedName(IV_CTHIS.lookupName(), currBB),
    );
    return [...getPointees(mutableFlowData, cThis)];
  } else if (rVal instanceof IV_STHIS) {
    const sThis = ensureNodeIDAndGetPTANode(
      mutableFlowData,
      getStackQualifiedName(IV_STHIS.lookupName(), currBB),
    );
    return [...getPointees(mutableFlowData, sThis)];
  }

  // // AMP
  // else if (rVal instanceof IV_Identifier) {
  //   return nextGraph.getPointees(
  //     getStackQualifiedName(rVal.lookupName(), currBB),
  //   );
  // } else if (rVal instanceof IV_MemberExpressionPA) {
  //   // a.x
  //   const res: Set<PTANode> = new Set();
  //   const iContext = "BB" + currBBIDx + ":" + stackInstOffset;
  //   const receiver = getStackQualifiedName(rVal.object.lookupName(), currBB);
  //   const receiverPointees: Array<Valid_Stack_To_Heap_Pointees> =
  //     nextGraph.getPointees(receiver);
  //   const dissernedProps: Set<string> = dissernProps(
  //     nextGraph,
  //     rVal.property.lookupName(),
  //     rVal.computed &&
  //       getStackQualifiedName(rVal.property.lookupName(), currBB),
  //     rVal.computed,
  //   );
  //   if (dissernedProps.size === 0) dissernedProps.add("*");

  //   const closureResults: Array<PTAGraph> = [];
  //   for (const u of receiverPointees) {
  //     for (const p of dissernedProps) {
  //       nextGraph.getFieldPointees(u, p, iContext).forEach((r) => res.add(r));
  //     }
  //   }
  //   nextGraph.union(...closureResults);
  //   return [...res];
  // } else if (rVal instanceof IV_ThisLookupPA) {
  //   // IV_This.x
  //   const res: Set<PTANode> = new Set();
  //   const iContext = "BB" + currBBIDx + ":" + stackInstOffset;
  //   const receiver = getStackQualifiedName(IV_This.lookupName(), currBB);
  //   const receiverPointees: Array<Valid_Stack_To_Heap_Pointees> =
  //     nextGraph.getPointees(receiver);
  //   const dissernedProps: Set<string> = dissernProps(
  //     nextGraph,
  //     rVal.property.lookupName(),
  //     rVal.computed &&
  //       getStackQualifiedName(rVal.property.lookupName(), currBB),
  //     rVal.computed,
  //   );
  //   if (dissernedProps.size === 0) dissernedProps.add("*");

  //   const closureResults: Array<PTAGraph> = [];
  //   for (const u of receiverPointees) {
  //     for (const p of dissernedProps) {
  //       nextGraph.getFieldPointees(u, p, iContext).forEach((r) => res.add(r));
  //     }
  //   }
  //   nextGraph.union(...closureResults);
  //   return [...res];
  // } else if (rVal instanceof IV_SuperLookupPA) {
  //   // ISP_Super.x
  //   const res: Set<PTANode> = new Set();
  //   const iContext = "BB" + currBBIDx + ":" + stackInstOffset;
  //   const receiver = getStackQualifiedName(ISP_Super.lookupName(), currBB);
  //   const receiverPointees: Array<Valid_Stack_To_Heap_Pointees> =
  //     nextGraph.getPointees(receiver);
  //   const dissernedProps: Set<string> = dissernProps(
  //     nextGraph,
  //     rVal.property.lookupName(),
  //     rVal.computed &&
  //       getStackQualifiedName(rVal.property.lookupName(), currBB),
  //     rVal.computed,
  //   );
  //   if (dissernedProps.size === 0) dissernedProps.add("*");

  //   const closureResults: Array<PTAGraph> = [];
  //   for (const u of receiverPointees) {
  //     for (const p of dissernedProps) {
  //       nextGraph.getFieldPointees(u, p, iContext).forEach((r) => res.add(r));
  //     }
  //   }
  //   nextGraph.union(...closureResults);
  //   return [...res];
  // }

  // // ALL_RVal
  // // t_IV_Literals
  // else if (rVal instanceof IV_DecimalLiteral) {
  //   const ID = rVal.lookupName();
  //   if (!nextGraph.hasNode(ID)) nextGraph.addPTANode(new DecimalNode(ID));
  //   return [nextGraph.getPTANode(ID)];
  // } else if (rVal instanceof IV_BigIntLiteral) {
  //   const ID = rVal.lookupName();
  //   if (!nextGraph.hasNode(ID)) nextGraph.addPTANode(new BigIntNode(ID));
  //   return [nextGraph.getPTANode(ID)];
  // } else if (rVal instanceof IV_StringLiteral) {
  //   const ID = rVal.value;
  //   if (!nextGraph.hasNode(ID)) nextGraph.addPTANode(new StringNode(ID));
  //   return [nextGraph.getPTANode(ID)];
  // } else if (rVal instanceof IV_NumericLiteral) {
  //   const ID = rVal.lookupName();
  //   if (!nextGraph.hasNode(ID)) nextGraph.addPTANode(new NumericNode(ID));
  //   return [nextGraph.getPTANode(ID)];
  // } else if (rVal instanceof IV_NullLiteral) {
  //   const ID = rVal.lookupName();
  //   if (!nextGraph.hasNode(ID)) nextGraph.addPTANode(new NullNode(ID));
  //   return [nextGraph.getPTANode(ID)];
  // } else if (rVal instanceof IV_BooleanLiteral) {
  //   const ID = rVal.lookupName();
  //   if (!nextGraph.hasNode(ID)) nextGraph.addPTANode(new BooleanNode(ID));
  //   return [nextGraph.getPTANode(ID)];
  // }

  // // t_IV_Regexp
  // else if (rVal instanceof IV_Regexp) {
  //   const resObj = new UnknownResultObj(
  //     getHeapQualifiedName("IV_Regexp", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   return [resObj];
  // }

  // // t_IV_Templates
  // else if (rVal instanceof IV_TemplateLiteral) {
  //   const resObj = new UnknownResultObj(
  //     getHeapQualifiedName("IV_TemplateLiteral", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   return [resObj];
  // }

  // // t_IV_Call
  // else if (rVal instanceof IV_ImportCall) {
  //   const resObj = new UnknownResultObj(
  //     getHeapQualifiedName("IV_ImportCall", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   return [resObj];
  // } else if (rVal instanceof IV_Call) {
  //   const callees = nextGraph.getPointees(
  //     getStackQualifiedName(rVal.callee.lookupName(), currBB),
  //   );

  //   const res = handleCallExpression(
  //     nextGraph,
  //     callees,
  //     rVal.args,
  //     currBB,
  //     currBBIDx,
  //     stackInstOffset,
  //   );
  //   return [...res];
  // } else if (rVal instanceof IV_SuperCall) {
  //   const resObj = new UnknownResultObj(
  //     getHeapQualifiedName("IV_SuperCall", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   return [resObj];
  // } else if (rVal instanceof IV_V8IntrinsicCall) {
  //   const resObj = new UnknownResultObj(
  //     getHeapQualifiedName("IV_V8IntrinsicCall", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   return [resObj];
  // }

  // // t_IV_META
  // else if (rVal instanceof IV_ModuleMeta) {
  //   const resObj = new UnknownResultObj(
  //     getHeapQualifiedName("IV_ModuleMeta", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   return [resObj];
  // } else if (rVal instanceof IV_NewTarget) {
  //   const resObj = new UnknownResultObj(
  //     getHeapQualifiedName("IV_NewTarget", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   return [resObj];
  // }

  // // t_IV_YIELD_AWAIT
  // else if (rVal instanceof IV_YIELD) {
  //   const resObj = new UnknownResultObj(
  //     getHeapQualifiedName("IV_YIELD", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   return [resObj];
  // } else if (rVal instanceof IV_AWAIT) {
  //   const resObj = new UnknownResultObj(
  //     getHeapQualifiedName("IV_AWAIT", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   return [resObj];
  // }

  // // t_IV_THISEXPRESSION
  // else if (rVal instanceof IV_This) {
  //   return nextGraph.getPointees(
  //     getStackQualifiedName(IV_This.lookupName(), currBB),
  //   );
  // }

  // // t_IV_BINOP
  // else if (rVal instanceof IV_ABINOP) {
  //   const resObj = new UnknownResultObj(
  //     getHeapQualifiedName("IV_ABINOP", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   return [resObj];
  // } else if (rVal instanceof IV_BBINOP) {
  //   const resObj = new UnknownResultObj(
  //     getHeapQualifiedName("IV_BBINOP", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   return [resObj];
  // } else if (rVal instanceof IV_CBINOP) {
  //   const resObj = new UnknownResultObj(
  //     getHeapQualifiedName("IV_CBINOP", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   return [resObj];
  // } else if (rVal instanceof IV_DBINOP) {
  //   const resObj = new UnknownResultObj(
  //     getHeapQualifiedName("IV_DBINOP", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   return [resObj];
  // } else if (rVal instanceof IV_EBINOP) {
  //   const resObj = new UnknownResultObj(
  //     getHeapQualifiedName("IV_EBINOP", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   return [resObj];
  // } else if (rVal instanceof IV_FBINOP) {
  //   const resObj = new UnknownResultObj(
  //     getHeapQualifiedName("IV_FBINOP", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   return [resObj];
  // }

  // // t_IV_ASSN
  // else if (rVal instanceof IV_SimpleAssn) {
  //   const res = handleRVals(
  //     nextGraph,
  //     rVal.RVal,
  //     currBB,
  //     currBBIDx,
  //     stackInstOffset,
  //   );
  //   handleSimpleAssignmentStatement(
  //     nextGraph,
  //     getStackQualifiedName(rVal.LVal.lookupName(), currBB),
  //     res,
  //   );
  //   return res;
  // } else if (rVal instanceof IV_MemberAssn) {
  //   // a.x = RVal
  //   const receiver = getStackQualifiedName(
  //     rVal.LVal.object.lookupName(),
  //     currBB,
  //   );
  //   const receiverPointees: Array<Valid_Stack_To_Heap_Pointees> =
  //     nextGraph.getPointees(receiver);

  //   const dissernedProps: Set<string> = dissernProps(
  //     nextGraph,
  //     rVal.LVal.property.lookupName(),
  //     rVal.LVal.computed &&
  //       getStackQualifiedName(rVal.LVal.property.lookupName(), currBB),
  //     rVal.LVal.computed,
  //   );
  //   if (dissernedProps.size === 0) dissernedProps.add("*");

  //   const res: Array<PTANode> = handleRVals(
  //     nextGraph,
  //     rVal.RVal,
  //     currBB,
  //     currBBIDx,
  //     stackInstOffset,
  //   );

  //   handleMemberAssignment(
  //     nextGraph,
  //     receiverPointees,
  //     res,
  //     dissernedProps,
  //     currBB,
  //     currBBIDx,
  //     stackInstOffset,
  //   );
  //   return res;
  // } else if (rVal instanceof IV_ThisAssn) {
  //   // THIS.x = RVal
  //   const receiver = getStackQualifiedName(IV_This.lookupName(), currBB);
  //   const receiverPointees: Array<Valid_Stack_To_Heap_Pointees> =
  //     nextGraph.getPointees(receiver);

  //   const dissernedProps: Set<string> = dissernProps(
  //     nextGraph,
  //     rVal.LVal.property.lookupName(),
  //     rVal.LVal.computed &&
  //       getStackQualifiedName(rVal.LVal.property.lookupName(), currBB),
  //     rVal.LVal.computed,
  //   );
  //   if (dissernedProps.size === 0) dissernedProps.add("*");

  //   const res: Array<PTANode> = handleRVals(
  //     nextGraph,
  //     rVal.RVal,
  //     currBB,
  //     currBBIDx,
  //     stackInstOffset,
  //   );

  //   handleMemberAssignment(
  //     nextGraph,
  //     receiverPointees,
  //     res,
  //     dissernedProps,
  //     currBB,
  //     currBBIDx,
  //     stackInstOffset,
  //   );
  //   // My god I forgot this!!!
  //   return res;
  // } else if (rVal instanceof IV_SuperAssn) {
  //   // SUPER.x = RVal
  //   const receiver = getStackQualifiedName(ISP_Super.lookupName(), currBB);
  //   const receiverPointees: Array<Valid_Stack_To_Heap_Pointees> =
  //     nextGraph.getPointees(receiver);

  //   const dissernedProps: Set<string> = dissernProps(
  //     nextGraph,
  //     rVal.LVal.property.lookupName(),
  //     rVal.LVal.computed &&
  //       getStackQualifiedName(rVal.LVal.property.lookupName(), currBB),
  //     rVal.LVal.computed,
  //   );
  //   if (dissernedProps.size === 0) dissernedProps.add("*");

  //   const res: Array<PTANode> = handleRVals(
  //     nextGraph,
  //     rVal.RVal,
  //     currBB,
  //     currBBIDx,
  //     stackInstOffset,
  //   );

  //   handleMemberAssignment(
  //     nextGraph,
  //     receiverPointees,
  //     res,
  //     dissernedProps,
  //     currBB,
  //     currBBIDx,
  //     stackInstOffset,
  //   );
  //   // My god I forgot this!!!
  //   return res;
  // } else if (rVal instanceof IV_ArrPatAssn) {
  //   const objDestLVal = rVal.LVal;
  //   const RValPointees = handleRVals(
  //     nextGraph,
  //     rVal.RVal,
  //     currBB,
  //     currBBIDx,
  //     stackInstOffset,
  //   );
  //   handleArrayDestructuring(
  //     nextGraph,
  //     objDestLVal,
  //     RValPointees,
  //     currBB,
  //     currBBIDx,
  //     stackInstOffset,
  //   );

  //   return RValPointees;
  // } else if (rVal instanceof IV_ObjPatAssn) {
  //   const objDestLVal = rVal.LVal;
  //   const RValPointees = handleRVals(
  //     nextGraph,
  //     rVal.RVal,
  //     currBB,
  //     currBBIDx,
  //     stackInstOffset,
  //   );
  //   handleObjectDestructuring(
  //     nextGraph,
  //     objDestLVal,
  //     RValPointees,
  //     currBB,
  //     currBBIDx,
  //     stackInstOffset,
  //   );

  //   return RValPointees;
  // }

  // // t_IV_ObjectExpression
  // else if (rVal instanceof IV_ObjectExpression) {
  //   // [Ordinary Object]
  //   const objExprID = getHeapQualifiedName(
  //     "objExpr",
  //     currBBIDx,
  //     stackInstOffset,
  //   );
  //   const objExprObj = new OrdinaryObject(objExprID);
  //   if (!nextGraph.hasNode(objExprID)) nextGraph.addPTANode(objExprObj);

  //   // Process Fields
  //   let i = 0;
  //   for (const p of rVal.properties) {
  //     if (p instanceof ISP_ObjectMethod) {
  //       const dissernedProps: Set<string> = dissernProps(
  //         nextGraph,
  //         p.key.lookupName(),
  //         p.computed && getStackQualifiedName(p.key.lookupName(), currBB),
  //         p.computed,
  //       );
  //       if (dissernedProps.size === 0) dissernedProps.add("*");
  //       let pointee:
  //         | OrdinaryFunctionObject
  //         | GetSpecialClosure
  //         | SetSpecialClosure;
  //       if (p.kind === "method") {
  //         pointee = new OrdinaryFunctionObject(
  //           getHeapQualifiedName("ObjMeth" + i, currBBIDx, stackInstOffset),
  //           p,
  //         );
  //       } else if (p.kind === "get") {
  //         pointee = new GetSpecialClosure(
  //           getHeapQualifiedName("GetMeth" + i, currBBIDx, stackInstOffset),
  //           p,
  //         );
  //       } else if (p.kind === "set") {
  //         pointee = new SetSpecialClosure(
  //           getHeapQualifiedName("SetMeth" + i, currBBIDx, stackInstOffset),
  //           p,
  //         );
  //       }
  //       nextGraph.addPTANode(pointee);

  //       //
  //       // It is safe to ignore the pending closures because we are performing set operation without
  //       // actually invoking any setters, so this should work
  //       //

  //       nextGraph.drawHeapToHeapEdge(
  //         [objExprObj],
  //         [pointee],
  //         dissernedProps,
  //         true,
  //       );
  //     } else if (p instanceof ISP_ObjectProperty) {
  //       const dissernedProps: Set<string> = dissernProps(
  //         nextGraph,
  //         p.key.lookupName(),
  //         p.computed && getStackQualifiedName(p.key.lookupName(), currBB),
  //         p.computed,
  //       );
  //       if (dissernedProps.size === 0) dissernedProps.add("*");
  //       //
  //       // [Ordinary Object] --[dissernedProps]--> PNode --e--> RVal(s)
  //       //                                               --h--> UNCHANGED

  //       // Get propValuePointees
  //       const pointees = nextGraph.getPointees(
  //         getStackQualifiedName(p.value.lookupName(), currBB),
  //       );

  //       //
  //       // It is safe to ignore the pending closures because we are performing set operation without
  //       // actually invoking any setters, so this should work
  //       //

  //       nextGraph.drawHeapToHeapEdge(
  //         [objExprObj],
  //         pointees,
  //         dissernedProps,
  //         true,
  //       );
  //     } else {
  //       const pointees = nextGraph.getPointees(
  //         getStackQualifiedName(p.arg.lookupName(), currBB),
  //       );
  //       //
  //       // [p] --[fields]--> PNodes
  //       //
  //       //
  //       // [Ordinary Object] --mergePNodes(PNodes)--> Objs
  //       for (const p of pointees) {
  //         const edges = nextGraph.outEdges(p.id);
  //         if (edges) {
  //           for (const e of edges) {
  //             const field = e.name;
  //             if (!nextGraph.hasField(objExprObj.id, field))
  //               nextGraph.addField(objExprObj.id, field);

  //             const targetPNode = nextGraph.getField(objExprObj.id, field);
  //             nextGraph.setEdge(objExprID, targetPNode.id, field, field);
  //             const outwardFromPNode = nextGraph.outEdges(e.w);
  //             if (outwardFromPNode) {
  //               for (const oE of outwardFromPNode) {
  //                 nextGraph.setEdge(targetPNode.id, oE.w, oE.name, oE.name);
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //     i++;
  //   }
  //   return [objExprObj];
  // }

  // // t_IV_ArrayExpression
  // else if (rVal instanceof IV_ArrayExpression) {
  //   //
  //   // [OrdinaryArrayObject]
  //   //

  //   const mainObjID = getHeapQualifiedName(
  //     "arrExpr",
  //     currBBIDx,
  //     stackInstOffset,
  //   );
  //   const mainObj = new OrdinaryArrayObject(mainObjID);
  //   if (!nextGraph.hasNode(mainObjID)) nextGraph.addPTANode(mainObj);

  //   let i = 0;
  //   const initTuple: Array<[string, IV_Identifier | ISP_ArgSpread]> = [];
  //   let hasSpread = false;
  //   for (const p of rVal.elements) {
  //     if (hasSpread || p instanceof ISP_ArgSpread) {
  //       initTuple.push(["*", p]);
  //       hasSpread = true;
  //     } else {
  //       initTuple.push([`${i}`, p]);
  //     }
  //     i++;
  //   }

  //   for (const [field, o] of initTuple) {
  //     if (o instanceof IV_Identifier) {
  //       //
  //       // [OrdinaryArrayObject] --field--> pointees(ID)
  //       //
  //       const lookupId = getStackQualifiedName(o.lookupName(), currBB);
  //       const pointees = nextGraph.getPointees(lookupId);
  //       nextGraph.drawHeapToHeapEdge([mainObj], pointees, [field], true);
  //     } else {
  //       //
  //       // [OrdinaryArrayObject] --field--> { PTANode(allOutwardEdges(x)) | x = pointees(ID) }
  //       //
  //       const lookupId = getStackQualifiedName(o.arg.lookupName(), currBB);
  //       const pointees = nextGraph.getPointees(lookupId);

  //       for (const p of pointees) {
  //         const edges = nextGraph.outEdges(p.id);
  //         const resultObjs: Array<PTANode> = edges
  //           ? edges.map((e) => nextGraph.getPTANode(e.w))
  //           : [];
  //         nextGraph.drawHeapToHeapEdge([mainObj], resultObjs, [field], true);
  //       }
  //     }
  //   }

  //   return [mainObj];
  // }

  // // t_IV_ConditionalExpression
  // else if (rVal instanceof IV_ConditionalExpression) {
  //   const resObj = new CSepObject(
  //     getHeapQualifiedName("CondExpr", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   const pointees1 = nextGraph.getPointees(
  //     getStackQualifiedName(rVal.consequent.lookupName(), currBB),
  //   );
  //   const pointees2 = nextGraph.getPointees(
  //     getStackQualifiedName(rVal.alternate.lookupName(), currBB),
  //   );
  //   for (const p of pointees1) nextGraph.setEdge(resObj.id, p.id, "T", "T");
  //   for (const p of pointees2) nextGraph.setEdge(resObj.id, p.id, "F", "F");
  //   return [resObj];
  // }

  // // t_IV_FunctionExpression
  // else if (rVal instanceof IV_FunctionExpression) {
  //   const funID = getHeapQualifiedName("funExpr", currBBIDx, stackInstOffset);
  //   const funObj = new OrdinaryFunctionObject(funID, rVal);
  //   if (!nextGraph.hasNode(funID)) nextGraph.addPTANode(funObj);
  //   return [funObj];
  // }

  // // t_IV_ArrowFunctionExpression
  // else if (rVal instanceof IV_ArrowFunctionExpression) {
  //   const funID = getHeapQualifiedName(
  //     "arrowFunExpr",
  //     currBBIDx,
  //     stackInstOffset,
  //   );
  //   const funObj = new OrdinaryFunctionObject(funID, rVal);
  //   if (!nextGraph.hasNode(funID)) nextGraph.addPTANode(funObj);
  //   return [funObj];
  // }

  // // t_IV_NewExpression
  // else if (rVal instanceof IV_NewExpression) {
  //   // debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_NewExpression")
  //   const resObj = new UnknownResultObj(
  //     getHeapQualifiedName("IV_NewExpression", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   return [resObj];
  // }

  // // t_IV_UnaryExpression
  // else if (rVal instanceof IV_AUNOP) {
  //   const resObj = new UnknownResultObj(
  //     getHeapQualifiedName("IV_AUNOP", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   return [resObj];
  // } else if (rVal instanceof IV_BUNOP) {
  //   const resObj = new UnknownResultObj(
  //     getHeapQualifiedName("IV_BUNOP", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   return [resObj];
  // } else if (rVal instanceof IV_CUNOP) {
  //   const resObj = new UnknownResultObj(
  //     getHeapQualifiedName("IV_CUNOP", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   return [resObj];
  // } else if (rVal instanceof IV_DUNOP) {
  //   const resObj = new UnknownResultObj(
  //     getHeapQualifiedName("IV_DUNOP", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   return [resObj];
  // }

  // // t_IV_UpdateExpression
  // else if (rVal instanceof IV_UpdateExpression) {
  //   const resObj = new UnknownResultObj(
  //     getHeapQualifiedName("IV_UpdateExpression", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   return [resObj];
  // }

  // // t_IV_ClassExpression
  // else if (rVal instanceof IV_ClassExpression) {
  //   //
  //   // [ClassObject]
  //   //

  //   const mainObjID = getHeapQualifiedName(
  //     "classExpr",
  //     currBBIDx,
  //     stackInstOffset,
  //   );
  //   const mainObj = new ClassObject(mainObjID);
  //   if (!nextGraph.hasNode(mainObjID)) nextGraph.addPTANode(mainObj);

  //   if (rVal.heritage) {
  //     const pointees = nextGraph.getPointees(
  //       getStackQualifiedName(rVal.heritage.lookupName(), currBB),
  //     );
  //     nextGraph.drawHeapToHeapEdge(
  //       [mainObj],
  //       pointees,
  //       ["$$hertitage$$"],
  //       true,
  //     );
  //   }

  //   return [mainObj];
  // }

  // // t_IV_ForIterators
  // else if (rVal instanceof IV_InIterator) {
  //   const resObj = new UnknownResultObj(
  //     getHeapQualifiedName("IV_InIterator", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   return [resObj];
  // } else if (rVal instanceof IV_OfIterator) {
  //   const resObj = new UnknownResultObj(
  //     getHeapQualifiedName("IV_OfIterator", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   return [resObj];
  // } else if (rVal instanceof IV_LoopNext) {
  //   const resObj = new UnknownResultObj(
  //     getHeapQualifiedName("IV_LoopNext", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   return [resObj];
  // } else if (rVal instanceof IV_HasLoopNext) {
  //   const resObj = new UnknownResultObj(
  //     getHeapQualifiedName("IV_HasLoopNext", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   return [resObj];
  // }

  // // t_IV_JSX
  // else if (rVal instanceof IV_PJSX) {
  //   const resObj = new PJSXObject(
  //     getHeapQualifiedName("PJSX", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);

  //   for (const c of rVal.children) {
  //     const pointees = nextGraph.getPointees(
  //       getStackQualifiedName(c.lookupName(), currBB),
  //     );
  //     nextGraph.drawHeapToHeapEdge([resObj], pointees, ["children"], true);
  //   }
  //   return [resObj];
  // } else if (rVal instanceof IV_JSX) {
  //   const currComponentPointees = nextGraph.getPointees(
  //     getStackQualifiedName(rVal.tag.lookupName(), currBB),
  //   );

  //   const resObj = new JSXObject(
  //     getHeapQualifiedName("JSX", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);

  //   //
  //   // Process Component Closures
  //   //

  //   const funObjs = currComponentPointees.filter(
  //     (n) => n instanceof OrdinaryFunctionObject,
  //   );

  //   const evalRes = handleCallExpression(
  //     nextGraph,
  //     funObjs,
  //     [rVal.props],
  //     currBB,
  //     currBBIDx,
  //     stackInstOffset,
  //   );

  //   nextGraph.drawHeapToHeapEdge(
  //     [resObj],
  //     currComponentPointees.filter(
  //       (n) => !(n instanceof OrdinaryFunctionObject),
  //     ),
  //     ["component"],
  //     true,
  //   );

  //   nextGraph.drawHeapToHeapEdge([resObj], [...evalRes], ["component"], true);

  //   for (const c of rVal.children) {
  //     const pointees = nextGraph.getPointees(
  //       getStackQualifiedName(c.lookupName(), currBB),
  //     );
  //     nextGraph.drawHeapToHeapEdge([resObj], pointees, ["children"], true);
  //   }

  //   return [resObj];
  // } else if (rVal instanceof IV_FJSX) {
  //   const resObj = new FJSXObject(
  //     getHeapQualifiedName("FJSX", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);

  //   for (const c of rVal.children) {
  //     const pointees = nextGraph.getPointees(
  //       getStackQualifiedName(c.lookupName(), currBB),
  //     );
  //     nextGraph.drawHeapToHeapEdge([resObj], pointees, ["children"], true);
  //   }
  //   return [resObj];
  // }

  debugConfig.logger.throwIriError(
    "TODO: PTA - Unreachable fallthrough reached, something is prolly wrong in the code!!!",
  );

  return [...res];
};
