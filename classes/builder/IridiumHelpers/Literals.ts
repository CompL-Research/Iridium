import { F_Instruction, F_Value, KEYWORDS } from './General.ts'
import * as t from '@babel/types'
import debugConfig from "#debugConfig";
import { JS3RegExpLiteral } from '../JS3Helpers/JS3Types.ts';
import assert from 'node:assert/strict'

// 
// Literals
// 
class F_DecimalLiteral extends F_Value { // Experimental 'decimal' plugin 
	value: String
	constructor(n: t.DecimalLiteral) {
		super(n)
		this.value = n.value
    debugConfig.logger.error("[experimental plugin] decimal not handled")
    assert(false)
	}
}

class F_BigIntLiteral extends F_Value {
  value: String
	constructor(n: t.BigIntLiteral) {
		super(n)
		this.value = n.value
	}
  
  toString() {
    return `${this.value}n`;
  }
}

class F_StringLiteral extends F_Value {
	value: String
	constructor(n: t.StringLiteral) {
		super(n)
		this.value = n.value
	}
  
  toString() {
    return `"${this.value}"`;
  }
}

class F_NumericLiteral extends F_Value {
	value: number
	constructor(n: t.NumericLiteral) {
		super(n)
		this.value = n.value
	}
  
  toString() {
    return `${this.value}`;
  }
}

class F_NullLiteral extends F_Value {
	constructor(n: t.NullLiteral) {
		super(n)
	}
  
  toString() {
    return "null";
  }
}

class F_BooleanLiteral extends F_Value {
  value: boolean

	constructor(n: t.BooleanLiteral) {
		super(n)
    this.value = n.value
	}
  
  toString() {
    return `${this.value}`;
  }
}

class F_RegExpLiteral extends F_Value {
  pattern: String
  flags: String

	constructor(n: JS3RegExpLiteral) {
		super(n)
    this.pattern = n.pattern
    this.flags = n.flags
	}
  
  toString() {
    return `/${this.pattern}/${this.flags}`;
  }
}