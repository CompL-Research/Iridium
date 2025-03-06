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
  addSelfLoop,
  unionAllPTAFlowData,
  assertFieldPTANode,
  getFieldPointees,
  hasFieldPTANode,
  unionAllMutablePTAFlowData,
  printPTAFlowData,
  GetClosureNode,
} from "./PTAFlowData.ts";
import { BB, FunctionReturn } from "../../BB.ts";
import { getHeapQualifiedName, getStackQualifiedName } from "./util.ts";
import debugConfig from "#debugConfig";
import assert from "node:assert";
import { IV_Identifier } from "../../ALL_AMP/ALL_AMP.ts";
import { ISP_ArgSpread, ISP_ObjectMethod } from "../../ALL_RVal/ALL_ISP.ts";
import { IRIDIUM_FG } from "../../I_GENERAL/IRIDIUM_FG.ts";
import { I_Function_params } from "../../I_GENERAL/I_Function.ts";
import { handleRVals } from "./RValHandlers.ts";
import { PTA, PTA_HASH_MAP, PTA_WORLD, PTA_WORLD_CURRMUTABLE_DATA } from "../PTA.ts";
import { hashGraph, saveFlowDataToFile, saveFlowDataToGraph } from "#utils"
import { IV_CTHIS } from "../../ALL_RVal/IV_NonLang.ts";

const a = saveFlowDataToFile;
const b = saveFlowDataToGraph;

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
    : new RemoteNode(heapID, i.FROM.value);

  assert(remoteNode instanceof RemoteNode);
  addPTANode(mutableFlowData, remoteNode);

  if (GLOBAL_RESOLUTION_MAP.has(heapID)) {
    debugConfig.logger.throwIriError("TODO: Handle resolved nodes");
  } else {
    addSelfLoop(mutableFlowData, remoteNode, true);
    addStackEdges(mutableFlowData, stackNode, [remoteNode]);
  }
};

export const handleOrdinaryFunctionObjectCall = (
  uname: string,
  mutableFlowData: PTAFlowData,
  c: OrdinaryFunctionNode | GetClosureNode,
  args: Array<IV_Identifier | ISP_ArgSpread>,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
  objectContext: Array<PTAFlowNode> | undefined,
): [PTAFlowData, string, StackNode] => {
  let calleeArgs: I_Function_params;
  if (c.meth instanceof ISP_ObjectMethod) calleeArgs = c.meth.params;
  else calleeArgs = c.meth.func.params;

  let closureGraph: IRIDIUM_FG;
  if (c.meth instanceof ISP_ObjectMethod) closureGraph = c.meth.funBody;
  else closureGraph = c.meth.func.funBody;

  const closureWorld = c.world;

  const hasMutableWorld = PTA_WORLD_CURRMUTABLE_DATA.has(closureWorld) && PTA_WORLD_CURRMUTABLE_DATA.get(closureWorld).length > 0;

  if (!hasMutableWorld) {
    debugConfig.logger.throwIriError("PTA TODO: calling closure to a immutable world");
  } else {
    const closureWorldData = PTA_WORLD_CURRMUTABLE_DATA.get(closureWorld)[PTA_WORLD_CURRMUTABLE_DATA.get(closureWorld).length - 1];
    const boundaryEnv = unionAllPTAFlowData(closureWorldData);
    // Add arguments node
    const argumentsNode = initializeArgumentsObj(
      uname,
      args,
      calleeArgs.length,
      boundaryEnv,
      currBB,
      currBBIDx,
      stackInstOffset,
    );

    if (objectContext) {
      const C_THIS_ID = getStackQualifiedName(IV_CTHIS.lookupName(), closureGraph.rootBB);
      const stackNode = GLOBAL_NODE_MAP.has(C_THIS_ID)
            ? GLOBAL_NODE_MAP.get(C_THIS_ID)
            : new StackNode(C_THIS_ID);
      assert(stackNode instanceof StackNode);
      addPTANode(boundaryEnv, stackNode);

      addStackEdges(boundaryEnv, stackNode, objectContext);
    }



    // PTA Eval with curbed env as eval context
    handleClosureCall(argumentsNode, args.length, calleeArgs, closureWorld, closureGraph, boundaryEnv);
    boundaryEnv.delete(argumentsNode.id);

    const sinks = closureGraph.sinks();
    if (sinks.length !== 1)
      debugConfig.logger.throwIriError(
        `Sinks length !== 1, found ${sinks.length}`,
      );
    const sink = sinks[0];
    const sinkBB = closureGraph.getBBNode(sink);

    //
    // Point to all stuff the return can point to
    //
    if (!(sinkBB instanceof FunctionReturn)) {
      debugConfig.logger.throwIriError(
        `Expected sinks to be Function Returns in closures!!! found ${sinkBB.scope}`,
      );
      return undefined
    };
    const argLookupName = getStackQualifiedName(
      sinkBB.arg.lookupName(),
      sinkBB,
    );
    return [boundaryEnv, closureWorld, ensureNodeIDAndGetStackNode(boundaryEnv, argLookupName)];
  }

  debugConfig.logger.throwIriError("TODO: Ordinary Function Call");
  return undefined;
};

export const initializeArgumentsObj = (
  uname: string,
  callerArgs: Array<IV_Identifier | ISP_ArgSpread>,
  expectedArgsLen: number,
  boundaryEnv: PTAFlowData,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
): OrdinaryArrayNode => {
  const argsID = getHeapQualifiedName(
    "argumentsObj",
    currBBIDx,
    stackInstOffset,
  );

  const argumentsNode = GLOBAL_NODE_MAP.has(argsID)
    ? GLOBAL_NODE_MAP.get(argsID)
    : new OrdinaryArrayNode(argsID);
  assert(argumentsNode instanceof OrdinaryArrayNode);
  addPTANode(boundaryEnv, argumentsNode);

  const suppliedArgs = callerArgs.length;

  for (let i = 0; i < suppliedArgs; i++) {
    const currArg = callerArgs[i];
    if (currArg instanceof IV_Identifier) {
      const ID = getStackQualifiedName(currArg.lookupName(), currBB);
      const stackNode = ensureNodeIDAndGetStackNode(boundaryEnv, ID);
      const pointees = getPointees(boundaryEnv, stackNode);
      // ArgumentsObj --[i]--> pointees
      addHeapEdges(boundaryEnv, argumentsNode, ["" + i], pointees, true);
    } else {
      if (i + 1 !== suppliedArgs)
        debugConfig.logger.throwIriError(
          "Expecting Spread operator to be the last supplied argument",
        );

      const ID = getStackQualifiedName(currArg.arg.lookupName(), currBB);
      const stackNode = ensureNodeIDAndGetStackNode(boundaryEnv, ID);
      const pointees = getPointees(boundaryEnv, stackNode);
      // ArgumentsObj --[*]--> pointees
      const edgesHolder = boundaryEnv.get(argumentsNode.id);

      for (const pp of pointees) {
        const outEdges = boundaryEnv.get(pp.id);
        for (const e of outEdges) {
          const constructedEdge = PTAEdge.from(pp.id, e);
          edgesHolder.add(
            PTAEdge.constructHeapEdge(
              argumentsNode.id,
              "*",
              "E",
              constructedEdge.v,
            ).getPTAEdge(),
          );
        }
      }
    }
  }

  // Do argument matching
  // case 1: supplied args === expected args
  // case 2: supplied args > expected args
  // case 3: supplied args < expected args
  const undefID = new IV_Identifier(undefined, "undefined");
  const undefPointee = handleRVals(
    uname,
    boundaryEnv,
    undefID,
    currBB,
    currBBIDx,
    stackInstOffset,
  )[0];

  if (suppliedArgs < expectedArgsLen) {
    const edgesHolder = boundaryEnv.get(argumentsNode.id)
    for (let i = suppliedArgs; i <= expectedArgsLen; i++) {
      edgesHolder.add(
        PTAEdge.constructHeapEdge(
          argumentsNode.id,
          "" + i,
          "E",
          undefPointee.id,
        ).getPTAEdge(),
      );
    }
  }
  return argumentsNode;
}

export const handleClosureCall = (
  argumentsNode: OrdinaryArrayNode,
  callerArgs: number,
  calleeArgs: I_Function_params,
  world: string,
  closureFG: IRIDIUM_FG,
  boundaryEnv: PTAFlowData,
) => {
  const boundaryHash = hashGraph(boundaryEnv, closureFG.rootBB.idx);
  if (PTA_HASH_MAP.has(boundaryHash)) {
    if (PTA_HASH_MAP.get(boundaryHash)) {
      debugConfig.logger.error(`Boundary Hash reused: ${boundaryHash}`);
      unionAllMutablePTAFlowData(boundaryEnv, PTA_HASH_MAP.get(boundaryHash));
    } else {
      debugConfig.logger.error(`Boundary Null Hash: ${boundaryHash}`);
    }
    return;
  }
  PTA_HASH_MAP.set(boundaryHash, null);
  const rootBB = closureFG.rootBB;
  //
  // Match formals (or the other one... I forgor),
  //
  let j = 0;
  for (; j < calleeArgs.length; j++) {
    const currField = "" + j;
    const currArg = calleeArgs[j];
    if (currArg instanceof IV_Identifier) {
      const argStackQualifiedName = getStackQualifiedName(
        currArg.lookupName(),
        rootBB,
      );

      const argStackNode = GLOBAL_NODE_MAP.has(argStackQualifiedName)
        ? GLOBAL_NODE_MAP.get(argStackQualifiedName)
        : new StackNode(argStackQualifiedName);
      assert(argStackNode instanceof StackNode);
      addPTANode(boundaryEnv, argumentsNode);
      
      assertFieldPTANode(boundaryEnv, argumentsNode, currField);

      const [pointees, closures] = getFieldPointees(boundaryEnv, argumentsNode, currField);
      addStackEdges(boundaryEnv, argStackNode, pointees);
      if (closures.length > 0)
        debugConfig.logger.error("Unexpected closure in arguments object: handleClosureCall function");
    } else {
      if (j + 1 !== calleeArgs.length)
        debugConfig.logger.throwIriError(
          "Expecting Spread operator to be the last function argument",
        );

      const spillHolderID = getHeapQualifiedName(
        currArg.arg.lookupName(),
        "" + rootBB.idx,
        0,
      );

      const spillHolderObj = GLOBAL_NODE_MAP.has(spillHolderID)
        ? GLOBAL_NODE_MAP.get(spillHolderID)
        : new OrdinaryArrayNode(spillHolderID);
      
      assert(spillHolderObj instanceof OrdinaryArrayNode);
      addPTANode(boundaryEnv, argumentsNode);

      const argStackID = getStackQualifiedName(
        currArg.arg.lookupName(),
        rootBB,
      );
      const argStackNode = GLOBAL_NODE_MAP.has(argStackID)
        ? GLOBAL_NODE_MAP.get(argStackID)
        : new StackNode(argStackID);
      assert(spillHolderObj instanceof StackNode);

      addStackEdges(boundaryEnv, argStackNode, [spillHolderObj]);
      
      let counter = 0;
      for (let k = j; k <= callerArgs; k++) {
        //
        // argStackQualifiedName ---> spillHolderObj --[k]--> U {argumentsObj.j...argumentsObj.lastMapped}
        //

        assertFieldPTANode(boundaryEnv, argumentsNode, currField);

        const [pointees, closures] = getFieldPointees(boundaryEnv, argumentsNode, currField);
        if (closures.length > 0)
          debugConfig.logger.error("Unexpected closure in arguments object: handleClosureCall function");

        addHeapEdges(
          boundaryEnv,
          spillHolderObj,
          ["" + counter],
          pointees,
          true
        );
        counter++;
      }

      if (hasFieldPTANode(boundaryEnv, argumentsNode, "*")) {
        const [pointees, closures] = getFieldPointees(boundaryEnv, argumentsNode, "*");
        if (closures.length > 0)
          debugConfig.logger.error("Unexpected closure in arguments object: handleClosureCall function");
  
        addHeapEdges(
          boundaryEnv,
          spillHolderObj,
          ["*"],
          pointees,
          true
        );
      }
    }
  }

  const resultEnv = PTA(world, closureFG, boundaryEnv);
  unionAllMutablePTAFlowData(boundaryEnv, resultEnv);
  PTA_HASH_MAP.set(boundaryHash, resultEnv);
  
}

const x = printPTAFlowData;

export const handleCallExpression = (
  uname: string,
  mutableFlowData: PTAFlowData,
  callees: Array<PTAFlowNode> | Set<PTAFlowNode>,
  args: Array<IV_Identifier | ISP_ArgSpread>,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
  objectContext: Array<PTAFlowNode> | undefined,
): Set<PTAFlowNode> => {
  const res: Set<PTAFlowNode> = new Set();
  const closureResults: Array<[PTAFlowData, string, StackNode]> = [];
  for (const c of callees) {
    if (c instanceof OrdinaryFunctionNode) {
      const [flowData, world, returnNode] = handleOrdinaryFunctionObjectCall(
        uname,
        mutableFlowData,
        c,
        args,
        currBB,
        currBBIDx,
        stackInstOffset,
        objectContext
      )
      closureResults.push([flowData, world, returnNode]);
    } else if (c instanceof GetClosureNode) {
      const [flowData, world, returnNode] = handleOrdinaryFunctionObjectCall(
        uname,
        mutableFlowData,
        c,
        args,
        currBB,
        currBBIDx,
        stackInstOffset,
        objectContext
      )
      closureResults.push([flowData, world, returnNode]);
    } else {
      console.warn(`PTA is skipping analysis of non-callable object: ${c.id}`);
    }
  }

  for (const [closureResult, closureWorld, returnObj] of closureResults) {
    if (PTA_WORLD.get(closureWorld) !== null) {
      debugConfig.logger.throwIriError("TODO: // Update a closed world");
    } else {
      const hasMutableWorld = PTA_WORLD_CURRMUTABLE_DATA.has(closureWorld) && PTA_WORLD_CURRMUTABLE_DATA.get(closureWorld).length > 0;

      // World already has an instance
      if (!hasMutableWorld) debugConfig.logger.throwIriError("An open world must have a mutable data active");
      
      const mutableWorldData = PTA_WORLD_CURRMUTABLE_DATA.get(closureWorld)[PTA_WORLD_CURRMUTABLE_DATA.get(closureWorld).length - 1];

      const pointees = getPointees(closureResult, returnObj);
      if (closureWorld === uname) 
        pointees.forEach((p) => res.add(p))
      else 
        debugConfig.logger.throwIriError("TODO: Handle Remote Object Returns");

      unionAllMutablePTAFlowData(mutableWorldData, closureResult);
    }
  }
  return res;
};
