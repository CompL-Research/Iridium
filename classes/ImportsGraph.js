import shell from 'shelljs'
import fs from 'fs'

import debugConfig from '../configs/debug.js'

export class ImportsGraph {
  #nodes
  #libraryNodes
  #edges
  constructor() {
    this.#nodes = new Set()
    this.#libraryNodes = new Set()
    this.#edges = {}
  }

  getNodes() {
    return this.#nodes
  }

  getEdges() {
    return this.#edges
  }

  addNode(n) {
    // console.log("Adding Node", n)
    this.#nodes.add(n)
    if (!(n in this.#edges)) {
      this.#edges[n] = new Set()
    }
  }

  addLibraryNode(n) {
    this.#nodes.add(n)
    this.#libraryNodes.add(n)
    if (!(n in this.#edges)) {
      this.#edges[n] = new Set()
    }
  }

  addEdge(n, m) {
    // console.log("Adding Edge: ", n, m)
    this.#nodes.add(n); this.#nodes.add(m); // Ensure the nodes are declared
    
    if (n in this.#edges) {
      this.#edges[n].add(m)
    } else {
      this.#edges[n] = new Set()
      this.#edges[n].add(m)
    }
  }

  getNodesWithNoIncomingEdges() {
    // Might be slowwww....
    const nodes = this.#nodes
    const edges = this.#edges
    let setOfNodesWithIncomingEdges = new Set()
    nodes.forEach(n => {
      edges[n].forEach(m => setOfNodesWithIncomingEdges.add(m))
    })
    var diff = Array.from(nodes).filter(function (x) {
      return !setOfNodesWithIncomingEdges.has(x);
    });
    return diff
  }

  dumpDOT() {

    const toMark = this.getNodesWithNoIncomingEdges()

    var stream = fs.createWriteStream(debugConfig.outputsPath + "/" + 'moduleGraph.DOT', { flags: 'w' });
    stream.write("digraph {\n")
    stream.write("  beautify=true;\n")
    this.#nodes.forEach(n => {
      if (toMark.includes(n)) {
        stream.write(`  "${n}"[shape=rectangle, fillcolor=green, style="rounded,filled"];\n`)
      } else if (this.#libraryNodes.has(n)) {
        stream.write(`  "${n}"[shape=rectangle, fillcolor=red, style="rounded,filled"];\n`)

      } else {
        stream.write(`  "${n}"[shape=rectangle, style="rounded"];\n`)
      }
    })

    for (let key in this.#edges) {
      if (this.#edges.hasOwnProperty(key)) { // Ensure it's not iterating over prototype properties
        let nn = this.#edges[key]
        nn.forEach(m => stream.write(`  "${key}" -> "${m}";\n`))
      }
    }


    stream.write("}")

    stream.close(() => {
      if (debugConfig.printModuleGraphPng) {
        shell.exec(`dot -Grankdir=TB -Gnodesep=1.0 -Granksep=1.0 -Gconcentrate=true -Gsplines=true -Tpng ${debugConfig.outputsPath + "/" + 'moduleGraph.DOT'} > ${debugConfig.outputsPath + "/" + 'moduleGraph.png'}`)
      }
    });

  }
}