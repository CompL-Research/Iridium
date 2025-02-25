import debugConfig from "#debugConfig";
import GLIB, { Edge } from "#graphlib";
import fs from "node:fs";
import { IV_CTHIS } from "../../ALL_RVal/IV_NonLang.ts";
import { FunctionReturn } from "../../BB.ts";
import { ContextualPTAHandler } from "../PTA.ts";
import {
  DummyObject,
  GetSpecialClosure,
  PNode,
  PTANode,
  SetSpecialClosure,
  StackNode,
  Valid_Stack_To_Heap_Pointees,
} from "./nodes.ts";
import { getStackQualifiedName } from "./util.ts";
import { execSync } from "node:child_process";

export class PTAGraph extends GLIB.Graph {
  nodeMap: Map<string, PTANode> = new Map();

  constructor() {
    super({ directed: true, multigraph: true });
  }

  declareNode(node: PTANode) {
    this.setNode(node.id);
    this.nodeMap.set(node.id, node);
  }

  ensureNode(lookupID: string): PTANode {
    if (!this.hasNode(lookupID) || !this.nodeMap.has(lookupID))
      debugConfig.logger.throwIriError(
        `Expected all uses to be dominated by their defs, node not found in the graph!!! ${lookupID}`,
      );

    return this.nodeMap.get(lookupID);
  }

  addPTANode(n: PTANode) {
    if (this.hasNode(n.id)) return;
    this.setNode(n.id);
    this.nodeMap.set(n.id, n);
  }

  removePTANodeAndFields(n: PTANode) {
    if (!this.hasNode(n.id)) return;
    const outEdges = this.outEdges(n.id);
    if (outEdges) {
      for (const e of outEdges) {
        const target = this.getPTANode(e.w);
        if (target instanceof PNode) {
          this.removePTANode(target);
        }
      }
    }
    this.removePTANode(n);
  }

  removePTANode(n: PTANode) {
    if (!this.hasNode(n.id)) return;
    this.removeNode(n.id);
    this.nodeMap.delete(n.id);
  }

  // Transfer stack edges from o1 to o2 recursively
  UnifyStackTargets(o1: PTANode, o2: PTANode) {
    const outEdges = this.outEdges(o1.id);
    if (outEdges) {
      for (const e of outEdges) {
        const currentField = e.name;
        // Check if o2 does not have the field...
        if (!this.hasField(o2.id, currentField)) {
          this.addField(o2.id, currentField);
          const o2PNode = this.getField(o2.id, currentField);
          this.setEdge(o2.id, o2PNode.id, currentField, currentField);
          const o1PNode = this.getPTANode(e.w);
          const outEdgesFromO1PNode = this.outEdges(o1PNode.id);
          if (outEdgesFromO1PNode) {
            for (const ee of outEdgesFromO1PNode) {
              this.setEdge(o2PNode.id, ee.w, ee.name, ee.name);
            }
          }
        } else {
          const o1PNode = this.getPTANode(e.w);
          const o2PNode = this.getField(o2.id, currentField);

          const edgesToTransfer: Set<Edge> = new Set();

          const outEdgesFromO1PNode = this.outEdges(o1PNode.id);
          if (outEdgesFromO1PNode) {
            for (const ee of outEdgesFromO1PNode) {
              const w = this.getPTANode(ee.w);
              if (w instanceof DummyObject) {
                const inEdges = this.inEdges(w.id);
                if (inEdges) for (const ff of inEdges) edgesToTransfer.add(ff);
              } else {
                // For non dummy objects, draw an edge from o2Pnode to w
                this.setEdge(o2PNode.id, w.id, ee.name, ee.name);
              }
            }
          }

          const outEdgesFromO2PNode = this.outEdges(o2PNode.id);
          if (outEdgesFromO2PNode) {
            for (const ee of outEdgesFromO2PNode) {
              // Transfer incoming edges
              for (const ff of edgesToTransfer) {
                this.setEdge(ff.v, ee.w, ff.name, ff.name);
              }
            }
          }

          // Recursively unify targets
          if (outEdgesFromO1PNode && outEdgesFromO2PNode) {
            for (const ee of outEdgesFromO1PNode) {
              const xx = this.getPTANode(ee.w);
              if (xx instanceof DummyObject) {
                for (const ff of outEdgesFromO2PNode) {
                  const yy = this.getPTANode(ff.w);
                  this.UnifyStackTargets(xx, yy);
                }
              }
            }
          }
        }
      }
    }
    // # Iterate over all the fields of o1
    // for (f of o1.fields) {
    //   # If o2 does not have the field, create a field and copy over the target object there.
    //   # Else
    //   #   iterate over (o1.f.w's) -> x:
    //   #     If x is Dummy, remember all incoming edges to x that need to be transferred to all nodes o2.f.pointees
    //   #     Else make o2.f... point to w
    //   #     If x is Dummy, UnifyStackTargets(x, each o2.f.pointees)
    //   #
    //   #
    // }
  }

  replacePTANode(oldNode: PTANode, newNode: PTANode) {
    if (!this.hasNode(oldNode.id))
      debugConfig.logger.throwIriError(
        "Expected oldNode to exist when calling replacePTANode",
      );

    this.addPTANode(newNode); // Ensure new node is added

    const outEdges = this.outEdges(oldNode.id);
    // Transfer outgoing edges
    if (outEdges) {
      outEdges.forEach((e) => {
        // If e.w is a Proxy Node, replace the proxy first
        const wNode = this.getPTANode(e.w);
        if (wNode instanceof PNode) {
          this.setEdge(newNode.id, wNode.id, e.name, e.name);

          this.addField(newNode.id, e.name);
          const newPnode = this.getField(newNode.id, e.name);
          this.replacePTANode(wNode, newPnode);
          this.removePTANode(wNode);
          this.setEdge(newNode.id, newPnode.id, e.name, e.name);
        } else {
          this.setEdge(newNode.id, e.w, e.name, e.name);
          this.removeEdge(e.v, e.w, e.name);
        }
      });
    }

    const inEdges = this.outEdges(oldNode.id);
    // Transfer incoming edges
    if (inEdges) {
      inEdges.forEach((e) => {
        this.setEdge(e.v, newNode.id, e.name, e.name);
        this.removeEdge(e.v, e.w, e.name);
      });
    }

    this.removePTANode(oldNode); // Remove old node
  }

  getPTANode(u: string) {
    this.ensureNode(u);
    return this.nodeMap.get(u);
  }

  clearSuccessors(u: string) {
    const succ = this.outEdges(u);
    if (succ) {
      succ.forEach((e) => {
        this.removeEdge(e.v, e.w, e.name);
      });
    }
  }

  edgeKey(edge, label) {
    return `${edge.v}->${edge.w}${label ? `:${label}` : ""}`;
  }

  // Stack to Heap Edge
  drawStackToHeapEdge(
    stackNode: StackNode,
    heapNodes: Array<PTANode> | Set<PTANode>,
  ) {
    heapNodes.forEach((h) => {
      if (h instanceof StackNode)
        debugConfig.logger.throwIriError(
          `Tried to draw a Stack->Stack Edge: ${stackNode.id} --> ${h.id}`,
        );
      this.setEdge(stackNode.id, h.id, "S", "S");
    });
  }

  // Heap to Heap Edge
  drawHeapToHeapEdge(
    us: Array<Valid_Stack_To_Heap_Pointees>,
    vs: Array<Valid_Stack_To_Heap_Pointees>,
    ps: Set<string> | Array<string>,
    enumerable: boolean,
  ): Array<
    [
      SetSpecialClosure,
      Valid_Stack_To_Heap_Pointees,
      Valid_Stack_To_Heap_Pointees,
    ]
  > {
    const pendingClosures: Array<
      [
        SetSpecialClosure,
        Valid_Stack_To_Heap_Pointees,
        Valid_Stack_To_Heap_Pointees,
      ]
    > = [];
    // Update graph
    for (const p of ps) {
      for (const u of us) {
        for (const v of vs) {
          //
          // u --p--> [u_p]
          //
          const pNodeName = u.id + "_" + p;
          if (!this.hasField(u.id, p)) this.addField(u.id, p);

          const pNode = this.getField(u.id, p);

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
            const setters = this.getClosureSetters(pNode);
            for (const clos of setters) {
              pendingClosures.push([clos, u, v]);
            }
          }
        }
      }
    }

    return pendingClosures;
  }

  // Returns the set of nodes pointed by a stack object
  getPointees(stackId: string): Array<Valid_Stack_To_Heap_Pointees> {
    const succ = this.successors(stackId);
    return succ
      ? succ.map((n) => {
          if (!this.nodeMap.has(n))
            debugConfig.logger.throwIriError(`nodemap is missing a node ${n}`);

          const ptaNode = this.nodeMap.get(n);

          // Valid_Stack_To_Heap_Pointees =
          // OrdinaryObject | OrdinaryFunctionObject | GlobalNode | ImportNode | LiteralNode;

          if (ptaNode instanceof StackNode) {
            debugConfig.logger.throwIriError(
              `Stack Node is pointing to an invalid node ${stackId} -> ${ptaNode.id}`,
            );
          } else {
            return ptaNode;
          }
        })
      : [];
  }

  // Get Field
  hasField(u: string, prop: string) {
    const pNodeName = u + "_" + prop;
    return this.hasNode(pNodeName);
  }

  getFieldPointees(
    u: PTANode,
    p: string,
    iContext: string,
    onlyEnumerable: boolean = false,
    includeStartResults: boolean = true,
  ): Set<Valid_Stack_To_Heap_Pointees> {
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
    const initialPointees: Set<Valid_Stack_To_Heap_Pointees> = new Set();

    const getPointeesFromPNode = (p: PNode) => {
      const outEdges = this.outEdges(p.id);
      const res: Set<PTANode> = new Set();
      if (outEdges) {
        for (const e of outEdges) {
          if (onlyEnumerable && e.name === "h") continue; // skip non-enumerable edges
          res.add(this.getPTANode(e.w));
        }
      }
      return res;
    };

    // '*'
    const starField = "*";
    if (!this.hasField(u.id, starField)) {
      this.addField(u.id, starField);
      this.setEdge(
        u.id,
        this.getField(u.id, starField).id,
        starField,
        starField,
      );
    }
    const starPNode = this.getField(u.id, starField);
    if (!includeStartResults) {
      const starPointees = getPointeesFromPNode(starPNode);
      starPointees.forEach((sp) => initialPointees.add(sp));
    }

    // Field 'p'
    if (this.hasField(u.id, p)) {
      const pNode = this.getField(u.id, p);
      const fieldPointees = getPointeesFromPNode(pNode);
      fieldPointees.forEach((fp) => initialPointees.add(fp));
    } else {
      if (u.dummyLevel <= PTANode.DUMMY_THRESHOLD) {
        this.addField(u.id, p);
        this.setEdge(u.id, this.getField(u.id, p).id, p, p);
        const pNode = this.getField(u.id, p);

        const dummyObj = new DummyObject(pNode.id + ":" + (u.dummyLevel + 1));
        dummyObj.dummyLevel = u.dummyLevel + 1;
        this.declareNode(dummyObj);

        this.setEdge(pNode.id, dummyObj.id, "e", "e");
        initialPointees.add(dummyObj);
      } else {
        // Create a self loop unto thyself
        this.setEdge(starPNode.id, u.id, "e", "e");
        initialPointees.add(u);
      }
    }

    const res: Set<Valid_Stack_To_Heap_Pointees> = new Set();
    const initialPointeesArr = [...initialPointees];
    const pendingClosures: Array<
      [GetSpecialClosure, Valid_Stack_To_Heap_Pointees]
    > = initialPointeesArr
      .filter((f) => f instanceof GetSpecialClosure)
      .map((e) => [e, u]);
    initialPointeesArr
      .filter(
        (f) =>
          !(f instanceof GetSpecialClosure || f instanceof SetSpecialClosure),
      )
      .forEach((p) => res.add(p));

    // Process delayed closures
    const closureResults: Array<PTAGraph> = [];
    for (const [clos, objContext] of pendingClosures) {
      let nextt = new PTAGraph();
      nextt.union(this);

      const closureGraph = clos.meth.funBody;

      // set THIS pointer to objContext
      const cThisLookupName = getStackQualifiedName(
        IV_CTHIS.lookupName(),
        closureGraph.rootBB,
      );
      const contextualThis = new StackNode(cThisLookupName);
      nextt.addPTANode(contextualThis);
      nextt.drawStackToHeapEdge(contextualThis, [objContext]);

      nextt = ContextualPTAHandler(
        objContext.id,
        iContext,
        nextt,
        closureGraph,
      ); // Save the sink...

      const sinks = closureGraph.sinks();
      if (sinks.length !== 1)
        debugConfig.logger.throwIriError(
          `Sinks length !== 1, found ${sinks.length}`,
        );

      const sink = sinks[0];
      const sinkBB = closureGraph.getBBNode(sink);

      // Point to all stuff the return can point to
      if (sinkBB instanceof FunctionReturn) {
        const argLookupName = getStackQualifiedName(
          sinkBB.arg.lookupName(),
          sinkBB,
        );
        const pointees = nextt.getPointees(argLookupName);
        for (const p of pointees) res.add(p);
      } else
        debugConfig.logger.throwIriError(
          `Expected sinks to be Function Returns in closures!!! found ${sinkBB.scope}`,
        );

      closureResults.push(nextt);
    }

    // Merge closure results
    this.union(...closureResults);

    return res;
  }

  // Add Field
  addField(u: string, prop: string) {
    const pNodeName = u + "_" + prop;
    this.addPTANode(new PNode(pNodeName));
  }

  // Get Field
  getField(u: string, prop: string): PNode {
    const pNodeName = u + "_" + prop;
    this.ensureNode(pNodeName);
    const res = this.nodeMap.get(pNodeName);
    if (!(res instanceof PNode))
      debugConfig.logger.throwIriError("PNode type is wrong");
    return res;
  }

  // Has closure getter?
  hasClosureGetter(n: PNode) {
    const es = this.outEdges(n.id);
    if (es) {
      for (const e of es) {
        const w = this.nodeMap.get(e.w);
        if (w instanceof GetSpecialClosure) return true;
      }
    }
    return false;
  }

  // Has closure getter?
  getClosureGetters(n: PNode): Set<GetSpecialClosure> {
    const res: Set<SetSpecialClosure> = new Set();
    const es = this.outEdges(n.id);
    if (es) {
      for (const e of es) {
        const w = this.nodeMap.get(e.w);
        if (w instanceof GetSpecialClosure) res.add(w);
      }
    }
    if (res.size === 0)
      debugConfig.logger.throwIriError(
        "Trying to get setters when no setters exiast",
      );
    return res;
  }

  // Has closure setter?
  hasClosureSetter(n: PNode) {
    const es = this.outEdges(n.id);
    if (es) {
      for (const e of es) {
        const w = this.nodeMap.get(e.w);
        if (w instanceof SetSpecialClosure) return true;
      }
    }
    return false;
  }

  // Has closure setter?
  getClosureSetters(n: PNode): Set<SetSpecialClosure> {
    const res: Set<SetSpecialClosure> = new Set();
    const es = this.outEdges(n.id);
    if (es) {
      for (const e of es) {
        const w = this.nodeMap.get(e.w);
        if (w instanceof SetSpecialClosure) res.add(w);
      }
    }
    if (res.size === 0)
      debugConfig.logger.throwIriError(
        "Trying to get setters when no setters exiast",
      );
    return res;
  }

  // For a given heap node, return the objects pointed to by a specific field
  getHeapPointees(heapId: string, prop: string) {
    this.ensureNode(heapId);
    const outEdges = this.outEdges(heapId);
    const res: Set<PTANode> = new Set();
    if (outEdges) {
      for (const e of outEdges) {
        const currE = this.edge(e);
        if (currE === "*" || currE === prop) res.add(this.nodeMap.get(e.w));
      }
    }

    return res;
  }

  // Recorder Methods
  saveDebugDot(): string {
    const res = [];
    res.push("digraph FG {");
    res.push('  node [fontname="Noto Mono"];');
    res.push("  graph [nodesep=1.0, ranksep=1.5]; // Adjust separation");
    for (const [key, value] of this.nodeMap) {
      const processedKey = key.replace(/"/g, '\\"');
      const dotStyle = value.dotStyle();
      res.push(`  "${processedKey}"${dotStyle}`);

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

    for (const e of this.edges()) {
      res.push(
        `  "${e.v.replace(/"/g, '\\"')}" -> "${e.w.replace(/"/g, '\\"')}" [ label="'${e.name.replace(/"/g, '\\"')}'" ];`,
      );
    }

    res.push("}");
    return res.join("\n");
  }

  toDot(graphName = "PTAGraph") {
    const res = [];
    res.push("digraph " + graphName + " {");
    // res.push("  graph [nodesep=1.0, ranksep=1.5]; // Adjust separation")
    for (const e of this.edges())
      res.push(
        "  " +
          e.v +
          " -> " +
          e.w +
          `[ label="'${e.name.replace(/"/g, '\\"')}'" ];`,
      );
    res.push("}");
    return res.join("\n");
  }

  saveDotToFile(path) {
    try {
      fs.writeFileSync(path + ".DOT", this.saveDebugDot());
      execSync(`dot -Tpng ${path + ".DOT"} -o ${path + ".png"}`);
    } catch (err) {
      console.error("File write failed:", err);
    }
  }

  union(...gs: Array<PTAGraph>) {
    const edgeSet: Set<string> = new Set();
    // Create an edgeset for faster checks on edges
    for (const e of this.edges()) edgeSet.add(this.edgeKey(e, this.edge(e)));

    for (const g of gs) {
      // Add all missing nodes
      for (const n of g.nodes()) {
        if (this.hasNode(n)) continue;
        this.setNode(n);
        this.nodeMap.set(n, g.getPTANode(n));
      }

      // Add all missing edges
      for (const e of g.edges()) {
        const curr = this.edgeKey(e, g.edge(e));
        if (!edgeSet.has(curr)) this.setEdge(e.v, e.w, g.edge(e), g.edge(e));
        edgeSet.add(curr);
      }
    }
  }

  equals(graph2: PTAGraph) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const graph1 = this;
    if (
      graph1.nodeCount() !== graph2.nodeCount() ||
      graph1.edgeCount() !== graph2.edgeCount()
    ) {
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
    const edges2Set = new Set(
      edges1.map((e) => this.edgeKey(e, graph1.edge(e))),
    ); // Store edges as keys for O(1) lookup

    if (edges1.length !== graph2.edges().length) {
      return false;
    }

    for (const edge of graph2.edges()) {
      if (
        !edges2Set.has(this.edgeKey(edge, graph2.edge(edge))) ||
        graph1.edge(edge) !== graph2.edge(edge)
      ) {
        return false;
      }
    }

    return true;
  }
}
