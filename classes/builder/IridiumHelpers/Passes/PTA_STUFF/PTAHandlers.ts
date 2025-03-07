import debugConfig from "#debugConfig";
import { hashGraph, saveFlowDataToFile, saveFlowDataToGraph } from "#utils";
import assert from "node:assert";
import { IV_Identifier, IV_PrivateName } from "../../ALL_AMP/ALL_AMP.ts";
import { IS_BImport } from "../../ALL_IS/IS_Imports_Exports.ts";
import { ISP_ArgSpread, ISP_ObjectMethod } from "../../ALL_RVal/ALL_ISP.ts";
import { IV_CTHIS } from "../../ALL_RVal/IV_NonLang.ts";
import { BB, FunctionReturn } from "../../BB.ts";
import { IRIDIUM_FG } from "../../I_GENERAL/IRIDIUM_FG.ts";
import { I_Function_params } from "../../I_GENERAL/I_Function.ts";
import { PTA, PTA_HASH_MAP, PTA_WORLD, PTA_WORLD_CURRMUTABLE_DATA } from "../PTA.ts";
import {
  GLOBAL_NODE_MAP,
  GLOBAL_RESOLUTION_MAP,
  GetClosureNode,
  OrdinaryArrayNode,
  OrdinaryFunctionNode,
  PTAEdge,
  PTAFlowData,
  PTAFlowNode,
  RemoteNode,
  SetClosureNode,
  StackNode,
  addHeapEdges,
  addPTANode,
  addSelfLoop,
  addStackEdges,
  addStackPTANode,
  assertFieldPTANode,
  ensureNodeIDAndGetStackNode,
  getFieldPointees,
  getPointees,
  hasFieldPTANode,
  unionAllMutablePTAFlowData,
  unionAllPTAFlowData
} from "./PTAFlowData.ts";
import { dissernProps, handleRVals } from "./RValHandlers.ts";
import { getHeapQualifiedName, getStackQualifiedName } from "./util.ts";

const a = saveFlowDataToFile;
const b = saveFlowDataToGraph;

// a[f]
export const handleFieldReference = (
  uname: string,
  mutableFlowData: PTAFlowData,
  stackQualifiedReceiverID: string,
  field: IV_Identifier | IV_PrivateName,
  computed: boolean,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
) => {
  const receiverStackNode = ensureNodeIDAndGetStackNode(mutableFlowData, stackQualifiedReceiverID);
  const receiverPointees = getPointees(mutableFlowData, receiverStackNode);

  const dissernedProps: Set<string> = dissernProps(
    mutableFlowData,
    field.lookupName(),
    computed && getStackQualifiedName(field.lookupName(), currBB),
    computed,
  );

  const res: Set<PTAFlowNode> = new Set();
  for (const u of receiverPointees) {
    for (const p of dissernedProps) {
      const [pointees, closures] = getFieldPointees(mutableFlowData, u, p);
      pointees.forEach((p) => res.add(p));
      handleCallExpression(
        uname,
        mutableFlowData,
        closures,
        [],
        currBB,
        currBBIDx,
        stackInstOffset,
        [u]
      ).forEach((r) => res.add(r))
    }
  }
  return [...res];
}


// a[f] = [PONTEES]
export const handleFieldAssignmentStatement = (
  mutableFlowData: PTAFlowData,
  us: Array<PTAFlowNode> | Set<PTAFlowNode>,
  fields: Set<string> | Array<string>,
  vs: Array<PTAFlowNode> | Set<PTAFlowNode>,
  enumerable: boolean,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,

) => {
  const pendingClosures: Array<[SetClosureNode, PTAFlowNode, Array<PTAFlowNode> | Set<PTAFlowNode>]> = [];
  const closureResults: Array<[PTAFlowData, string, StackNode]> = [];

  for (const u of us) {
    for (const field of fields) {
      pendingClosures.push(...addHeapEdges(mutableFlowData, u, field, vs, enumerable));
    }
  }

  for (const [closure, objContext, args] of pendingClosures) {
    const [flowData, world, returnNode] = handleSetClosureCall(
      closure,
      objContext,
      args,
      currBBIDx,
      stackInstOffset
    )

    closureResults.push([flowData, world, returnNode]);
  }

  for (const [closureResult, closureWorld, returnObj] of closureResults) {
    if (PTA_WORLD.get(closureWorld) !== null) {
      debugConfig.logger.throwIriError("TODO: // Update a closed world");
    } else {
      const hasMutableWorld = PTA_WORLD_CURRMUTABLE_DATA.has(closureWorld) && PTA_WORLD_CURRMUTABLE_DATA.get(closureWorld).length > 0;

      // World already has an instance
      if (!hasMutableWorld) debugConfig.logger.throwIriError("An open world must have a mutable data active");

      const mutableWorldData = PTA_WORLD_CURRMUTABLE_DATA.get(closureWorld)[PTA_WORLD_CURRMUTABLE_DATA.get(closureWorld).length - 1];

      unionAllMutablePTAFlowData(mutableWorldData, closureResult);
    }
  }
}


// a = [POINTEES]
export const handleSimpleAssignmentStatement = (
  uname: string,
  mutableFlowData: PTAFlowData,
  qualifiedStackId: string,
  vs: Array<PTAFlowNode> | Set<PTAFlowNode>,
) => {
  const u = GLOBAL_NODE_MAP.has(qualifiedStackId)
    ? GLOBAL_NODE_MAP.get(qualifiedStackId)
    : new StackNode(qualifiedStackId, uname);
  assert(u instanceof StackNode);
  addStackPTANode(mutableFlowData, u);
  addStackEdges(mutableFlowData, u, vs);
};

// import { remote as local } from FROM
export const handleBImportNode = (
  uname: string,
  mutableFlowData: PTAFlowData,
  i: IS_BImport,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
) => {
  const stackID = getStackQualifiedName(i.local.lookupName(), currBB);
  const stackNode = GLOBAL_NODE_MAP.has(stackID)
    ? GLOBAL_NODE_MAP.get(stackID)
    : new StackNode(stackID, uname);
  assert(stackNode instanceof StackNode);
  addPTANode(mutableFlowData, stackNode);

  const heapID = getHeapQualifiedName("IMPORT", currBBIDx, stackInstOffset);
  const remoteNode = GLOBAL_NODE_MAP.has(heapID)
    ? GLOBAL_NODE_MAP.get(heapID)
    : new RemoteNode(heapID, i.FROM.value, uname);

  assert(remoteNode instanceof RemoteNode);
  addPTANode(mutableFlowData, remoteNode);

  if (GLOBAL_RESOLUTION_MAP.has(heapID)) {
    debugConfig.logger.throwIriError("TODO: Handle resolved nodes");
  } else {
    addSelfLoop(mutableFlowData, remoteNode, true);
    addStackEdges(mutableFlowData, stackNode, [remoteNode]);
  }
};

export const handleSetClosureCall = (
  closure: SetClosureNode,
  objectContext: PTAFlowNode,
  targets: Array<PTAFlowNode> | Set<PTAFlowNode>,
  currBBIDx: string,
  stackInstOffset: number,
): [PTAFlowData, string, StackNode] => {
  let calleeArgs: I_Function_params = closure.meth.params;
  let closureGraph: IRIDIUM_FG = closure.meth.funBody;
  const closureWorld = closure.world;

  const hasMutableWorld = PTA_WORLD_CURRMUTABLE_DATA.has(closureWorld) && PTA_WORLD_CURRMUTABLE_DATA.get(closureWorld).length > 0;

  if (!hasMutableWorld) {
    debugConfig.logger.throwIriError("PTA TODO: calling closure to a immutable world");
  } else {
    const closureWorldData = PTA_WORLD_CURRMUTABLE_DATA.get(closureWorld)[PTA_WORLD_CURRMUTABLE_DATA.get(closureWorld).length - 1];
    const boundaryEnv = unionAllPTAFlowData(closureWorldData);
    // Add arguments node
    const argsID = getHeapQualifiedName(
      "argumentsObj",
      currBBIDx,
      stackInstOffset,
    );

    const argumentsNode = GLOBAL_NODE_MAP.has(argsID)
      ? GLOBAL_NODE_MAP.get(argsID)
      : new OrdinaryArrayNode(argsID, closureWorld);
    assert(argumentsNode instanceof OrdinaryArrayNode);
    addPTANode(boundaryEnv, argumentsNode);

    const pendingClosures = addHeapEdges(boundaryEnv, argumentsNode, "0", targets, true);

    if (pendingClosures.length > 0)
      debugConfig.logger.throwIriError("Unexpected pending closures when making SetClosure Call")

    if (calleeArgs.length !== 1)
      debugConfig.logger.throwIriError("Expected set closures to have exactly one argument")

    const C_THIS_ID = getStackQualifiedName(IV_CTHIS.lookupName(), closureGraph.rootBB);
    const stackNode = GLOBAL_NODE_MAP.has(C_THIS_ID)
      ? GLOBAL_NODE_MAP.get(C_THIS_ID)
      : new StackNode(C_THIS_ID, closureWorld);
    assert(stackNode instanceof StackNode);
    addPTANode(boundaryEnv, stackNode);
    addStackEdges(boundaryEnv, stackNode, [objectContext]);
    // PTA Eval with curbed env as eval context
    handleClosureCall(argumentsNode, 1, calleeArgs, closureWorld, closureGraph, boundaryEnv);
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

}

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
      closureWorld,
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
        : new StackNode(C_THIS_ID, closureWorld);
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
  remoteWorld: string,
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
    : new OrdinaryArrayNode(argsID, remoteWorld);
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

      handleFieldAssignmentStatement(boundaryEnv, [argumentsNode], ["" + i], pointees, true, currBB, currBBIDx, stackInstOffset);

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
    remoteWorld,
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
        : new StackNode(argStackQualifiedName, world);
      assert(argStackNode instanceof StackNode);
      addPTANode(boundaryEnv, argStackNode);

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
        : new OrdinaryArrayNode(spillHolderID, world);

      assert(spillHolderObj instanceof OrdinaryArrayNode);
      addPTANode(boundaryEnv, argumentsNode);

      const argStackID = getStackQualifiedName(
        currArg.arg.lookupName(),
        rootBB,
      );
      const argStackNode = GLOBAL_NODE_MAP.has(argStackID)
        ? GLOBAL_NODE_MAP.get(argStackID)
        : new StackNode(argStackID, world);
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

        handleFieldAssignmentStatement(boundaryEnv, [spillHolderObj], ["" + counter], pointees, true, closureFG.rootBB, "" + closureFG.rootBB.idx, 0);

        counter++;
      }

      if (hasFieldPTANode(boundaryEnv, argumentsNode, "*")) {
        const [pointees, closures] = getFieldPointees(boundaryEnv, argumentsNode, "*");
        if (closures.length > 0)
          debugConfig.logger.error("Unexpected closure in arguments object: handleClosureCall function");

        handleFieldAssignmentStatement(boundaryEnv, [spillHolderObj], ["*"], pointees, true, closureFG.rootBB, "" + closureFG.rootBB.idx, 0);
      }
    }
  }

  const resultEnv = PTA(world, closureFG, boundaryEnv);
  unionAllMutablePTAFlowData(boundaryEnv, resultEnv);
  PTA_HASH_MAP.set(boundaryHash, resultEnv);

}

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
