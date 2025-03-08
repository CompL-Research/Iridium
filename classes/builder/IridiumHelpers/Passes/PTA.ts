import { IRIDIUM_FG } from "../I_GENERAL/IRIDIUM_FG.ts";
import {
  addHeapEdges,
  addPTANode,
  addSelfLoop,
  addStackEdges,
  arePTAFlowDataEqual,
  ensureNodeIDAndGetPTANode,
  ensureNodeIDAndGetStackNode,
  getAllFields,
  getPointees,
  GLOBAL_NODE_MAP,
  IRIDUM_GLOBAL,
  NewPTAFlowData,
  OrdinaryObjectNode,
  printPTAFlowData,
  PTAEdge,
  PTAFlowData,
  StackNode,
  unionAllPTAFlowData,
} from "./PTA_STUFF/PTAFlowData.ts";
import debugConfig from "#debugConfig";
import GLIB from "#graphlib";
import { popSet, saveFlowDataToFile, saveFlowDataToGraph } from "#utils";
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
import {
  IS_AExport,
  IS_BExport,
  IS_BImport,
  IS_CExport,
  IS_DExport,
  IS_EExport,
} from "../ALL_IS/IS_Imports_Exports.ts";
import { IS_ClassStaticPropInit } from "../ALL_IS/IS_ClassStaticPropInit.ts";
import {
  IS1_DeclarationStmt,
  IS1_AssignmentStmt,
} from "../ALL_IS/IS_VarDecl.ts";
import { getHeapQualifiedName, getStackQualifiedName } from "./PTA_STUFF/util.ts";
import {
  handleSimpleAssignmentStatement,
  handleBImportNode,
  handleFieldAssignmentStatement,
  handleFieldReference,
} from "./PTA_STUFF/PTAHandlers.ts";
import { handleRVals } from "./PTA_STUFF/RValHandlers.ts";
import { IV_Identifier, IV_PrivateName } from "../ALL_AMP/ALL_AMP.ts";
import assert from "node:assert";
import { isJS3AssnObjectProperty, isJS3ObjectPattern, isJS3PrivateName, JS3PrivateName } from "classes/builder/JS3Helpers/JS3Types.ts";
import { IV_NumericLiteral } from "../ALL_RVal/IV_Literals.ts";
//
// A world can be in three states:
//  1. !PTA_WORLD.has()            ===> Not Seen Before
//  2. !PTA_WORLD.has() && isNull  ===> Under Process
//  3. !PTA_WORLD.has() && !isNull ===> Processed
//
export const PTA_WORLD: Map<string, PTAFlowData> = new Map();
export const PTA_WORLD_FG: Map<string, IRIDIUM_FG> = new Map();
export const PTA_WORLD_CURRMUTABLE_DATA: Map<string, Array<PTAFlowData>> = new Map();
export const PTA_HASH_MAP: Map<string, PTAFlowData> = new Map();

export const getEXPORTID = (uname: string) => { return `${uname}_EXPORT`; }

export const initializeWorld = (uname: string, fg: IRIDIUM_FG) => {
  PTA_WORLD.set(uname, null);
  PTA_WORLD_FG.set(uname, fg);
  const initialWorldData: PTAFlowData = NewPTAFlowData();
  const globalEnv = fg.rootBB.env.parent;

  for (const binding of globalEnv.bindings) {
    const globalNode = GLOBAL_NODE_MAP.has(binding[0])
      ? GLOBAL_NODE_MAP.get(binding[0])
      : new IRIDUM_GLOBAL(binding[0], uname);
    assert(globalNode instanceof IRIDUM_GLOBAL);
  
    addPTANode(initialWorldData, globalNode);
    initialWorldData.get(globalNode.id).add(PTAEdge.constructHeapEdge(globalNode.id, "*", "E", globalNode.id).getPTAEdge());

    const refToBinding = getStackQualifiedName(binding[0], fg.rootBB);
    const stackNode = GLOBAL_NODE_MAP.has(refToBinding)
      ? GLOBAL_NODE_MAP.get(refToBinding)
      : new StackNode(refToBinding, uname);
    assert(stackNode instanceof StackNode);
    addPTANode(initialWorldData, stackNode);

    addStackEdges(initialWorldData, stackNode, [globalNode]);
  }

  const exportID = getEXPORTID(uname);

  const exportNode = GLOBAL_NODE_MAP.has(exportID)
    ? GLOBAL_NODE_MAP.get(exportID)
    : new OrdinaryObjectNode(exportID, uname);
  assert(exportNode instanceof OrdinaryObjectNode);

  addPTANode(initialWorldData, exportNode);

  PTA_WORLD.set(uname, PTA(uname, fg, initialWorldData));
};

type BBIdx = string;
export const PTA = (
  uname: string,
  rootFG: IRIDIUM_FG,
  BOUNDARY_PTAGRAPH: PTAFlowData,
) => {
  if (!PTA_WORLD_CURRMUTABLE_DATA.has(uname)) PTA_WORLD_CURRMUTABLE_DATA.set(uname, []);
  // Assert that there is only one source in the flowgraph
  if (rootFG.sources().length !== 1)
    debugConfig.logger.throwIriError(
      "Expected exactly one root inside a flowgraph",
    );

  // Initialize flowMap and worklist
  const worklist: Set<BBIdx> = new Set();
  const flowMap: Map<BBIdx, PTAFlowData> = new Map();
  rootFG
    .nodes()
    .forEach((bbIdx: BBIdx) => flowMap.set(bbIdx, NewPTAFlowData()));

  // Do one pass in DTree order, this will ensure all defs dominate uses...
  const dTree = GLIB.alg.dominatorTarjan(rootFG, "" + rootFG.rootBB.idx, false);

  const visited = new Set();
  const dfsOrder: Array<string> = [];
  // DFS function
  const visitDFS = (node) => {
    visited.add(node); // Mark node as visited
    dfsOrder.push(node);

    // Visit successors in DFS
    const successors = dTree.successors(node);
    if (successors) {
      for (const succ of successors) {
        if (visited.has(succ)) continue; // Skip already visited nodes
        visitDFS(succ); // Recursive DFS call
      }
    }
  };

  visitDFS("" + rootFG.rootBB.idx);

  const doWorklist = (currBBIDx: string) => {
    // Incoming Set
    let nextGraph: PTAFlowData;
    const preds = rootFG.predecessors(currBBIDx);
    if (preds && preds.length > 0) {
      nextGraph = unionAllPTAFlowData(
        ...preds.map((bbIdx: BBIdx) => flowMap.get(bbIdx)),
      );
    } else {
      nextGraph = unionAllPTAFlowData(...[BOUNDARY_PTAGRAPH]);
    }

    PTA_WORLD_CURRMUTABLE_DATA.get(uname).push(nextGraph);
    flowFunction(uname, rootFG, nextGraph, currBBIDx);
    PTA_WORLD_CURRMUTABLE_DATA.get(uname).pop();

    // Add successors to worklist if there was a change
    if (!flowMap.has(currBBIDx))
      throw new Error("Expected flowmap to have a graph for each node");
    const oldGraph = flowMap.get(currBBIDx);
    if (!arePTAFlowDataEqual(nextGraph, oldGraph)) {
      flowMap.set(currBBIDx, nextGraph);
      const succ = rootFG.successors(currBBIDx);
      if (succ) succ.forEach((bbIdx: BBIdx) => worklist.add(bbIdx));
    }
  };

  for (const currBBIDx of dfsOrder) {
    doWorklist(currBBIDx);
  }

  // Start working on the worklist
  while (worklist.size > 0) {
    doWorklist(popSet(worklist));
  }

  // Send back the sink, we need it to merge closures!!!!
  const sinks = rootFG.sinks();
  if (sinks.length !== 1)
    debugConfig.logger.throwIriError("Expected exactly one sink in PTA!!");
  const sinkPTA = flowMap.get(sinks[0]);
  return sinkPTA;
};

export const getKeyString = (
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

// Flow Functions operates on a mutable data structure,
// this is done to allow batch to the otherwise immutable dataflow data.
export const flowFunction = (
  uname: string,
  rootFG: IRIDIUM_FG,
  mutableFlowData: PTAFlowData,
  currBBIDx: string,
) => {
  const currBB = rootFG.getBBNode(currBBIDx);
  let stackInstOffset = 0;
  for (const i of currBB.statements) {
    // debugConfig.logger.error(`At stmt ${i.toString()}`);

    if (i instanceof IS_BImport) {
      handleBImportNode(uname, mutableFlowData, i, currBB, currBBIDx, stackInstOffset);
    } else if (i instanceof IS_ClassStaticPropInit) {
      debugConfig.logger.throwIriError("PTA TODO: IS_ClassStaticPropInit");
      // // obj[prop] = rval
      // // obj.prop = rval
      // let rValID = getStackQualifiedName(i.RVal.lookupName(), currBB)
      // nextGraph.ensureNode(rValID)

      // let rValPointees = nextGraph.getPointees(rValID)

      // // handleMemberAssignment(nextGraph, i.obj.lookupName(), rValPointees, i.prop.lookupName(), i.computed);
    } else if (i instanceof IS1_DeclarationStmt) {
      const qualifiedLVal = getStackQualifiedName(i.LVal.lookupName(), currBB);
      handleSimpleAssignmentStatement(
        uname,
        mutableFlowData,
        qualifiedLVal,
        handleRVals(
          uname,
          mutableFlowData,
          i.RVal,
          currBB,
          currBBIDx,
          stackInstOffset,
        ),
      );
    } else if (i instanceof IS1_AssignmentStmt) {
      const RValPointees = handleRVals(
        uname,
        mutableFlowData,
        i.RVal,
        currBB,
        currBBIDx,
        stackInstOffset,
      );
      if (i.LVal instanceof IV_Identifier) {
        const lookupName = i.LVal.lookupName();
        const qualifiedLVal = getStackQualifiedName(lookupName, currBB);
        handleSimpleAssignmentStatement(
          uname,
          mutableFlowData,
          qualifiedLVal,
          RValPointees,
        );
      }
      else if (isJS3ObjectPattern(i.LVal)) {
        const toSkip: Set<string> = new Set();
        for (const p of i.LVal.properties) {
          if (isJS3AssnObjectProperty(p)) {
            // Field to lookup
            const field: string = getKeyString(p.key);
            toSkip.add(field);
            
            // Stack binding to create
            const bindingID = getStackQualifiedName(p.value.name, currBB);
            const bindingNode = GLOBAL_NODE_MAP.has(bindingID)
              ? GLOBAL_NODE_MAP.get(bindingID)
              : new StackNode(bindingID, uname);
            assert(bindingNode instanceof StackNode);

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
            assert(bindingNode instanceof StackNode);
            addPTANode(mutableFlowData, bindingNode);
            
            // Temporary Result Holder
            const destObjID = getHeapQualifiedName("DestRestObj", currBBIDx, stackInstOffset);
            const destObjNode = GLOBAL_NODE_MAP.has(destObjID)
              ? GLOBAL_NODE_MAP.get(destObjID)
              : new OrdinaryObjectNode(destObjID, uname);
            assert(destObjNode instanceof OrdinaryObjectNode);
            addPTANode(mutableFlowData, destObjNode);

            for (const field of fieldsToProcess) {
              const vs = handleFieldReference(uname, mutableFlowData, RValPointees, [field], currBB, currBBIDx, stackInstOffset);
              handleFieldAssignmentStatement(mutableFlowData, [destObjNode], [field], vs, true, currBB, currBBIDx, stackInstOffset)
            }

            handleSimpleAssignmentStatement(uname, mutableFlowData, bindingID, [destObjNode])            
          }
        }
      } else {
        debugConfig.logger.throwIriError("PTA TODO: Destructuring Assignment");
      } 
      // 
      // else {
      //   const objDestLVal = i.LVal;
      //   const RValPointees = handleRVals(
      //     nextGraph,
      //     i.RVal,
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
      // }
    } else if (i instanceof IS_AExport) {
      debugConfig.logger.throwIriError("PTA TODO: IS_AExport");
      // // export default ID
      // const heapNode = nextGraph.getPTANode("EXPORT");
      // const pointees = nextGraph.getPointees(
      //   getStackQualifiedName(i.id.lookupName(), currBB),
      // );
      // nextGraph.drawHeapToHeapEdge([heapNode], pointees, ["default"], true);
    } else if (i instanceof IS_BExport) {
      // debugConfig.logger.throwIriError("PTA TODO: IS_BExport");
      // Export local as remote
      const localID = getStackQualifiedName(i.local.lookupName(), currBB);
      const localNode = ensureNodeIDAndGetStackNode(mutableFlowData, localID);
      const pointees = getPointees(mutableFlowData, localNode);

      const exportNode = ensureNodeIDAndGetPTANode(mutableFlowData, getEXPORTID(uname));

      let field: string;
      if (i.remote instanceof IV_Identifier) field = i.remote.lookupName();
      else field = i.remote.value;

      addHeapEdges(mutableFlowData, exportNode, field, pointees, true);
    } else if (i instanceof IS_CExport) {
      debugConfig.logger.throwIriError("PTA TODO: IS_CExport");
      // handleCExportNode(nextGraph, i, currBB, currBBIDx, stackInstOffset);
    } else if (i instanceof IS_DExport) {
      debugConfig.logger.throwIriError("PTA TODO: IS_DExport");
      // debugConfig.logger.throwIriError("PTA: IS_DExport not yet supported");
    } else if (i instanceof IS_EExport) {
      debugConfig.logger.throwIriError("PTA TODO: IS_EExport");
      // handleEExportNode(nextGraph, i, currBB, currBBIDx, stackInstOffset);
    } else {
      debugConfig.logger.throwIriError("PTA TODO: UNHANDLED");
    }
    // debugConfig.logger.error(`After stmt ${i.toString()}`);
    // saveFlowDataToFile(`${currBBIDx}_${stackInstOffset}`, mutableFlowData)
    // printPTAFlowData(mutableFlowData);
    stackInstOffset++;
  }
};
