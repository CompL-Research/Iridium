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
import { BB, FunctionReturn } from "../../BB.ts";
import { I_Function_params } from "../../I_GENERAL/I_Function.ts";
import { IRIDIUM_FG } from "../../IRIDIUM.ts";
import { ContextualPTAHandler } from "../PTA.ts";
import { handleMemberAssignment, handleSimpleAssignmentStatement } from "./handleAssignments.ts";
import { BigIntNode, BooleanNode, ClassObject, CSepObject, DecimalNode, DummyObject, FJSXObject, GetSpecialClosure, GlobalNode, JSXObject, KnownFunctionNode, KnownResultObj, NullNode, NumericNode, OrdinaryArrayObject, OrdinaryFunctionObject, OrdinaryObject, PJSXObject, PTANode, ReactRenderRoot, SetSpecialClosure, StackNode, StringNode, UnknownResultObj, Valid_Stack_To_Heap_Pointees } from "./nodes.ts";
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

export const getSpreadPointees = (nextGraph: PTAGraph, node: PTANode, iContext: string) => {
  if (node instanceof OrdinaryObject || node instanceof OrdinaryArrayObject) {
    let outwardEdges = nextGraph.outEdges(node.id);
    let res: Set<PTANode> = new Set()
    if (outwardEdges) {
      for (let e of outwardEdges) {
        let pointees = nextGraph.getFieldPointees(node, e.name, iContext, true);
        pointees.forEach(p => res.add(p));
      }
    }
    return res;
  } else {
    return undefined;
  }
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
    if (dissernedProps.size === 0) dissernedProps.add("*");

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
    if (dissernedProps.size === 0) dissernedProps.add("*");

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
    if (dissernedProps.size === 0) dissernedProps.add("*");

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
    let resObj = new UnknownResultObj(getHeapQualifiedName('IV_Regexp', currBBIDx, stackInstOffset));
    nextGraph.declareNode(resObj)
    return [resObj]
  }

  // t_IV_Templates
  else if (rVal instanceof IV_TemplateLiteral) {
    let resObj = new UnknownResultObj(getHeapQualifiedName('IV_TemplateLiteral', currBBIDx, stackInstOffset));
    nextGraph.declareNode(resObj)
    return [resObj]
  }

  // t_IV_Call
  else if (rVal instanceof IV_ImportCall) {
    let resObj = new UnknownResultObj(getHeapQualifiedName('IV_ImportCall', currBBIDx, stackInstOffset));
    nextGraph.declareNode(resObj)
    return [resObj]
  } else if (rVal instanceof IV_Call) {
    let res: Set<PTANode> = new Set();
    let calleeObj = nextGraph.getPointees(getStackQualifiedName(rVal.callee.lookupName(), currBB));
    let closureResults: Array<PTAGraph> = new Array();
    let iContext = "BB" + currBBIDx + ":" + stackInstOffset;

    for (let c of calleeObj) {
      if (c instanceof OrdinaryFunctionObject) {
        let meth = c.meth;
        let closureGraph: IRIDIUM_FG;
        if (meth instanceof ISP_ObjectMethod) closureGraph = meth.funBody;
        else closureGraph = meth.func.funBody;

        let calleeArgs: I_Function_params;
        if (meth instanceof ISP_ObjectMethod) calleeArgs = meth.params;
        else calleeArgs = meth.func.params;

        let rootBB: BB;
        if (meth instanceof ISP_ObjectMethod) rootBB = meth.funBody.rootBB;
        else rootBB = meth.func.funBody.rootBB;

        let closureContextPTA = new PTAGraph();
        closureContextPTA.union(nextGraph)

        // 
        // Create arguments object
        // 
        let argumentsObj = new OrdinaryArrayObject(getHeapQualifiedName("argumentsObj", currBBIDx, stackInstOffset))
        closureContextPTA.declareNode(argumentsObj)
        let i = 0;
        let lastMapped = i;
        for (; i < rVal.args.length; i++) {
          let currArg = rVal.args[i];
          if (currArg instanceof IV_Identifier) {
            let pointees = closureContextPTA.getPointees(getStackQualifiedName(currArg.lookupName(), currBB))
            // ArgumentsObj --[i]--> pointees 
            closureContextPTA.drawHeapToHeapEdge([argumentsObj], pointees, ['' + i], true)
            lastMapped = i;
          } else {
            if (i + 1 !== rVal.args.length) debugConfig.logger.throwIriError("Expecting Spread operator to be the last supplied argument");
            let pointees = closureContextPTA.getPointees(getStackQualifiedName(currArg.arg.lookupName(), currBB))
            // ArgumentsObj --[*]--> pointees 
            for (let pp of pointees) {
              let spreadPointees = getSpreadPointees(closureContextPTA, pp, iContext)
              closureContextPTA.drawHeapToHeapEdge([argumentsObj], [...spreadPointees], ['*'], true)
            }
          }
        }

        // 
        // Match formals (or the other one... I forgor), 
        // 
        let j = 0;
        for (; j < calleeArgs.length; j++) {
          let currArg = calleeArgs[j];
          if (currArg instanceof IV_Identifier) {
            let argStackQualifiedName = getStackQualifiedName(currArg.lookupName(), rootBB)
            let argStackNode = new StackNode(argStackQualifiedName)
            closureContextPTA.declareNode(argStackNode);
            if (j <= lastMapped) {
              // 
              // argStackQualifiedName --> argumentsObj.j
              // 
              if (!closureContextPTA.hasField(argumentsObj.id, '' + j)) debugConfig.logger.throwIriError("Expecting field to exist");
              let pointees = closureContextPTA.getFieldPointees(argumentsObj, '' + j, iContext, true, false);
              closureContextPTA.drawStackToHeapEdge(argStackNode, [...pointees]);

            } else {
              // 
              // argStackQualifiedName --> argumentsObj.*
              // 
              if (!closureContextPTA.hasField(argumentsObj.id, '*')) debugConfig.logger.throwIriError("Expecting field to exist");
              let pointees = closureContextPTA.getFieldPointees(argumentsObj, '*', iContext, true);
              closureContextPTA.drawStackToHeapEdge(argStackNode, [...pointees]);
            }
          } else {
            if (j + 1 !== calleeArgs.length) debugConfig.logger.throwIriError("Expecting Spread operator to be the last function argument");
            let spillHolderObj = new OrdinaryArrayObject(getHeapQualifiedName(currArg.arg.lookupName(), currBBIDx, stackInstOffset))
            closureContextPTA.declareNode(spillHolderObj);
            let argStackQualifiedName = getStackQualifiedName(currArg.arg.lookupName(), rootBB);
            let argStackNode = new StackNode(argStackQualifiedName)
            closureContextPTA.declareNode(argStackNode);
            let counter = 0;
            for (let k = j; k <= lastMapped; k++) {
              // 
              // argStackQualifiedName ---> spillHolderObj --[k]--> U {argumentsObj.j...argumentsObj.lastMapped} 
              // 
              if (!closureContextPTA.hasField(argumentsObj.id, '' + k)) debugConfig.logger.throwIriError("Expecting field to exist");
              let pointees = closureContextPTA.getFieldPointees(argumentsObj, '' + k, iContext, true, false);
              closureContextPTA.drawHeapToHeapEdge([spillHolderObj], [...pointees], ['' + counter], true)
              counter++;
            }
            // argStackQualifiedName ---> spillHolderObj --[k]--> argumentsObj.*
            if (closureContextPTA.hasField(argumentsObj.id, '*')) {
              let pointees = closureContextPTA.getFieldPointees(argumentsObj, '*', iContext, true);
              closureContextPTA.drawHeapToHeapEdge([spillHolderObj], [...pointees], ['*'], true)
            }
            closureContextPTA.drawStackToHeapEdge(argStackNode, [spillHolderObj]);
          }
        }

        // 
        // Evaluate Closure
        // 
        let nextt = ContextualPTAHandler(c.id, iContext, closureContextPTA, closureGraph);
        let sinks = closureGraph.sinks()
        if (sinks.length !== 1) debugConfig.logger.throwIriError(`Sinks length !== 1, found ${sinks.length}`);
        let sink = sinks[0];
        let sinkBB = closureGraph.getBBNode(sink);

        // 
        // Point to all stuff the return can point to
        // 
        if (sinkBB instanceof FunctionReturn) {
          let argLookupName = getStackQualifiedName(sinkBB.arg.lookupName(), sinkBB)
          let pointees = nextt.getPointees(argLookupName);
          pointees.forEach(p => res.add(p));
        } else debugConfig.logger.throwIriError(`Expected sinks to be Function Returns in closures!!! found ${sinkBB.scope}`);
        closureResults.push(nextt);
      } else if (c instanceof UnknownResultObj || c instanceof DummyObject) {
        let hasClosure = false;
        // Check if the arguments point to any closure object
        let i = 0;
        outer: for (; i < rVal.args.length; i++) {
          let currArg = rVal.args[i];
          if (currArg instanceof IV_Identifier) {
            let pointees = nextGraph.getPointees(getStackQualifiedName(currArg.lookupName(), currBB));

            for (let p of pointees) {
              if (p instanceof OrdinaryFunctionObject) {
                hasClosure = true;
                break outer;
              }
            }
          } else {
            if (i + 1 !== rVal.args.length) debugConfig.logger.throwIriError("Expecting Spread operator to be the last supplied argument");
            let pointees = nextGraph.getPointees(getStackQualifiedName(currArg.arg.lookupName(), currBB));
            // ArgumentsObj --[*]--> pointees 
            for (let pp of pointees) {
              let spreadPointees = getSpreadPointees(nextGraph, pp, iContext);
              for (let sp of spreadPointees) {
                if (sp instanceof OrdinaryFunctionObject) {
                  hasClosure = true;
                  break outer;
                }
              }
            }
          }
        }

        if (!hasClosure) {
          console.warn(`PTA is skipping analysis as no closures escape at this call site...`);
          let resObj = new UnknownResultObj(getHeapQualifiedName('IV_Call', currBBIDx, stackInstOffset));
          nextGraph.declareNode(resObj);
          return [resObj];
        } else {
          debugConfig.logger.throwIriError(`PTA must resolve call site as closure might escape!!!`);
        }
      } else if (c instanceof KnownFunctionNode) {
        // createRoot
        if (c.idx === 0) {
          let knownResObj = new KnownResultObj(getHeapQualifiedName(`KnownFunctionNode_${0}`, currBBIDx, stackInstOffset), 0);
          nextGraph.addPTANode(knownResObj);

          let render = new KnownFunctionNode("render", 1);
          nextGraph.declareNode(render);
          nextGraph.drawHeapToHeapEdge([knownResObj], [render], ['render'], true);

          res.add(knownResObj);
        } else if (c.idx === 1) {
          let knownResObj = new ReactRenderRoot(getHeapQualifiedName(`ReactRenderRoot_${0}`, currBBIDx, stackInstOffset));
          nextGraph.addPTANode(knownResObj);

          let pointees : Set<PTANode> = new Set();
          
          for (let i = 0; i < rVal.args.length; i++) {
            let currArg = rVal.args[i];
            if (currArg instanceof IV_Identifier) {
              nextGraph.getPointees(getStackQualifiedName(currArg.lookupName(), currBB)).forEach(p => pointees.add(p));

            } else {
              if (i + 1 !== rVal.args.length) debugConfig.logger.throwIriError("Expecting Spread operator to be the last supplied argument");
              nextGraph.getPointees(getStackQualifiedName(currArg.arg.lookupName(), currBB)).forEach(p => pointees.add(p));
            }
          }

          nextGraph.drawHeapToHeapEdge([knownResObj], [...pointees], ['root'], true);

          return [knownResObj];
        }

        else {
          console.warn(`PTA [KnownFunctionNode]: ${c.idx}`);
        }
      } else {
        console.warn(`PTA is skipping analysis of non-callable object: ${c.id}`);
      }
    }

    nextGraph.union(...closureResults);
    return [...res];
  } else if (rVal instanceof IV_SuperCall) {
    let resObj = new UnknownResultObj(getHeapQualifiedName('IV_SuperCall', currBBIDx, stackInstOffset));
    nextGraph.declareNode(resObj)
    return [resObj]
  } else if (rVal instanceof IV_V8IntrinsicCall) {
    let resObj = new UnknownResultObj(getHeapQualifiedName('IV_V8IntrinsicCall', currBBIDx, stackInstOffset));
    nextGraph.declareNode(resObj)
    return [resObj]
  }

  // t_IV_META
  else if (rVal instanceof IV_ModuleMeta) {
    let resObj = new UnknownResultObj(getHeapQualifiedName('IV_ModuleMeta', currBBIDx, stackInstOffset));
    nextGraph.declareNode(resObj)
    return [resObj]
  } else if (rVal instanceof IV_NewTarget) {
    let resObj = new UnknownResultObj(getHeapQualifiedName('IV_NewTarget', currBBIDx, stackInstOffset));
    nextGraph.declareNode(resObj)
    return [resObj]
  }

  // t_IV_YIELD_AWAIT
  else if (rVal instanceof IV_YIELD) {
    let resObj = new UnknownResultObj(getHeapQualifiedName('IV_YIELD', currBBIDx, stackInstOffset));
    nextGraph.declareNode(resObj)
    return [resObj]
  } else if (rVal instanceof IV_AWAIT) {
    let resObj = new UnknownResultObj(getHeapQualifiedName('IV_AWAIT', currBBIDx, stackInstOffset));
    nextGraph.declareNode(resObj)
    return [resObj]
  }

  // t_IV_THISEXPRESSION
  else if (rVal instanceof IV_This) {
    return nextGraph.getPointees(getStackQualifiedName(IV_This.lookupName(), currBB));
  }

  // t_IV_BINOP
  else if (rVal instanceof IV_ABINOP) {
    let resObj = new UnknownResultObj(getHeapQualifiedName('IV_ABINOP', currBBIDx, stackInstOffset));
    nextGraph.declareNode(resObj)
    return [resObj]
  } else if (rVal instanceof IV_BBINOP) {
    let resObj = new UnknownResultObj(getHeapQualifiedName('IV_BBINOP', currBBIDx, stackInstOffset));
    nextGraph.declareNode(resObj)
    return [resObj]
  } else if (rVal instanceof IV_CBINOP) {
    let resObj = new UnknownResultObj(getHeapQualifiedName('IV_CBINOP', currBBIDx, stackInstOffset));
    nextGraph.declareNode(resObj)
    return [resObj]
  } else if (rVal instanceof IV_DBINOP) {
    let resObj = new UnknownResultObj(getHeapQualifiedName('IV_DBINOP', currBBIDx, stackInstOffset));
    nextGraph.declareNode(resObj)
    return [resObj]
  } else if (rVal instanceof IV_EBINOP) {
    let resObj = new UnknownResultObj(getHeapQualifiedName('IV_EBINOP', currBBIDx, stackInstOffset));
    nextGraph.declareNode(resObj)
    return [resObj]
  } else if (rVal instanceof IV_FBINOP) {
    let resObj = new UnknownResultObj(getHeapQualifiedName('IV_FBINOP', currBBIDx, stackInstOffset));
    nextGraph.declareNode(resObj)
    return [resObj]
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
    if (dissernedProps.size === 0) dissernedProps.add("*");

    let res: Array<PTANode> = handleRVals(nextGraph, rVal.RVal, currBB, currBBIDx, stackInstOffset)

    handleMemberAssignment(nextGraph, receiverPointees, res, dissernedProps, currBB, currBBIDx, stackInstOffset);
    return res;
  } else if (rVal instanceof IV_ThisAssn) {
    // THIS.x = RVal
    let receiver = getStackQualifiedName(IV_This.lookupName(), currBB)
    let receiverPointees: Array<Valid_Stack_To_Heap_Pointees> = nextGraph.getPointees(receiver)

    let dissernedProps: Set<string> = dissernProps(nextGraph, rVal.LVal.property.lookupName(), rVal.LVal.computed && getStackQualifiedName(rVal.LVal.property.lookupName(), currBB), rVal.LVal.computed);
    if (dissernedProps.size === 0) dissernedProps.add("*");

    let res: Array<PTANode> = handleRVals(nextGraph, rVal.RVal, currBB, currBBIDx, stackInstOffset)

    handleMemberAssignment(nextGraph, receiverPointees, res, dissernedProps, currBB, currBBIDx, stackInstOffset);
    // My god I forgot this!!!
    return res;
  } else if (rVal instanceof IV_SuperAssn) {
    // SUPER.x = RVal
    let receiver = getStackQualifiedName(ISP_Super.lookupName(), currBB)
    let receiverPointees: Array<Valid_Stack_To_Heap_Pointees> = nextGraph.getPointees(receiver)

    let dissernedProps: Set<string> = dissernProps(nextGraph, rVal.LVal.property.lookupName(), rVal.LVal.computed && getStackQualifiedName(rVal.LVal.property.lookupName(), currBB), rVal.LVal.computed);
    if (dissernedProps.size === 0) dissernedProps.add("*");

    let res: Array<PTANode> = handleRVals(nextGraph, rVal.RVal, currBB, currBBIDx, stackInstOffset)

    handleMemberAssignment(nextGraph, receiverPointees, res, dissernedProps, currBB, currBBIDx, stackInstOffset);
    // My god I forgot this!!!
    return res;

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
        if (dissernedProps.size === 0) dissernedProps.add("*");
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
        if (dissernedProps.size === 0) dissernedProps.add("*");
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
    let resObj = new CSepObject(getHeapQualifiedName("CondExpr", currBBIDx, stackInstOffset));
    nextGraph.declareNode(resObj);
    let pointees1 = nextGraph.getPointees(getStackQualifiedName(rVal.consequent.lookupName(), currBB));
    let pointees2 = nextGraph.getPointees(getStackQualifiedName(rVal.alternate.lookupName(), currBB));
    for (let p of pointees1) nextGraph.setEdge(resObj.id, p.id, "T", "T");
    for (let p of pointees2) nextGraph.setEdge(resObj.id, p.id, "F", "F");
    return [resObj];
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
    // debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_NewExpression")
    let resObj = new UnknownResultObj(getHeapQualifiedName('IV_NewExpression', currBBIDx, stackInstOffset));
    nextGraph.declareNode(resObj)
    return [resObj]
  }

  // t_IV_UnaryExpression
  else if (rVal instanceof IV_AUNOP) {
    let resObj = new UnknownResultObj(getHeapQualifiedName('IV_AUNOP', currBBIDx, stackInstOffset));
    nextGraph.declareNode(resObj)
    return [resObj]
  } else if (rVal instanceof IV_BUNOP) {
    let resObj = new UnknownResultObj(getHeapQualifiedName('IV_BUNOP', currBBIDx, stackInstOffset));
    nextGraph.declareNode(resObj)
    return [resObj]
  } else if (rVal instanceof IV_CUNOP) {
    let resObj = new UnknownResultObj(getHeapQualifiedName('IV_CUNOP', currBBIDx, stackInstOffset));
    nextGraph.declareNode(resObj)
    return [resObj]
  } else if (rVal instanceof IV_DUNOP) {
    let resObj = new UnknownResultObj(getHeapQualifiedName('IV_DUNOP', currBBIDx, stackInstOffset));
    nextGraph.declareNode(resObj)
    return [resObj]
  }

  // t_IV_UpdateExpression
  else if (rVal instanceof IV_UpdateExpression) {
    let resObj = new UnknownResultObj(getHeapQualifiedName('IV_UpdateExpression', currBBIDx, stackInstOffset));
    nextGraph.declareNode(resObj)
    return [resObj]
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
    let resObj = new UnknownResultObj(getHeapQualifiedName('IV_InIterator', currBBIDx, stackInstOffset));
    nextGraph.declareNode(resObj)
    return [resObj]
  } else if (rVal instanceof IV_OfIterator) {
    let resObj = new UnknownResultObj(getHeapQualifiedName('IV_OfIterator', currBBIDx, stackInstOffset));
    nextGraph.declareNode(resObj)
    return [resObj]
  } else if (rVal instanceof IV_LoopNext) {
    let resObj = new UnknownResultObj(getHeapQualifiedName('IV_LoopNext', currBBIDx, stackInstOffset));
    nextGraph.declareNode(resObj)
    return [resObj]
  } else if (rVal instanceof IV_HasLoopNext) {
    let resObj = new UnknownResultObj(getHeapQualifiedName('IV_HasLoopNext', currBBIDx, stackInstOffset));
    nextGraph.declareNode(resObj)
    return [resObj]
  }

  // t_IV_JSX
  else if (rVal instanceof IV_PJSX) {
    let resObj = new PJSXObject(getHeapQualifiedName('PJSX', currBBIDx, stackInstOffset))
    nextGraph.declareNode(resObj)

    for (let c of rVal.children) {
      let pointees = nextGraph.getPointees(getStackQualifiedName(c.lookupName(), currBB))
      nextGraph.drawHeapToHeapEdge([resObj], pointees, ["children"], true)
    }
    return [resObj]
  } else if (rVal instanceof IV_JSX) {

    let currComponentPointees = nextGraph.getPointees(getStackQualifiedName(rVal.tag.lookupName(), currBB));

    let resObj = new JSXObject(getHeapQualifiedName('JSX', currBBIDx, stackInstOffset))
    nextGraph.declareNode(resObj);

    nextGraph.drawHeapToHeapEdge([resObj], currComponentPointees, ['component'], true);

    for (let c of rVal.children) {
      let pointees = nextGraph.getPointees(getStackQualifiedName(c.lookupName(), currBB))
      nextGraph.drawHeapToHeapEdge([resObj], pointees, ["children"], true)
    }
    

    return [resObj]
  } else if (rVal instanceof IV_FJSX) {
    let resObj = new FJSXObject(getHeapQualifiedName('FJSX', currBBIDx, stackInstOffset))
    nextGraph.declareNode(resObj)

    for (let c of rVal.children) {
      let pointees = nextGraph.getPointees(getStackQualifiedName(c.lookupName(), currBB))
      nextGraph.drawHeapToHeapEdge([resObj], pointees, ["children"], true)
    }
    return [resObj]
  }

  debugConfig.logger.throwIriError("TODO: PTA - Unreachable fallthrough reached, something is prolly wrong in the code!!!")

  return [...res];
}