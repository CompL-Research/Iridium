import * as t from '@babel/types'
import debugConfig from "#debugConfig";

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

  toString() {
    debugConfig.logger.throwIriError(`All Iridium Instructions must override the toString method: ${this.tag}`)
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
	binding_import: "BIN_IMPORT",
	ns_import: "NS_IMPORT",
  unhandled: "UNHANDLED"
	
}

//
// Unhandled
//
export class F_Unhandled extends F_Instruction {
	constructor(n: t.Node) {
    super(n, "F_Unhandled")
	}

  toString() {
    return `${KEYWORDS.unhandled} { type: ${this.node.type} }`
  }
}