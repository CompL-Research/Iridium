import debugConfig from "#debugConfig";
import { Graph } from "#graphlib";
import { printScopedSpace, printSpace } from "#utils";
import { IV_Identifier } from "../../ALL_AMP/ALL_AMP.ts";
import { IV_NUBD } from "../../ALL_RVal/IV_NonLang.ts";
import { BB } from "../../BB.ts";
import { Environment } from "../../I_GENERAL/I_Environment.ts";
import { I_Function_params } from "../../I_GENERAL/I_Function.ts";

// List of free variables to ignore
const filterList = [IV_NUBD.lookupName(), "undefined"];

export class IRIDIUM_FG extends Graph {
  rootBB: BB;
  currentBB: BB;
  freeVarWrites: Set<string> = new Set();
  freeVarReads: Set<string> = new Set();

  initArguments(args: I_Function_params) {
    const envInQuestion = this.rootBB.env;
    for (const a of args) {
      if (a instanceof IV_Identifier)
        envInQuestion.declareBinding(
          a.lookupName(),
          undefined,
          this.rootBB,
          "var",
        );
      else
        envInQuestion.declareBinding(
          a.arg.lookupName(),
          undefined,
          this.rootBB,
          "var",
        );
    }
  }

  getName() {
    return `FG_ROOT=BB${this.rootBB.idx}`;
  }

  // Get a mapping of envs to BBs in the flowgraph
  getEnvBBMap(): Map<Environment, Set<BB>> {
    const envs: Map<Environment, Set<BB>> = new Map();
    for (const bb of this.nodes()) {
      const bbNode = this.getBBNode(bb);
      if (!envs.has(bbNode.env)) envs.set(bbNode.env, new Set());
      envs.get(bbNode.env).add(bbNode);
    }
    return envs;
  }

  // Get list of environments local to this closure context
  getEnvs(): Set<Environment> {
    const envs: Set<Environment> = new Set();
    for (const bb of this.nodes()) {
      const bbNode = this.getBBNode(bb);
      if (!envs.has(bbNode.env)) envs.add(bbNode.env);
    }
    return envs;
  }

  // Operates on free variables?
  hasFreeVariables() {
    return (
      [...this.freeVarReads].filter((a) => !filterList.includes(a)).length >
        0 ||
      [...this.freeVarWrites].filter((a) => !filterList.includes(a)).length > 0
    );
  }

  // Methods to set and get BB's from the flowgraph
  declareBBNode(bb: BB) {
    const bbIdx: string = "" + bb.idx;
    this.setNode(bbIdx, bb);
    return bb;
  }

  getBBNode(idx: string | number): BB {
    const bbIdx: string = "" + idx;
    return this.node(bbIdx);
  }

  // Add Edges
  setBBEdge(from: string | number, to: string | number, label: string = "") {
    const fromIdx: string = "" + from;
    const toIdx: string = "" + to;
    this.setEdge(fromIdx, toIdx, label);
  }

  constructor(bb: BB) {
    super({ directed: true });
    this.declareBBNode(bb);
    this.rootBB = bb;
    this.currentBB = bb;
  }

  // Get/Set current BB context
  getCurrentBB() {
    return this.currentBB;
  }
  setCurrentBB(bb: BB) {
    this.currentBB = bb;
  }

  forwardSuccessorsBB(uBB: BB, vBB: BB) {
    const u = "" + uBB.idx;
    const v = "" + vBB.idx;
    this.forwardSuccessors(u, v);
  }

  // Utility methods
  forwardSuccessors(u: string, v: string) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const graph = this;
    if (!graph.hasNode(u) || !graph.hasNode(v)) {
      debugConfig.logger.throwIriError(
        "Both nodes must exist in the graph to be able to forward the successors",
      );
    }
    // Get all successors of node u
    const successors = graph.successors(u) as Array<string>;
    // Redirect each successor of u to v
    successors.forEach((successor) => {
      if (successor !== v) {
        // Avoid self-loops to v
        const edgeData = graph.edge(u, successor); // Preserve edge data
        graph.setEdge(v, successor, edgeData);
      }
      graph.removeEdge(u, successor);
    });
  }

  // Save the IR to a string
  saveIridiumToString(space = 0) {
    const stmts = [];
    const nodes = this.nodes();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;

    nodes.sort((a, b) => {
      const aPred = that.predecessors(a);
      const bPred = that.predecessors(b);
      if (aPred && bPred) {
        return aPred.length - bPred.length;
      }
      return 0;
    });

    stmts.push(
      `${printScopedSpace(space)}🕊️  [${this.hasFreeVariables() ? [...this.freeVarReads, ...this.freeVarWrites].filter((a) => !filterList.includes(a)).join(",") : ""}] `,
    );

    for (const bbIdx of nodes) {
      const bb: BB = this.node(bbIdx);

      // stmts.push(`${printScopedSpace(space)}`)
      const preds = this.predecessors(bbIdx);
      stmts.push(
        `${printScopedSpace(space)}🬕 ${bb.printHeader()} [PRED: ${preds ? preds.map((b) => `BB${b}`).join(", ") : ""}]`,
      );
      stmts.push(bb.toString(space));
      const succs = this.successors(bbIdx);
      stmts.push(
        `${printScopedSpace(space)}🬲 [SUCC: ${succs ? succs.map((b) => `BB${b}`).join(", ") : ""}]`,
      );
    }

    return stmts.join("\n");
  }

  // override the existing implementation for saving DOT
  saveIridiumToDOT(space = 0) {
    const res = [];
    for (const b of this.nodes()) {
      const bb: BB = this.node(b);

      // Declare node and their labels
      res.push(`${printSpace(space)}${bb.toDOT()}`);
    }

    // res.push("  graph [nodesep=1.0, ranksep=1.5]; // Adjust separation")
    for (const e of this.edges()) {
      const startNode = e.v;
      const endNode = e.w;
      const startBB: BB = this.node(startNode);
      const endBB: BB = this.node(endNode);
      res.push(
        `${printSpace(space)}${startBB.printHeaderDOT()} -> ${endBB.printHeaderDOT()};`,
      );
    }

    return res.join("\n");
  }

  // Generate the env edges between nodes
  saveEnvToDOT(space = 0) {
    const res = [];
    for (const b of this.nodes()) {
      const bb: BB = this.node(b);

      // Declare node and their labels
      res.push(
        `${printSpace(space)} ${bb.printHeaderDOT()} -> "${bb.env.getName()}" [dir=none, style="dashed"]`,
      );
    }

    return res.join("\n");
  }
}
