// 
// Combine all return statements in functions
// 

import debugConfig from "#debugConfig";
import GLIB from "#graphlib";
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
import fs from "node:fs";
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

// Global Object
export class GlobalObject extends HeapNode {
  constructor(id: string) {
    super(id)
  }
}

// Ordinary Object
export class OrdinaryObject extends HeapNode {
  constructor(id: string) {
    super(id)
  }
}

// Ordinary Function Object
export class OrdinaryFunctionObject extends HeapNode {
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

  toString() {
    return `${this.remote.toString()} from ${this.FROM.toString()}`
  }
}

export class PTARecorder {
  top: Array<string> = []
  states: Array<[string, string]> = []
  bottom: Array<string> = []

  init() {
    this.top.push(`<html>`)
    this.top.push(`  <header>IRIDIUM PTA Debug Session</header>`)
    this.top.push(`  <body>`)

    this.bottom.push(`  </body>`)
    this.bottom.push(`</html>`)
  }

  recordState(codeState, ptaState) {
    this.states.push([codeState, ptaState])
  }

  saveRecording(path) {
    let res = []
    res = [...this.top]


    res = [...this.bottom]
  }

}

function equals(graph1: PTAGraph, graph2: PTAGraph) {
  if (graph1.nodeCount() !== graph2.nodeCount() || graph1.edgeCount() !== graph2.edgeCount()) {
    return false;
  }

  // Compare nodes and their data
  for (const node of graph1.nodes()) {
    if (!graph2.hasNode(node) || graph1.node(node) !== graph2.node(node)) {
      return false;
    }
  }

  // Compare edges and their data
  const edges1 = graph1.edges();
  const edges2Set = new Set(edges1.map(e => edgeKey(e, graph1.edge(e)))); // Store edges as keys for O(1) lookup

  if (edges1.length !== graph2.edges().length) {
    return false;
  }

  for (const edge of graph2.edges()) {
    if (!edges2Set.has(edgeKey(edge, graph2.edge(edge))) || graph1.edge(edge) !== graph2.edge(edge)) {
      return false;
    }
  }

  return true;
}

// Unique key for edges to avoid sorting
function edgeKey(edge, label) {
  return `${edge.v}->${edge.w}${label ? `:${label}` : ""}`;
}

export class PTAGraph extends GLIB.Graph {
  nodeMap: Map<string, PTANode> = new Map()

  constructor() {
    super({ directed: true, multigraph: true })
  }

  declareNode(node: PTANode) {
    this.setNode(node.id)
    this.nodeMap.set(node.id, node);
  }

  ensureNode(lookupID: string): PTANode {
    if (!this.hasNode(lookupID) || !this.nodeMap.has(lookupID)) debugConfig.logger.throwIriError(`Expected all uses to be dominated by their defs, node not found in the graph!!! ${lookupID}`);

    return this.nodeMap.get(lookupID)
  }

  addPTANode(n: PTANode) {
    if (this.hasNode(n.id)) return;
    this.setNode(n.id)
    this.nodeMap.set(n.id, n)
  }

  getPTANode(u: string) {
    this.ensureNode(u);
    return this.nodeMap.get(u)
  }

  clearSuccessors(u: string) {
    let succ = this.outEdges(u)
    succ && succ.forEach(e => this.removeEdge(e.v, e.w, e.name))
  }

  // Stack to Heap Edge
  drawStackToHeapEdge(stackNode: StackNode, heapNodes: Array<PTANode>) {
    heapNodes.forEach(h => this.setEdge(stackNode.id, h.id, "S", "S"))
  }

  // Heap to Heap Edge
  drawHeapToHeapEdge(us: Array<PTANode>, vs: Array<PTANode>, ps: Array<string>) {
    // Strong update 
    // 1. if us length is one.
    // 2. if u has no outward * edge
    // 3. if 2 is true: remove all edges on label p of ps
    if (us.length === 1) {
      let u = us[0]
      let edges = this.outEdges(u.id)
      let hasStarEdge = false
      edges && edges.forEach(e => (e.name === "*") && (hasStarEdge = true));
      !hasStarEdge && edges && edges.forEach(e => ps.forEach(p => this.removeEdge(e.v, e.w, p)));
    }
    // Update graph
    for (let p of ps) for (let u of us) for (let v of vs) this.setEdge(u.id, v.id, p, p);
  }

  // Returns the set of nodes pointed by a stack object
  getPointees(stackId: string): Array<PTANode> {
    let succ = this.successors(stackId)
    return succ ? succ.map(n => {
      if (!this.nodeMap.has(n)) debugConfig.logger.throwIriError(`nodemap is missing a node ${n}`);

      return this.nodeMap.get(n);
    }) : []
  }

  // For a given heap node, return the objects pointed to by a specific field
  getHeapPointees(heapId: string, prop: string) {
    this.ensureNode(heapId);
    let outEdges = this.outEdges(heapId)
    let res: Set<PTANode> = new Set();
    if (outEdges) {
      for (let e of outEdges) {
        let currE = this.edge(e)
        if (currE === "*" || currE === prop)
          res.add(this.nodeMap.get(e.w))
      }
    }

    return res;
  }

  // Recorder Methods
  saveDebugDot(): string {
    let res = []
    res.push("digraph FG {")
    res.push("  node [fontname=\"Noto Mono\"];");
    res.push("  graph [nodesep=1.0, ranksep=1.5]; // Adjust separation")
    for (let [key, value] of this.nodeMap) {
      // Stack Values
      if (value instanceof StackNode)
        res.push(`  "${key.replace(/"/g, '\\"')}"[]`)

      // Literals
      else if (value instanceof DecimalNode || value instanceof BigIntNode || value instanceof StringNode || value instanceof NumericNode || value instanceof NullNode || value instanceof BooleanNode || value instanceof SymbolNode)
        res.push(`  "${key.replace(/"/g, '\\"')}"[shape="square", style="filled", fillcolor="green"]`)

      else if (value instanceof LazyHeapNode)
        res.push(`  "${key.replace(/"/g, '\\"')}"[xlabel="${value.toString().replace(/"/g, '\\"')}",shape="square", style="filled", fillcolor="yellow"]`)
      // Heap Objects
      else res.push(`  "${key.replace(/"/g, '\\"')}"[shape="rectangle"]`)
    }

    for (let e of this.edges()) {
      res.push(`  "${e.v.replace(/"/g, '\\"')}" -> "${e.w.replace(/"/g, '\\"')}" [ label="'${e.name.replace(/"/g, '\\"')}'" ];`);
    }
      
    res.push("}")
    return res.join("\n")
  }

  toDot(graphName = "PTAGraph") {
    let res = []
    res.push("digraph " + graphName + " {")
    // res.push("  graph [nodesep=1.0, ranksep=1.5]; // Adjust separation")
    for (let e of this.edges())
      res.push("  " + e.v + " -> " + e.w + `[ label="'${e.name.replace(/"/g, '\\"')}'" ];`);
    res.push("}");
    return res.join("\n");
  }

  saveDotToFile(path) {
    fs.writeFileSync(path + ".DOT", this.saveDebugDot());
    execSync(`dot -Tpng ${path + ".DOT"} -o ${path + ".png"}`);
  }

  union(...gs: Array<PTAGraph>) {
    let edgeSet: Set<string> = new Set()
    // Create an edgeset for faster checks on edges
    for (let e of this.edges()) edgeSet.add(edgeKey(e, this.edge(e)))

    for (let g of gs) {
      // Add all missing nodes
      for (let n of g.nodes()) {
        if (this.hasNode(n)) continue;
        this.setNode(n);
        this.nodeMap.set(n, g.getPTANode(n))
      }

      // Add all missing edges
      for (let e of g.edges()) {
        let curr = edgeKey(e, g.edge(e));
        if (!edgeSet.has(curr)) this.setEdge(e.v, e.w, g.edge(e), g.edge(e));
        edgeSet.add(curr);
      }
    }
  }

}

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
    globalEnv.addPTANode((new GlobalObject("ENV0$" + o)))
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
    if (!equals(oldGraph, nextGraph)) {
      flowMap.set(currBBIDx, nextGraph);
      let succ = rootFG.successors(currBBIDx)
      if (succ) succ.forEach((bbIdx: BBIdx) => worklist.add(bbIdx))
    }
  }

  if (saveRecording) {
    execSync(`rm outputs/PTA/*.DOT 2>/dev/null`);
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
    else if (n instanceof SymbolNode) res.add(n.id)
    // TODO: Recursion case??? 
    else res.add("*")
  }
  return res
}



function flowFunction(rootFG: IRIDIUM_FG, nextGraph: PTAGraph, currBBIDx: BBIdx) {
  let currBB = rootFG.getBBNode(currBBIDx)

  let stackInstOffset = 0

  let getStackQualifiedName = (lookupID: string): string => {
    let declaredEnv = currBB.env.findEnvContaining(lookupID)
    return "ENV" + declaredEnv.idx + "$" + lookupID
  }

  let getHeapQualifiedName = (heapID: string): string => {
    return "BB" + currBBIDx + "$" + stackInstOffset + "$" + heapID
  }

  let handleRVals = (nextGraph: PTAGraph, rVal: IV_ASSIGNABLE): Array<PTANode> => {
    let res: Set<PTANode> = new Set();

    // IS1_DeclarationStmt
    if (rVal instanceof IV_NUBD) {
      let ID = "NUBD"
      if (!nextGraph.hasNode(ID)) nextGraph.addPTANode(new SymbolNode(ID));
      return [nextGraph.getPTANode(ID)]
    } else if (rVal instanceof IV_Identifier && rVal.name === "undefined") {
      let ID = "undefined"
      if (!nextGraph.hasNode(ID)) nextGraph.addPTANode(new SymbolNode(ID));
      return [nextGraph.getPTANode(ID)]
    } else if (rVal instanceof IV_CTHIS) {
      let ID = "IV_CTHIS"
      if (!nextGraph.hasNode(ID)) nextGraph.addPTANode(new SymbolNode(ID));
      return [nextGraph.getPTANode(ID)]
    } else if (rVal instanceof IV_STHIS) {
      let ID = "IV_STHIS"
      if (!nextGraph.hasNode(ID)) nextGraph.addPTANode(new SymbolNode(ID));
      return [nextGraph.getPTANode(ID)]
    }

    // AMP
    else if (rVal instanceof IV_Identifier) {
      let ID = getStackQualifiedName(rVal.lookupName())
      // Ensure uses are dominated by their defs...
      nextGraph.ensureNode(ID);
      return nextGraph.getPointees(ID)
    } else if (rVal instanceof IV_MemberExpressionPA) {
      return handleMemberLookup(rVal.object.lookupName(), rVal.property.lookupName(), rVal.computed);
    } else if (rVal instanceof IV_ThisLookupPA) {
      return handleMemberLookup(IV_This.lookupName(), rVal.property.lookupName(), rVal.computed);
    } else if (rVal instanceof IV_SuperLookupPA) {
      return handleMemberLookup(ISP_Super.lookupName(), rVal.property.lookupName(), rVal.computed);
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
      let ID = rVal.lookupName()
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
      let ID = rVal.toString()
      if (!nextGraph.hasNode(ID)) nextGraph.addPTANode(new SymbolNode(ID));
      return [nextGraph.getPTANode(ID)]
    }

    // t_IV_Templates
    else if (rVal instanceof IV_TemplateLiteral) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_TemplateLiteral")
    }

    // t_IV_Call
    else if (rVal instanceof IV_ImportCall) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_TemplateLiteral")
    } else if (rVal instanceof IV_Call) {
      // debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_Call")
    } else if (rVal instanceof IV_SuperCall) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_SuperCall")
    } else if (rVal instanceof IV_V8IntrinsicCall) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_V8IntrinsicCall")
    }

    // t_IV_META
    else if (rVal instanceof IV_ModuleMeta) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_ModuleMeta")
    } else if (rVal instanceof IV_NewTarget) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_NewTarget")
    }

    // t_IV_YIELD_AWAIT
    else if (rVal instanceof IV_YIELD) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_YIELD")
    } else if (rVal instanceof IV_AWAIT) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_AWAIT")
    }

    // t_IV_THISEXPRESSION
    else if (rVal instanceof IV_This) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_This")
    }

    // t_IV_BINOP
    else if (rVal instanceof IV_ABINOP) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_ABINOP")
    } else if (rVal instanceof IV_BBINOP) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_BBINOP")
    } else if (rVal instanceof IV_CBINOP) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_CBINOP")
    } else if (rVal instanceof IV_DBINOP) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_DBINOP")
    } else if (rVal instanceof IV_EBINOP) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_EBINOP")
    } else if (rVal instanceof IV_FBINOP) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_FBINOP")
    }

    // t_IV_ASSN
    else if (rVal instanceof IV_SimpleAssn) {
      let res = handleRVals(nextGraph, rVal.RVal)
      handleSimpleAssignmentStatement(nextGraph, rVal.LVal.lookupName(), res)
      return res;
    } else if (rVal instanceof IV_MemberAssn) {
      let res = handleRVals(nextGraph, rVal.RVal)
      handleMemberAssignment(nextGraph, rVal.LVal.object.lookupName(), res, rVal.LVal.property.lookupName(), rVal.LVal.computed)
      return res;
    } else if (rVal instanceof IV_ThisAssn) {
      let res = handleRVals(nextGraph, rVal.RVal)
      handleMemberAssignment(nextGraph, IV_This.lookupName(), res, rVal.LVal.property.lookupName(), rVal.LVal.computed)
      return res;
    } else if (rVal instanceof IV_SuperAssn) {
      let res = handleRVals(nextGraph, rVal.RVal)
      handleMemberAssignment(nextGraph, ISP_Super.lookupName(), res, rVal.LVal.property.lookupName(), rVal.LVal.computed)
      return res;
    } else if (rVal instanceof IV_ArrPatAssn) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_ArrPatAssn")
    } else if (rVal instanceof IV_ObjPatAssn) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_ObjPatAssn")
    }

    // t_IV_ObjectExpression
    else if (rVal instanceof IV_ObjectExpression) {
      // debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_ObjPatAssn")
      let objExprID = getHeapQualifiedName("objExpr")
      let objExprObj = new OrdinaryObject(objExprID)
      if (!nextGraph.hasNode(objExprID)) nextGraph.addPTANode(objExprObj);
      // Process Fields
      let i = 0
      for (let p of rVal.properties) {
        if (p instanceof ISP_ObjectMethod) {
          // Create Function Object
          let methID = getHeapQualifiedName(`meth${i}`)
          let methObj = new OrdinaryFunctionObject(methID)
          if (!nextGraph.hasNode(methID)) nextGraph.addPTANode(methObj);
          // Create link from objExprID to function object
          let dissernedProps: Set<string> = new Set();
          let prop = p.key.lookupName()
          if (p.computed) {
            let propID = getStackQualifiedName(prop)
            nextGraph.ensureNode(propID)
            let propPointees = nextGraph.getPointees(propID)
            dissernedProps = dissernPointees(propPointees)
          } else {
            if (!nextGraph.hasNode(prop)) nextGraph.addPTANode(new SymbolNode(prop));
            dissernedProps.add(prop)
          }
          nextGraph.drawHeapToHeapEdge([objExprObj], [methObj], [...dissernedProps])
        } else if (p instanceof ISP_ObjectProperty) {
          // Get propValuePointees
          let pointees : Array<PTANode>;
          if (p.value instanceof IV_Identifier) {
            pointees = nextGraph.getPointees(getStackQualifiedName(p.value.lookupName()))
          } else {
            pointees = handleRVals(nextGraph, p.value)
          }
          // Create link from objExprID to function object
          let dissernedProps: Set<string> = new Set();
          let prop = p.key.lookupName()
          if (p.computed) {
            let propID = getStackQualifiedName(prop)
            nextGraph.ensureNode(propID)
            let propPointees = nextGraph.getPointees(propID)
            dissernedProps = dissernPointees(propPointees)
          } else {
            if (!nextGraph.hasNode(prop)) nextGraph.addPTANode(new SymbolNode(prop));
            dissernedProps.add(prop)
          }      
          nextGraph.drawHeapToHeapEdge([objExprObj], pointees, [...dissernedProps])
        } else {
          debugConfig.logger.throwIriError("TODO: PTA - RVal - ISP_ArgSpread")
        }
        i++;
      }
      return [objExprObj]
    }

    // t_IV_ArrayExpression
    else if (rVal instanceof IV_ArrayExpression) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_ArrayExpression")
    }

    // t_IV_ConditionalExpression
    else if (rVal instanceof IV_ConditionalExpression) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_ConditionalExpression")
    }

    // t_IV_FunctionExpression
    else if (rVal instanceof IV_FunctionExpression) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_FunctionExpression")
    }

    // t_IV_ArrowFunctionExpression
    else if (rVal instanceof IV_ArrowFunctionExpression) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_ArrowFunctionExpression")
    }

    // t_IV_NewExpression
    else if (rVal instanceof IV_NewExpression) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_NewExpression")
    }

    // t_IV_UnaryExpression
    else if (rVal instanceof IV_AUNOP) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_AUNOP")
    } else if (rVal instanceof IV_BUNOP) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_BUNOP")
    } else if (rVal instanceof IV_CUNOP) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_CUNOP")
    } else if (rVal instanceof IV_DUNOP) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_DUNOP")
    }

    // t_IV_UpdateExpression
    else if (rVal instanceof IV_UpdateExpression) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_UpdateExpression")
    }

    // t_IV_ClassExpression
    else if (rVal instanceof IV_ClassExpression) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_ClassExpression")
    }

    // t_IV_ForIterators
    else if (rVal instanceof IV_InIterator) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_InIterator")
    } else if (rVal instanceof IV_OfIterator) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_OfIterator")
    } else if (rVal instanceof IV_LoopNext) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_LoopNext")
    } else if (rVal instanceof IV_HasLoopNext) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_HasLoopNext")
    }

    // t_IV_JSX
    else if (rVal instanceof IV_PJSX) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_PJSX")
    } else if (rVal instanceof IV_JSX) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_JSX")
    } else if (rVal instanceof IV_FJSX) {
      debugConfig.logger.throwIriError("TODO: PTA - RVal - IV_FJSX")
    }

    return [...res];
  }

  // Handle assignment statements...
  let handleMemberAssignment = (nextGraph: PTAGraph, lVal: string, rValPointees: Array<PTANode>, prop: string, computed: boolean) => {
    let receiverObjID = getStackQualifiedName(lVal)
    nextGraph.ensureNode(receiverObjID)

    let receiverPointees = nextGraph.getPointees(receiverObjID)

    let dissernedProps: Set<string> = new Set();
    if (computed) {
      let propID = getStackQualifiedName(prop)
      nextGraph.ensureNode(propID)
      let propPointees = nextGraph.getPointees(propID)
      dissernedProps = dissernPointees(propPointees)
    } else {
      if (!nextGraph.hasNode(prop)) nextGraph.addPTANode(new SymbolNode(prop));
      dissernedProps.add(prop)
    }

    nextGraph.drawHeapToHeapEdge(receiverPointees, rValPointees, [...dissernedProps])
  }

  let handleMemberLookup = (receiverObj: string, prop: string, computed: boolean) => {
    let receiverObjID = getStackQualifiedName(receiverObj)
    nextGraph.ensureNode(receiverObjID)

    let receiverPointees = nextGraph.getPointees(receiverObjID)
    let dissernedProps: Set<string> = new Set();
    if (computed) {
      let propID = getStackQualifiedName(prop)
      nextGraph.ensureNode(propID)
      let propPointees = nextGraph.getPointees(propID)
      dissernedProps = dissernPointees(propPointees)
    } else {
      if (!nextGraph.hasNode(prop)) nextGraph.addPTANode(new SymbolNode(prop));
      dissernedProps.add(prop)
    }

    let res: Set<PTANode> = new Set();

    for (let r of receiverPointees)
      for (let p of dissernedProps)
        nextGraph.getHeapPointees(r.id, p).forEach(e => res.add(e))

    return [...res];
  }

  // Handle Simple Assignment Statement
  let handleSimpleAssignmentStatement = (nextGraph: PTAGraph, lval: string, rVal: Array<PTANode>) => {
    let stackID = getStackQualifiedName(lval)
    let stackNode = new StackNode(stackID)
    nextGraph.declareNode(stackNode)

    nextGraph.clearSuccessors(stackID)

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
      let rValID = getStackQualifiedName(i.RVal.lookupName())
      nextGraph.ensureNode(rValID)

      let rValPointees = nextGraph.getPointees(rValID)

      handleMemberAssignment(nextGraph, i.obj.lookupName(), rValPointees, i.prop.lookupName(), i.computed);
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

    // console.log(nextGraph.toDot(i.toString()))
  }
}