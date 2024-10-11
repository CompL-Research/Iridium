import _generator from "@babel/generator"
import assert from 'node:assert/strict'
import { Project } from '../Project.ts'
import { ProjectFile } from '../ProjectFile.ts'
import { JS3Module } from './JS3Module.ts'

const generator = _generator["default"]


import debugConfig from "#debugConfig"
import JS3Builder from "./JS3Builder.ts"
import { JS3File } from "./JS3Helpers/JS3Types.ts"
import { FlowGraph } from "./FlowGraph.ts"

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