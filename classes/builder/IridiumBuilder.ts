import _generator from "@babel/generator"
import assert from 'node:assert/strict'
import { Project } from '../Project.ts'
import { ProjectFile } from '../ProjectFile.ts'
import { JS3Module } from './JS3Module.ts'

const generator = _generator["default"]


import debugConfig from "#debugConfig"
import JS3Builder from "./JS3Builder.ts"

export class IridiumBuilder {
  project: Project
  moduleMap: Map<string, JS3Module>
  constructor(prj: Project) {
    this.project = prj
  }

  start() {
    const that = this
    const project = this.project
    const importsGraph = project.importsGraph
    const rootNodes = importsGraph.rootNodes;
    rootNodes.forEach((f) => {
      const importsGraphProp = importsGraph.getNodeProp(f)
      if (importsGraphProp) {
        if (importsGraphProp.sourceFile) {
          that.handleProjectFile(importsGraphProp.sourceFile)
        } else {
          debugConfig.logger.error(`Project File not found for "${f}"`)
        }
      } else {
        debugConfig.logger.error(`Node Property Missing for "${f}", cannot proceed. Exiting...`)
        assert(false)
      }
    })
  }



  handleProjectFile(file: ProjectFile) {
    // Generate JS3 Module
    debugConfig.logger.log(`[Generating JS3 Module] ${file.relativeFilePath}`)
    const js3Builder = new JS3Builder(file);
    js3Builder.build()
    js3Builder.saveGeneratedFile()
    debugConfig.logger.warn(`\/\/ [Source Code]\n${file.transformedCode}\n`)

    if (js3Builder.generatedProgram !== null) {
      const generatedJS3Program = generator(js3Builder.generatedProgram)
      debugConfig.logger.log(`\/\/ [Genereted Code]\n${generatedJS3Program.code}`, [js3Builder.generatedProgram])
    } else {
      debugConfig.logger.log(`[Iridium Builder] JS3 builder failed!`)
    }
  }
  
}