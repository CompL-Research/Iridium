import debugConfig from "#debugConfig";
import assert from "node:assert";
import { IV_Identifier, IV_MemberExpressionPA, IV_SuperLookupPA, IV_ThisLookupPA } from "../../ALL_AMP/ALL_AMP.ts";
import {
  ISP_ArgSpread,
  ISP_ObjectMethod,
  ISP_ObjectProperty
} from "../../ALL_RVal/ALL_ISP.ts";
import { IV_ASSIGNABLE } from "../../ALL_RVal/ALL_RVal.ts";
import { IV_ArrowFunctionExpression } from "../../ALL_RVal/IV_ArrowFunctionExpression.ts";
import { IV_ArrPatAssn, IV_MemberAssn, IV_ObjPatAssn, IV_SimpleAssn, IV_ThisAssn } from "../../ALL_RVal/IV_Assignment.ts";
import { IV_ABINOP, IV_BBINOP, IV_CBINOP, IV_DBINOP, IV_EBINOP, IV_FBINOP } from "../../ALL_RVal/IV_Binop.ts";
import { IV_Call } from "../../ALL_RVal/IV_Call.ts";
import { IV_FunctionExpression } from "../../ALL_RVal/IV_FunctionExpression.ts";
import {
  IV_BigIntLiteral,
  IV_BooleanLiteral,
  IV_DecimalLiteral,
  IV_NullLiteral,
  IV_NumericLiteral,
  IV_StringLiteral,
} from "../../ALL_RVal/IV_Literals.ts";
import { IV_CTHIS, IV_NUBD, IV_STHIS } from "../../ALL_RVal/IV_NonLang.ts";
import { IV_ObjectExpression } from "../../ALL_RVal/IV_ObjectExpression.ts";
import { IV_This } from "../../ALL_RVal/IV_This.ts";
import { BB } from "../../BB.ts";
import {
  addHeapEdges,
  addPTANode,
  ClassNode,
  CSepNode,
  ensureNodeIDAndGetPTANode,
  ensureNodeIDAndGetStackNode,
  FJSXNode,
  getAllFields,
  getAllFieldsOfNodes,
  GetClosureNode,
  getPointees,
  GLOBAL_NODE_MAP,
  IRIDUM_GLOBAL,
  JSXNode,
  LiteralNode,
  OrdinaryArrayNode,
  OrdinaryFunctionNode,
  OrdinaryObjectNode,
  PJSXNode,
  PTAEdge,
  PTAFlowData,
  PTAFlowNode,
  SetClosureNode,
  StackNode,
  UnknownNode
} from "./PTAFlowData.ts";
import {
  handleArrayDestructuringAssignmentStatement,
  handleCallExpression,
  handleFieldAssignmentStatement,
  handleFieldReference,
  handleJSXCallExpression,
  handleObjectDestructuringAssignmentStatement,
  handleSimpleAssignmentStatement,
} from "./PTAHandlers.ts";
import {
  dissernPointees,
  getHeapQualifiedName,
  getStackQualifiedName,
} from "./util.ts";
import { IV_Regexp } from "../../ALL_RVal/IV_Regexp.ts";
import { IV_TemplateLiteral } from "../../ALL_RVal/IV_Templates.ts";
import { IV_NewExpression } from "../../ALL_RVal/IV_NewExpression.ts";
import { IV_ClassExpression } from "../../ALL_RVal/IV_ClassExpression.ts";
import { IV_ConditionalExpression } from "../../ALL_RVal/IV_ConditionalExpression.ts";
import { IV_FJSX, IV_JSX, IV_PJSX } from "../../ALL_RVal/IV_JSX.ts";
import { IV_ArrayExpression } from "../../ALL_RVal/IV_ArrayExpression.ts";
import { IV_AUNOP, IV_BUNOP, IV_CUNOP, IV_DUNOP } from "../../ALL_RVal/IV_Unop.ts";
import { IV_UpdateExpression } from "../../ALL_RVal/IV_UpdateExpression.ts";

// const assert = (val) => {
//   if (!val) {
//     console.log("Assertion Failed");
//   }
  
// }

export const dissernProps = (
  mutableFlowData: PTAFlowData,
  name: string,
  stackQualifiedName: string,
  computed: boolean,
): Set<string> => {
  const res: Set<string> = new Set();
  if (!computed) {
    res.add(name);
    return res;
  }
  //
  // We have a computed prop, we must find all the literals it points to and see if we can resolve it.
  //
  const node = ensureNodeIDAndGetPTANode(mutableFlowData, stackQualifiedName);
  assert(node instanceof StackNode);
  const propPointees = getPointees(mutableFlowData, node);
  return dissernPointees(propPointees);
};

export const handleRVals = (
  uname: string,
  mutableFlowData: PTAFlowData,
  rVal: IV_ASSIGNABLE,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
): Array<PTAFlowNode> => {
  const res: Set<PTAFlowNode> = new Set();

  // IS1_DeclarationStmt
  if (rVal instanceof IV_NUBD) {
    const ID = "NUBD";
    const node = GLOBAL_NODE_MAP.has(ID)
      ? GLOBAL_NODE_MAP.get(ID)
      : new IRIDUM_GLOBAL(ID, uname);
    assert(node instanceof IRIDUM_GLOBAL);
    addPTANode(mutableFlowData, node);
    return [node];
  } else if (rVal instanceof IV_Identifier && rVal.name === "undefined") {
    const ID = "undefined";
    const node = GLOBAL_NODE_MAP.has(ID)
      ? GLOBAL_NODE_MAP.get(ID)
      : new IRIDUM_GLOBAL(ID, uname);
    assert(node instanceof IRIDUM_GLOBAL);
    addPTANode(mutableFlowData, node);
    return [node];
  } else if (rVal instanceof IV_CTHIS) {
    const ID = getStackQualifiedName(IV_CTHIS.lookupName(), currBB);
    const stackNode = ensureNodeIDAndGetStackNode(mutableFlowData, ID);
    return [...getPointees(mutableFlowData, stackNode)];
  } else if (rVal instanceof IV_STHIS) {
    debugConfig.logger.throwIriError("TODO: Handle IV_STHIS");
  }

  // AMP
  else if (rVal instanceof IV_Identifier) {
    const ID = getStackQualifiedName(rVal.lookupName(), currBB);
    const stackNode = ensureNodeIDAndGetStackNode(mutableFlowData, ID);
    return [...getPointees(mutableFlowData, stackNode)];
  }
  else if (rVal instanceof IV_MemberExpressionPA) {
    const receiverID = getStackQualifiedName(rVal.object.lookupName(), currBB);
    const receiverStackNode = ensureNodeIDAndGetStackNode(mutableFlowData, receiverID);
    const receiverPointees = getPointees(mutableFlowData, receiverStackNode);
    const dissernedProps: Set<string> = dissernProps(
      mutableFlowData,
      rVal.property.lookupName(),
      rVal.computed && getStackQualifiedName(rVal.property.lookupName(), currBB),
      rVal.computed,
    );
    return handleFieldReference(uname, mutableFlowData, receiverPointees, dissernedProps, currBB, currBBIDx, stackInstOffset);
  } else if (rVal instanceof IV_ThisLookupPA) {
    const receiverID = getStackQualifiedName(IV_This.lookupName(), currBB);
    const receiverStackNode = ensureNodeIDAndGetStackNode(mutableFlowData, receiverID);
    const receiverPointees = getPointees(mutableFlowData, receiverStackNode);
    const dissernedProps: Set<string> = dissernProps(
      mutableFlowData,
      rVal.property.lookupName(),
      rVal.computed && getStackQualifiedName(rVal.property.lookupName(), currBB),
      rVal.computed,
    );
    return handleFieldReference(uname, mutableFlowData, receiverPointees, dissernedProps, currBB, currBBIDx, stackInstOffset);
  } else if (rVal instanceof IV_SuperLookupPA) {
    debugConfig.logger.throwIriError(`TODO: Handle IV_SuperLookupPA`);
  }

  // ALL_RVal
  // t_IV_Literals
  else if (rVal instanceof IV_DecimalLiteral) {
    const ID = rVal.lookupName();
    const node = GLOBAL_NODE_MAP.has(ID)
      ? GLOBAL_NODE_MAP.get(ID)
      : new LiteralNode(ID, rVal, uname);
    assert(node instanceof LiteralNode);
    addPTANode(mutableFlowData, node);
    return [node];
  } else if (rVal instanceof IV_BigIntLiteral) {
    const ID = rVal.lookupName();
    const node = GLOBAL_NODE_MAP.has(ID)
      ? GLOBAL_NODE_MAP.get(ID)
      : new LiteralNode(ID, rVal, uname);
    assert(node instanceof LiteralNode);
    addPTANode(mutableFlowData, node);
    return [node];
  } else if (rVal instanceof IV_StringLiteral) {
    const ID = rVal.lookupName();
    const node = GLOBAL_NODE_MAP.has(ID)
      ? GLOBAL_NODE_MAP.get(ID)
      : new LiteralNode(ID, rVal, uname);
    assert(node instanceof LiteralNode);
    addPTANode(mutableFlowData, node);
    return [node];
  } else if (rVal instanceof IV_NumericLiteral) {
    const ID = rVal.lookupName();
    const node = GLOBAL_NODE_MAP.has(ID)
      ? GLOBAL_NODE_MAP.get(ID)
      : new LiteralNode(ID, rVal, uname);
    assert(node instanceof LiteralNode);
    addPTANode(mutableFlowData, node);
    return [node];
  } else if (rVal instanceof IV_NullLiteral) {
    const ID = rVal.lookupName();
    const node = GLOBAL_NODE_MAP.has(ID)
      ? GLOBAL_NODE_MAP.get(ID)
      : new LiteralNode(ID, rVal, uname);
    assert(node instanceof LiteralNode);
    addPTANode(mutableFlowData, node);
    return [node];
  } else if (rVal instanceof IV_BooleanLiteral) {
    const ID = rVal.lookupName();
    const node = GLOBAL_NODE_MAP.has(ID)
      ? GLOBAL_NODE_MAP.get(ID)
      : new LiteralNode(ID, rVal, uname);
    assert(node instanceof LiteralNode);
    addPTANode(mutableFlowData, node);
    return [node];
  }

  // t_IV_Regexp
  else if (rVal instanceof IV_Regexp) {
    debugConfig.logger.throwIriError("TODO: Handle IV_Regexp");
  }

  // t_IV_Templates
  else if (rVal instanceof IV_TemplateLiteral) {
    const ID = getHeapQualifiedName("IV_TemplateLiteral", currBBIDx, stackInstOffset);
    const resObj = new UnknownNode(ID, uname);
    addPTANode(mutableFlowData, resObj);
    return [resObj];

    // debugConfig.logger.throwIriError("TODO: Handle IV_TemplateLiteral");
  }

  // // t_IV_Call
  // else if (rVal instanceof IV_ImportCall) {
  //   const resObj = new UnknownResultObj(
  //     getHeapQualifiedName("IV_ImportCall", currBBIDx, stackInstOffset),
  //   );
  //   nextGraph.declareNode(resObj);
  //   return [resObj];
  // }
  else if (rVal instanceof IV_Call) {
    const ID = getStackQualifiedName(rVal.callee.lookupName(), currBB);
    const stackNode = GLOBAL_NODE_MAP.has(ID)
      ? GLOBAL_NODE_MAP.get(ID)
      : new StackNode(ID, uname);
    assert(stackNode instanceof StackNode);

    const callees = getPointees(mutableFlowData, stackNode);

    let calleeContext: Array<PTAFlowNode>;

    if (rVal.staticThis) {
      calleeContext = [...callees];
    } else {
      calleeContext = undefined;
    }

    const res = handleCallExpression(
      uname,
      mutableFlowData,
      callees,
      rVal.args,
      currBB,
      currBBIDx,
      stackInstOffset,
      calleeContext
    );
    return [...res];
  }
  // else if (rVal instanceof IV_SuperCall) {
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

  // t_IV_THISEXPRESSION
  else if (rVal instanceof IV_This) {
    const ID = getStackQualifiedName(IV_This.lookupName(), currBB);
    const stackNode = ensureNodeIDAndGetStackNode(mutableFlowData, ID);
    return [...getPointees(mutableFlowData, stackNode)];
  }

  // t_IV_BINOP
  else if (rVal instanceof IV_ABINOP) {
    const ID = getHeapQualifiedName("IV_ABINOP", currBBIDx, stackInstOffset);
    const resObj = new UnknownNode(ID, uname);
    addPTANode(mutableFlowData, resObj);
    return [resObj];
  } else if (rVal instanceof IV_BBINOP) {
    const ID = getHeapQualifiedName("IV_BBINOP", currBBIDx, stackInstOffset);
    const resObj = new UnknownNode(ID, uname);
    addPTANode(mutableFlowData, resObj);
    return [resObj];
  } else if (rVal instanceof IV_CBINOP) {
    const ID = getHeapQualifiedName("IV_CBINOP", currBBIDx, stackInstOffset);
    const resObj = new UnknownNode(ID, uname);
    addPTANode(mutableFlowData, resObj);
    return [resObj];
  } else if (rVal instanceof IV_DBINOP) {
    const ID = getHeapQualifiedName("IV_DBINOP", currBBIDx, stackInstOffset);
    const resObj = new UnknownNode(ID, uname);
    addPTANode(mutableFlowData, resObj);
    return [resObj];
  } else if (rVal instanceof IV_EBINOP) {
    const ID = getHeapQualifiedName("IV_EBINOP", currBBIDx, stackInstOffset);
    const resObj = new UnknownNode(ID, uname);
    addPTANode(mutableFlowData, resObj);
    return [resObj];
  } 
  else if (rVal instanceof IV_FBINOP) {
    const trueID = "true";
    const trueNode = GLOBAL_NODE_MAP.has(trueID)
      ? GLOBAL_NODE_MAP.get(trueID)
      : new LiteralNode(trueID, new IV_BooleanLiteral(undefined, true), uname);
    assert(trueNode instanceof LiteralNode);
    assert(trueNode.node instanceof IV_BooleanLiteral);
    addPTANode(mutableFlowData, trueNode);

    const falseID = "false";
    const falseNode = GLOBAL_NODE_MAP.has(falseID)
      ? GLOBAL_NODE_MAP.get(falseID)
      : new LiteralNode(falseID, new IV_BooleanLiteral(undefined, false), uname);
    assert(falseNode instanceof LiteralNode);
    assert(falseNode.node instanceof IV_BooleanLiteral);
    addPTANode(mutableFlowData, falseNode);

    return [trueNode, falseNode];
  }

  // t_IV_ASSN
  else if (rVal instanceof IV_SimpleAssn) {
    const res = handleRVals(
      uname,
      mutableFlowData,
      rVal.RVal,
      currBB,
      currBBIDx,
      stackInstOffset,
    );
    const ID = getStackQualifiedName(rVal.LVal.lookupName(), currBB);
    handleSimpleAssignmentStatement(uname, mutableFlowData, ID, res);
    return res;
  } else if (rVal instanceof IV_MemberAssn) {
    // a.x = RVal
    const RVal = rVal.RVal;
    const res = handleRVals(
      uname,
      mutableFlowData,
      RVal,
      currBB,
      currBBIDx,
      stackInstOffset,
    );

    const LVal = rVal.LVal;

    const receiverID = getStackQualifiedName(LVal.object.lookupName(), currBB);
    const receiverStackNode = ensureNodeIDAndGetStackNode(mutableFlowData, receiverID);
    const receiverPointees = getPointees(mutableFlowData, receiverStackNode);

    const dissernedProps: Set<string> = dissernProps(
      mutableFlowData,
      LVal.property.lookupName(),
      LVal.computed && getStackQualifiedName(LVal.property.lookupName(), currBB),
      LVal.computed,
    );

    handleFieldAssignmentStatement(
      mutableFlowData,
      receiverPointees,
      dissernedProps,
      res,
      true,
      currBB,
      currBBIDx,
      stackInstOffset
    );
    return res;
  } else if (rVal instanceof IV_ThisAssn) {
    // this.x = RVal
    const RVal = rVal.RVal;
    const res = handleRVals(
      uname,
      mutableFlowData,
      RVal,
      currBB,
      currBBIDx,
      stackInstOffset,
    );

    const LVal = rVal.LVal;

    const receiverID = getStackQualifiedName(IV_This.lookupName(), currBB);
    const receiverStackNode = ensureNodeIDAndGetStackNode(mutableFlowData, receiverID);
    const receiverPointees = getPointees(mutableFlowData, receiverStackNode);

    const dissernedProps: Set<string> = dissernProps(
      mutableFlowData,
      LVal.property.lookupName(),
      LVal.computed && getStackQualifiedName(LVal.property.lookupName(), currBB),
      LVal.computed,
    );

    handleFieldAssignmentStatement(
      mutableFlowData,
      receiverPointees,
      dissernedProps,
      res,
      true,
      currBB,
      currBBIDx,
      stackInstOffset
    );
    return res;
  } else if (rVal instanceof IV_ArrPatAssn) {
    const RValPointees = handleRVals(
      uname,
      mutableFlowData,
      rVal.RVal,
      currBB,
      currBBIDx,
      stackInstOffset,
    );
    handleArrayDestructuringAssignmentStatement(
      uname,
      mutableFlowData,
      rVal.LVal.elements,
      RValPointees,
      currBB,
      currBBIDx,
      stackInstOffset
    );
    return RValPointees;
  } else if (rVal instanceof IV_ObjPatAssn) {
    const RValPointees = handleRVals(
      uname,
      mutableFlowData,
      rVal.RVal,
      currBB,
      currBBIDx,
      stackInstOffset,
    );
    handleObjectDestructuringAssignmentStatement(
      uname,
      mutableFlowData,
      rVal.LVal.properties,
      RValPointees,
      currBB,
      currBBIDx,
      stackInstOffset
    );
    return RValPointees;
  }
  // 
  // else if (rVal instanceof IV_SuperAssn) {
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
  // } 
  // 


  // t_IV_ObjectExpression
  else if (rVal instanceof IV_ObjectExpression) {
    // [Ordinary Object]
    const objExprID = getHeapQualifiedName(
      "objExpr",
      currBBIDx,
      stackInstOffset,
    );

    const objNode = GLOBAL_NODE_MAP.has(objExprID)
      ? GLOBAL_NODE_MAP.get(objExprID)
      : new OrdinaryObjectNode(objExprID, uname);
    assert(objNode instanceof OrdinaryObjectNode);
    addPTANode(mutableFlowData, objNode);

    // Process Fields
    let i = 0;
    for (const p of rVal.properties) {
      if (p instanceof ISP_ObjectMethod) {
        const dissernedProps: Set<string> = dissernProps(
          mutableFlowData,
          p.key.lookupName(),
          p.computed && getStackQualifiedName(p.key.lookupName(), currBB),
          p.computed,
        );

        let pointee: OrdinaryFunctionNode | SetClosureNode | GetClosureNode;
        if (p.kind === "method") {
          const ID = getHeapQualifiedName(
            "ObjMeth" + i,
            currBBIDx,
            stackInstOffset,
          );
          const node = GLOBAL_NODE_MAP.has(ID)
            ? GLOBAL_NODE_MAP.get(ID)
            : new OrdinaryFunctionNode(ID, p, uname);
          assert(node instanceof OrdinaryFunctionNode);
          pointee = node;
        } else if (p.kind === "get") {
          const ID = getHeapQualifiedName(
            "GetMeth" + i,
            currBBIDx,
            stackInstOffset,
          );
          const node = GLOBAL_NODE_MAP.has(ID)
            ? GLOBAL_NODE_MAP.get(ID)
            : new GetClosureNode(ID, p, uname);
          assert(node instanceof GetClosureNode);
          pointee = node;
        } else if (p.kind === "set") {
          const ID = getHeapQualifiedName(
            "SetMeth" + i,
            currBBIDx,
            stackInstOffset,
          );
          const node = GLOBAL_NODE_MAP.has(ID)
            ? GLOBAL_NODE_MAP.get(ID)
            : new SetClosureNode(ID, p, uname);
          assert(node instanceof SetClosureNode);
          pointee = node;
        }
        addPTANode(mutableFlowData, pointee);
        handleFieldAssignmentStatement(
          mutableFlowData,
          [objNode],
          dissernedProps,
          [pointee],
          true,
          currBB,
          currBBIDx,
          stackInstOffset
        );

      } else if (p instanceof ISP_ObjectProperty) {
        const dissernedProps: Set<string> = dissernProps(
          mutableFlowData,
          p.key.lookupName(),
          p.computed && getStackQualifiedName(p.key.lookupName(), currBB),
          p.computed,
        );
        // Get propValuePointees
        const pointees = handleRVals(
          uname,
          mutableFlowData,
          p.value,
          currBB,
          currBBIDx,
          stackInstOffset,
        );
        handleFieldAssignmentStatement(
          mutableFlowData,
          [objNode],
          dissernedProps,
          pointees,
          true,
          currBB,
          currBBIDx,
          stackInstOffset
        );
      } else {
        const RValPointees = handleRVals(
          uname,
          mutableFlowData,
          p.arg,
          currBB,
          currBBIDx,
          stackInstOffset,
        );
        const fieldsToProcess: Set<string> = new Set();
        for (const p of RValPointees) {
          getAllFields(mutableFlowData, p).forEach((f) => fieldsToProcess.add(f));
        }
        for (const field of fieldsToProcess) {
          const vs = handleFieldReference(uname, mutableFlowData, RValPointees, [field], currBB, currBBIDx, stackInstOffset);
          handleFieldAssignmentStatement(mutableFlowData, [objNode], ["*"], vs, true, currBB, currBBIDx, stackInstOffset)
        }
      }
      i++;
    }
    return [objNode];
  }

  // t_IV_ArrayExpression
  else if (rVal instanceof IV_ArrayExpression) {
    //
    // [OrdinaryArrayObject]
    //

    const mainObjID = getHeapQualifiedName(
      "arrExpr",
      currBBIDx,
      stackInstOffset,
    );
    const objNode = GLOBAL_NODE_MAP.has(mainObjID)
      ? GLOBAL_NODE_MAP.get(mainObjID)
      : new OrdinaryArrayNode(mainObjID, uname);
    assert(objNode instanceof OrdinaryArrayNode);
    addPTANode(mutableFlowData, objNode);

    let i = 0;
    const initTuple: Array<[string, IV_Identifier | ISP_ArgSpread]> = [];
    let hasSpread = false;
    for (const p of rVal.elements) {
      if (hasSpread || p instanceof ISP_ArgSpread) {
        initTuple.push(["*", p]);
        hasSpread = true;
      } else {
        initTuple.push([`${i}`, p]);
      }
      i++;
    }

    for (const [field, o] of initTuple) {
      if (o instanceof IV_Identifier) {
        //
        // [OrdinaryArrayObject] --field--> pointees(ID)
        //
        const lookupID = getStackQualifiedName(o.lookupName(), currBB);
        const lookupNode = ensureNodeIDAndGetStackNode(mutableFlowData, lookupID);
        const pointees = getPointees(mutableFlowData, lookupNode);
        handleFieldAssignmentStatement(mutableFlowData, [objNode], [field], pointees, true, currBB, currBBIDx, stackInstOffset);
      } else {
        //
        // [OrdinaryArrayObject] --field--> { PTANode(allOutwardEdges(x)) | x = pointees(ID) }
        //
        const lookupID = getStackQualifiedName(o.arg.lookupName(), currBB);
        const lookupNode = ensureNodeIDAndGetStackNode(mutableFlowData, lookupID);
        const pointees = getPointees(mutableFlowData, lookupNode);

        for (const p of pointees) {

          const allFields = getAllFields(mutableFlowData, p);
          const pps = handleFieldReference(uname, mutableFlowData, [p], allFields, currBB, currBBIDx, stackInstOffset);

          handleFieldAssignmentStatement(mutableFlowData, [objNode], ["*"], pps, true, currBB, currBBIDx, stackInstOffset);
        }
      }
    }

    return [objNode];
  }

  // t_IV_ConditionalExpression
  else if (rVal instanceof IV_ConditionalExpression) {
    const ID1 = getStackQualifiedName(rVal.consequent.lookupName(), currBB);
    const stackNode1 = ensureNodeIDAndGetStackNode(mutableFlowData, ID1);
    const pointees1 = getPointees(mutableFlowData, stackNode1);

    const ID2 = getStackQualifiedName(rVal.consequent.lookupName(), currBB);
    const stackNode2 = ensureNodeIDAndGetStackNode(mutableFlowData, ID2);
    const pointees2 = getPointees(mutableFlowData, stackNode2);
    return [...pointees1, ...pointees2];
  }

  // t_IV_FunctionExpression
  else if (rVal instanceof IV_FunctionExpression) {
    const funID = getHeapQualifiedName("funExpr", currBBIDx, stackInstOffset);
    const funNode = GLOBAL_NODE_MAP.has(funID)
      ? GLOBAL_NODE_MAP.get(funID)
      : new OrdinaryFunctionNode(funID, rVal, uname);
    assert(funNode instanceof OrdinaryFunctionNode);
    addPTANode(mutableFlowData, funNode);
    return [funNode];
  }

  // t_IV_ArrowFunctionExpression
  else if (rVal instanceof IV_ArrowFunctionExpression) {
    const funID = getHeapQualifiedName(
      "arrowFunExpr",
      currBBIDx,
      stackInstOffset,
    );
    const funNode = GLOBAL_NODE_MAP.has(funID)
      ? GLOBAL_NODE_MAP.get(funID)
      : new OrdinaryFunctionNode(funID, rVal, uname);
    assert(funNode instanceof OrdinaryFunctionNode);
    addPTANode(mutableFlowData, funNode);
    return [funNode];
  }

  // t_IV_NewExpression
  else if (rVal instanceof IV_NewExpression) {
    // debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_NewExpression")
    const ID = getHeapQualifiedName("IV_NewExpression", currBBIDx, stackInstOffset)
    const resObj = GLOBAL_NODE_MAP.has(ID)
      ? GLOBAL_NODE_MAP.get(ID)
      : new UnknownNode(ID, uname);
    assert(resObj instanceof UnknownNode);
    addPTANode(mutableFlowData, resObj);
    return [resObj];
  }

  // t_IV_UnaryExpression
  else if (rVal instanceof IV_AUNOP) {
    const ID = getHeapQualifiedName("IV_AUNOP", currBBIDx, stackInstOffset);
    const resObj = new UnknownNode(ID, uname);
    addPTANode(mutableFlowData, resObj);
    return [resObj];
  } else if (rVal instanceof IV_BUNOP) {
    const ID = getHeapQualifiedName("IV_BUNOP", currBBIDx, stackInstOffset);
    const resObj = new UnknownNode(ID, uname);
    addPTANode(mutableFlowData, resObj);
    return [resObj];
  } else if (rVal instanceof IV_CUNOP) {
    const ID = getHeapQualifiedName("IV_CUNOP", currBBIDx, stackInstOffset);
    const resObj = new UnknownNode(ID, uname);
    addPTANode(mutableFlowData, resObj);
    return [resObj];
  } else if (rVal instanceof IV_DUNOP) {
    const ID = getHeapQualifiedName("IV_DUNOP", currBBIDx, stackInstOffset);
    const resObj = new UnknownNode(ID, uname);
    addPTANode(mutableFlowData, resObj);
    return [resObj];
  }

  // t_IV_UpdateExpression
  else if (rVal instanceof IV_UpdateExpression) {
    const ID = getHeapQualifiedName("IV_UpdateExpression", currBBIDx, stackInstOffset);
    const resObj = new UnknownNode(ID, uname);
    addPTANode(mutableFlowData, resObj);
    return [resObj];
  }

  // t_IV_ClassExpression
  else if (rVal instanceof IV_ClassExpression) {
    //
    // [ClassObject]
    //

    const mainObjID = getHeapQualifiedName(
      "classExpr",
      currBBIDx,
      stackInstOffset,
    );
    const mainObj = GLOBAL_NODE_MAP.has(mainObjID)
      ? GLOBAL_NODE_MAP.get(mainObjID)
      : new ClassNode(mainObjID, rVal, uname);
    assert(mainObj instanceof ClassNode);
    addPTANode(mutableFlowData, mainObj);

    if (rVal.heritage) {
      const heritageID = getStackQualifiedName(rVal.heritage.lookupName(), currBB);
      const heritageNode = ensureNodeIDAndGetStackNode(mutableFlowData, heritageID);
      assert(heritageNode instanceof StackNode);
      const pointees = getPointees(mutableFlowData, heritageNode);
      addHeapEdges(mutableFlowData, mainObj, "^HERITAGE^", pointees, true);
    }

    return [mainObj];
  }

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
  else if (rVal instanceof IV_PJSX) {
    const pJSXID = getHeapQualifiedName(rVal.tag.value, currBBIDx, stackInstOffset)
    const pJSXObj = GLOBAL_NODE_MAP.has(pJSXID)
      ? GLOBAL_NODE_MAP.get(pJSXID)
      : new PJSXNode(pJSXID, uname);
    assert(pJSXObj instanceof PJSXNode);
    addPTANode(mutableFlowData, pJSXObj);

    for (const c of rVal.children) {
      const childID = getStackQualifiedName(c.lookupName(), currBB);
      const childStackNode = ensureNodeIDAndGetStackNode(mutableFlowData, childID);
      const pointees = getPointees(mutableFlowData, childStackNode);
      handleFieldAssignmentStatement(mutableFlowData, [pJSXObj], ["children"], pointees, true, currBB, currBBIDx, stackInstOffset);
    }
    return [pJSXObj];
  }
  else if (rVal instanceof IV_JSX) {
    let componentID: string;
    try {
      // Component Function
      componentID = getStackQualifiedName(rVal.tag.lookupName(), currBB);
    } catch(e) {
      // Treat as a PJSX
      const pJSXID = getHeapQualifiedName(rVal.tag.name, currBBIDx, stackInstOffset)
      const pJSXObj = GLOBAL_NODE_MAP.has(pJSXID)
        ? GLOBAL_NODE_MAP.get(pJSXID)
        : new PJSXNode(pJSXID, uname);
      assert(pJSXObj instanceof PJSXNode);
      addPTANode(mutableFlowData, pJSXObj);

      for (const c of rVal.children) {
        const childID = getStackQualifiedName(c.lookupName(), currBB);
        const childStackNode = ensureNodeIDAndGetStackNode(mutableFlowData, childID);
        const pointees = getPointees(mutableFlowData, childStackNode);
        handleFieldAssignmentStatement(mutableFlowData, [pJSXObj], ["children"], pointees, true, currBB, currBBIDx, stackInstOffset);
      }
      return [pJSXObj];
    }

    // Component Node
    const JSXID = getHeapQualifiedName("JSX", currBBIDx, stackInstOffset)
    const JSXObj = GLOBAL_NODE_MAP.has(JSXID)
      ? GLOBAL_NODE_MAP.get(JSXID)
      : new JSXNode(JSXID, uname);
    assert(JSXObj instanceof JSXNode);
    addPTANode(mutableFlowData, JSXObj);

    // Component Function
    const componentStackNode = GLOBAL_NODE_MAP.has(componentID)
      ? GLOBAL_NODE_MAP.get(componentID)
      : new StackNode(componentID, uname);
    assert(componentStackNode instanceof StackNode);

    const componentPointees = getPointees(mutableFlowData, componentStackNode);

    // Children
    const childrenNodes: Set<PTAFlowNode> = new Set();
    rVal.children.forEach((c) => {
      const cID = getStackQualifiedName(c.lookupName(), currBB);
      const cStackNode = GLOBAL_NODE_MAP.has(cID)
        ? GLOBAL_NODE_MAP.get(cID)
        : new StackNode(cID, uname);
      assert(cStackNode instanceof StackNode);
      getPointees(mutableFlowData, cStackNode).forEach((c) => childrenNodes.add(c));
    });

    // Props
    const propsID = getStackQualifiedName(rVal.props.lookupName(), currBB);
    const propsStackNode = GLOBAL_NODE_MAP.has(propsID)
      ? GLOBAL_NODE_MAP.get(propsID)
      : new StackNode(propsID, uname);
    assert(propsStackNode instanceof StackNode);

    // ArgumentsObj
    const argsID = getHeapQualifiedName("JSXARGS", currBBIDx, stackInstOffset);
    const argsNode = GLOBAL_NODE_MAP.has(argsID)
      ? GLOBAL_NODE_MAP.get(argsID)
      : new OrdinaryObjectNode(argsID, uname);
    assert(argsNode instanceof OrdinaryObjectNode);
    addPTANode(mutableFlowData, argsNode);
    
    const propsPointees = getPointees(mutableFlowData, propsStackNode);
    const fields = getAllFieldsOfNodes(mutableFlowData, propsPointees);

    // transfer fields from props objs
    for (const ff of fields) {
      for (const cc of propsPointees) {
        const pointeesForField = handleFieldReference(uname, mutableFlowData, [cc], [ff], currBB, currBBIDx, stackInstOffset);
        handleFieldAssignmentStatement(mutableFlowData, [argsNode], [ff], pointeesForField, true, currBB, currBBIDx, stackInstOffset);
      }
    }

    // add children prop
    handleFieldAssignmentStatement(mutableFlowData, [argsNode], ["children"], childrenNodes, true, currBB, currBBIDx, stackInstOffset);

    // evalRes
    const evalRes = handleJSXCallExpression(uname, mutableFlowData, componentPointees, argsNode, currBB, currBBIDx, stackInstOffset, undefined)

    handleFieldAssignmentStatement(mutableFlowData, [JSXObj], ["^render^"], evalRes, true, currBB, currBBIDx, stackInstOffset);


    return [JSXObj]

    // return [...];
  }
  else if (rVal instanceof IV_FJSX) {
    const fJSXID = getHeapQualifiedName("Fragment", currBBIDx, stackInstOffset)
    const fJSXObj = GLOBAL_NODE_MAP.has(fJSXID)
      ? GLOBAL_NODE_MAP.get(fJSXID)
      : new FJSXNode(fJSXID, uname);
    assert(fJSXObj instanceof FJSXNode);
    addPTANode(mutableFlowData, fJSXObj);

    for (const c of rVal.children) {
      const childID = getStackQualifiedName(c.lookupName(), currBB);
      const childStackNode = ensureNodeIDAndGetStackNode(mutableFlowData, childID);
      const pointees = getPointees(mutableFlowData, childStackNode);
      handleFieldAssignmentStatement(mutableFlowData, [fJSXObj], ["children"], pointees, true, currBB, currBBIDx, stackInstOffset);
    }
    return [fJSXObj];
  }

  debugConfig.logger.throwIriError(
    `TODO: PTA - Unreachable fallthrough reached, something is prolly wrong in the code!!! : ${rVal.toString()}`,
  );

  return [...res];
};
