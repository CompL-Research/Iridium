import { F_Instruction, F_Value, KEYWORDS } from './General.ts'
import * as t from '@babel/types'

export class V_BindingImport extends F_Value {
	source: String
	binding: String
	constructor(n: t.Node, source: String, binding: String) {
		super(n)
		this.source = source
		this.binding = binding
	}

	toString() {
		return `${KEYWORDS.binding_import} "${this.binding}" "${this.source}"`
	}
}


// 1. import "source"
export class F_EffectfulImport extends F_Instruction {
	source: String
	constructor(n: t.Node, source: String) {
		super(n, "F_EffectfulImport")
		this.source = source
	}
	toString() {
		return `${KEYWORDS.effectful_import} "${this.source}"`
	}
}
const isF_EffectfulImport = (node: any): node is F_EffectfulImport => node && node.tag === "F_EffectfulImport"

// 2. 
// import x from "source"
// import { x as y } from "source"
export class F_Import extends F_Instruction {
	left: String
	right: V_BindingImport
	constructor(n: t.Node, local: String, binding: String, source: String) {
		super(n, "F_Import")
		this.left = local
		this.right = new V_BindingImport(n, source, binding)
	}

	toString() {
		return `${this.left} = ${this.right.toString()}`
	}
}
export const isF_Import = (node: any): node is F_Import => node && node.tag === "F_Import"

// 4. import * as x from "source"
export class V_NSImport extends F_Value {
	source: String
	constructor(n: t.Node, source: String) {
		super(n)
		this.source = source
	}

	toString() {
		return `${KEYWORDS.ns_import} "${this.source}"`
	}
}

export class F_ImportNS extends F_Instruction {
	left: String
	right: V_NSImport
	constructor(n: t.Node, local: String, source: String) {
		super(n, "F_ImportNS")
		this.left = local
		this.right = new V_NSImport(n, source)
	}
	toString() {
		return `${this.left} = ${this.right.toString()}`
	}
}
export const isF_ImportNS = (node: any): node is F_ImportNS => node && node.tag === "F_ImportNS"
