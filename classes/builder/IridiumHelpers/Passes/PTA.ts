// 
// Combine all return statements in functions
// 

import debugConfig from "#debugConfig";
import { popSet } from "#utils";
import { IV_Identifier, IV_MemberExpressionPA, IV_SuperLookupPA, IV_ThisLookupPA } from "../ALL_AMP/ALL_AMP.ts";
import { IS_ClassStaticPropInit } from "../ALL_IS/IS_ClassStaticPropInit.ts";
import { IS_BImport } from "../ALL_IS/IS_Imports_Exports.ts";
import { IS1_AssignmentStmt, IS1_DeclarationStmt } from "../ALL_IS/IS_VarDecl.ts";
import { ISP_ObjectMethod, ISP_ObjectProperty, ISP_Super } from "../ALL_RVal/ALL_ISP.ts";
import { IV_ASSIGNABLE } from "../ALL_RVal/ALL_RVal.ts";
import { IV_BigIntLiteral, IV_BooleanLiteral, IV_DecimalLiteral, IV_NullLiteral, IV_NumericLiteral, IV_StringLiteral } from "../ALL_RVal/IV_Literals.ts";
import { IV_CTHIS, IV_NUBD, IV_STHIS } from "../ALL_RVal/IV_NonLang.ts";
import { IV_Regexp } from "../ALL_RVal/IV_Regexp.ts";
import { IV_This } from "../ALL_RVal/IV_This.ts";
import { BB } from "../BB.ts";
import { IRIDIUM_FG } from "../IRIDIUM.ts";
import { execSync } from "node:child_process";

import { IV_ArrayExpression } from "../ALL_RVal/IV_ArrayExpression.ts";
import { IV_ArrowFunctionExpression } from "../ALL_RVal/IV_ArrowFunctionExpression.ts";
import { IV_ArrPatAssn, IV_MemberAssn, IV_ObjPatAssn, IV_SimpleAssn, IV_SuperAssn, IV_ThisAssn } from "../ALL_RVal/IV_Assignment.ts";
import { IV_ABINOP, IV_BBINOP, IV_CBINOP, IV_DBINOP, IV_EBINOP, IV_FBINOP } from "../ALL_RVal/IV_Binop.ts";
import { IV_Call, IV_ImportCall, IV_SuperCall, IV_V8IntrinsicCall } from "../ALL_RVal/IV_Call.ts";
import { IV_ClassExpression } from "../ALL_RVal/IV_ClassExpression.ts";
import { IV_ConditionalExpression } from "../ALL_RVal/IV_ConditionalExpression.ts";
import { IV_FunctionExpression } from "../ALL_RVal/IV_FunctionExpression.ts";
import { IV_FJSX, IV_JSX, IV_PJSX } from "../ALL_RVal/IV_JSX.ts";
import { IV_HasLoopNext, IV_InIterator, IV_LoopNext, IV_OfIterator } from "../ALL_RVal/IV_LoopIterators.ts";
import { IV_ModuleMeta, IV_NewTarget } from "../ALL_RVal/IV_META.ts";
import { IV_NewExpression } from "../ALL_RVal/IV_NewExpression.ts";
import { IV_ObjectExpression } from "../ALL_RVal/IV_ObjectExpression.ts";
import { IV_TemplateLiteral } from "../ALL_RVal/IV_Templates.ts";
import { IV_AUNOP, IV_BUNOP, IV_CUNOP, IV_DUNOP } from "../ALL_RVal/IV_Unop.ts";
import { IV_UpdateExpression } from "../ALL_RVal/IV_UpdateExpression.ts";
import { IV_AWAIT, IV_YIELD } from "../ALL_RVal/IV_YIELD_AWAIT.ts";
import { BigIntNode, BooleanNode, DecimalNode, GlobalNode, ImportNode, NullNode, NumericNode, OrdinaryFunctionObject, OrdinaryObject, PTANode, StackNode, StringNode, SymbolNode } from "./PTA/nodes.ts";
import { PTARecorder } from "./PTA/PTARecorder.ts";
import { PTAGraph } from "./PTA/PTAGraph.ts";
import { handleRVals } from "./PTA/rvalHandler.ts";
import { getHeapQualifiedName, getStackQualifiedName } from "./PTA/util.ts";



type BBIdx = string;
let getBBIdx = (bb: BB): BBIdx => '' + bb.idx;

export function PTA(rootFG: IRIDIUM_FG, saveRecording: boolean) {
  // Assert that there is only one source in the flowgraph
  if (rootFG.sources().length !== 1) debugConfig.logger.throwIriError("Expected exactly one root inside a flowgraph")

  // Initialize flowMap and worklist
  let worklist: Set<BBIdx> = new Set()
  let flowMap: Map<BBIdx, PTAGraph> = new Map()
  rootFG.nodes().forEach((bbIdx: BBIdx) => (flowMap.set(bbIdx, new PTAGraph()), worklist.add(bbIdx)));

  let recorder = new PTARecorder()

  let step = 1

  if (saveRecording) recorder.init()

  // Initialize global objs
  let globalEnv = new PTAGraph()
  for (let [o,_] of rootFG.rootBB.env.parent.bindings) {
    globalEnv.addPTANode((new GlobalNode("ENV0$" + o)))
  }

  // Start working on the worklist
  while (worklist.size > 0) {
    step++;
    let currBBIDx: BBIdx = popSet(worklist);

    // Incoming Set
    let nextGraph: PTAGraph = new PTAGraph()
    let preds = rootFG.predecessors(currBBIDx)
    let incomingBBIdxs: Array<BBIdx> = preds ? preds : []
    nextGraph.union(...incomingBBIdxs.map((bbIdx: BBIdx) => flowMap.get(bbIdx)), globalEnv)

    if (saveRecording) {
      nextGraph.saveDotToFile(`outputs/PTA/${step}_BB${currBBIDx}_IN`)
      // console.log(`Processing BB${currBBIDx}`)
      // console.log(rootFG.getBBNode(currBBIDx).toString(0))
    }

    // Flow Function 
    flowFunction(rootFG, nextGraph, currBBIDx);

    if (saveRecording) {
      nextGraph.saveDotToFile(`outputs/PTA/${step}_BB${currBBIDx}_OUT`)
      // console.log(nextGraph.toDot(`BB${currBBIDx}_OUT`))
    }

    // Add successors to worklist if there was a change
    if (!flowMap.has(currBBIDx)) throw new Error("Expected flowmap to have a graph for each node");
    let oldGraph = flowMap.get(currBBIDx)
    if (!oldGraph.equals(nextGraph)) {
      flowMap.set(currBBIDx, nextGraph);
      let succ = rootFG.successors(currBBIDx)
      if (succ) succ.forEach((bbIdx: BBIdx) => worklist.add(bbIdx))
    }
  }

  if (saveRecording) {
    execSync(`rm outputs/PTA/*.DOT 2>/dev/null`);
  }
}

function flowFunction(rootFG: IRIDIUM_FG, nextGraph: PTAGraph, currBBIDx: BBIdx) {
  let currBB = rootFG.getBBNode(currBBIDx)
  let stackInstOffset = 0
  for (let i of currBB.statements) {
    stackInstOffset++;

    if (i instanceof IS_BImport) {
      // import { remote as local } from FROM
      let stackID = getStackQualifiedName(i.local.lookupName(), currBB)
      let stackNode = new StackNode(stackID)
      nextGraph.declareNode(stackNode)

      let heapObj = getHeapQualifiedName(i.remote.lookupName(), currBBIDx, stackInstOffset)
      let heapNode = new ImportNode(heapObj, i.remote, i.FROM)
      nextGraph.declareNode(heapNode)

      nextGraph.clearSuccessors(stackNode.id)
      nextGraph.drawStackToHeapEdge(stackNode, [heapNode])
    } else if (i instanceof IS_ClassStaticPropInit) {
      // // obj[prop] = rval
      // // obj.prop = rval
      // let rValID = getStackQualifiedName(i.RVal.lookupName(), currBB)
      // nextGraph.ensureNode(rValID)

      // let rValPointees = nextGraph.getPointees(rValID)

      // // handleMemberAssignment(nextGraph, i.obj.lookupName(), rValPointees, i.prop.lookupName(), i.computed);
    } else if (i instanceof IS1_DeclarationStmt) {
      if (i.LVal instanceof IV_Identifier) {
        // handleSimpleAssignmentStatement(nextGraph, i.LVal.lookupName(), handleRVals(nextGraph, i.RVal, currBB, currBBIDx, stackInstOffset))
      } else {
        // TODO?? Handle destructuring patterns
      }
    } else if (i instanceof IS1_AssignmentStmt) {
      if (i.LVal instanceof IV_Identifier) {
        // handleSimpleAssignmentStatement(nextGraph, i.LVal.lookupName(), handleRVals(nextGraph, i.RVal, currBB, currBBIDx, stackInstOffset))
      } else {
        // TODO?? Handle destructuring patterns
      }
    }

    // console.log(nextGraph.toDot(i.toString()))
  }
}