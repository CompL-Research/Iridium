import { F_Instruction } from "./General.ts"


// 
// Block Metadata:
// 	1. isLoopHead: This block is a loop head
// 	2. isContainedExpression: This block is a contained expression
// 

class F_BlockMeta {
	// Info about how this block was created
	isLoopHead: Boolean
	isContainedExpression: Boolean
	
	// Useful information that we can calculate about the block
	usesThisContext: Boolean
	createsThisContext: Boolean // For example, arrow functions do not create a new this context, whereas classes and functions do.
	
	// Pointer to a parent block
	lexicalScope: F_Block

	constructor() {
		this.isLoopHead = false;
		this.isContainedExpression = false;

		this.usesThisContext = false;
		this.createsThisContext = false;

		this.lexicalScope = null
	}
}

// 
// A Block contains:
// 	1. meta: Metadata about the block
// 	2. instructions: This contains the instructions
//  3. outgoing: Outgoing edges
//  4. incoming: Incoming edges
// 	5. 
// 
export class F_Block  {
  static id = 0
  idx
	name: undefined | String
	meta: F_BlockMeta
	instructions: Array<F_Instruction>
	successors: Set<F_Block>
	predecessors: Set<F_Block> 

	constructor() {
    this.idx = F_Block.id++
		this.meta = new F_BlockMeta()
		this.instructions = new Array()
		this.successors = new Set()
		this.predecessors = new Set()
	}

  pushInstruction(i : F_Instruction) {
    this.instructions.push(i)
  }

	markAsLoopHead() {
		return this.meta.isLoopHead = true
	}

	isLoopHead() {
		return this.meta.isLoopHead 
	}

	markAsContainedExpression() {
		return this.meta.isContainedExpression = true
	}

	isContainedExpression() {
		return this.meta.isContainedExpression 
	}

  toString(space = 0) {
    let res = []
		let preds = ""
		this.predecessors.forEach(p => {
			preds += `BB${p.idx} `
		})

		let succs = ""
		this.successors.forEach(s => {
			succs += `BB${s.idx} `
		})
    res.push(`${" ".repeat(space)}BB${this.idx} ${this.name ? `(${this.name})` : ""}: ${preds}`)
    for (let i of this.instructions) {
      res.push(`${" ".repeat(space+2)}${i.toString()}`)
    }
		res.push(`${" ".repeat(space+2)}__SUCC__: ${succs}`)
    return res.join("\n")
  }

}

export function createBackLink(from: F_Block, to: F_Block) {
	from.successors.add(to)
	to.predecessors.add(from)
}
