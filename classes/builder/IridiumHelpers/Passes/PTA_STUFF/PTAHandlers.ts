import { IS_BImport } from "../../ALL_IS/IS_Imports_Exports.ts";
import {
  PTAFlowData,
  PTAFlowNode,
  StackNode,
  addStackPTANode,
  addStackEdges,
  GLOBAL_RESOLUTION_MAP,
  addPTANode,
  GLOBAL_NODE_MAP,
  RemoteNode,
  OrdinaryFunctionNode,
  OrdinaryArrayNode,
  getPointees,
  addHeapEdges,
  ensureNodeIDAndGetStackNode,
  PTAEdge,
} from "./PTAFlowData.ts";
import { BB } from "../../BB.ts";
import { getHeapQualifiedName, getStackQualifiedName } from "./util.ts";
import debugConfig from "#debugConfig";
import assert from "node:assert";
import { IV_Identifier } from "../../ALL_AMP/ALL_AMP.ts";
import { ISP_ArgSpread, ISP_ObjectMethod } from "../../ALL_RVal/ALL_ISP.ts";
import { Set as ISet } from "immutable";
import { IRIDIUM_FG } from "../../I_GENERAL/IRIDIUM_FG.ts";
import { I_Function_params } from "../../I_GENERAL/I_Function.ts";
import { handleRVals } from "./RValHandlers.ts";

// a = [POINTEES]
export const handleSimpleAssignmentStatement = (
  mutableFlowData: PTAFlowData,
  qualifiedStackId: string,
  vs: Array<PTAFlowNode> | Set<PTAFlowNode>,
) => {
  const u = GLOBAL_NODE_MAP.has(qualifiedStackId)
    ? GLOBAL_NODE_MAP.get(qualifiedStackId)
    : new StackNode(qualifiedStackId);
  assert(u instanceof StackNode);
  addStackPTANode(mutableFlowData, u);
  addStackEdges(mutableFlowData, u, vs);
};

// import { remote as local } from FROM
export const handleBImportNode = (
  mutableFlowData: PTAFlowData,
  i: IS_BImport,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
) => {
  const stackID = getStackQualifiedName(i.local.lookupName(), currBB);
  const stackNode = GLOBAL_NODE_MAP.has(stackID)
    ? GLOBAL_NODE_MAP.get(stackID)
    : new StackNode(stackID);
  assert(stackNode instanceof StackNode);
  addPTANode(mutableFlowData, stackNode);

  const heapID = getHeapQualifiedName("IMPORT", currBBIDx, stackInstOffset);
  const remoteNode = GLOBAL_NODE_MAP.has(heapID)
    ? GLOBAL_NODE_MAP.get(heapID)
    : new RemoteNode(heapID);

  assert(remoteNode instanceof RemoteNode);
  addPTANode(mutableFlowData, remoteNode);

  if (GLOBAL_RESOLUTION_MAP.has(heapID)) {
    debugConfig.logger.throwIriError("TODO: Handle resolved nodes");
  } else {
    addStackEdges(mutableFlowData, stackNode, [remoteNode]);
  }
};

export const handleOrdinaryFunctionObjectCall = (
  mutableFlowData: PTAFlowData,
  c: OrdinaryFunctionNode,
  args: Array<IV_Identifier | ISP_ArgSpread>,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
): Set<PTAFlowNode> => {
  const iContext = "BB" + currBBIDx + ":" + stackInstOffset;
  const meth = c.meth;
  const res: Set<PTAFlowNode> = new Set();
  let closureGraph: IRIDIUM_FG;
  if (meth instanceof ISP_ObjectMethod) closureGraph = meth.funBody;
  else closureGraph = meth.func.funBody;

  let calleeArgs: I_Function_params;
  if (meth instanceof ISP_ObjectMethod) calleeArgs = meth.params;
  else calleeArgs = meth.func.params;

  let rootBB: BB;
  if (meth instanceof ISP_ObjectMethod) rootBB = meth.funBody.rootBB;
  else rootBB = meth.func.funBody.rootBB;

  // const closureContextPTA = new PTAGraph();
  // closureContextPTA.union(nextGraph);

  //
  // Create arguments object
  //
  const argsID = getHeapQualifiedName(
    "argumentsObj",
    currBBIDx,
    stackInstOffset,
  );
  const argumentsNode = GLOBAL_NODE_MAP.has(argsID)
    ? GLOBAL_NODE_MAP.get(argsID)
    : new OrdinaryArrayNode(argsID);
  assert(argumentsNode instanceof OrdinaryArrayNode);
  addPTANode(mutableFlowData, argumentsNode);

  const suppliedArgs = args.length;
  const expectedArgs = calleeArgs.length;

  for (let i = 0; i < suppliedArgs; i++) {
    const currArg = args[i];
    if (currArg instanceof IV_Identifier) {
      const ID = getStackQualifiedName(currArg.lookupName(), currBB);
      const stackNode = ensureNodeIDAndGetStackNode(mutableFlowData, ID);
      const pointees = getPointees(mutableFlowData, stackNode);
      // ArgumentsObj --[i]--> pointees
      addHeapEdges(mutableFlowData, argumentsNode, ["" + i], pointees, true);
    } else {
      if (i + 1 !== suppliedArgs)
        debugConfig.logger.throwIriError(
          "Expecting Spread operator to be the last supplied argument",
        );

      const ID = getStackQualifiedName(currArg.arg.lookupName(), currBB);
      const stackNode = ensureNodeIDAndGetStackNode(mutableFlowData, ID);
      const pointees = getPointees(mutableFlowData, stackNode);
      // ArgumentsObj --[*]--> pointees
      mutableFlowData.set(
        argumentsNode.id,
        mutableFlowData.get(argumentsNode.id).withMutations((edges) => {
          for (const pp of pointees) {
            const outEdges = mutableFlowData.get(pp.id);
            for (const e of outEdges) {
              const constructedEdge = PTAEdge.from(pp.id, e);
              edges.add(
                PTAEdge.constructHeapEdge(
                  argumentsNode.id,
                  "*",
                  "E",
                  constructedEdge.v,
                ).getPTAEdge(),
              );
            }
          }
        }),
      );
    }
  }

  // Do argument matching
  // case 1: supplied args === expected args
  // case 2: supplied args > expected args
  // case 3: supplied args < expected args

  const undefID = new IV_Identifier(undefined, "undefined");
  const undefPointee = handleRVals(
    mutableFlowData,
    undefID,
    currBB,
    currBBIDx,
    stackInstOffset,
  )[0];

  if (suppliedArgs < expectedArgs) {
    mutableFlowData.set(
      argumentsNode.id,
      mutableFlowData.get(argumentsNode.id).withMutations((edges) => {
        for (let i = suppliedArgs; i <= expectedArgs; i++) {
          edges.add(
            PTAEdge.constructHeapEdge(
              argumentsNode.id,
              "*",
              "E",
              undefPointee.id,
            ).getPTAEdge(),
          );
        }
      }),
    );
  }

  // //
  // // Match formals (or the other one... I forgor),
  // //
  // let j = 0;
  // for (; j < calleeArgs.length; j++) {
  //   const currArg = calleeArgs[j];
  //   if (currArg instanceof IV_Identifier) {
  //     const argStackQualifiedName = getStackQualifiedName(
  //       currArg.lookupName(),
  //       rootBB,
  //     );
  //     const argStackNode = new StackNode(argStackQualifiedName);
  //     closureContextPTA.declareNode(argStackNode);
  //     if (j <= lastMapped) {
  //       //
  //       // argStackQualifiedName --> argumentsObj.j
  //       //
  //       let pointees;
  //       if (!closureContextPTA.hasField(argumentsObj.id, "" + j)) {
  //         debugConfig.logger.error("Expecting field to exist");
  //         pointees = closureContextPTA.getPointees("undefined");
  //       } else {
  //         pointees = closureContextPTA.getFieldPointees(
  //           argumentsObj,
  //           "" + j,
  //           iContext,
  //           true,
  //           false,
  //         );
  //       }
  //       closureContextPTA.drawStackToHeapEdge(argStackNode, [...pointees]);
  //       // if (!closureContextPTA.hasField(argumentsObj.id, "" + j))
  //       //   debugConfig.logger.throwIriError("Expecting field to exist");
  //       // const pointees = closureContextPTA.getFieldPointees(
  //       //   argumentsObj,
  //       //   "" + j,
  //       //   iContext,
  //       //   true,
  //       //   false,
  //       // );
  //       // closureContextPTA.drawStackToHeapEdge(argStackNode, [...pointees]);
  //     } else {
  //       //
  //       // argStackQualifiedName --> argumentsObj.*
  //       //
  //       let pointees;
  //       if (!closureContextPTA.hasField(argumentsObj.id, "*")) {
  //         debugConfig.logger.error("Expecting field to exist");
  //         pointees = closureContextPTA.getPointees("undefined");
  //       } else {
  //         pointees = closureContextPTA.getFieldPointees(
  //           argumentsObj,
  //           "*",
  //           iContext,
  //           true,
  //         );
  //       }
  //       closureContextPTA.drawStackToHeapEdge(argStackNode, [...pointees]);
  //       // if (!closureContextPTA.hasField(argumentsObj.id, "*"))
  //       //   debugConfig.logger.throwIriError("Expecting field to exist");
  //       // const pointees = closureContextPTA.getFieldPointees(
  //       //   argumentsObj,
  //       //   "*",
  //       //   iContext,
  //       //   true,
  //       // );
  //       // closureContextPTA.drawStackToHeapEdge(argStackNode, [...pointees]);
  //     }
  //   } else {
  //     if (j + 1 !== calleeArgs.length)
  //       debugConfig.logger.throwIriError(
  //         "Expecting Spread operator to be the last function argument",
  //       );
  //     const spillHolderObj = new OrdinaryArrayObject(
  //       getHeapQualifiedName(
  //         currArg.arg.lookupName(),
  //         currBBIDx,
  //         stackInstOffset,
  //       ),
  //     );
  //     closureContextPTA.declareNode(spillHolderObj);
  //     const argStackQualifiedName = getStackQualifiedName(
  //       currArg.arg.lookupName(),
  //       rootBB,
  //     );
  //     const argStackNode = new StackNode(argStackQualifiedName);
  //     closureContextPTA.declareNode(argStackNode);
  //     let counter = 0;
  //     for (let k = j; k <= lastMapped; k++) {
  //       //
  //       // argStackQualifiedName ---> spillHolderObj --[k]--> U {argumentsObj.j...argumentsObj.lastMapped}
  //       //
  //       if (!closureContextPTA.hasField(argumentsObj.id, "" + k))
  //         debugConfig.logger.throwIriError("Expecting field to exist");
  //       const pointees = closureContextPTA.getFieldPointees(
  //         argumentsObj,
  //         "" + k,
  //         iContext,
  //         true,
  //         false,
  //       );
  //       closureContextPTA.drawHeapToHeapEdge(
  //         [spillHolderObj],
  //         [...pointees],
  //         ["" + counter],
  //         true,
  //       );
  //       counter++;
  //     }
  //     // argStackQualifiedName ---> spillHolderObj --[k]--> argumentsObj.*
  //     if (closureContextPTA.hasField(argumentsObj.id, "*")) {
  //       const pointees = closureContextPTA.getFieldPointees(
  //         argumentsObj,
  //         "*",
  //         iContext,
  //         true,
  //       );
  //       closureContextPTA.drawHeapToHeapEdge(
  //         [spillHolderObj],
  //         [...pointees],
  //         ["*"],
  //         true,
  //       );
  //     }
  //     closureContextPTA.drawStackToHeapEdge(argStackNode, [spillHolderObj]);
  //   }
  // }

  // //
  // // Evaluate Closure
  // //
  // const nextt = ContextualPTAHandler(
  //   c.id,
  //   iContext,
  //   closureContextPTA,
  //   closureGraph,
  // );
  // const sinks = closureGraph.sinks();
  // if (sinks.length !== 1)
  //   debugConfig.logger.throwIriError(
  //     `Sinks length !== 1, found ${sinks.length}`,
  //   );
  // const sink = sinks[0];
  // const sinkBB = closureGraph.getBBNode(sink);

  // //
  // // Point to all stuff the return can point to
  // //
  // if (sinkBB instanceof FunctionReturn) {
  //   const argLookupName = getStackQualifiedName(
  //     sinkBB.arg.lookupName(),
  //     sinkBB,
  //   );
  //   const pointees = nextt.getPointees(argLookupName);
  //   pointees.forEach((p) => res.add(p));
  // } else {
  //   debugConfig.logger.throwIriError(
  //     `Expected sinks to be Function Returns in closures!!! found ${sinkBB.scope}`,
  //   );
  // }
  return res;
};

export const handleCallExpression = (
  mutableFlowData: PTAFlowData,
  callees: Array<PTAFlowNode> | Set<PTAFlowNode> | ISet<PTAFlowNode>,
  args: Array<IV_Identifier | ISP_ArgSpread>,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
): Set<PTAFlowNode> => {
  const res: Set<PTAFlowNode> = new Set();
  // const closureResults: Array<PTAGraph> = [];
  for (const c of callees) {
    if (c instanceof OrdinaryFunctionNode) {
      return handleOrdinaryFunctionObjectCall(
        mutableFlowData,
        c,
        args,
        currBB,
        currBBIDx,
        stackInstOffset,
      );
    } else {
      console.warn(`PTA is skipping analysis of non-callable object: ${c.id}`);
    }
  }

  // nextGraph.union(...closureResults);
  return res;
};
