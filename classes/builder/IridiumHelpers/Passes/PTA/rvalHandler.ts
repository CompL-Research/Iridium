import debugConfig from "#debugConfig";
import { IV_Identifier, IV_MemberExpressionPA, IV_SuperLookupPA, IV_ThisLookupPA } from "../../ALL_AMP/ALL_AMP.ts";
import { ISP_ArgSpread, ISP_ObjectMethod, ISP_ObjectProperty, ISP_Super } from "../../ALL_RVal/ALL_ISP.ts";
import { IV_ASSIGNABLE } from "../../ALL_RVal/ALL_RVal.ts";
import { IV_ArrayExpression } from "../../ALL_RVal/IV_ArrayExpression.ts";
import { IV_ArrowFunctionExpression } from "../../ALL_RVal/IV_ArrowFunctionExpression.ts";
import { IV_ArrPatAssn, IV_MemberAssn, IV_ObjPatAssn, IV_SimpleAssn, IV_SuperAssn, IV_ThisAssn } from "../../ALL_RVal/IV_Assignment.ts";
import { IV_ABINOP, IV_BBINOP, IV_CBINOP, IV_DBINOP, IV_EBINOP, IV_FBINOP } from "../../ALL_RVal/IV_Binop.ts";
import { IV_Call, IV_ImportCall, IV_SuperCall, IV_V8IntrinsicCall } from "../../ALL_RVal/IV_Call.ts";
import { IV_ClassExpression } from "../../ALL_RVal/IV_ClassExpression.ts";
import { IV_ConditionalExpression } from "../../ALL_RVal/IV_ConditionalExpression.ts";
import { IV_FunctionExpression } from "../../ALL_RVal/IV_FunctionExpression.ts";
import { IV_FJSX, IV_JSX, IV_PJSX } from "../../ALL_RVal/IV_JSX.ts";
import { IV_BigIntLiteral, IV_BooleanLiteral, IV_DecimalLiteral, IV_NullLiteral, IV_NumericLiteral, IV_StringLiteral } from "../../ALL_RVal/IV_Literals.ts";
import { IV_HasLoopNext, IV_InIterator, IV_LoopNext, IV_OfIterator } from "../../ALL_RVal/IV_LoopIterators.ts";
import { IV_ModuleMeta, IV_NewTarget } from "../../ALL_RVal/IV_META.ts";
import { IV_NewExpression } from "../../ALL_RVal/IV_NewExpression.ts";
import { IV_CTHIS, IV_NUBD, IV_STHIS } from "../../ALL_RVal/IV_NonLang.ts";
import { IV_ObjectExpression } from "../../ALL_RVal/IV_ObjectExpression.ts";
import { IV_Regexp } from "../../ALL_RVal/IV_Regexp.ts";
import { IV_TemplateLiteral } from "../../ALL_RVal/IV_Templates.ts";
import { IV_This } from "../../ALL_RVal/IV_This.ts";
import { IV_AUNOP, IV_BUNOP, IV_CUNOP, IV_DUNOP } from "../../ALL_RVal/IV_Unop.ts";
import { IV_UpdateExpression } from "../../ALL_RVal/IV_UpdateExpression.ts";
import { IV_AWAIT, IV_YIELD } from "../../ALL_RVal/IV_YIELD_AWAIT.ts";
import { BB } from "../../BB.ts";
import { handleMemberAssignment, handleSimpleAssignmentStatement } from "./handleAssignments.ts";
import { BigIntNode, BooleanNode, ClassObject, DecimalNode, GetSpecialClosure, GlobalNode, NullNode, NumericNode, OrdinaryArrayObject, OrdinaryFunctionObject, OrdinaryObject, PTANode, SetSpecialClosure, StringNode, Valid_Stack_To_Heap_Pointees } from "./nodes.ts";
import { PTAGraph } from "./PTAGraph.ts";
import { dissernPointees, getHeapQualifiedName, getStackQualifiedName } from "./util.ts";

export const dissernProps = (nextGraph: PTAGraph, name: string, stackQualifiedName: string, computed: boolean): Set<string> => {
  let res: Set<string> = new Set()
  if (!computed) { res.add(name); return res; }
  // 
  // We have a computed prop, we must find all the literals it points to and see if we can resolve it.
  // 
  nextGraph.ensureNode(stackQualifiedName);
  let propPointees: Array<Valid_Stack_To_Heap_Pointees> = nextGraph.getPointees(stackQualifiedName);
  return dissernPointees(propPointees);
}

export const handleRVals = (nextGraph: PTAGraph, rVal: IV_ASSIGNABLE, currBB: BB, currBBIDx: string, stackInstOffset: number): Array<PTANode> => {
  let res: Set<PTANode> = new Set();

  // IS1_DeclarationStmt
  if (rVal instanceof IV_NUBD) {
    let ID = getStackQualifiedName("NUBD", currBB)
    if (!nextGraph.hasNode(ID)) nextGraph.addPTANode(new GlobalNode(ID));
    return [nextGraph.getPTANode(ID)]
  } else if (rVal instanceof IV_Identifier && rVal.name === "undefined") {
    let ID = getStackQualifiedName("undefined", currBB)
    if (!nextGraph.hasNode(ID)) nextGraph.addPTANode(new GlobalNode(ID));
    return [nextGraph.getPTANode(ID)]
  } else if (rVal instanceof IV_CTHIS) {
    return nextGraph.getPointees(getStackQualifiedName(IV_CTHIS.lookupName(), currBB));
  } else if (rVal instanceof IV_STHIS) {
    return nextGraph.getPointees(getStackQualifiedName(IV_STHIS.lookupName(), currBB));
  }

  // AMP
  else if (rVal instanceof IV_Identifier) {
    return nextGraph.getPointees(getStackQualifiedName(rVal.lookupName(), currBB));
  } else if (rVal instanceof IV_MemberExpressionPA) {
    // a.x
    let res: Set<PTANode> = new Set();
    let iContext = "BB" + currBBIDx + ":" + stackInstOffset;
    let receiver = getStackQualifiedName(rVal.object.lookupName(), currBB)
    let receiverPointees: Array<Valid_Stack_To_Heap_Pointees> = nextGraph.getPointees(receiver)
    let dissernedProps: Set<string> = dissernProps(nextGraph, rVal.property.lookupName(), rVal.computed && getStackQualifiedName(rVal.property.lookupName(), currBB), rVal.computed);
    let closureResults: Array<PTAGraph> = new Array()
    for (let u of receiverPointees) {
      for (let p of dissernedProps) {
        nextGraph.getFieldPointees(u, p, iContext).forEach(r => res.add(r))
      }
    }
    nextGraph.union(...closureResults)
    return [...res];
  } else if (rVal instanceof IV_ThisLookupPA) {
    // IV_This.x
    let res: Set<PTANode> = new Set();
    let iContext = "BB" + currBBIDx + ":" + stackInstOffset;
    let receiver = getStackQualifiedName(IV_This.lookupName(), currBB)
    let receiverPointees: Array<Valid_Stack_To_Heap_Pointees> = nextGraph.getPointees(receiver)
    let dissernedProps: Set<string> = dissernProps(nextGraph, rVal.property.lookupName(), rVal.computed && getStackQualifiedName(rVal.property.lookupName(), currBB), rVal.computed);
    let closureResults: Array<PTAGraph> = new Array()
    for (let u of receiverPointees) {
      for (let p of dissernedProps) {
        nextGraph.getFieldPointees(u, p, iContext).forEach(r => res.add(r))
      }
    }
    nextGraph.union(...closureResults)
    return [...res];
  } else if (rVal instanceof IV_SuperLookupPA) {
    // ISP_Super.x
    let res: Set<PTANode> = new Set();
    let iContext = "BB" + currBBIDx + ":" + stackInstOffset;
    let receiver = getStackQualifiedName(ISP_Super.lookupName(), currBB)
    let receiverPointees: Array<Valid_Stack_To_Heap_Pointees> = nextGraph.getPointees(receiver)
    let dissernedProps: Set<string> = dissernProps(nextGraph, rVal.property.lookupName(), rVal.computed && getStackQualifiedName(rVal.property.lookupName(), currBB), rVal.computed);
    let closureResults: Array<PTAGraph> = new Array()
    for (let u of receiverPointees) {
      for (let p of dissernedProps) {
        nextGraph.getFieldPointees(u, p, iContext).forEach(r => res.add(r))
      }
    }
    nextGraph.union(...closureResults)
    return [...res];
  }

  // ALL_RVal
  // t_IV_Literals
  else if (rVal instanceof IV_DecimalLiteral) {
    let ID = rVal.lookupName()
    if (!nextGraph.hasNode(ID)) nextGraph.addPTANode(new DecimalNode(ID));
    return [nextGraph.getPTANode(ID)]
  } else if (rVal instanceof IV_BigIntLiteral) {
    let ID = rVal.lookupName()
    if (!nextGraph.hasNode(ID)) nextGraph.addPTANode(new BigIntNode(ID));
    return [nextGraph.getPTANode(ID)]
  } else if (rVal instanceof IV_StringLiteral) {
    let ID = rVal.value;
    if (!nextGraph.hasNode(ID)) nextGraph.addPTANode(new StringNode(ID));
    return [nextGraph.getPTANode(ID)]
  } else if (rVal instanceof IV_NumericLiteral) {
    let ID = rVal.lookupName()
    if (!nextGraph.hasNode(ID)) nextGraph.addPTANode(new NumericNode(ID));
    return [nextGraph.getPTANode(ID)]
  } else if (rVal instanceof IV_NullLiteral) {
    let ID = rVal.lookupName()
    if (!nextGraph.hasNode(ID)) nextGraph.addPTANode(new NullNode(ID));
    return [nextGraph.getPTANode(ID)]
  } else if (rVal instanceof IV_BooleanLiteral) {
    let ID = rVal.lookupName()
    if (!nextGraph.hasNode(ID)) nextGraph.addPTANode(new BooleanNode(ID));
    return [nextGraph.getPTANode(ID)]
  }

  // t_IV_Regexp
  else if (rVal instanceof IV_Regexp) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_Regexp")
  }

  // t_IV_Templates
  else if (rVal instanceof IV_TemplateLiteral) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_TemplateLiteral")
  }

  // t_IV_Call
  else if (rVal instanceof IV_ImportCall) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_ImportCall")
  } else if (rVal instanceof IV_Call) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_Call")
  } else if (rVal instanceof IV_SuperCall) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_SuperCall")
  } else if (rVal instanceof IV_V8IntrinsicCall) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_V8IntrinsicCall")
  }

  // t_IV_META
  else if (rVal instanceof IV_ModuleMeta) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_ModuleMeta")
  } else if (rVal instanceof IV_NewTarget) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_NewTarget")
  }

  // t_IV_YIELD_AWAIT
  else if (rVal instanceof IV_YIELD) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_YIELD")
  } else if (rVal instanceof IV_AWAIT) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_AWAIT")
  }

  // t_IV_THISEXPRESSION
  else if (rVal instanceof IV_This) {
    return nextGraph.getPointees(getStackQualifiedName(IV_This.lookupName(), currBB));
  }

  // t_IV_BINOP
  else if (rVal instanceof IV_ABINOP) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_ABINOP")
  } else if (rVal instanceof IV_BBINOP) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_BBINOP")
  } else if (rVal instanceof IV_CBINOP) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_CBINOP")
  } else if (rVal instanceof IV_DBINOP) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_DBINOP")
  } else if (rVal instanceof IV_EBINOP) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_EBINOP")
  } else if (rVal instanceof IV_FBINOP) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_FBINOP")
  }

  // t_IV_ASSN
  else if (rVal instanceof IV_SimpleAssn) {
    let res = handleRVals(nextGraph, rVal.RVal, currBB, currBBIDx, stackInstOffset)
    handleSimpleAssignmentStatement(nextGraph, getStackQualifiedName(rVal.LVal.lookupName(), currBB), res)
    return res;
  } else if (rVal instanceof IV_MemberAssn) {
    // a.x = RVal
    let receiver = getStackQualifiedName(rVal.LVal.object.lookupName(), currBB)
    let receiverPointees: Array<Valid_Stack_To_Heap_Pointees> = nextGraph.getPointees(receiver)

    let dissernedProps: Set<string> = dissernProps(nextGraph, rVal.LVal.property.lookupName(), rVal.LVal.computed && getStackQualifiedName(rVal.LVal.property.lookupName(), currBB), rVal.LVal.computed);

    let res: Array<PTANode> = handleRVals(nextGraph, rVal.RVal, currBB, currBBIDx, stackInstOffset)

    handleMemberAssignment(nextGraph, receiverPointees, res, dissernedProps, currBB, currBBIDx, stackInstOffset);
    return res;
  } else if (rVal instanceof IV_ThisAssn) {
    // THIS.x = RVal
    let receiver = getStackQualifiedName(IV_This.lookupName(), currBB)
    let receiverPointees: Array<Valid_Stack_To_Heap_Pointees> = nextGraph.getPointees(receiver)

    let dissernedProps: Set<string> = dissernProps(nextGraph, rVal.LVal.property.lookupName(), rVal.LVal.computed && getStackQualifiedName(rVal.LVal.property.lookupName(), currBB), rVal.LVal.computed);

    let res: Array<PTANode> = handleRVals(nextGraph, rVal.RVal, currBB, currBBIDx, stackInstOffset)

    handleMemberAssignment(nextGraph, receiverPointees, res, dissernedProps, currBB, currBBIDx, stackInstOffset);

  } else if (rVal instanceof IV_SuperAssn) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_SuperAssn")
  } else if (rVal instanceof IV_ArrPatAssn) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_ArrPatAssn")
  } else if (rVal instanceof IV_ObjPatAssn) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_ObjPatAssn")
  }

  // t_IV_ObjectExpression
  else if (rVal instanceof IV_ObjectExpression) {
    // [Ordinary Object]
    let objExprID = getHeapQualifiedName("objExpr", currBBIDx, stackInstOffset)
    let objExprObj = new OrdinaryObject(objExprID)
    if (!nextGraph.hasNode(objExprID)) nextGraph.addPTANode(objExprObj);

    // Process Fields
    let i = 0
    for (let p of rVal.properties) {
      if (p instanceof ISP_ObjectMethod) {
        let dissernedProps: Set<string> = dissernProps(nextGraph, p.key.lookupName(), p.computed && getStackQualifiedName(p.key.lookupName(), currBB), p.computed);
        let pointee: OrdinaryFunctionObject | GetSpecialClosure | SetSpecialClosure;
        if (p.kind === "method") {
          pointee = new OrdinaryFunctionObject(getHeapQualifiedName('ObjMeth' + i, currBBIDx, stackInstOffset), p)
        } else if (p.kind === "get") {
          pointee = new GetSpecialClosure(getHeapQualifiedName('GetMeth' + i, currBBIDx, stackInstOffset), p)
        } else if (p.kind === "set") {
          pointee = new SetSpecialClosure(getHeapQualifiedName('SetMeth' + i, currBBIDx, stackInstOffset), p)
        }
        nextGraph.addPTANode(pointee)

        // 
        // It is safe to ignore the pending closures because we are performing set operation without 
        // actually invoking any setters, so this should work
        // 

        nextGraph.drawHeapToHeapEdge([objExprObj], [pointee], dissernedProps, true)

      } else if (p instanceof ISP_ObjectProperty) {
        let dissernedProps: Set<string> = dissernProps(nextGraph, p.key.lookupName(), p.computed && getStackQualifiedName(p.key.lookupName(), currBB), p.computed);
        // 
        // [Ordinary Object] --[dissernedProps]--> PNode --e--> RVal(s)
        //                                               --h--> UNCHANGED

        // Get propValuePointees
        let pointees = nextGraph.getPointees(getStackQualifiedName(p.value.lookupName(), currBB));

        // 
        // It is safe to ignore the pending closures because we are performing set operation without 
        // actually invoking any setters, so this should work
        // 

        nextGraph.drawHeapToHeapEdge([objExprObj], pointees, dissernedProps, true)

      } else {
        let pointees = nextGraph.getPointees(getStackQualifiedName(p.arg.lookupName(), currBB));
        // 
        // [p] --[fields]--> PNodes
        // 
        // 
        // [Ordinary Object] --mergePNodes(PNodes)--> Objs
        for (let p of pointees) {
          let edges = nextGraph.outEdges(p.id)
          if (edges) {
            for (let e of edges) {
              let field = e.name
              if (!nextGraph.hasField(objExprObj.id, field)) nextGraph.addField(objExprObj.id, field);

              let targetPNode = nextGraph.getField(objExprObj.id, field)
              nextGraph.setEdge(objExprID, targetPNode.id, field, field)
              let outwardFromPNode = nextGraph.outEdges(e.w)
              if (outwardFromPNode) {
                for (let oE of outwardFromPNode) {
                  nextGraph.setEdge(targetPNode.id, oE.w, oE.name, oE.name)
                }
              }
            }
          }
        }

      }
      i++;
    }
    return [objExprObj]
  }

  // t_IV_ArrayExpression
  else if (rVal instanceof IV_ArrayExpression) {
    // 
    // [OrdinaryArrayObject]
    // 

    let mainObjID = getHeapQualifiedName("arrExpr", currBBIDx, stackInstOffset);
    let mainObj = new OrdinaryArrayObject(mainObjID)
    if (!nextGraph.hasNode(mainObjID)) nextGraph.addPTANode(mainObj);

    let i = 0;
    let initTuple: Array<[string, IV_Identifier | ISP_ArgSpread]> = new Array()
    let hasSpread = false;
    for (let p of rVal.elements) {
      if (hasSpread || p instanceof ISP_ArgSpread) {
        initTuple.push(["*", p])
        hasSpread = true;
      } else {
        initTuple.push([`${i}`, p])
      }
      i++;
    }

    for (let [field, o] of initTuple) {
      if (o instanceof IV_Identifier) {
        // 
        // [OrdinaryArrayObject] --field--> pointees(ID)
        //  
        let lookupId = getStackQualifiedName(o.lookupName(), currBB)
        let pointees = nextGraph.getPointees(lookupId)
        nextGraph.drawHeapToHeapEdge([mainObj], pointees, [field], true)
      } else {
        // 
        // [OrdinaryArrayObject] --field--> { PTANode(allOutwardEdges(x)) | x = pointees(ID) }
        //  
        let lookupId = getStackQualifiedName(o.arg.lookupName(), currBB)
        let pointees = nextGraph.getPointees(lookupId)

        for (let p of pointees) {
          let edges = nextGraph.outEdges(p.id)
          let resultObjs: Array<PTANode> = edges ? edges.map(e => nextGraph.getPTANode(e.w)) : []
          nextGraph.drawHeapToHeapEdge([mainObj], resultObjs, [field], true)
        }
      }
    }

    return [mainObj]
  }

  // t_IV_ConditionalExpression
  else if (rVal instanceof IV_ConditionalExpression) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_ConditionalExpression")
  }

  // t_IV_FunctionExpression
  else if (rVal instanceof IV_FunctionExpression) {
    let funID = getHeapQualifiedName("funExpr", currBBIDx, stackInstOffset);
    let funObj = new OrdinaryFunctionObject(funID, rVal)
    if (!nextGraph.hasNode(funID)) nextGraph.addPTANode(funObj);
    return [funObj];
  }

  // t_IV_ArrowFunctionExpression
  else if (rVal instanceof IV_ArrowFunctionExpression) {
    let funID = getHeapQualifiedName("arrowFunExpr", currBBIDx, stackInstOffset);
    let funObj = new OrdinaryFunctionObject(funID, rVal)
    if (!nextGraph.hasNode(funID)) nextGraph.addPTANode(funObj);
    return [funObj];
  }

  // t_IV_NewExpression
  else if (rVal instanceof IV_NewExpression) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_NewExpression")
  }

  // t_IV_UnaryExpression
  else if (rVal instanceof IV_AUNOP) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_AUNOP")
  } else if (rVal instanceof IV_BUNOP) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_BUNOP")
  } else if (rVal instanceof IV_CUNOP) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_CUNOP")
  } else if (rVal instanceof IV_DUNOP) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_DUNOP")
  }

  // t_IV_UpdateExpression
  else if (rVal instanceof IV_UpdateExpression) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_UpdateExpression")
  }

  // t_IV_ClassExpression
  else if (rVal instanceof IV_ClassExpression) {
    // 
    // [ClassObject]
    // 

    let mainObjID = getHeapQualifiedName("classExpr", currBBIDx, stackInstOffset);
    let mainObj = new ClassObject(mainObjID)
    if (!nextGraph.hasNode(mainObjID)) nextGraph.addPTANode(mainObj);

    if (rVal.heritage) {
      let pointees = nextGraph.getPointees(getStackQualifiedName(rVal.heritage.lookupName(), currBB))
      nextGraph.drawHeapToHeapEdge([mainObj], pointees, ["$$hertitage$$"], true)
    }

    return [mainObj]
  }

  // t_IV_ForIterators
  else if (rVal instanceof IV_InIterator) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_InIterator")
  } else if (rVal instanceof IV_OfIterator) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_OfIterator")
  } else if (rVal instanceof IV_LoopNext) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_LoopNext")
  } else if (rVal instanceof IV_HasLoopNext) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_HasLoopNext")
  }

  // t_IV_JSX
  else if (rVal instanceof IV_PJSX) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_PJSX")
  } else if (rVal instanceof IV_JSX) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_JSX")
  } else if (rVal instanceof IV_FJSX) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_FJSX")
  }

  return [...res];
}