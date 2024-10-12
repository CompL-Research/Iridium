import { FlowGraph } from "./FlowGraph.ts"
import { JS3File } from "./JS3Helpers/JS3Types.ts"

export class IridiumBuilder {
  js3File: JS3File
  flowGraph: FlowGraph
  constructor(js3File: JS3File) {
    this.js3File = js3File
  }
  build() {
    const file = this.js3File
    this.flowGraph = new FlowGraph(file)
  }
  toString() {
    return this.flowGraph.toString()
  }
}