import shell from 'shelljs'
import fs from 'fs'

import debugConfig from '../configs/debug.js'
import assert from 'node:assert/strict'
import t from "@babel/types"
import { ProjectFile } from './ProjectFile.js'

export class NodeProp {
  shape: string = "rectangle"
  style: string = "rounded"
  fillcolor: string = "white"
  sourceFile: ProjectFile | null = null

  dumpToStream(stream: fs.WriteStream, node: string, space = 0) {
    for (let i = 0; i < space; i++) stream.write(" ");
    stream.write(`"${node}"[shape="${this.shape}", fillcolor="${this.fillcolor}", style="${this.style}"];\n`)
  }
}

export class EdgeProp {
  style: string = "solid"
  color: string = "black"
  label: string = ""

  dumpToStream(stream: fs.WriteStream, n: string, m: string, space = 0) {
    for (let i = 0; i < space; i++) stream.write(" ");
    stream.write(`"${n}" -> "${m}" [label="${this.label}", style="${this.style}", color="${this.color}"];\n`)
  }

}

export class ImportsGraph {
  #nodes: Set<string>
  #edges: Map<string, Set<string>>
  #nodeProp: Map<string, NodeProp>
  #edgeProp: Map<string, EdgeProp>
  rootNodes: Array<string>

  constructor() {
    this.#nodes = new Set()
    this.#edges = new Map()
    this.#nodeProp = new Map()
    this.#edgeProp = new Map()
  }

  getNodes() {
    return this.#nodes
  }

  getEdges() {
    return this.#edges
  }

  getNodeProp(n) {
    if (!this.#nodeProp.has(n)) {
      this.#nodeProp.set(n, new NodeProp())
    }
    return this.#nodeProp.get(n)
  }

  addNode(n) {
    if (!this.#nodes.has(n)) this.#nodes.add(n)
    if (!this.#edges.has(n)) this.#edges.set(n,new Set())
  }

  addEdge(n, m) {
    this.addNode(n); this.addNode(m);
    this.#edges.get(n)?.add(m)
  }

  getEdgeProp(n, m) {
    const key = n + m
    if (!this.#edgeProp.has(key)) {
      this.#edgeProp.set(key, new EdgeProp())
    }
    return this.#edgeProp.get(key)
  }

  generateRootNodes() {
    // Might be slowwww....
    const nodes = this.#nodes
    const edges = this.#edges
  
    // Union of all right side sets
    const setOfNodesWithIncomingEdges = new Set()
    nodes.forEach(n => edges.get(n)?.forEach(m => setOfNodesWithIncomingEdges.add(m)))
  
    // Set difference -> Root Nodes
    this.rootNodes = Array.from(nodes).filter(x => !setOfNodesWithIncomingEdges.has(x));
  }

  colorRootNodes() {
    const that = this
    this.rootNodes.forEach(n => {
      const nProp = that.getNodeProp(n)
      if (nProp) {
        nProp.style = "rounded,filled"
        nProp.fillcolor = "green"
      }
      else assert(false)
    })
  }

  dump() {
    console.log(this.#edges)
  }

  dumpDOT() {
    const that = this

    var stream = fs.createWriteStream(debugConfig.outputsPath + "/" + 'moduleGraph.DOT', { flags: 'w' });
    stream.write("digraph {\n")
    stream.write("  beautify=true;\n")

    this.#nodes.forEach((n) => {
      const nProp = that.getNodeProp(n)
      if (nProp) nProp.dumpToStream(stream, n, 2)
      else assert(false)
    })


    for (const [n, adjSet] of this.#edges) {
      adjSet.forEach(m => {
        const eProp = that.getEdgeProp(n, m)
        if (eProp) eProp.dumpToStream(stream, n, m, 2)
        else assert(false)
      })
    }

    stream.write("}")

    stream.close(() => {
      if (debugConfig.printModuleGraphPng) {
        shell.exec(`dot -Grankdir=TB -Gnodesep=1.0 -Granksep=1.0 -Gconcentrate=true -Gsplines=true -Tpng ${debugConfig.outputsPath + "/" + 'moduleGraph.DOT'} > ${debugConfig.outputsPath + "/" + 'moduleGraph.png'}`)
      }
    });

  }
}