import { IV_Identifier } from "../../ALL_AMP/ALL_AMP.ts"
import { ISP_ObjectMethod } from "../../ALL_RVal/ALL_ISP.ts";
import { IV_StringLiteral } from "../../ALL_RVal/IV_Literals.ts"

export class PTANode {
  id: string
  constructor(id: string) {
    this.id = id
  }

  toString() : string {
    throw new Error("Expected all extensions of PTANode to override toString")
  }

  dotStyle() : string {
    throw new Error("Expected all extensions of PTANode to override dotStyle")
  }
}

export type Valid_Stack_To_Heap_Pointees = OrdinaryObject | OrdinaryFunctionObject | GlobalNode | ImportNode | LiteralNode;

// 1. StackNode
export class StackNode extends PTANode {
  constructor(id: string) {
    super(id)
  }
  
  toString() {
    return "StackNode"
  }

  dotStyle() {
    return `[xlabel="${this.toString()}"]`
  }
}

// 2. OrdinaryObject
export class OrdinaryObject extends PTANode {
  constructor(id: string) {
    super(id)
  }

  toString() {
    return "OrdinaryObject"
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="square"]`
  }
}

// 3. OrdinaryFunctionObject
export type OrdinaryFunctionObject_meth = ISP_ObjectMethod
export class OrdinaryFunctionObject extends PTANode {
  meth: OrdinaryFunctionObject_meth
  constructor(id: string, meth: OrdinaryFunctionObject_meth) {
    super(id)
    this.meth = meth
  }

  toString() {
    return "OrdinaryFunctionObject"
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="octagon"]`
  }
}

// 4. GlobalNode
export class GlobalNode extends PTANode {
  constructor(id: string) {
    super(id)
  }

  toString() {
    return "GlobalNode"
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="square",style="filled", fillcolor="gray"]`
  }
}

// 5. SetSpecialClosure
export type SetSpecialClosure_meth = ISP_ObjectMethod
export class SetSpecialClosure extends PTANode {
  meth: SetSpecialClosure_meth
  constructor(id: string, meth: SetSpecialClosure_meth) {
    super(id)
    this.meth = meth
  }

  toString() {
    return "SetSpecialClosure"
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="octagon",style="filled", fillcolor="gray"]`
  }
}

// 6. GetSpecialClosure
export type GetSpecialClosure_meth = ISP_ObjectMethod
export class GetSpecialClosure extends PTANode {
  meth: GetSpecialClosure_meth
  constructor(id: string, meth: GetSpecialClosure_meth) {
    super(id)
    this.meth = meth
  }

  toString() {
    return "GetSpecialClosure_meth"
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="octagon",style="filled", fillcolor="gray"]`
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

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="square",style="filled", fillcolor="yellow"]`
  }
}

// 8. PNode: A proxy node that allows us to keep track of enumerable and non-enumerable nodes
export class PNode extends PTANode {
  constructor(id: string) {
    super(id)
  }

  toString() {
    return "PNode"
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="diamond",style="filled", fillcolor="gray"]`
  }
}

// 9. Litearal Node
export class LiteralNode extends PTANode {
  constructor(id: string) {
    super(id)
  }

  toString() {
    return "LiteralNode"
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="rectangle",style="filled", fillcolor="green"]`
  }
}

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
