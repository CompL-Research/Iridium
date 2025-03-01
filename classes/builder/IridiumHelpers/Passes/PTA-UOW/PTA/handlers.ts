import debugConfig from "#debugConfig";
import {
  JS3ArrayPattern,
  JS3ObjectPattern,
  isJS3AssnObjectProperty,
} from "classes/builder/JS3Helpers/JS3Types.ts";
import { IV_Identifier } from "../../ALL_AMP/ALL_AMP.ts";
import {
  IS_BImport,
  IS_CExport,
  IS_EExport,
} from "../../ALL_IS/IS_Imports_Exports.ts";
import { ISP_ArgSpread, ISP_ObjectMethod } from "../../ALL_RVal/ALL_ISP.ts";
import { IV_CTHIS } from "../../ALL_RVal/IV_NonLang.ts";
import { BB, FunctionReturn } from "../../BB.ts";
import { I_Function_params } from "../../I_GENERAL/I_Function.ts";
import IRIDIUM_MODULE from "../../IRIDIUM.ts";
import { predecessorPTAClosure, successorPTAClosure } from "../../PTAUtil.ts";
import { ContextualPTAHandler, getKeyString, PTA_OUT_RES } from "../PTA.ts";
import { IRIDIUM_FG } from "../../../I_GENERAL/IRIDIUM_FG.ts";
import {
  DummyObject,
  ECall,
  ImportNode,
  KnownFunctionNode,
  KnownResultObj,
  OrdinaryArrayObject,
  OrdinaryFunctionObject,
  OrdinaryObject,
  PTANode,
  ReactRenderRoot,
  SetSpecialClosure,
  StackNode,
  UnknownResultObj,
  Valid_Stack_To_Heap_Pointees,
} from "./nodes.ts";
import { PTAGraph } from "./PTAGraph.ts";
import { dissernProps, getSpreadPointees } from "./rvalHandler.ts";
import { getHeapQualifiedName, getStackQualifiedName } from "./util.ts";
import { isIdentifier } from "@babel/types";
import { popSet } from "#utils";
import { I_Container } from "../../I_GENERAL/I_Container.ts";
export const handleObjectDestructuring = (
  nextGraph: PTAGraph,
  objDestLVal: JS3ObjectPattern,
  RValPointees: Array<PTANode> | Set<PTANode>,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
) => {
  for (const p of objDestLVal.properties) {
    if (isJS3AssnObjectProperty(p)) {
      //
      // JS3AssnObjectProp ==> {[x] : stackNode} = RVal
      //
      // stackNode = [RValPointees][x]
      //
      const lookupName = getKeyString(p.key);
      const dissernedProps: Set<string> = dissernProps(
        nextGraph,
        lookupName,
        p.computed && getStackQualifiedName(lookupName, currBB),
        p.computed,
      );

      if (dissernedProps.size === 0) dissernedProps.add("*");

      // [RValPointees].x
      const res: Set<PTANode> = new Set();
      const iContext = "BB" + currBBIDx + ":" + stackInstOffset;

      const closureResults: Array<PTAGraph> = [];
      for (const u of RValPointees) {
        for (const p of dissernedProps) {
          nextGraph
            .getFieldPointees(u, p, iContext, true, true)
            .forEach((r) => res.add(r));
        }
      }
      nextGraph.union(...closureResults);

      handleSimpleAssignmentStatement(
        nextGraph,
        getStackQualifiedName(IV_Identifier.from(p.value).lookupName(), currBB),
        res,
      );
    } else {
      // ...ID = RVal
      // Approximate => ID = DUP(RVal)
      const duplicateRValPointees: Set<PTANode> = new Set();
      for (const rValPointee of RValPointees) {
        const duplicateRVal = new OrdinaryObject(
          getHeapQualifiedName("spreadObj", currBBIDx, stackInstOffset),
        );
        nextGraph.addPTANode(duplicateRVal);
        duplicateRValPointees.add(duplicateRVal);

        const outEdges = nextGraph.outEdges(rValPointee.id);
        if (outEdges) {
          for (const e of outEdges) {
            const prop = e.name;
            if (!nextGraph.hasField(duplicateRVal.id, prop)) {
              nextGraph.addField(duplicateRVal.id, prop);
              nextGraph.setEdge(
                duplicateRVal.id,
                nextGraph.getField(duplicateRVal.id, prop).id,
                prop,
                prop,
              );
            }
            const existingPNode = nextGraph.getPTANode(e.w);
            const newPNode = nextGraph.getField(duplicateRVal.id, prop);

            const pNodePointeeEdges = nextGraph.outEdges(existingPNode.id);
            if (pNodePointeeEdges) {
              for (const ee of pNodePointeeEdges) {
                nextGraph.setEdge(newPNode.id, ee.w, ee.name, ee.name);
              }
            }
          }
        }
      }
      handleSimpleAssignmentStatement(
        nextGraph,
        getStackQualifiedName(
          IV_Identifier.from(p.argument).lookupName(),
          currBB,
        ),
        duplicateRValPointees,
      );
    }
  }
};

export const handleArrayDestructuring = (
  nextGraph: PTAGraph,
  objDestLVal: JS3ArrayPattern,
  RValPointees: Array<PTANode> | Set<PTANode>,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
) => {
  let idx = 0;
  const processedIdx: Set<string> = new Set();
  for (const p of objDestLVal.elements) {
    if (isIdentifier(p)) {
      processedIdx.add("" + idx);
      const qualifiedStackID = getStackQualifiedName(
        IV_Identifier.from(p).lookupName(),
        currBB,
      );
      //
      // p --> RVal[idx U * U IterableResult]
      //
      const uknNode = new UnknownResultObj(
        getHeapQualifiedName("Iterable_res", currBBIDx, stackInstOffset),
      );
      nextGraph.declareNode(uknNode);

      handleSimpleAssignmentStatement(nextGraph, qualifiedStackID, [uknNode]);

      const dissernedProps: Set<string> = new Set();
      dissernedProps.add("" + idx);
      dissernedProps.add("*");

      // [RValPointees].x
      const res: Set<PTANode> = new Set();
      const iContext = "BB" + currBBIDx + ":" + stackInstOffset;

      const closureResults: Array<PTAGraph> = [];
      for (const u of RValPointees) {
        for (const p of dissernedProps) {
          nextGraph
            .getFieldPointees(u, p, iContext, true, true)
            .forEach((r) => res.add(r));
        }
      }
      nextGraph.union(...closureResults);

      res.add(uknNode);

      handleSimpleAssignmentStatement(nextGraph, qualifiedStackID, res);
    } else {
      const qualifiedStackID = getStackQualifiedName(
        IV_Identifier.from(p.argument).lookupName(),
        currBB,
      );
      //
      // p --> RVal[idx U * U IterableResult / idx_processed]
      //
      const iterableNode = new OrdinaryArrayObject(
        getHeapQualifiedName("Iterable_rest", currBBIDx, stackInstOffset),
      );

      nextGraph.declareNode(iterableNode);

      const dissernedProps: Set<string> = new Set();
      for (const u of RValPointees) {
        const outEdges = nextGraph.outEdges(u.id);
        if (outEdges) {
          for (const e of outEdges) {
            if (!processedIdx.has(e.name)) dissernedProps.add(e.name);
          }
        }
      }

      // [RValPointees].x
      const res: Set<PTANode> = new Set();
      const iContext = "BB" + currBBIDx + ":" + stackInstOffset;

      const closureResults: Array<PTAGraph> = [];
      for (const u of RValPointees) {
        for (const p of dissernedProps) {
          nextGraph
            .getFieldPointees(u, p, iContext, true, true)
            .forEach((r) => res.add(r));
        }
      }
      nextGraph.union(...closureResults);

      nextGraph.drawHeapToHeapEdge([iterableNode], res, ["*"], true);
      handleSimpleAssignmentStatement(nextGraph, qualifiedStackID, [
        iterableNode,
      ]);
    }
    idx++;
  }
};

export const handleResolvedImportNode = (
  nextGraph: PTAGraph,
  rootNode: ImportNode,
  stackID: string,
  remoteLookupID: string,
  currBBIDx: string,
  stackInstOffset: number,
) => {
  const worklist: Set<ImportNode> = new Set();
  // Initialize Worklist
  worklist.add(rootNode);
  while (worklist.size > 0) {
    // Update Worklist
    const heapNode = popSet(worklist);
    debugConfig.logger.log(
      `Processing: ${heapNode.FROM} [worklist has ${worklist.size} remaining]`,
    );

    const replacementNode = new OrdinaryObject(
      getHeapQualifiedName(
        `${heapNode.resolvedContainer.projectFile.uname}`,
        currBBIDx,
        stackInstOffset,
      ),
    );
    const resolvedPTA: I_Container = heapNode.resolvedContainer;
    const moduleFG = resolvedPTA.module.fg;
    const sinks = moduleFG.sinks();
    if (sinks.length === 1) {
      const sink = sinks[0];
      const outFG = PTA_OUT_RES.get(sink);
      const nnn = new PTAGraph();
      nnn.union(outFG);
      const exportsNode = nnn.getPTANode("EXPORT");
      nnn.replacePTANode(exportsNode, replacementNode);

      nextGraph.union(nnn);
      nextGraph.UnifyStackTargets(heapNode, replacementNode);

      nextGraph.removePTANodeAndFields(heapNode);

      const finalReplacement = new OrdinaryObject(heapNode.id);
      nextGraph.addPTANode(finalReplacement);
      nextGraph.replacePTANode(replacementNode, finalReplacement);

      // Mark all reachable objects from 'finalReplacement' node as EXTERNAL_CONTEXT
      const nodeClosure: Set<string> = successorPTAClosure(
        nextGraph,
        finalReplacement.id,
      );

      for (const n of nodeClosure) {
        nextGraph.getPTANode(n).EXTERNAL_CONTEXT = true;
      }

      const iContext = "BB" + currBBIDx + ":" + stackInstOffset;
      if (heapNode === rootNode) {
        //
        // stackID --->resolvedObject---[remote U *]-->pointees
        //
        handleSimpleAssignmentStatement(nextGraph, stackID, [
          ...nextGraph.getFieldPointees(
            finalReplacement,
            remoteLookupID,
            iContext,
            true,
            true,
          ),
          ...nextGraph.getFieldPointees(
            finalReplacement,
            "*",
            iContext,
            true,
            true,
          ),
        ]);
      }
    } else {
      debugConfig.logger.throwIriError("Expecting only only one sink in a FG");
    }

    // Update Worklist
    const remainingImportNodes: Array<ImportNode> = nextGraph
      .nodes()
      .map((n) => nextGraph.nodeMap.get(n))
      .filter((n) => n instanceof ImportNode)
      .filter((n) => n.isResolved());
    remainingImportNodes.forEach((n) => worklist.add(n));
  }
};

// Resolve 'heapNode' and make 'stackNode' point to 'field'
export const handleImportNode = (
  nextGraph: PTAGraph,
  FROM: string,
  heapNode: PTANode,
  field: string,
  stackNode: PTANode,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
) => {
  const iContext = "BB" + currBBIDx + ":" + stackInstOffset;

  if (heapNode instanceof ImportNode) {
    // If this is already a resolved node, then compose the PTA
    if (heapNode.isResolved()) {
      handleResolvedImportNode(
        nextGraph,
        heapNode,
        stackNode.id,
        field,
        currBBIDx,
        stackInstOffset,
      );
    } else if (FROM === "react-dom/client" && field === "createRoot") {
      debugConfig.logger.log("[Primitive Import] react-dom/client");
      nextGraph.drawStackToHeapEdge(stackNode, [
        nextGraph.getPTANode("createRoot"),
      ]);
    } else {
      if (!nextGraph.hasField(heapNode.id, field))
        nextGraph.addField(heapNode.id, field);
      const remoteDummyNode = new DummyObject(
        getHeapQualifiedName(field, currBBIDx, stackInstOffset),
      );
      nextGraph.declareNode(remoteDummyNode);

      nextGraph.drawHeapToHeapEdge(
        [heapNode],
        [remoteDummyNode],
        [field],
        true,
      );
      nextGraph.drawStackToHeapEdge(stackNode, [remoteDummyNode]);
    }
  } else if (heapNode instanceof OrdinaryObject) {
    const pointees = nextGraph.getFieldPointees(
      heapNode,
      field,
      iContext,
      true,
      true,
    );
    nextGraph.drawStackToHeapEdge(stackNode, [...pointees]);
  } else {
    debugConfig.logger.throwIriError("Expected Import Node here");
  }
};

// export { field as boo } from FROM
//  1. heapID --[field]--> [targetObjs] <-- stackID
//  2. EXPORT --[foo]--> [targetObjs]
export const handleCExportNode = (
  nextGraph: PTAGraph,
  i: IS_CExport,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
) => {
  const stackID = getHeapQualifiedName(
    "TEMP_IMPORT",
    currBBIDx,
    stackInstOffset,
  );
  if (!nextGraph.hasNode(stackID))
    nextGraph.declareNode(new StackNode(stackID));
  const stackNode = new StackNode(stackID);

  nextGraph.declareNode(stackNode);
  nextGraph.clearSuccessors(stackNode.id);

  const fieldID = i.local.lookupName();

  const heapID = getHeapQualifiedName("IMPORT", currBBIDx, stackInstOffset);
  if (!nextGraph.hasNode(heapID)) {
    const iNode = new ImportNode(i, heapID, i.FROM, true);
    iNode.importContext =
      IRIDIUM_MODULE.GLOBAL_CONTEXT[IRIDIUM_MODULE.GLOBAL_CONTEXT.length - 1];
    nextGraph.declareNode(iNode);
  }

  const heapNode = nextGraph.getPTANode(heapID);

  handleImportNode(
    nextGraph,
    i.FROM.value,
    heapNode,
    fieldID,
    stackNode,
    currBB,
    currBBIDx,
    stackInstOffset,
  );

  const exportNode = nextGraph.getPTANode("EXPORT");
  const exportFieldID = i.remote.lookupName();

  // EXPORT --[foo]--> [targetObjs] <-- stackID
  nextGraph.drawHeapToHeapEdge(
    [exportNode],
    nextGraph.getPointees(stackID),
    [exportFieldID],
    true,
  );

  nextGraph.removePTANode(stackNode);
};

// export * from FROM
//  1. heapID --[*]--> [targetObjs] <-- DUMMY
//  2. heapID --[F]-------> [OBJS]
//                             ^
//     EXPORT --[F / default]--|
export const handleEExportNode = (
  nextGraph: PTAGraph,
  i: IS_EExport,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
) => {
  const iContext = "BB" + currBBIDx + ":" + stackInstOffset;

  // DUMMY
  const stackID = getHeapQualifiedName("DUMMY", currBBIDx, stackInstOffset);
  if (!nextGraph.hasNode(stackID))
    nextGraph.declareNode(new StackNode(stackID));
  const stackNode = new StackNode(stackID);
  nextGraph.declareNode(stackNode);
  nextGraph.clearSuccessors(stackNode.id);

  // DUMMY will point to field "*" of IMPORTED object
  const fieldID = "*";
  const heapID = getHeapQualifiedName("IMPORT", currBBIDx, stackInstOffset);
  if (!nextGraph.hasNode(heapID)) {
    const iNode = new ImportNode(i, heapID, i.FROM, true);
    iNode.importContext =
      IRIDIUM_MODULE.GLOBAL_CONTEXT[IRIDIUM_MODULE.GLOBAL_CONTEXT.length - 1];
    nextGraph.declareNode(iNode);
  }

  const heapNode = nextGraph.getPTANode(heapID);
  handleImportNode(
    nextGraph,
    i.FROM.value,
    heapNode,
    fieldID,
    stackNode,
    currBB,
    currBBIDx,
    stackInstOffset,
  );

  const exportNode = nextGraph.getPTANode("EXPORT");
  const outEdges = nextGraph.outEdges(heapID);

  if (outEdges) {
    for (const e of outEdges) {
      if (e.name === "default") continue;
      const pointees = nextGraph.getFieldPointees(
        heapNode,
        e.name,
        iContext,
        true,
        true,
      );
      nextGraph.drawHeapToHeapEdge([exportNode], pointees, [e.name], true);
    }
  }
};

// import { remote as local } from FROM
export const handleBImportNode = (
  nextGraph: PTAGraph,
  i: IS_BImport,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
) => {
  const stackID = getStackQualifiedName(i.local.lookupName(), currBB);
  const stackNode = new StackNode(stackID);
  nextGraph.declareNode(stackNode);
  nextGraph.clearSuccessors(stackNode.id);

  const fieldID =
    i.remote instanceof IV_Identifier ? i.remote.lookupName() : i.remote.value;

  const heapID = getHeapQualifiedName("IMPORT", currBBIDx, stackInstOffset);
  if (!nextGraph.hasNode(heapID)) {
    const iNode = new ImportNode(i, heapID, i.FROM, true);
    iNode.importContext =
      IRIDIUM_MODULE.GLOBAL_CONTEXT[IRIDIUM_MODULE.GLOBAL_CONTEXT.length - 1];
    nextGraph.declareNode(iNode);
  }

  const heapNode = nextGraph.getPTANode(heapID);

  handleImportNode(
    nextGraph,
    i.FROM.value,
    heapNode,
    fieldID,
    stackNode,
    currBB,
    currBBIDx,
    stackInstOffset,
  );
};

export const handleOrdinaryFunctionObjectCall = (
  nextGraph: PTAGraph,
  c: OrdinaryFunctionObject,
  args: Array<IV_Identifier | ISP_ArgSpread>,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
): [Set<PTANode>, PTAGraph] => {
  const iContext = "BB" + currBBIDx + ":" + stackInstOffset;
  const meth = c.meth;
  const res: Set<PTANode> = new Set();
  let closureGraph: IRIDIUM_FG;
  if (meth instanceof ISP_ObjectMethod) closureGraph = meth.funBody;
  else closureGraph = meth.func.funBody;

  let calleeArgs: I_Function_params;
  if (meth instanceof ISP_ObjectMethod) calleeArgs = meth.params;
  else calleeArgs = meth.func.params;

  let rootBB: BB;
  if (meth instanceof ISP_ObjectMethod) rootBB = meth.funBody.rootBB;
  else rootBB = meth.func.funBody.rootBB;

  const closureContextPTA = new PTAGraph();
  closureContextPTA.union(nextGraph);

  //
  // Create arguments object
  //
  const argumentsObj = new OrdinaryArrayObject(
    getHeapQualifiedName("argumentsObj", currBBIDx, stackInstOffset),
  );
  closureContextPTA.declareNode(argumentsObj);
  let i = 0;
  let lastMapped = i;
  for (; i < args.length; i++) {
    const currArg = args[i];
    if (currArg instanceof IV_Identifier) {
      const pointees = closureContextPTA.getPointees(
        getStackQualifiedName(currArg.lookupName(), currBB),
      );
      // ArgumentsObj --[i]--> pointees
      closureContextPTA.drawHeapToHeapEdge(
        [argumentsObj],
        pointees,
        ["" + i],
        true,
      );
      lastMapped = i;
    } else {
      if (i + 1 !== args.length)
        debugConfig.logger.throwIriError(
          "Expecting Spread operator to be the last supplied argument",
        );
      const pointees = closureContextPTA.getPointees(
        getStackQualifiedName(currArg.arg.lookupName(), currBB),
      );
      // ArgumentsObj --[*]--> pointees
      for (const pp of pointees) {
        const spreadPointees = getSpreadPointees(
          closureContextPTA,
          pp,
          iContext,
        );
        closureContextPTA.drawHeapToHeapEdge(
          [argumentsObj],
          [...spreadPointees],
          ["*"],
          true,
        );
      }
    }
  }

  //
  // Match formals (or the other one... I forgor),
  //
  let j = 0;
  for (; j < calleeArgs.length; j++) {
    const currArg = calleeArgs[j];
    if (currArg instanceof IV_Identifier) {
      const argStackQualifiedName = getStackQualifiedName(
        currArg.lookupName(),
        rootBB,
      );
      const argStackNode = new StackNode(argStackQualifiedName);
      closureContextPTA.declareNode(argStackNode);
      if (j <= lastMapped) {
        //
        // argStackQualifiedName --> argumentsObj.j
        //
        let pointees;
        if (!closureContextPTA.hasField(argumentsObj.id, "" + j)) {
          debugConfig.logger.error("Expecting field to exist");
          pointees = closureContextPTA.getPointees("undefined");
        } else {
          pointees = closureContextPTA.getFieldPointees(
            argumentsObj,
            "" + j,
            iContext,
            true,
            false,
          );
        }
        closureContextPTA.drawStackToHeapEdge(argStackNode, [...pointees]);
        // if (!closureContextPTA.hasField(argumentsObj.id, "" + j))
        //   debugConfig.logger.throwIriError("Expecting field to exist");
        // const pointees = closureContextPTA.getFieldPointees(
        //   argumentsObj,
        //   "" + j,
        //   iContext,
        //   true,
        //   false,
        // );
        // closureContextPTA.drawStackToHeapEdge(argStackNode, [...pointees]);
      } else {
        //
        // argStackQualifiedName --> argumentsObj.*
        //
        let pointees;
        if (!closureContextPTA.hasField(argumentsObj.id, "*")) {
          debugConfig.logger.error("Expecting field to exist");
          pointees = closureContextPTA.getPointees("undefined");
        } else {
          pointees = closureContextPTA.getFieldPointees(
            argumentsObj,
            "*",
            iContext,
            true,
          );
        }
        closureContextPTA.drawStackToHeapEdge(argStackNode, [...pointees]);
        // if (!closureContextPTA.hasField(argumentsObj.id, "*"))
        //   debugConfig.logger.throwIriError("Expecting field to exist");
        // const pointees = closureContextPTA.getFieldPointees(
        //   argumentsObj,
        //   "*",
        //   iContext,
        //   true,
        // );
        // closureContextPTA.drawStackToHeapEdge(argStackNode, [...pointees]);
      }
    } else {
      if (j + 1 !== calleeArgs.length)
        debugConfig.logger.throwIriError(
          "Expecting Spread operator to be the last function argument",
        );
      const spillHolderObj = new OrdinaryArrayObject(
        getHeapQualifiedName(
          currArg.arg.lookupName(),
          currBBIDx,
          stackInstOffset,
        ),
      );
      closureContextPTA.declareNode(spillHolderObj);
      const argStackQualifiedName = getStackQualifiedName(
        currArg.arg.lookupName(),
        rootBB,
      );
      const argStackNode = new StackNode(argStackQualifiedName);
      closureContextPTA.declareNode(argStackNode);
      let counter = 0;
      for (let k = j; k <= lastMapped; k++) {
        //
        // argStackQualifiedName ---> spillHolderObj --[k]--> U {argumentsObj.j...argumentsObj.lastMapped}
        //
        if (!closureContextPTA.hasField(argumentsObj.id, "" + k))
          debugConfig.logger.throwIriError("Expecting field to exist");
        const pointees = closureContextPTA.getFieldPointees(
          argumentsObj,
          "" + k,
          iContext,
          true,
          false,
        );
        closureContextPTA.drawHeapToHeapEdge(
          [spillHolderObj],
          [...pointees],
          ["" + counter],
          true,
        );
        counter++;
      }
      // argStackQualifiedName ---> spillHolderObj --[k]--> argumentsObj.*
      if (closureContextPTA.hasField(argumentsObj.id, "*")) {
        const pointees = closureContextPTA.getFieldPointees(
          argumentsObj,
          "*",
          iContext,
          true,
        );
        closureContextPTA.drawHeapToHeapEdge(
          [spillHolderObj],
          [...pointees],
          ["*"],
          true,
        );
      }
      closureContextPTA.drawStackToHeapEdge(argStackNode, [spillHolderObj]);
    }
  }

  //
  // Evaluate Closure
  //
  const nextt = ContextualPTAHandler(
    c.id,
    iContext,
    closureContextPTA,
    closureGraph,
  );
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
  if (sinkBB instanceof FunctionReturn) {
    const argLookupName = getStackQualifiedName(
      sinkBB.arg.lookupName(),
      sinkBB,
    );
    const pointees = nextt.getPointees(argLookupName);
    pointees.forEach((p) => res.add(p));
  } else {
    debugConfig.logger.throwIriError(
      `Expected sinks to be Function Returns in closures!!! found ${sinkBB.scope}`,
    );
  }
  return [res, nextt];
};

export const handleUnknownDummyObjectCall = (
  nextGraph: PTAGraph,
  c: DummyObject,
  args: Array<IV_Identifier | ISP_ArgSpread>,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
) => {
  const iContext = "BB" + currBBIDx + ":" + stackInstOffset;
  let hasClosure = false;
  // Check if the arguments point to any closure object
  let i = 0;
  const ress: Set<PTANode> = new Set();
  outer: for (; i < args.length; i++) {
    const currArg = args[i];
    if (currArg instanceof IV_Identifier) {
      const pointees = nextGraph.getPointees(
        getStackQualifiedName(currArg.lookupName(), currBB),
      );

      for (const p of pointees) {
        ress.add(p);
        if (p instanceof OrdinaryFunctionObject) {
          hasClosure = true;
          break outer;
        }
      }
    } else {
      if (i + 1 !== args.length)
        debugConfig.logger.throwIriError(
          "Expecting Spread operator to be the last supplied argument",
        );
      const pointees = nextGraph.getPointees(
        getStackQualifiedName(currArg.arg.lookupName(), currBB),
      );
      // ArgumentsObj --[*]--> pointees
      for (const pp of pointees) {
        const spreadPointees = getSpreadPointees(nextGraph, pp, iContext);
        for (const sp of spreadPointees) {
          ress.add(sp);
          if (sp instanceof OrdinaryFunctionObject) {
            hasClosure = true;
            break outer;
          }
        }
      }
    }
  }

  if (!hasClosure) {
    debugConfig.logger.warn(
      `PTA is skipping analysis as no closures escape at this call site...`,
    );
    const resObj = new UnknownResultObj(
      getHeapQualifiedName("IV_Call", currBBIDx, stackInstOffset),
    );
    nextGraph.declareNode(resObj);
    ress.add(resObj);
    return ress;
  } else {
    debugConfig.logger.warn(
      `Introducing ECall Node to handle escaping closures: ${iContext}`,
    );

    const rootSet = predecessorPTAClosure(nextGraph, c.id);
    const resolvedSources: Array<ImportNode> = [];

    for (const n of rootSet) {
      const curr = nextGraph.getPTANode(n);
      if (curr instanceof ImportNode && !resolvedSources.includes(curr))
        resolvedSources.push(curr);
    }

    if (resolvedSources.length === 0) {
      debugConfig.logger.error(
        `Failed to resolve call to Dummy Object: ${c.id}`,
      );
    }

    resolvedSources.forEach((iNode: ImportNode) => {
      const eCallNode = new ECall(
        getHeapQualifiedName(`ECALL_` + iNode.id, currBBIDx, stackInstOffset),
        iNode,
      );
      nextGraph.addPTANode(eCallNode);
    });

    const resObj = new UnknownResultObj(
      getHeapQualifiedName("IV_ECall", currBBIDx, stackInstOffset),
    );
    nextGraph.declareNode(resObj);
    ress.add(resObj);
    return ress;

    // const resObj = new UnknownResultObj(
    //   getHeapQualifiedName("IV_Call", currBBIDx, stackInstOffset),
    // );
    // nextGraph.declareNode(resObj);
    // ress.add(resObj);
    // return ress;
  }
};

export const handleKnownFunctionNodeCall = (
  nextGraph: PTAGraph,
  c: KnownFunctionNode,
  args: Array<IV_Identifier | ISP_ArgSpread>,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
): Set<PTANode> => {
  const res: Set<PTANode> = new Set();
  // createRoot:
  //  Ignore arguments passed and return an object which has a render method.
  //  When the render method it called, it creates the "ReactRenderRoot" Known Object.
  if (c.idx === 0) {
    const knownResObj = new KnownResultObj(
      getHeapQualifiedName(
        `KnownFunctionNode_${0}`,
        currBBIDx,
        stackInstOffset,
      ),
      0,
    );
    nextGraph.addPTANode(knownResObj);

    const render = new KnownFunctionNode("render", 1);
    nextGraph.declareNode(render);
    nextGraph.drawHeapToHeapEdge([knownResObj], [render], ["render"], true);

    res.add(knownResObj);
  } else if (c.idx === 1) {
    const knownResObj = new ReactRenderRoot(
      getHeapQualifiedName(`ReactRenderRoot_${0}`, currBBIDx, stackInstOffset),
    );
    nextGraph.addPTANode(knownResObj);

    const pointees: Set<PTANode> = new Set();

    for (let i = 0; i < args.length; i++) {
      const currArg = args[i];
      if (currArg instanceof IV_Identifier) {
        nextGraph
          .getPointees(getStackQualifiedName(currArg.lookupName(), currBB))
          .forEach((p) => pointees.add(p));
      } else {
        if (i + 1 !== args.length)
          debugConfig.logger.throwIriError(
            "Expecting Spread operator to be the last supplied argument",
          );
        nextGraph
          .getPointees(getStackQualifiedName(currArg.arg.lookupName(), currBB))
          .forEach((p) => pointees.add(p));
      }
    }

    nextGraph.drawHeapToHeapEdge([knownResObj], [...pointees], ["root"], true);

    res.add(knownResObj);
  } else {
    console.warn(`PTA [KnownFunctionNode]: ${c.idx}`);
  }
  return res;
};

export const handleCallExpression = (
  nextGraph: PTAGraph,
  callees: Array<PTANode>,
  args: Array<IV_Identifier | ISP_ArgSpread>,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
): Set<PTANode> => {
  const res: Set<PTANode> = new Set();
  const closureResults: Array<PTAGraph> = [];
  for (const c of callees) {
    if (c instanceof OrdinaryFunctionObject) {
      const [evalRes, nextt] = handleOrdinaryFunctionObjectCall(
        nextGraph,
        c,
        args,
        currBB,
        currBBIDx,
        stackInstOffset,
      );
      evalRes.forEach((n) => {
        if (c.EXTERNAL_CONTEXT) n.EXTERNAL_CONTEXT = true;
        res.add(n);
      });
      closureResults.push(nextt);
    } else if (c instanceof UnknownResultObj || c instanceof DummyObject) {
      const evalRes = handleUnknownDummyObjectCall(
        nextGraph,
        c,
        args,
        currBB,
        currBBIDx,
        stackInstOffset,
      );
      evalRes.forEach((n) => res.add(n));
    } else if (c instanceof KnownFunctionNode) {
      const evalRes = handleKnownFunctionNodeCall(
        nextGraph,
        c,
        args,
        currBB,
        currBBIDx,
        stackInstOffset,
      );
      evalRes.forEach((n) => res.add(n));
    } else {
      console.warn(`PTA is skipping analysis of non-callable object: ${c.id}`);
    }
  }

  nextGraph.union(...closureResults);
  return res;
};

// Handle Simple Assignment Statement
export const handleSimpleAssignmentStatement = (
  nextGraph: PTAGraph,
  qualifiedStackId: string,
  rVal: Array<PTANode> | Set<PTANode>,
) => {
  const stackNode = new StackNode(qualifiedStackId);
  if (!nextGraph.hasNode(stackNode.id)) nextGraph.declareNode(stackNode);
  nextGraph.clearSuccessors(qualifiedStackId);
  nextGraph.drawStackToHeapEdge(stackNode, rVal);
};

export const handleMemberAssignment = (
  origNextGraph: PTAGraph,
  us: Array<Valid_Stack_To_Heap_Pointees>,
  vs: Array<PTANode>,
  ps: Set<string> | Array<string>,
  currBB: BB,
  currBBIDx: string,
  stackInstOffset: number,
) => {
  let closureResults: Array<PTAGraph> = [];
  const pendingClosures = origNextGraph.drawHeapToHeapEdge(us, vs, ps, true);
  const iContext = "BB" + currBBIDx + ":" + stackInstOffset;

  closureResults = pendingClosures.map((e) => {
    const clos: SetSpecialClosure = e[0];
    const objContext: Valid_Stack_To_Heap_Pointees = e[1];
    const arg: Valid_Stack_To_Heap_Pointees = e[2];
    const nextGraph = new PTAGraph();
    nextGraph.union(origNextGraph);

    // set THIS pointer to objContext
    const cThisLookupName = getStackQualifiedName(
      IV_CTHIS.lookupName(),
      clos.meth.funBody.rootBB,
    );
    const contextualThis = new StackNode(cThisLookupName);
    nextGraph.addPTANode(contextualThis);
    nextGraph.drawStackToHeapEdge(contextualThis, [objContext]);

    // set argument to v
    if (clos.meth.params.length !== 1)
      debugConfig.logger.throwIriError(
        "Expected setters to have exactly one argument!!",
      );

    const param1 = clos.meth.params[0];
    let paramLookupName;

    if (param1 instanceof IV_Identifier)
      paramLookupName = getStackQualifiedName(
        param1.lookupName(),
        clos.meth.funBody.rootBB,
      );
    else
      paramLookupName = getStackQualifiedName(
        param1.arg.lookupName(),
        clos.meth.funBody.rootBB,
      );

    const paramNode = new StackNode(paramLookupName);
    nextGraph.addPTANode(paramNode);
    nextGraph.drawStackToHeapEdge(paramNode, [arg]);

    return ContextualPTAHandler(
      objContext.id,
      iContext,
      nextGraph,
      clos.meth.funBody,
    );
  });

  // Union of closure results must be merged back into the nextGraph...
  origNextGraph.union(...closureResults);
};

// TODO: Handle Array Assignment Pattern
// TODO: Handle Object Assignment Pattern
