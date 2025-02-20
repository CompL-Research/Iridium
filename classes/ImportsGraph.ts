import fs from "fs";

import debugConfig from "#debugConfig";
import assert from "node:assert/strict";
import { ProjectFile } from "./ProjectFile.js";

export class NodeProp {
  shape: string = "rectangle";
  style: string = "rounded";
  fillcolor: string = "white";
  sourceFile: ProjectFile | null = null;

  getString(node: string, space = 0) {
    let res = "";
    for (let i = 0; i < space; i++) res += " ";
    res += `"${node}"[shape="${this.shape}", fillcolor="${this.fillcolor}", style="${this.style}"];\n`;
    return res;
  }

  dumpToStream(stream: fs.WriteStream, node: string, space = 0) {
    for (let i = 0; i < space; i++) stream.write(" ");
    stream.write(
      `"${node}"[shape="${this.shape}", fillcolor="${this.fillcolor}", style="${this.style}"];\n`,
    );
  }
}

export class EdgeProp {
  style: string = "solid";
  color: string = "black";
  label: string = "";

  getString(n: string, m: string, space = 0) {
    let res = "";
    for (let i = 0; i < space; i++) res += " ";
    res += `"${n}" -> "${m}" [label="${this.label}", style="${this.style}", color="${this.color}"];\n`;
    return res;
  }

  dumpToStream(stream: fs.WriteStream, n: string, m: string, space = 0) {
    for (let i = 0; i < space; i++) stream.write(" ");
    stream.write(
      `"${n}" -> "${m}" [label="${this.label}", style="${this.style}", color="${this.color}"];\n`,
    );
  }
}

export class ImportsGraph {
  #nodes: Set<string>;
  #edges: Map<string, Set<string>>;
  #nodeProp: Map<string, NodeProp>;
  #edgeProp: Map<string, EdgeProp>;
  rootNodes: Array<string>;

  constructor() {
    this.#nodes = new Set();
    this.#edges = new Map();
    this.#nodeProp = new Map();
    this.#edgeProp = new Map();
  }

  getNodes() {
    return this.#nodes;
  }

  getEdges() {
    return this.#edges;
  }

  getNodeProp(n) {
    if (!this.#nodeProp.has(n)) {
      this.#nodeProp.set(n, new NodeProp());
    }
    return this.#nodeProp.get(n);
  }

  addNode(n) {
    if (!this.#nodes.has(n)) this.#nodes.add(n);
    if (!this.#edges.has(n)) this.#edges.set(n, new Set());
  }

  addEdge(n, m) {
    this.addNode(n);
    this.addNode(m);
    this.#edges.get(n)?.add(m);
  }

  getEdgeProp(n, m) {
    const key = n + m;
    if (!this.#edgeProp.has(key)) {
      this.#edgeProp.set(key, new EdgeProp());
    }
    return this.#edgeProp.get(key);
  }

  generateRootNodes() {
    // Might be slowwww....
    const nodes = this.#nodes;
    const edges = this.#edges;

    // Union of all right side sets
    const setOfNodesWithIncomingEdges = new Set();
    nodes.forEach((n) =>
      edges.get(n)?.forEach((m) => setOfNodesWithIncomingEdges.add(m)),
    );

    // Set difference -> Root Nodes
    this.rootNodes = Array.from(nodes).filter(
      (x) => !setOfNodesWithIncomingEdges.has(x),
    );

    debugConfig.logger.log(
      `[Imports Graph] Found ${this.rootNodes.length} root nodes`,
    );
  }

  colorRootNodes() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    this.rootNodes.forEach((n) => {
      const nProp = that.getNodeProp(n);
      if (nProp) {
        nProp.style = "rounded,filled";
        nProp.fillcolor = "green";
      } else assert(false);
    });
  }

  dump() {
    debugConfig.logger.log("ImportsGraph Dump", [this.#edges]);
  }

  getDOT() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    let res = "";

    res += "digraph {\n";
    res += "  beautify=true;\n";

    let rootCluster = "  subgraph cluster_0 {\n";
    rootCluster += `    label="Root Nodes";\n`;

    this.#nodes.forEach((n) => {
      const nProp = that.getNodeProp(n);
      if (this.rootNodes.includes(n)) {
        rootCluster += nProp.getString(n, 4);
      } else if (nProp) {
        res += nProp.getString(n, 2);
      } else assert(false);
    });

    rootCluster += "  }\n";

    res += rootCluster;

    for (const [n, adjSet] of this.#edges) {
      adjSet.forEach((m) => {
        const eProp = that.getEdgeProp(n, m);
        if (eProp) res += eProp.getString(n, m, 2);
        else assert(false);
      });
    }

    res += "}";

    return res;
  }

  dumpDOT() {
    // const that = this
    // fs.writeFileSync(debugConfig.cli.outputsPath + "/" + 'moduleGraph.DOT', this.getDOT())
    // if (debugConfig.printModuleGraphPng) {
    //   shell.exec(`dot -Grankdir=TB -Gnodesep=1.0 -Granksep=1.0 -Gconcentrate=true -Gsplines=true -Tpng ${debugConfig.cli.outputsPath + "/" + 'moduleGraph.DOT'} > ${debugConfig.cli.outputsPath + "/" + 'moduleGraph.png'}`)
    // }
  }
}
