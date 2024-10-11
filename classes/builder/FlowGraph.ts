
import * as t from '@babel/types'
import { isJS3ImportDeclaration, JS3File, JS3AllowedProgStatement, JS3Program, JS3ImportDeclaration, JS3RegExpLiteral, isJS3ExportDefaultDeclaration, isJS3ExportNamedDeclaration, isJS3ExportAllDeclaration } from './JS3Helpers/JS3Types.ts'
import assert from 'node:assert/strict'
import debugConfig from "#debugConfig";
import { F_EffectfulImport, F_Import, F_ImportNS } from './IridiumHelpers/Imports.ts';
import { F_Instruction, F_Unhandled } from './IridiumHelpers/General.ts';

class F_Program {
	sourceType: "script" | "module"
	directives: Array<String>
	body: Array<F_Instruction>

	constructor(p: JS3Program) {
		this.sourceType = p.sourceType
		this.directives = new Array()
		p.directives.forEach(d => this.directives.push(d.value.value))
		this.body = new Array()
		p.body.forEach(i => { this.body.push(this.handleAllowedStatement(i)) })
	}

	handleAllowedStatement(n: JS3AllowedProgStatement) : F_Instruction {
		// Handle each case here
		if (isJS3ImportDeclaration(n)) {
			if (n.specifiers.length === 0) {
				return new F_EffectfulImport(n, n.source.value)
			} else {
				// Assert JS3 Spec
				assert(n.specifiers.length === 1)
				let specifier = n.specifiers[0]
				if (t.isImportNamespaceSpecifier(specifier)) {
					return new F_ImportNS(n, specifier.local.name, n.source.value)
				} else if (t.isImportDefaultSpecifier(specifier)) {
          return new F_Import(n, specifier.local.name, "default", n.source.value)
				} else if (t.isImportSpecifier) {
					if (t.isIdentifier(specifier.imported))
						return new F_Import(n, specifier.local.name, specifier.imported.name, n.source.value)
					else
						return new F_Import(n, specifier.local.name, specifier.imported.value, n.source.value)
				}
			}
		} else if (isJS3ExportDefaultDeclaration(n)) {
			debugConfig.logger.throwIriError("[Iridium] unhandled Export Default Declaration")
		} else if (isJS3ExportNamedDeclaration(n)) {
			debugConfig.logger.throwIriError("[Iridium] unhandled Export Named Declaration")
		} else if (isJS3ExportAllDeclaration(n)) {
			debugConfig.logger.throwIriError("[Iridium] unhandled Export All Declaration")
		} else {
      debugConfig.logger.throwIriError(`[Iridium] Unhandled ${n.type}`, [n])
      // @ts-ignore
      return new F_Unhandled(n)
    }
	}

  toString() : String {
    let res = []
    res.push(`[F_Program]`)
    res.push(`  Source Type: ${this.sourceType}`)
    res.push(`  Directives: ${this.directives.join(" ")}`)
    let count = 0
    for (let i of this.body) {
      res.push(`  [${count++}] ${i.toString()}`)
    }
    return res.join("\n")
  }
}

export class FlowGraph {
	fileASTNode: JS3File
	graph: F_Program
	
	constructor(f: JS3File) {
		this.fileASTNode = f
    this.generateFlowGraph()
	}

	generateFlowGraph() {
		const program : JS3Program = this.fileASTNode.program
		this.graph = new F_Program(program)
	}

  toString() {
    return this.graph.toString()
  }

	// Methods exposed to iterate/analyze the flow graph here...
}