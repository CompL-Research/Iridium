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
class F_Block  {
	meta: F_BlockMeta
	instructions: Array<F_Instruction>
	successors: Array<F_Block>
	predecessors: Array<F_Block> 

	constructor() {
		this.meta = new F_BlockMeta()
		this.instructions = new Array()
		this.successors = new Array()
		this.predecessors = new Array()
	}

	setSuccessors(s: Array<F_Block>) {
		this.successors = s
	}

	getSuccessors(s: Array<F_Block>) {
		return this.successors
	}

	setPredecessors(p: Array<F_Block>) {
		this.predecessors = p
	}

	getPredecessors(s: Array<F_Block>) {
		return this.predecessors
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

}
