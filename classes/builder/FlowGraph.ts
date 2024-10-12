
import { F_Block } from './IridiumHelpers/Block.ts';
import { handleJS3AllowedProgStatement } from './IridiumHelpers/Statement.ts';
import { JS3File, JS3Program } from './JS3Helpers/JS3Types.ts';

class F_Program {
	sourceType: "script" | "module"
	directives: Array<String>
	body: F_Block
	current: F_Block

	constructor(p: JS3Program) {
		this.sourceType = p.sourceType
		this.directives = new Array()
		p.directives.forEach(d => this.directives.push(d.value.value))
		this.body = new F_Block()
		this.current = this.body
		p.body.forEach(i => { 
      handleJS3AllowedProgStatement.call(this, i)
    })
	}

  toString() : String {
    let res = []
    res.push(`[F_Program]`)
    res.push(`  [Source Type: ${this.sourceType}]`)
    res.push(`  [Directives: ${this.directives.join(" ")}]`)
		const allBlocks = new Set<F_Block>()
		const populateBlocks = (b: F_Block) => {
			if (!allBlocks.has(b)) {
				allBlocks.add(b)
				b.successors.forEach(x => populateBlocks(x))
			}
		}
		populateBlocks(this.body)
		// console.log(allBlocks)
		let sortedBlocks = Array.from(allBlocks)
		sortedBlocks.sort(function(a, b) { 
			return a.idx - b.idx;
		})
	
		sortedBlocks.forEach(b => res.push(b.toString(2)))
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