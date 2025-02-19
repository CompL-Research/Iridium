import debugConfig from "#debugConfig";
import GLIB from "#graphlib";
import { execSync } from "node:child_process";
import fs from "node:fs";
import { IV_CTHIS } from "../../ALL_RVal/IV_NonLang.ts";
import { FunctionReturn } from "../../BB.ts";
import { ContextualPTAHandler } from "../PTA.ts";
import { ClassObject, DummyObject, GetSpecialClosure, GlobalNode, ImportNode, LiteralNode, OrdinaryArrayObject, OrdinaryFunctionObject, OrdinaryObject, PNode, PTANode, SetSpecialClosure, StackNode, Valid_Stack_To_Heap_Pointees } from "./nodes.ts";
import { getStackQualifiedName } from "./util.ts";

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

  removePTANode(n: PTANode) {
    if (this.hasNode(n.id)) return;
    this.removeNode(n.id)
    this.nodeMap.delete(n.id)
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
  drawHeapToHeapEdge(us: Array<Valid_Stack_To_Heap_Pointees>, vs: Array<Valid_Stack_To_Heap_Pointees>, ps: Set<string> | Array<string>, enumerable: boolean): Array<[SetSpecialClosure, Valid_Stack_To_Heap_Pointees, Valid_Stack_To_Heap_Pointees]> {
    let pendingClosures: Array<[SetSpecialClosure, Valid_Stack_To_Heap_Pointees, Valid_Stack_To_Heap_Pointees]> = new Array()
    // Update graph
    for (let p of ps) {
      for (let u of us) {
        for (let v of vs) {
          // 
          // u --p--> [u_p]
          // 
          let pNodeName = u.id + "_" + p;
          if (!this.hasField(u.id, p)) this.addField(u.id, p)

          let pNode = this.getField(u.id, p)

          this.setEdge(u.id, pNodeName, p, p);

          // TODO: prevent hidden/enumerable prop update when its wrong to do so
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

          // Handle closure updates
          if (this.hasClosureSetter(pNode)) {
            let setters = this.getClosureSetters(pNode)
            for (let clos of setters) {
              pendingClosures.push([clos, u, v])
            }
          }
        }
      }
    }

    return pendingClosures;
  }

  // Returns the set of nodes pointed by a stack object
  getPointees(stackId: string): Array<Valid_Stack_To_Heap_Pointees> {
    let succ = this.successors(stackId)
    return succ ? succ.map(n => {
      if (!this.nodeMap.has(n)) debugConfig.logger.throwIriError(`nodemap is missing a node ${n}`);

      let ptaNode = this.nodeMap.get(n)

      // Valid_Stack_To_Heap_Pointees = 
      // OrdinaryObject | OrdinaryFunctionObject | GlobalNode | ImportNode | LiteralNode;

      if (ptaNode instanceof StackNode) {
        debugConfig.logger.throwIriError(`Stack Node is pointing to an invalid node ${stackId} -> ${ptaNode.id}`);
      } else {
        return ptaNode;
      }
    }) : []
  }

  // Get Field 
  hasField(u: string, prop: string) {
    let pNodeName = u + "_" + prop;
    return this.hasNode(pNodeName)
  }

  getFieldPointees(u: PTANode, p: string, iContext: string, onlyEnumerable: boolean = false, includeStartResults : boolean = true): Set<Valid_Stack_To_Heap_Pointees> {

    // 
    //  -- Populate 'result' set with everything from '*'
    //  -- If field 'p' exists:
    //    -- add pointees to 'result'
    //  -- Else:
    //    -- It is possible we are already a dummy, in which case create a self loop unto thyself.
    //      -- add thyself to the result set.
    //    -- Else: declare a dummy with appropritate level and add it to 'result'
    //  -- Filter results from closures
    //  -- Evaluate closures
    //  
    let initialPointees: Set<Valid_Stack_To_Heap_Pointees> = new Set();

    let getPointeesFromPNode = (p: PNode) => {
      let outEdges = this.outEdges(p.id);
      let res : Set<PTANode> = new Set();
      if (outEdges) {
        for (let e of outEdges) {
          if (onlyEnumerable && e.name === "h") continue; // skip non-enumerable edges
          res.add(this.getPTANode(e.w));
        }
      }
      return res;
    };

    // '*'
    let starField = '*';
    if (!this.hasField(u.id, starField)) {
      this.addField(u.id, starField);
      this.setEdge(u.id, this.getField(u.id, starField).id, starField, starField);
    }
    let starPNode = this.getField(u.id, starField);
    if (!includeStartResults) {
      let starPointees = getPointeesFromPNode(starPNode);
      starPointees.forEach(sp => initialPointees.add(sp));
    }

    // Field 'p'
    if (this.hasField(u.id, p)) {
      let pNode = this.getField(u.id, p);
      let fieldPointees = getPointeesFromPNode(pNode);
      fieldPointees.forEach(fp => initialPointees.add(fp));
    } else {
      if (u.dummyLevel <= PTANode.DUMMY_THRESHOLD) {
        this.addField(u.id, p);
        this.setEdge(u.id, this.getField(u.id, p).id, p, p);
        let pNode = this.getField(u.id, p);
        
        let dummyObj = new DummyObject(pNode.id + ":" + (u.dummyLevel + 1));
        dummyObj.dummyLevel = u.dummyLevel + 1;
        this.declareNode(dummyObj);

        this.setEdge(pNode.id, dummyObj.id, 'e', 'e');
        initialPointees.add(dummyObj);
      } else {
        // Create a self loop unto thyself
        this.setEdge(starPNode.id, u.id, 'e', 'e');
        initialPointees.add(u);
      }
    }

    let res: Set<Valid_Stack_To_Heap_Pointees> = new Set();
    let initialPointeesArr = [...initialPointees];
    let pendingClosures: Array<[GetSpecialClosure, Valid_Stack_To_Heap_Pointees]> = initialPointeesArr.filter(f => f instanceof GetSpecialClosure).map(e => [e, u]);
    initialPointeesArr.filter(f => !(f instanceof GetSpecialClosure || f instanceof SetSpecialClosure)).forEach(p => res.add(p));

    // Process delayed closures
    let closureResults: Array<PTAGraph> = new Array()
    for (let [clos, objContext] of pendingClosures) {
      let nextt = new PTAGraph()
      nextt.union(this)

      let closureGraph = clos.meth.funBody

      // set THIS pointer to objContext
      let cThisLookupName = getStackQualifiedName(IV_CTHIS.lookupName(), closureGraph.rootBB)
      let contextualThis = new StackNode(cThisLookupName)
      nextt.addPTANode(contextualThis)
      nextt.drawStackToHeapEdge(contextualThis, [objContext])

      nextt = ContextualPTAHandler(objContext.id, iContext, nextt, closureGraph); // Save the sink...

      let sinks = closureGraph.sinks()
      if (sinks.length !== 1) debugConfig.logger.throwIriError(`Sinks length !== 1, found ${sinks.length}`);

      let sink = sinks[0];
      let sinkBB = closureGraph.getBBNode(sink);

      // Point to all stuff the return can point to
      if (sinkBB instanceof FunctionReturn) {
        let argLookupName = getStackQualifiedName(sinkBB.arg.lookupName(), sinkBB)
        let pointees = nextt.getPointees(argLookupName)
        for (let p of pointees) res.add(p);
      } else debugConfig.logger.throwIriError(`Expected sinks to be Function Returns in closures!!! found ${sinkBB.scope}`);

      closureResults.push(nextt)
    }

    // Merge closure results
    this.union(...closureResults)

    return res;
  }

  // Add Field 
  addField(u: string, prop: string) {
    let pNodeName = u + "_" + prop;
    this.addPTANode(new PNode(pNodeName))
  }

  // Get Field 
  getField(u: string, prop: string): PNode {
    let pNodeName = u + "_" + prop;
    this.ensureNode(pNodeName)
    let res = this.nodeMap.get(pNodeName)
    if (!(res instanceof PNode)) debugConfig.logger.throwIriError("PNode type is wrong")
    return res
  }


  // Has closure getter?
  hasClosureGetter(n: PNode) {
    let es = this.outEdges(n.id)
    if (es) {
      for (let e of es) {
        let w = this.nodeMap.get(e.w)
        if (w instanceof GetSpecialClosure) return true;
      }
    }
    return false;
  }

  // Has closure getter?
  getClosureGetters(n: PNode): Set<GetSpecialClosure> {
    let res: Set<SetSpecialClosure> = new Set()
    let es = this.outEdges(n.id)
    if (es) {
      for (let e of es) {
        let w = this.nodeMap.get(e.w)
        if (w instanceof GetSpecialClosure) res.add(w);
      }
    }
    if (res.size === 0) debugConfig.logger.throwIriError("Trying to get setters when no setters exiast");
    return res;
  }

  // Has closure setter?
  hasClosureSetter(n: PNode) {
    let es = this.outEdges(n.id)
    if (es) {
      for (let e of es) {
        let w = this.nodeMap.get(e.w)
        if (w instanceof SetSpecialClosure) return true;
      }
    }
    return false;
  }

  // Has closure setter?
  getClosureSetters(n: PNode): Set<SetSpecialClosure> {
    let res: Set<SetSpecialClosure> = new Set()
    let es = this.outEdges(n.id)
    if (es) {
      for (let e of es) {
        let w = this.nodeMap.get(e.w)
        if (w instanceof SetSpecialClosure) res.add(w);
      }
    }
    if (res.size === 0) debugConfig.logger.throwIriError("Trying to get setters when no setters exiast");
    return res;
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
    try {
      fs.writeFileSync(path + ".DOT", this.saveDebugDot());
    } catch (err) {
      console.error('File write failed:', err);
    }

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