import debugConfig from "#debugConfig";
import { assertMessage, hashGraph, saveFlowDataToFile, saveFlowDataToGraph } from "#utils";
import assert from "node:assert";
import { IV_Identifier, IV_PrivateName } from "../../ALL_AMP/ALL_AMP.ts";
import { IS_AExport, IS_AImport, IS_BExport, IS_BImport, IS_CExport, IS_CImport, IS_DExport, IS_EExport } from "../../ALL_IS/IS_Imports_Exports.ts";
import { ISP_ArgSpread, ISP_ObjectMethod } from "../../ALL_RVal/ALL_ISP.ts";
import { IV_CTHIS } from "../../ALL_RVal/IV_NonLang.ts";
import { BB, FunctionReturn } from "../../BB.ts";
import { IRIDIUM_FG } from "../../I_GENERAL/IRIDIUM_FG.ts";
import { I_Function_params } from "../../I_GENERAL/I_Function.ts";
import { getEXPORTID, PTA, PTA_HASH_MAP, PTA_WORLD, PTA_WORLD_CURRMUTABLE_DATA } from "../PTA.ts";
import {
  GLOBAL_NODE_MAP,
  GLOBAL_RESOLUTION_MAP,
  GetClosureNode,
  OrdinaryArrayNode,
  OrdinaryFunctionNode,
  OrdinaryObjectNode,
  PTAEdge,
  PTAFlowData,
  PTAFlowNode,
  RemoteNode,
  ResolvedRemoteNode,
  SetClosureNode,
  StackNode,
  UnknownNode,
  addHeapEdges,
  addPTANode,
  addSelfLoop,
  addStackEdges,
  addStackPTANode,
  assertFieldPTANode,
  ensureAndGetMutableWorldInstance,
  ensureMutableWorldInstance,
  ensureNodeIDAndGetPTANode,
  ensureNodeIDAndGetStackNode,
  getAllFields,
  getFieldPointees,
  getMutableWorldInstance,
  getPointees,
  hasFieldPTANode,
  unionAllMutablePTAFlowData,
  unionAllPTAFlowData
} from "./PTAFlowData.ts";
import { dissernProps, handleRVals } from "./RValHandlers.ts";
import { getHeapQualifiedName, getStackQualifiedName } from "./util.ts";
import { isJS3AssnObjectProperty, isJS3PrivateName, JS3ArrayPattern_elements, JS3ObjectPattern_properties, JS3PrivateName } from "classes/builder/JS3Helpers/JS3Types.ts";
import {
  BigIntLiteral,
  DecimalLiteral,
  Identifier,
  isBigIntLiteral,
  isDecimalLiteral,
  isIdentifier,
  isNumericLiteral,
  isStringLiteral,
  NumericLiteral,
  StringLiteral
} from "@babel/types";
import { IV_NumericLiteral } from "../../ALL_RVal/IV_Literals.ts";
import { IV_ArrowFunctionExpression } from "../../ALL_RVal/IV_ArrowFunctionExpression.ts";

// const assert = (val) => {
//   if (!val) {
//     console.log("Assertion Failed");
//   } 
// }

// a[f]
export const handleFieldReference = (
  uname: string,
  mutableFlowData: PTAFlowData,
  receiverPointees: Set<PTAFlowNode> | Array<PTAFlowNode>,
  dissernedProps: Set<string> | Array<string>,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
  toSkip: Set<string> = new Set()
) => {
  const res: Set<PTAFlowNode> = new Set();
  for (const u of receiverPointees) {
    for (const p of dissernedProps) {
      if (toSkip.has(p)) continue;
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
    const hasMutableWorld = PTA_WORLD_CURRMUTABLE_DATA.has(closureWorld) && PTA_WORLD_CURRMUTABLE_DATA.get(closureWorld).length > 0;

    if (!hasMutableWorld) {
      debugConfig.logger.throwIriError("TODO: // Update a world with no instance");
    } else {
      const hasMutableWorld = PTA_WORLD_CURRMUTABLE_DATA.has(closureWorld) && PTA_WORLD_CURRMUTABLE_DATA.get(closureWorld).length > 0;

      // World already has an instance
      if (!hasMutableWorld) debugConfig.logger.throwIriError("An open world must have a mutable data active");

      const mutableWorldData = PTA_WORLD_CURRMUTABLE_DATA.get(closureWorld)[PTA_WORLD_CURRMUTABLE_DATA.get(closureWorld).length - 1];

      unionAllMutablePTAFlowData(mutableWorldData, closureResult);
    }
  }
}

const getKeyString = (
  k:
    | Identifier
    | StringLiteral
    | NumericLiteral
    | BigIntLiteral
    | DecimalLiteral
    | JS3PrivateName,
) => {
  if (isIdentifier(k)) {
    return k.name;
  } else if (isStringLiteral(k)) {
    return k.value;
  } else if (isNumericLiteral(k)) {
    const iriNumericLiteral = new IV_NumericLiteral(k, k.value);
    return iriNumericLiteral.lookupName();
  } else if (isBigIntLiteral(k)) {
    return k.value;
  } else if (isDecimalLiteral(k)) {
    return k.value;
  } else if (isJS3PrivateName(k)) {
    const iriPrivate = new IV_PrivateName(k, IV_Identifier.from(k.id));
    return iriPrivate.lookupName();
  }
};

// { a: t1, b: t2, ...t3 } = [POINTEES]
export const handleObjectDestructuringAssignmentStatement = (
  uname: string,
  mutableFlowData: PTAFlowData,
  properties: JS3ObjectPattern_properties,
  RValPointees: Array<PTAFlowNode> | Set<PTAFlowNode>,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
) => {
  const toSkip: Set<string> = new Set();
  for (const p of properties) {
    if (isJS3AssnObjectProperty(p)) {
      // Field to lookup
      const field: string = getKeyString(p.key);
      toSkip.add(field);

      // Stack binding to create
      const bindingID = getStackQualifiedName(p.value.name, currBB);
      const bindingNode = GLOBAL_NODE_MAP.has(bindingID)
        ? GLOBAL_NODE_MAP.get(bindingID)
        : new StackNode(bindingID, uname);
      assert(bindingNode instanceof StackNode, assertMessage(import.meta.url, `💔 "${bindingNode}" !instanceof StackNode`));

      // Propagate Edges
      const vs = handleFieldReference(uname, mutableFlowData, RValPointees, [field], currBB, currBBIDx, stackInstOffset);
      handleSimpleAssignmentStatement(uname, mutableFlowData, bindingID, vs)
    } else {
      toSkip.delete("*");

      const fieldsToProcess: Set<string> = new Set();

      for (const p of RValPointees) {
        getAllFields(mutableFlowData, p).forEach((f) => fieldsToProcess.add(f));
      }

      for (const s of toSkip) fieldsToProcess.delete(s);

      // Stack binding to create
      const bindingID = getStackQualifiedName(p.argument.name, currBB);
      const bindingNode = GLOBAL_NODE_MAP.has(bindingID)
        ? GLOBAL_NODE_MAP.get(bindingID)
        : new StackNode(bindingID, uname);
      assert(bindingNode instanceof StackNode, assertMessage(import.meta.url, `💔 "${bindingNode}" !instanceof StackNode`));
      addPTANode(mutableFlowData, bindingNode);

      // Temporary Result Holder
      const destObjID = getHeapQualifiedName("DestRestObj", currBBIDx, stackInstOffset);
      const destObjNode = GLOBAL_NODE_MAP.has(destObjID)
        ? GLOBAL_NODE_MAP.get(destObjID)
        : new OrdinaryObjectNode(destObjID, uname);
      assert(destObjNode instanceof OrdinaryObjectNode, assertMessage(import.meta.url, `💔 "${destObjNode}" !instanceof OrdinaryObjectNode`));
      addPTANode(mutableFlowData, destObjNode);

      for (const field of fieldsToProcess) {
        const vs = handleFieldReference(uname, mutableFlowData, RValPointees, [field], currBB, currBBIDx, stackInstOffset);
        handleFieldAssignmentStatement(mutableFlowData, [destObjNode], [field], vs, true, currBB, currBBIDx, stackInstOffset)
      }

      handleSimpleAssignmentStatement(uname, mutableFlowData, bindingID, [destObjNode])
    }
  }
};

// [a, b, ...c] = [POINTEES]
export const handleArrayDestructuringAssignmentStatement = (
  uname: string,
  mutableFlowData: PTAFlowData,
  properties: JS3ArrayPattern_elements,
  RValPointees: Array<PTAFlowNode> | Set<PTAFlowNode>,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
) => {
  const toSkip: Set<string> = new Set();
  let count = 0;
  for (const p of properties) {
    if (isIdentifier(p)) {
      // Field to lookup
      const field: string = "" + count;
      toSkip.add(field);

      // Stack binding to create
      const bindingID = getStackQualifiedName(p.name, currBB);
      const bindingNode = GLOBAL_NODE_MAP.has(bindingID)
        ? GLOBAL_NODE_MAP.get(bindingID)
        : new StackNode(bindingID, uname);
      assert(bindingNode instanceof StackNode, assertMessage(import.meta.url, `💔 "${bindingNode}" !instanceof StackNode`));

      // Propagate Edges
      const vs = handleFieldReference(uname, mutableFlowData, RValPointees, [field], currBB, currBBIDx, stackInstOffset);
      handleSimpleAssignmentStatement(uname, mutableFlowData, bindingID, vs)
    } else {
      toSkip.delete("*");

      const fieldsToProcess: Set<string> = new Set();

      for (const p of RValPointees) {
        getAllFields(mutableFlowData, p).forEach((f) => fieldsToProcess.add(f));
      }

      for (const s of toSkip) fieldsToProcess.delete(s);

      // Stack binding to create
      const bindingID = getStackQualifiedName(p.argument.name, currBB);
      const bindingNode = GLOBAL_NODE_MAP.has(bindingID)
        ? GLOBAL_NODE_MAP.get(bindingID)
        : new StackNode(bindingID, uname);
      assert(bindingNode instanceof StackNode, assertMessage(import.meta.url, `💔 "${bindingNode}" !instanceof StackNode`));
      addPTANode(mutableFlowData, bindingNode);

      // Temporary Result Holder
      const destObjID = getHeapQualifiedName("DestRestObj", currBBIDx, stackInstOffset);
      const destObjNode = GLOBAL_NODE_MAP.has(destObjID)
        ? GLOBAL_NODE_MAP.get(destObjID)
        : new OrdinaryArrayNode(destObjID, uname);
      assert(destObjNode instanceof OrdinaryArrayNode, assertMessage(import.meta.url, `💔 "${destObjNode}" !instanceof OrdinaryArrayNode`));
      addPTANode(mutableFlowData, destObjNode);

      for (const field of fieldsToProcess) {
        const vs = handleFieldReference(uname, mutableFlowData, RValPointees, [field], currBB, currBBIDx, stackInstOffset);
        handleFieldAssignmentStatement(mutableFlowData, [destObjNode], ["*"], vs, true, currBB, currBBIDx, stackInstOffset)
      }

      handleSimpleAssignmentStatement(uname, mutableFlowData, bindingID, [destObjNode])
    }
    count++;
  }
};

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
  assert(u instanceof StackNode, assertMessage(import.meta.url, `💔 "${u}" !instanceof StackNode`));
  addStackPTANode(mutableFlowData, u);
  addStackEdges(mutableFlowData, u, vs);
};

// 
// IMPORTS
// 



// IS_BImport
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
  assert(stackNode instanceof StackNode, assertMessage(import.meta.url, `💔 "${stackNode}" !instanceof StackNode`));
  addPTANode(mutableFlowData, stackNode);

  let field: string;
  if (i.remote instanceof IV_Identifier) field = i.remote.name;
  else field = i.remote.value;

  handleFieldImportToStackNode(i, uname, mutableFlowData, stackNode, field, i.FROM.value, currBB, currBBIDx, stackInstOffset);
};

// IS_CImport
// import * as local from FROM
export const handleCImportNode = (
  uname: string,
  mutableFlowData: PTAFlowData,
  i: IS_CImport,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
) => {
  const stackID = getStackQualifiedName(i.local.lookupName(), currBB);
  const stackNode = GLOBAL_NODE_MAP.has(stackID)
    ? GLOBAL_NODE_MAP.get(stackID)
    : new StackNode(stackID, uname);
  assert(stackNode instanceof StackNode, assertMessage(import.meta.url, `💔 "${stackNode}" !instanceof StackNode`));
  addPTANode(mutableFlowData, stackNode);

  handleImportToStackNode(i, uname, mutableFlowData, stackNode, i.FROM.value, currBBIDx, stackInstOffset);
};

const handleFieldImportToStackNode = (
  node: IS_AImport | IS_BImport | IS_CImport | IS_CExport | IS_DExport | IS_EExport,
  uname: string,
  mutableFlowData: PTAFlowData,
  stackNode: StackNode,
  field: string,
  FROM: string,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
) => {
  const heapID = getHeapQualifiedName("IMPORT", currBBIDx, stackInstOffset);
  
  if (GLOBAL_RESOLUTION_MAP.has(heapID)) {
    const resolvedUname = GLOBAL_RESOLUTION_MAP.get(heapID);
    getMutableWorldInstance(resolvedUname);
    const worldData = PTA_WORLD_CURRMUTABLE_DATA.get(resolvedUname)[0];
    const exportedNode = ensureNodeIDAndGetPTANode(worldData, getEXPORTID(resolvedUname));

    const pointees: Set<PTAFlowNode> = new Set()

    for (const e of worldData.get(exportedNode.id)) {
      const edge = PTAEdge.from(exportedNode.id, e);
      if (edge.field === field || edge.field === "*") {
        const v = ensureNodeIDAndGetPTANode(worldData, edge.v);
        addPTANode(mutableFlowData, v);
        pointees.add(v);
      }
    }
    if (pointees.size === 0) {
      const importID = getHeapQualifiedName(`FAILED_IMPORT_${field}_${resolvedUname}`, currBBIDx, stackInstOffset);
      const resObj = new UnknownNode(importID, uname);
      addPTANode(mutableFlowData, resObj);
      addSelfLoop(mutableFlowData, resObj, true);
      pointees.add(resObj);
    }

    const resolvedID = getHeapQualifiedName("RESOLVED", currBBIDx, stackInstOffset);
    const resolvedRemoteNode = GLOBAL_NODE_MAP.has(resolvedID)
      ? GLOBAL_NODE_MAP.get(resolvedID)
      : new ResolvedRemoteNode(resolvedID, FROM, field, uname);
    assert(resolvedRemoteNode instanceof ResolvedRemoteNode, assertMessage(import.meta.url, `💔 "${resolvedRemoteNode}" !instanceof ResolvedRemoteNode`));
    addPTANode(mutableFlowData, resolvedRemoteNode);

    pointees.forEach((p) => mutableFlowData.get(resolvedID).add(PTAEdge.constructHeapEdge(resolvedID, field, "E", p.id).getPTAEdge()));
    
    addStackEdges(mutableFlowData, stackNode, pointees);
  } else {
    const remoteNode = GLOBAL_NODE_MAP.has(heapID)
      ? GLOBAL_NODE_MAP.get(heapID)
      : new RemoteNode(heapID, FROM, uname, node);

    assert(remoteNode instanceof RemoteNode, assertMessage(import.meta.url, `💔 "${remoteNode}" !instanceof RemoteNode`));
    addPTANode(mutableFlowData, remoteNode);
    addSelfLoop(mutableFlowData, remoteNode, true);
    addStackEdges(mutableFlowData, stackNode, [remoteNode]);
  }
}

const handleImportToStackNode = (
  node: IS_AImport | IS_BImport | IS_CImport | IS_CExport | IS_DExport | IS_EExport,
  uname: string,
  mutableFlowData: PTAFlowData,
  stackNode: StackNode,
  FROM: string,
  currBBIDx: string,
  stackInstOffset: number,
) => {

  const heapID = getHeapQualifiedName("IMPORT", currBBIDx, stackInstOffset);

  if (GLOBAL_RESOLUTION_MAP.has(heapID)) {
    const resolvedUname = GLOBAL_RESOLUTION_MAP.get(heapID);
    getMutableWorldInstance(resolvedUname);
    const worldData = PTA_WORLD_CURRMUTABLE_DATA.get(resolvedUname)[0];
    const exportedNode = ensureNodeIDAndGetPTANode(worldData, getEXPORTID(resolvedUname));

    const resolvedID = getHeapQualifiedName("RESOLVED", currBBIDx, stackInstOffset);
    const resolvedRemoteNode = GLOBAL_NODE_MAP.has(resolvedID)
      ? GLOBAL_NODE_MAP.get(resolvedID)
      : new ResolvedRemoteNode(resolvedID, FROM, "default", uname);
    assert(resolvedRemoteNode instanceof ResolvedRemoteNode, assertMessage(import.meta.url, `💔 "${resolvedRemoteNode}" !instanceof ResolvedRemoteNode`));
    addPTANode(mutableFlowData, resolvedRemoteNode);

    mutableFlowData.get(resolvedID).add(PTAEdge.constructHeapEdge(resolvedID, "default", "E", exportedNode.id).getPTAEdge())
    

    addPTANode(mutableFlowData, exportedNode);
    addStackEdges(mutableFlowData, stackNode, [exportedNode]);
  } else {
    const remoteNode = GLOBAL_NODE_MAP.has(heapID)
      ? GLOBAL_NODE_MAP.get(heapID)
      : new RemoteNode(heapID, FROM, uname, node);

    assert(remoteNode instanceof RemoteNode, assertMessage(import.meta.url, `💔 "${remoteNode}" !instanceof RemoteNode`));
    addPTANode(mutableFlowData, remoteNode);
    addSelfLoop(mutableFlowData, remoteNode, true);
    addStackEdges(mutableFlowData, stackNode, [remoteNode]);
  }
}

// 
// EXPORTS
// 

// IS_AExport
// export default ID
export const handleAExportNode = (
  uname: string,
  mutableFlowData: PTAFlowData,
  i: IS_AExport,
  currBB: BB,
) => {
  const localID = getStackQualifiedName(i.id.lookupName(), currBB);
  const localNode = ensureNodeIDAndGetStackNode(mutableFlowData, localID);
  const pointees = getPointees(mutableFlowData, localNode);
  const exportNode = ensureNodeIDAndGetPTANode(mutableFlowData, getEXPORTID(uname));
  let field: string = "default";
  addHeapEdges(mutableFlowData, exportNode, field, pointees, true);
};

// IS_BExport
// export local as remote
export const handleBExportNode = (
  uname: string,
  mutableFlowData: PTAFlowData,
  i: IS_BExport,
  currBB: BB,
) => {
  const localID = getStackQualifiedName(i.local.lookupName(), currBB);
  const localNode = ensureNodeIDAndGetStackNode(mutableFlowData, localID);
  let field: string;
  if (i.remote instanceof IV_Identifier) field = i.remote.lookupName();
  else field = i.remote.value;
  exportLocalAsRemote(uname, mutableFlowData, localNode, field);
};

// IS_CExport
// export { field as boo } from FROM
export const handleCExportNode = (
  uname: string,
  mutableFlowData: PTAFlowData,
  i: IS_CExport,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
) => {
  // import { field as TEMP } from FROM: 
  const stackID = getHeapQualifiedName("TEMP_C_EXPORT", currBBIDx, stackInstOffset);
  const stackNode = GLOBAL_NODE_MAP.has(stackID)
    ? GLOBAL_NODE_MAP.get(stackID)
    : new StackNode(stackID, uname);
  assert(stackNode instanceof StackNode, assertMessage(import.meta.url, `💔 "${stackNode}" !instanceof StackNode`));
  addPTANode(mutableFlowData, stackNode);

  const field: string = i.local.name;

  handleFieldImportToStackNode(i, uname, mutableFlowData, stackNode, field, i.FROM.value, currBB, currBBIDx, stackInstOffset);
  
  // export { TEMP as boo }
  const localNode = stackNode
  let exportField: string;
  if (i.remote instanceof IV_Identifier) exportField = i.remote.lookupName();
  else exportField = i.remote.value;
  exportLocalAsRemote(uname, mutableFlowData, localNode, exportField);
};

// IS_EExport
// export * from FROM
export const handleEExportNode = (
  uname: string,
  mutableFlowData: PTAFlowData,
  i: IS_EExport,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
) => {

  // import * as TEMP from FROM
  const tempStackID = getHeapQualifiedName("TEMP_REEXPORT", currBBIDx, stackInstOffset);
  const tempStackNode = GLOBAL_NODE_MAP.has(tempStackID)
    ? GLOBAL_NODE_MAP.get(tempStackID)
    : new StackNode(tempStackID, uname);
  assert(tempStackNode instanceof StackNode, assertMessage(import.meta.url, `💔 "${tempStackNode}" !instanceof StackNode`));
  addPTANode(mutableFlowData, tempStackNode);

  handleImportToStackNode(i, uname, mutableFlowData, tempStackNode, i.FROM.value, currBBIDx, stackInstOffset);

  // FIELDS = ALLFIELDS(TEMP)
  const TEMP_POINTEES = getPointees(mutableFlowData, tempStackNode);
  const fields: Set<string> = new Set();
  for (const t of TEMP_POINTEES) {
    getAllFields(mutableFlowData, t).forEach((f) => fields.add(f));
  }

  const x = saveFlowDataToFile;


  const exportNode = ensureNodeIDAndGetPTANode(mutableFlowData, getEXPORTID(uname));

  if (fields.size === 0) fields.add("*");

  // F of FIELDS: EXPORT[f] = TEMP[f]
  for (const field of fields) {
    const rvals = handleFieldReference(uname, mutableFlowData, TEMP_POINTEES, [field], currBB, currBBIDx, stackInstOffset);
    handleFieldAssignmentStatement(mutableFlowData, [exportNode], [field], rvals, true, currBB, currBBIDx, stackInstOffset);
  }
};


const exportLocalAsRemote = (
  uname: string,
  mutableFlowData: PTAFlowData,
  localNode: StackNode,
  field: string,
) => {
  const pointees = getPointees(mutableFlowData, localNode);
  const exportNode = ensureNodeIDAndGetPTANode(mutableFlowData, getEXPORTID(uname));
  addHeapEdges(mutableFlowData, exportNode, field, pointees, true);
}


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

  let boundaryEnv: PTAFlowData = unionAllPTAFlowData(getMutableWorldInstance(closureWorld));

  PTA_WORLD_CURRMUTABLE_DATA.get(closureWorld).push(boundaryEnv);

  // let boundaryEnv: PTAFlowData = unionAllPTAFlowData(getMutableWorldInstance(closureWorld));

  // Add arguments node
  const argsID = getHeapQualifiedName(
    "argumentsObj",
    currBBIDx,
    stackInstOffset,
  );

  const argumentsNode = GLOBAL_NODE_MAP.has(argsID)
    ? GLOBAL_NODE_MAP.get(argsID)
    : new OrdinaryArrayNode(argsID, closureWorld);
  assert(argumentsNode instanceof OrdinaryArrayNode, assertMessage(import.meta.url, `💔 "${argumentsNode}" !instanceof OrdinaryArrayNode`));
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
  assert(stackNode instanceof StackNode, assertMessage(import.meta.url, `💔 "${stackNode}" !instanceof StackNode`));
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

  PTA_WORLD_CURRMUTABLE_DATA.get(closureWorld).pop();
  return [boundaryEnv, closureWorld, ensureNodeIDAndGetStackNode(boundaryEnv, argLookupName)];
}

export const handleOrdinaryFunctionObjectCall = (
  uname: string,
  mutableFlowData: PTAFlowData,
  c: OrdinaryFunctionNode | GetClosureNode,
  args: Array<IV_Identifier | ISP_ArgSpread> | OrdinaryObjectNode,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
  objectContext: Array<PTAFlowNode> | Set<PTAFlowNode> | undefined,
): [PTAFlowData, string, StackNode] => {
  let calleeArgs: I_Function_params;
  if (c.meth instanceof ISP_ObjectMethod) calleeArgs = c.meth.params;
  else calleeArgs = c.meth.func.params;

  let closureGraph: IRIDIUM_FG;
  if (c.meth instanceof ISP_ObjectMethod) closureGraph = c.meth.funBody;
  else closureGraph = c.meth.func.funBody;

  const closureWorld = c.world;

  let boundaryEnv: PTAFlowData = unionAllPTAFlowData(getMutableWorldInstance(closureWorld));

  PTA_WORLD_CURRMUTABLE_DATA.get(closureWorld).push(boundaryEnv);

  // Add arguments node
  const argumentsNode =
    args instanceof OrdinaryObjectNode ?
      initializeJSXArgumentsObj(
        c.id,
        closureWorld,
        args,
        calleeArgs.length,
        boundaryEnv,
        mutableFlowData,
        currBB,
        currBBIDx,
        stackInstOffset,
      ) :
      initializeArgumentsObj(
        c.id,
        closureWorld,
        args,
        calleeArgs.length,
        boundaryEnv,
        mutableFlowData,
        currBB,
        currBBIDx,
        stackInstOffset,
      );


  
  
  if (!(c.meth instanceof IV_ArrowFunctionExpression)) {
    if (objectContext) {
      const C_THIS_ID = getStackQualifiedName(IV_CTHIS.lookupName(), closureGraph.rootBB);
      const stackNode = GLOBAL_NODE_MAP.has(C_THIS_ID)
        ? GLOBAL_NODE_MAP.get(C_THIS_ID)
        : new StackNode(C_THIS_ID, closureWorld);
      assert(stackNode instanceof StackNode, assertMessage(import.meta.url, `💔 "${stackNode}" !instanceof StackNode`));
      addPTANode(boundaryEnv, stackNode);
      addStackEdges(boundaryEnv, stackNode, objectContext);
    } else {
      const C_THIS_ID = getStackQualifiedName(IV_CTHIS.lookupName(), closureGraph.rootBB);
      const stackNode = GLOBAL_NODE_MAP.has(C_THIS_ID)
        ? GLOBAL_NODE_MAP.get(C_THIS_ID)
        : new StackNode(C_THIS_ID, closureWorld);
      assert(stackNode instanceof StackNode, assertMessage(import.meta.url, `💔 "${stackNode}" !instanceof StackNode`));
      addPTANode(boundaryEnv, stackNode);
      const undefID = new IV_Identifier(undefined, "undefined");
      const undefPointees = handleRVals(
        closureWorld,
        boundaryEnv,
        undefID,
        currBB,
        currBBIDx,
        stackInstOffset,
      );
      if (undefPointees.length === 0) 
        debugConfig.logger.throwIriError("RValPointees can never be zero");

      const undefPointee = undefPointees[0];

      addPTANode(boundaryEnv, undefPointee);
      addStackEdges(boundaryEnv, stackNode, [undefPointee]);
    }
  }
  // PTA Eval with curbed env as eval context
  handleClosureCall(argumentsNode, args instanceof OrdinaryObjectNode ? 1 : args.length, calleeArgs, closureWorld, closureGraph, boundaryEnv);
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

  PTA_WORLD_CURRMUTABLE_DATA.get(closureWorld).pop();
  return [boundaryEnv, closureWorld, ensureNodeIDAndGetStackNode(boundaryEnv, argLookupName)];
};

export const initializeArgumentsObj = (
  calleeContext: string,
  remoteWorld: string,
  callerArgs: Array<IV_Identifier | ISP_ArgSpread>,
  expectedArgsLen: number,
  boundaryEnv: PTAFlowData,
  pointeeEnv: PTAFlowData,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
): OrdinaryArrayNode => {
  const argsID = getHeapQualifiedName(
    "argumentsObj_" + calleeContext,
    currBBIDx,
    stackInstOffset,
  );

  const argumentsNode = GLOBAL_NODE_MAP.has(argsID)
    ? GLOBAL_NODE_MAP.get(argsID)
    : new OrdinaryArrayNode(argsID, remoteWorld);
  assert(argumentsNode instanceof OrdinaryArrayNode, assertMessage(import.meta.url, `💔 "${argumentsNode}" !instanceof OrdinaryArrayNode`));
  addPTANode(boundaryEnv, argumentsNode);

  const suppliedArgs = callerArgs.length;

  for (let i = 0; i < suppliedArgs; i++) {
    const currArg = callerArgs[i];
    if (currArg instanceof IV_Identifier) {
      const ID = getStackQualifiedName(currArg.lookupName(), currBB);
      const stackNode = ensureNodeIDAndGetStackNode(pointeeEnv, ID);
      const pointees = getPointees(pointeeEnv, stackNode);

      if (pointees.size === 0) {
        debugConfig.logger.throwJS3Error("Expected atleast one pointee for each stack node");
      }

      pointees.forEach((p) => addPTANode(boundaryEnv, p));

      // ArgumentsObj --[i]--> pointees

      handleFieldAssignmentStatement(boundaryEnv, [argumentsNode], ["" + i], pointees, true, currBB, currBBIDx, stackInstOffset);

    } else {
      if (i + 1 !== suppliedArgs)
        debugConfig.logger.throwIriError(
          "Expecting Spread operator to be the last supplied argument",
        );

      const ID = getStackQualifiedName(currArg.arg.lookupName(), currBB);
      const stackNode = ensureNodeIDAndGetStackNode(pointeeEnv, ID);
      const pointees = getPointees(pointeeEnv, stackNode);
      pointees.forEach((p) => addPTANode(boundaryEnv, p));
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
  const undefPointees = handleRVals(
    remoteWorld,
    boundaryEnv,
    undefID,
    currBB,
    currBBIDx,
    stackInstOffset,
  );
  if (undefPointees.length === 0) 
    debugConfig.logger.throwIriError("RValPointees can never be zero");
  const undefPointee = undefPointees[0];

  addPTANode(boundaryEnv, undefPointee);

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

export const initializeJSXArgumentsObj = (
  calleeContext: string,
  remoteWorld: string,
  callerArgs: OrdinaryObjectNode,
  expectedArgsLen: number,
  boundaryEnv: PTAFlowData,
  pointeeEnv: PTAFlowData,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
): OrdinaryArrayNode => {
  const argsID = getHeapQualifiedName(
    "argumentsObj_" + calleeContext,
    currBBIDx,
    stackInstOffset,
  );

  const argumentsNode = GLOBAL_NODE_MAP.has(argsID)
    ? GLOBAL_NODE_MAP.get(argsID)
    : new OrdinaryArrayNode(argsID, remoteWorld);
  assert(argumentsNode instanceof OrdinaryArrayNode, assertMessage(import.meta.url, `💔 "${argumentsNode}" !instanceof OrdinaryArrayNode`));
  addPTANode(boundaryEnv, argumentsNode);

  const suppliedArgs = 1;
  handleFieldAssignmentStatement(boundaryEnv, [argumentsNode], ["" + 0], [callerArgs], true, currBB, currBBIDx, stackInstOffset);

  // Do argument matching
  // case 1: supplied args === expected args
  // case 2: supplied args > expected args
  // case 3: supplied args < expected args
  const undefID = new IV_Identifier(undefined, "undefined");
  const undefPointees = handleRVals(
    remoteWorld,
    boundaryEnv,
    undefID,
    currBB,
    currBBIDx,
    stackInstOffset,
  );
  if (undefPointees.length === 0) 
    debugConfig.logger.throwIriError("RValPointees can never be zero");

  const undefPointee = undefPointees[0]
  addPTANode(boundaryEnv, undefPointee);

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
      // debugConfig.logger.success(`Boundary Hash reused: ${boundaryHash}`);
      unionAllMutablePTAFlowData(boundaryEnv, PTA_HASH_MAP.get(boundaryHash));
    } else {
      // debugConfig.logger.warn(`Boundary Null Hash: ${boundaryHash}`);
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
      assert(argStackNode instanceof StackNode, assertMessage(import.meta.url, `💔 "${argStackNode}" !instanceof StackNode`));
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

      assert(spillHolderObj instanceof OrdinaryArrayNode, assertMessage(import.meta.url, `💔 "${spillHolderObj}" !instanceof OrdinaryArrayNode`));
      addPTANode(boundaryEnv, spillHolderObj);

      const argStackID = getStackQualifiedName(
        currArg.arg.lookupName(),
        rootBB,
      );
      const argStackNode = GLOBAL_NODE_MAP.has(argStackID)
        ? GLOBAL_NODE_MAP.get(argStackID)
        : new StackNode(argStackID, world);
      
      assert(argStackNode instanceof StackNode, assertMessage(import.meta.url, `💔 "${argStackNode}" !instanceof StackNode`));
      addPTANode(boundaryEnv, argStackNode);

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
  args: Array<IV_Identifier | ISP_ArgSpread> | OrdinaryObjectNode,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
  objectContext: Array<PTAFlowNode> | Set<PTAFlowNode> | undefined,
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
      // if (args instanceof OrdinaryObjectNode) {
      //   getFieldPointees(mutableFlowData, args, "children", true).forEach((p, _) => p.forEach(pp => res.add(pp)));
      //   // res.add(args);
      // } else {
      //   for (const a of args) {
      //     let ID;
      //     if (a instanceof IV_Identifier) {
      //       ID = getStackQualifiedName(a.lookupName(), currBB);
      //     } else {
      //       ID = getStackQualifiedName(a.arg.lookupName(), currBB);
      //     }
      //     const stackNode = ensureNodeIDAndGetStackNode(mutableFlowData, ID);
      //     const pointees = getPointees(mutableFlowData, stackNode);
      //     pointees.forEach((n) => res.add(n));
      //   }
      // }
      res.add(c);
    }
  }

  for (const [closureResult, closureWorld, returnObj] of closureResults) {
    const hasMutableWorld = PTA_WORLD_CURRMUTABLE_DATA.has(closureWorld) && PTA_WORLD_CURRMUTABLE_DATA.get(closureWorld).length > 0;

    if (!hasMutableWorld) {
      debugConfig.logger.throwIriError("TODO: // Update a world with no instance");
    } else {
      const hasMutableWorld = PTA_WORLD_CURRMUTABLE_DATA.has(closureWorld) && PTA_WORLD_CURRMUTABLE_DATA.get(closureWorld).length > 0;

      // World already has an instance
      if (!hasMutableWorld) debugConfig.logger.throwIriError("An open world must have a mutable data active");

      const mutableWorldData = PTA_WORLD_CURRMUTABLE_DATA.get(closureWorld)[PTA_WORLD_CURRMUTABLE_DATA.get(closureWorld).length - 1];

      const pointees = getPointees(closureResult, returnObj);

      for (const p of pointees) {
        if (p.world !== closureWorld) {
          addPTANode(mutableWorldData, p);
        }
      }

      pointees.forEach((p) => res.add(p))
      unionAllMutablePTAFlowData(mutableWorldData, closureResult);
    }
  }
  res.forEach((p) => {
    addPTANode(mutableFlowData, p);
  })
  return res;
};
