import { IV_Identifier } from "../../ALL_AMP/ALL_AMP.ts"
import { IV_StringLiteral } from "../../ALL_RVal/IV_Literals.ts"

export class PTANode {
  id: string
  constructor(id: string) {
    this.id = id
  }
}

export type Valid_Stack_To_Heap_Pointees = OrdinaryObject | OrdinaryFunctionObject | GlobalNode | ImportNode | LiteralNode;

// 1. StackNode
export class StackNode extends PTANode {
  constructor(id: string) {
    super(id)
  }
}

// 2. OrdinaryObject
export class OrdinaryObject extends PTANode {
  constructor(id: string) {
    super(id)
  }
}

// 3. OrdinaryFunctionObject
export class OrdinaryFunctionObject extends PTANode {
  constructor(id: string) {
    super(id)
  }
}
// 4. GlobalNode
export class GlobalNode extends PTANode {
  constructor(id: string) {
    super(id)
  }
}

// 5. SetSpecialClosure
export class SetSpecialClosure extends PTANode {
  constructor(id: string) {
    super(id)
  }
}

// 6. GetSpecialClosure
export class GetSpecialClosure extends PTANode {
  constructor(id: string) {
    super(id)
  }
}

// 7. ImportNode
export class ImportNode extends PTANode {
  remote: IV_Identifier | IV_StringLiteral
  FROM: IV_StringLiteral
  constructor(id: string, remote: IV_Identifier | IV_StringLiteral, FROM: IV_StringLiteral) {
    super(id)
    this.remote = remote
    this.FROM = FROM
  }

  toString() {
    return `${this.remote.toString()} from ${this.FROM.toString()}`
  }
}

// 8. PNode: A proxy node that allows us to keep track of enumerable and non-enumerable nodes
export class PNode extends PTANode {
  constructor(id: string) {
    super(id)
  }
}

// 9. Litearal Node
export class LiteralNode extends PTANode {
  constructor(id: string) {
    super(id)
  }
}


// 
// Heap Nodes
// 



// 
// Literals
// 


export class DecimalNode extends LiteralNode {
  constructor(id: string) {
    super(id)
  }
}

export class BigIntNode extends LiteralNode {
  constructor(id: string) {
    super(id)
  }
}

export class StringNode extends LiteralNode {
  constructor(id: string) {
    super(id)
  }
}

export class NumericNode extends LiteralNode {
  constructor(id: string) {
    super(id)
  }
}

export class NullNode extends LiteralNode {
  constructor(id: string) {
    super(id)
  }
}

export class BooleanNode extends LiteralNode {
  constructor(id: string) {
    super(id)
  }
}

export class SymbolNode extends LiteralNode {
  constructor(id: string) {
    super(id)
  }
}
