// 
// Combine all return statements in functions
// 

import GLIB from "#graphlib";
import { popSet } from "#utils";
import { ALL_IS } from "../ALL_IS/ALL_IS.ts";
import { IS_Return } from "../ALL_IS/IS_Debugger_Return_Throw.ts";
import { IS1_AssignmentStmt, IS1_DeclarationStmt } from "../ALL_IS/IS_VarDecl.ts";
import { BB, FunctionBB } from "../BB.ts";
import { IRIDIUM_FG } from "../IRIDIUM.ts";
import { traverseBB, traverseFGLexical, traverseInstruction } from "../Visitors/traverse.ts";
import debugConfig from "#debugConfig";
import { IS_BImport } from "../ALL_IS/IS_Imports_Exports.ts";
import { IV_Identifier, IV_PrivateName } from "../ALL_AMP/ALL_AMP.ts";
import { IV_BigIntLiteral, IV_BooleanLiteral, IV_DecimalLiteral, IV_NullLiteral, IV_NumericLiteral, IV_StringLiteral } from "../ALL_RVal/IV_Literals.ts";
import { IS_ClassStaticPropInit } from "../ALL_IS/IS_ClassStaticPropInit.ts";
import { IV_CTHIS, IV_NUBD, IV_STHIS } from "../ALL_RVal/IV_NonLang.ts";
import { IV_ASSIGNABLE } from "../ALL_RVal/ALL_RVal.ts";

export class PTANode {
  id: string
  constructor(id: string) {
    this.id = id
  }
}

export class StackNode extends PTANode {
  constructor(id: string) {
    super(id)
  }
}

export class HeapNode extends PTANode {
  constructor(id: string) {
    super(id)
  }
}

// Literals, this help us dissern prop updates
export class DecimalNode extends HeapNode {
  constructor(id: string) {
    super(id)
  }
}

export class BigIntNode extends HeapNode {
  constructor(id: string) {
    super(id)
  }
}

export class StringNode extends HeapNode {
  constructor(id: string) {
    super(id)
  }
}

export class NumericNode extends HeapNode {
  constructor(id: string) {
    super(id)
  }
}

export class NullNode extends HeapNode {
  constructor(id: string) {
    super(id)
  }
}

export class BooleanNode extends HeapNode {
  constructor(id: string) {
    super(id)
  }
}

export class PrivateNode extends HeapNode {
  constructor(id: string) {
    super(id)
  }
}

export class SymbolNode extends HeapNode {
  constructor(id: string) {
    super(id)
  }
}

// These are for external imports
export class LazyHeapNode extends HeapNode {
  remote: IV_Identifier | IV_StringLiteral
  FROM: IV_StringLiteral
  constructor(id: string, remote: IV_Identifier | IV_StringLiteral, FROM: IV_StringLiteral) {
    super(id)
    this.remote = remote
    this.FROM = FROM
  }
}

export class PTAGraph extends GLIB.Graph {
  nodeMap: Map<string, PTANode> = new Map()

  constructor() {
    super({ directed: true })
  }

  declareNode(node: PTANode) {
    this.setNode(node.id)
    this.nodeMap.set(node.id, node);
  }

  ensureNode(lookupID: string): PTANode {
    if (!this.hasNode(lookupID) || !this.nodeMap.has(lookupID)) debugConfig.logger.throwIriError("Expected all uses to be dominated by their defs, node not found in the graph!!!");

    return this.nodeMap.get(lookupID)
  }

  addPTANode(n: PTANode) {
    this.setNode(n.id)
    this.nodeMap.set(n.id, n)
  }

  clearSuccessors(u: string) {
    let succ = this.successors(u)
    succ && succ.forEach(v => this.removeEdge(u, v))
  }

  // Stack to Heap Edge
  drawStackToHeapEdge(stackNode: StackNode, heapNodes: Array<PTANode>) {
    heapNodes.forEach(h => this.setEdge(stackNode.id, h.id))
  }

  // Heap to Heap Edge
  drawHeapToHeapEdge(us: Array<PTANode>, vs: Array<PTANode>, ps: Array<string>) {
    for (let p of ps) for (let u of us) for (let v of vs) this.setEdge(u.id, v.id, p)
  }

  // Returns the set of nodes pointed by a stack object
  getPointees(stackId: string): Array<PTANode> {
    let succ = this.successors(stackId)
    return succ ? succ.map(n => {
      if (!this.nodeMap.has(n)) debugConfig.logger.throwIriError(`nodemap is missing a node ${n}`);

      return this.nodeMap.get(n);
    }) : []
  }

  union(...gs: Array<PTAGraph>) {
    // for (let n of g.nodes()) {
    //   this.setNode()
    // }
  }

  equals(fg: PTAGraph): boolean {
    return true
  }
}

type BBIdx = string;
let getBBIdx = (bb: BB): BBIdx => '' + bb.idx;

export function PTA(rootFG: IRIDIUM_FG) {
  // Assert that there is only one source in the flowgraph
  if (rootFG.sources().length !== 0) debugConfig.logger.throwIriError("Expected exactly one root inside a flowgraph")

  // Initialize flowMap and worklist
  let worklist: Set<BBIdx> = new Set()
  let flowMap: Map<BBIdx, PTAGraph> = new Map()
  rootFG.nodes().forEach((bbIdx: BBIdx) => (flowMap[bbIdx] = new PTAGraph(), worklist.add(bbIdx)));

  // Start working on the worklist
  while (worklist.size > 0) {
    let currBBIdx: BBIdx = popSet(worklist);

    // Incoming Set
    let nextGraph: PTAGraph = new PTAGraph()
    let preds = rootFG.predecessors(currBBIdx)
    let incomingBBIdxs: Array<BBIdx> = preds ? preds : []
    nextGraph.union(...incomingBBIdxs.map((bbIdx: BBIdx) => flowMap.get(bbIdx)))

    // Flow Function 
    flowFunction(rootFG, nextGraph, currBBIdx);

    // Add successors to worklist if there was a change
    let oldGraph = flowMap.get(currBBIdx)
    if (!oldGraph.equals(nextGraph)) {
      flowMap.set(currBBIdx, nextGraph);
      let succ = rootFG.successors(currBBIdx)
      if (succ) succ.forEach((bbIdx: BBIdx) => worklist.add(bbIdx))
    }
  }
}


let dissernPointees = (ns: Array<PTANode>) => {
  let res: Set<string> = new Set();
  for (let n of ns) {
    if (n instanceof DecimalNode) res.add(n.id)
    else if (n instanceof BigIntNode) res.add(n.id)
    else if (n instanceof StringNode) res.add(n.id)
    else if (n instanceof NumericNode) res.add(n.id)
    else if (n instanceof NullNode) res.add(n.id)
    else if (n instanceof BooleanNode) res.add(n.id)
    else if (n instanceof PrivateNode) res.add(n.id)
    else if (n instanceof SymbolNode) res.add(n.id)
    // TODO: Recursion case??? 
    else return res.add("*")
  }
}



function flowFunction(rootFG: IRIDIUM_FG, nextGraph: PTAGraph, currBBIDx: BBIdx) {
  let currBB = rootFG.getBBNode(currBBIDx)

  let stackInstOffset = 0

  let getStackQualifiedName = (lookupID: string): string => {
    let declaredEnv = currBB.env.findEnvContaining(lookupID)
    return "ENV" + declaredEnv.idx + "$" + lookupID
  }

  let getHeapQualifiedName = (heapID: string): string => {
    return "BB" + currBBIDx + "$" + stackInstOffset
  }

  let handleRVals = (nextGraph: PTAGraph, rVal: IV_ASSIGNABLE): Array<PTANode> => {
    let res: Set<PTANode> = new Set()

    if (rVal instanceof IV_Identifier && rVal.name === "undefined") {
      let undefNode = new SymbolNode("undefined")
      nextGraph.addPTANode(undefNode)
      return [undefNode]
    } else if (rVal instanceof IV_Identifier) {
      return nextGraph.getPointees(getStackQualifiedName(rVal.lookupName()))
    } else if (rVal instanceof IV_DecimalLiteral) {
      let undefNode = new DecimalNode(rVal.lookupName())
      nextGraph.addPTANode(undefNode)
      return [undefNode]
    } else if (rVal instanceof IV_BigIntLiteral) {
      let bigIntNode = new BigIntNode(rVal.lookupName())
      nextGraph.addPTANode(bigIntNode)
      return [bigIntNode]
    } else if (rVal instanceof IV_StringLiteral) {
      let stringNode = new StringNode(rVal.lookupName())
      nextGraph.addPTANode(stringNode)
      return [stringNode]
    } else if (rVal instanceof IV_NumericLiteral) {
      let numericLiteral = new NumericNode(rVal.lookupName())
      nextGraph.addPTANode(numericLiteral)
      return [numericLiteral]
    } else if (rVal instanceof IV_NullLiteral) {
      let nullLiteral = new NullNode(rVal.lookupName())
      nextGraph.addPTANode(nullLiteral)
      return [nullLiteral]
    } else if (rVal instanceof IV_BooleanLiteral) {
      let booleanLiteral = new BooleanNode(rVal.lookupName())
      nextGraph.addPTANode(booleanLiteral)
      return [booleanLiteral]
    } else if (rVal instanceof IV_PrivateName) {
      let privateName = new PrivateNode(rVal.lookupName())
      nextGraph.addPTANode(privateName)
      return [privateName]
    }

    // TODO... handle more cases...

    return [...res];
  }

  // Handle assignment statements...
  let handleMemberAssignment = (nextGraph: PTAGraph, lVal: string, rVal: string, prop: string, computed: boolean) => {
    let receiverObjID = getStackQualifiedName(lVal)
    nextGraph.ensureNode(receiverObjID)

    let rValID = getStackQualifiedName(rVal)
    nextGraph.ensureNode(rValID)

    let receiverPointees = nextGraph.getPointees(receiverObjID)
    let rValPointees = nextGraph.getPointees(rValID)

    let dissernedProps: Set<string> = new Set();
    if (computed) {
      let propID = getStackQualifiedName(prop)
      nextGraph.ensureNode(propID)
      let propPointees = nextGraph.getPointees(propID)
      dissernedProps = dissernPointees(propPointees)
    } else {
      let symbolNode = new SymbolNode(prop)
      nextGraph.addPTANode(symbolNode)
      dissernedProps.add(symbolNode.id)
    }

    nextGraph.drawHeapToHeapEdge(receiverPointees, rValPointees, [...dissernedProps])
  }

  // Handle Simple Assignment Statement
  let handleSimpleAssignmentStatement = (nextGraph: PTAGraph, lval: string, rVal: Array<PTANode>) => {
    let stackID = getStackQualifiedName(lval)
    let stackNode = new StackNode(stackID)
    nextGraph.declareNode(stackNode)

    nextGraph.drawStackToHeapEdge(stackNode, rVal)
  }

  // TODO: Handle Array Assignment Pattern
  // TODO: Handle Object Assignment Pattern


  for (let i of currBB.statements) {
    stackInstOffset++;

    if (i instanceof IS_BImport) {
      // import { remote as local } from FROM
      let stackID = getStackQualifiedName(i.local.lookupName())
      let stackNode = new StackNode(stackID)
      nextGraph.declareNode(stackNode)

      let heapObj = getHeapQualifiedName(i.remote.lookupName())
      let heapNode = new LazyHeapNode(heapObj, i.remote, i.FROM)
      nextGraph.declareNode(heapNode)

      nextGraph.clearSuccessors(stackNode.id)
      nextGraph.drawStackToHeapEdge(stackNode, [heapNode])
    } else if (i instanceof IS_ClassStaticPropInit) {
      // obj[prop] = rval
      // obj.prop = rval
      handleMemberAssignment(nextGraph, i.obj.lookupName(), i.RVal.lookupName(), i.prop.lookupName(), i.computed);
    } else if (i instanceof IS1_DeclarationStmt) {
      if (i.LVal instanceof IV_Identifier) {
        handleSimpleAssignmentStatement(nextGraph, i.LVal.lookupName(), handleRVals(nextGraph, i.RVal))
      } else {
        // TODO?? Handle destructuring patterns
      }
    } else if (i instanceof IS1_AssignmentStmt) {
      if (i.LVal instanceof IV_Identifier) {
        handleSimpleAssignmentStatement(nextGraph, i.LVal.lookupName(), handleRVals(nextGraph, i.RVal))
      } else {
        // TODO?? Handle destructuring patterns
      }
    }

  }
}