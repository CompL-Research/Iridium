import { IV_Identifier, IV_MemberExpressionPA, IV_ThisLookupPA, IV_SuperLookupPA } from "../../ALL_AMP/ALL_AMP.ts";
import { ISP_Super, ISP_ObjectMethod, ISP_ObjectProperty } from "../../ALL_RVal/ALL_ISP.ts";
import { IV_ASSIGNABLE } from "../../ALL_RVal/ALL_RVal.ts";
import { IV_ArrayExpression } from "../../ALL_RVal/IV_ArrayExpression.ts";
import { IV_ArrowFunctionExpression } from "../../ALL_RVal/IV_ArrowFunctionExpression.ts";
import { IV_SimpleAssn, IV_MemberAssn, IV_ThisAssn, IV_SuperAssn, IV_ArrPatAssn, IV_ObjPatAssn } from "../../ALL_RVal/IV_Assignment.ts";
import { IV_ABINOP, IV_BBINOP, IV_CBINOP, IV_DBINOP, IV_EBINOP, IV_FBINOP } from "../../ALL_RVal/IV_Binop.ts";
import { IV_ImportCall, IV_Call, IV_SuperCall, IV_V8IntrinsicCall } from "../../ALL_RVal/IV_Call.ts";
import { IV_ClassExpression } from "../../ALL_RVal/IV_ClassExpression.ts";
import { IV_ConditionalExpression } from "../../ALL_RVal/IV_ConditionalExpression.ts";
import { IV_FunctionExpression } from "../../ALL_RVal/IV_FunctionExpression.ts";
import { IV_PJSX, IV_JSX, IV_FJSX } from "../../ALL_RVal/IV_JSX.ts";
import { IV_DecimalLiteral, IV_BigIntLiteral, IV_StringLiteral, IV_NumericLiteral, IV_NullLiteral, IV_BooleanLiteral } from "../../ALL_RVal/IV_Literals.ts";
import { IV_InIterator, IV_OfIterator, IV_LoopNext, IV_HasLoopNext } from "../../ALL_RVal/IV_LoopIterators.ts";
import { IV_ModuleMeta, IV_NewTarget } from "../../ALL_RVal/IV_META.ts";
import { IV_NewExpression } from "../../ALL_RVal/IV_NewExpression.ts";
import { IV_NUBD, IV_CTHIS, IV_STHIS } from "../../ALL_RVal/IV_NonLang.ts";
import { IV_ObjectExpression } from "../../ALL_RVal/IV_ObjectExpression.ts";
import { IV_Regexp } from "../../ALL_RVal/IV_Regexp.ts";
import { IV_TemplateLiteral } from "../../ALL_RVal/IV_Templates.ts";
import { IV_This } from "../../ALL_RVal/IV_This.ts";
import { IV_AUNOP, IV_BUNOP, IV_CUNOP, IV_DUNOP } from "../../ALL_RVal/IV_Unop.ts";
import { IV_UpdateExpression } from "../../ALL_RVal/IV_UpdateExpression.ts";
import { IV_YIELD, IV_AWAIT } from "../../ALL_RVal/IV_YIELD_AWAIT.ts";
import { BB } from "../../BB.ts";
import { BigIntNode, BooleanNode, DecimalNode, GetSpecialClosure, GlobalNode, NullNode, NumericNode, OrdinaryFunctionObject, OrdinaryObject, PTANode, SetSpecialClosure, StringNode, SymbolNode, Valid_Stack_To_Heap_Pointees } from "./nodes.ts";
import { PTAGraph } from "./PTAGraph.ts";
import { dissernPointees, getHeapQualifiedName, getStackQualifiedName } from "./util.ts";
import debugConfig from "#debugConfig";
import { handleSimpleAssignmentStatement } from "./handleAssignments.ts";

export const dissernProps = (nextGraph: PTAGraph, name : string, stackQualifiedName: string, computed: boolean) : Set<string> => {
  let res : Set<string> = new Set()
  if (!computed) { res.add(name); return res; }
  // 
  // We have a computed prop, we must find all the literals it points to and see if we can resolve it.
  // 
  nextGraph.ensureNode(stackQualifiedName);
  let propPointees : Array<Valid_Stack_To_Heap_Pointees> = nextGraph.getPointees(stackQualifiedName);
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
    let ID = getStackQualifiedName(IV_CTHIS.lookupName(), currBB)
    if (!nextGraph.hasNode(ID)) nextGraph.addPTANode(new GlobalNode(ID));
    return [nextGraph.getPTANode(ID)]
  } else if (rVal instanceof IV_STHIS) {
    let ID = getStackQualifiedName(IV_STHIS.lookupName(), currBB)
    if (!nextGraph.hasNode(ID)) nextGraph.addPTANode(new GlobalNode(ID));
    return [nextGraph.getPTANode(ID)]
  }

  // AMP
  else if (rVal instanceof IV_Identifier) {
    return nextGraph.getPointees(getStackQualifiedName(rVal.lookupName(), currBB));
  } else if (rVal instanceof IV_MemberExpressionPA) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_MemberExpressionPA")
  } else if (rVal instanceof IV_ThisLookupPA) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_ThisLookupPA")
  } else if (rVal instanceof IV_SuperLookupPA) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_SuperLookupPA")
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
    let ID = rVal.lookupName()
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
    let ID = rVal.toString()
    if (!nextGraph.hasNode(ID)) nextGraph.addPTANode(new SymbolNode(ID));
    return [nextGraph.getPTANode(ID)]
  }

  // t_IV_Templates
  else if (rVal instanceof IV_TemplateLiteral) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_TemplateLiteral")
  }

  // t_IV_Call
  else if (rVal instanceof IV_ImportCall) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_TemplateLiteral")
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
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_This")
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
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_MemberAssn")
  } else if (rVal instanceof IV_ThisAssn) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_ThisAssn")
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
        let dissernedProps: Set<string> = dissernProps(nextGraph, p.key.lookupName(), getStackQualifiedName(p.key.lookupName(), currBB), p.computed);
        let pointee : OrdinaryFunctionObject | GetSpecialClosure | SetSpecialClosure;
        if (p.kind === "method") {
          pointee = new OrdinaryFunctionObject(getHeapQualifiedName('ObjMeth' + i, currBBIDx, stackInstOffset), p)
        } else if (p.kind === "get") {
          pointee = new GetSpecialClosure(getHeapQualifiedName('GetMeth' + i, currBBIDx, stackInstOffset), p)
        } else if (p.kind === "set") {
          pointee = new SetSpecialClosure(getHeapQualifiedName('GetMeth' + i, currBBIDx, stackInstOffset), p)
        }
        nextGraph.addPTANode(pointee)
        nextGraph.drawHeapToHeapEdge([objExprObj], [pointee], [...dissernedProps], true);
      } else if (p instanceof ISP_ObjectProperty) {
        let dissernedProps: Set<string> = dissernProps(nextGraph, p.key.lookupName(), getStackQualifiedName(p.key.lookupName(), currBB), p.computed);

        // [Ordinary Object] --[dissernedProps]--> PNode --e--> RVal(s)
        //                                               --h--> UNCHANGED

        // Get propValuePointees
        let pointees = nextGraph.getPointees(getStackQualifiedName(p.value.lookupName(), currBB));
        nextGraph.drawHeapToHeapEdge([objExprObj], pointees, [...dissernedProps], true);
      } else {
        debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_ObjectExpression - ISP_ArgSpread")
      }
      i++;
    }
    return [objExprObj]
  }

  // t_IV_ArrayExpression
  else if (rVal instanceof IV_ArrayExpression) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_ArrayExpression")
  }

  // t_IV_ConditionalExpression
  else if (rVal instanceof IV_ConditionalExpression) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_ConditionalExpression")
  }

  // t_IV_FunctionExpression
  else if (rVal instanceof IV_FunctionExpression) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_FunctionExpression")
  }

  // t_IV_ArrowFunctionExpression
  else if (rVal instanceof IV_ArrowFunctionExpression) {
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_ArrowFunctionExpression")
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
    debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_ClassExpression")
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