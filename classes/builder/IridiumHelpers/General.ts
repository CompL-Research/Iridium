import * as t from '@babel/types'

//
// An instruction of the form: a = F_Value
//
export class F_Instruction {
	tag: String
	node: t.Node
	effects: {}

	constructor(n: t.Node, tag: String) {
		this.node = n
		this.tag = tag
		this.effects = {}
	}
}

//
// A value: one of literal, identifier, etc...
//
export class F_Value {
	node: t.Node
	constructor(n: t.Node) {
		this.node = n
	}
}

export const KEYWORDS = {
	effectful_import: "EFF_IMPORT",
	default_import: "DEF_IMPORT",
	binding_import: "BIN_IMPORT",
	ns_import: "NS_IMPORT"
	
}