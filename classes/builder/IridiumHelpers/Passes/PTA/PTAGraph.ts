import debugConfig from "#debugConfig";
import GLIB from "#graphlib";
import { execSync } from "node:child_process";
import fs from "node:fs";
import { BigIntNode, BooleanNode, DecimalNode, GlobalNode, ImportNode, LiteralNode, NullNode, NumericNode, OrdinaryFunctionObject, OrdinaryObject, PNode, PTANode, StackNode, StringNode, SymbolNode, Valid_Stack_To_Heap_Pointees } from "./nodes.ts";

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

  edgeKey(edge, label) {
    return `${edge.v}->${edge.w}${label ? `:${label}` : ""}`;
  }

  // Stack to Heap Edge
  drawStackToHeapEdge(stackNode: StackNode, heapNodes: Array<PTANode>) {
    heapNodes.forEach(h => this.setEdge(stackNode.id, h.id, "S", "S"))
  }

  // Heap to Heap Edge
  drawHeapToHeapEdge(us: Array<Valid_Stack_To_Heap_Pointees>, vs: Array<Valid_Stack_To_Heap_Pointees>, ps: Array<string>, enumerable: boolean) {
    // Update graph
    for (let p of ps) {
      for (let u of us) {
        for (let v of vs) {
          // 
          // u --p--> [u_p]
          // 
          let pNodeName = u.id + "_" + p;
          if (!this.hasNode(pNodeName)) this.addPTANode(new PNode(pNodeName));
          this.setEdge(u.id, pNodeName, p, p);

          if (enumerable) {
            // 
            // u --p--> [u_p] --e--> v
            // 
            this.setEdge(pNodeName, v.id, "e", "e");
          } else {
            // 
            // u --p--> [u_p] --h--> v
            // 
            this.setEdge(pNodeName, v.id, "h", "h");
          }
        }
      }
    }
  }

  // Returns the set of nodes pointed by a stack object
  getPointees(stackId: string): Array<Valid_Stack_To_Heap_Pointees> {
    let succ = this.successors(stackId)
    return succ ? succ.map(n => {
      if (!this.nodeMap.has(n)) debugConfig.logger.throwIriError(`nodemap is missing a node ${n}`);

      let ptaNode = this.nodeMap.get(n)

      // Valid_Stack_To_Heap_Pointees = 
      // OrdinaryObject | OrdinaryFunctionObject | GlobalNode | ImportNode | LiteralNode;

      if (
        ptaNode instanceof OrdinaryObject ||
        ptaNode instanceof OrdinaryFunctionObject ||
        ptaNode instanceof GlobalNode ||
        ptaNode instanceof ImportNode ||
        ptaNode instanceof LiteralNode
      ) {
        return ptaNode
      } else {
        debugConfig.logger.throwIriError(`Stack Node is pointing to an invalid node`);
      }
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
      let processedKey = key.replace(/"/g, '\\"')
      let dotStyle = value.dotStyle()
      res.push(`  "${processedKey}"${dotStyle}`)

      // // Stack Values
      // if (value instanceof StackNode)

      // // Literals
      // else if (value instanceof LiteralNode)
      //   res.push(`  "${processedKey}"[xlabel="${label}",shape="square", style="filled", fillcolor="green"]`)

      // // Literals
      // else if (value instanceof PNode)
      //   res.push(`  "${processedKey}"[xlabel="${label}",shape="doublecircle", style="filled", fillcolor="gray"]`)


      // // Lazy Heap Node
      // else if (value instanceof ImportNode)
      //   res.push(`  "${processedKey}"[xlabel="${label}",shape="square", style="filled", fillcolor="yellow"]`)

      // // Ordinary Object
      // else if (value instanceof OrdinaryObject)
      //   res.push(`  "${processedKey}"[xlabel="${label}",,shape="square", style="filled", fillcolor="gray"]`)

      // // Ordinary Function Object
      // else if (value instanceof OrdinaryFunctionObject)
      //   res.push(`  "${processedKey}"[xlabel="${label}",,shape="octagon", style="filled", fillcolor="gray"]`)

      // // Heap Objects
      // else res.push(`  "${processedKey}"[shape="rectangle"]`)
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
    for (let e of this.edges()) edgeSet.add(this.edgeKey(e, this.edge(e)))

    for (let g of gs) {
      // Add all missing nodes
      for (let n of g.nodes()) {
        if (this.hasNode(n)) continue;
        this.setNode(n);
        this.nodeMap.set(n, g.getPTANode(n))
      }

      // Add all missing edges
      for (let e of g.edges()) {
        let curr = this.edgeKey(e, g.edge(e));
        if (!edgeSet.has(curr)) this.setEdge(e.v, e.w, g.edge(e), g.edge(e));
        edgeSet.add(curr);
      }
    }
  }

  equals(graph2: PTAGraph) {
    let graph1 = this;
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
    const edges2Set = new Set(edges1.map(e => this.edgeKey(e, graph1.edge(e)))); // Store edges as keys for O(1) lookup

    if (edges1.length !== graph2.edges().length) {
      return false;
    }

    for (const edge of graph2.edges()) {
      if (!edges2Set.has(this.edgeKey(edge, graph2.edge(edge))) || graph1.edge(edge) !== graph2.edge(edge)) {
        return false;
      }
    }

    return true;
  }

}