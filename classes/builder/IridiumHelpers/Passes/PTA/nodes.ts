import { ISP_ObjectMethod } from "../../ALL_RVal/ALL_ISP.ts";
import { IV_StringLiteral } from "../../ALL_RVal/IV_Literals.ts";
import debugConfig from "#debugConfig";
import { IV_FunctionExpression } from "../../ALL_RVal/IV_FunctionExpression.ts";
import { IV_ArrowFunctionExpression } from "../../ALL_RVal/IV_ArrowFunctionExpression.ts";
import { I_Container } from "../../I_GENERAL/I_Container.ts";

export class PTANode {
  static DUMMY_THRESHOLD: number = 3;
  dummyLevel: number = 0;
  id: string;
  constructor(id: string) {
    this.id = id;
  }

  toString(): string {
    debugConfig.logger.throwIriError(
      "Expected all extensions of PTANode to override toString",
    );
    return "";
  }

  dotStyle(): string {
    debugConfig.logger.throwIriError(
      "Expected all extensions of PTANode to override dotStyle",
    );
    return "";
  }
}

export type Valid_Stack_To_Heap_Pointees =
  | OrdinaryObject
  | OrdinaryFunctionObject
  | GlobalNode
  | ImportNode
  | LiteralNode;

//
// StackNode
//
export class StackNode extends PTANode {
  constructor(id: string) {
    super(id);
  }

  toString() {
    return "StackNode";
  }

  dotStyle() {
    return `[shape="plain"]`;
  }
}

//
// KnownFunction
//
export class KnownFunctionNode extends PTANode {
  idx: number;
  constructor(id: string, idx: number) {
    super(id);
    this.idx = idx;
  }

  toString() {
    return "KnownFunction";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="octagon",style="filled",fillcolor="orange"]`;
  }
}

//
// ModuleExports
//
export class ModuleExportsNode extends PTANode {
  constructor(id: string) {
    super(id);
  }

  toString() {
    return "ModuleExportsNode";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="rectangle",style="filled",fillcolor="aquamarine"]`;
  }
}

//
// ReactRenderRoot
//
export class ReactRenderRoot extends PTANode {
  constructor(id: string) {
    super(id);
  }

  toString() {
    return "ReactRenderRoot";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="rectangle",style="filled",fillcolor="aquamarine"]`;
  }
}

//
// DummyObject
//
export class DummyObject extends PTANode {
  constructor(id: string) {
    super(id);
  }

  toString() {
    return "DummyObject";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="square",style="filled",fillcolor="orange"]`;
  }
}

//
// PJSXObject
//
export class PJSXObject extends PTANode {
  constructor(id: string) {
    super(id);
  }

  toString() {
    return "PJSXObject";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="square"]`;
  }
}

//
// JSXObject
//
export class JSXObject extends PTANode {
  constructor(id: string) {
    super(id);
  }

  toString() {
    return "JSXObject";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="square"]`;
  }
}

//
// FJSXObject
//
export class FJSXObject extends PTANode {
  constructor(id: string) {
    super(id);
  }

  toString() {
    return "FJSXObject";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="square"]`;
  }
}

//
// CSepObject
//
export class CSepObject extends PTANode {
  constructor(id: string) {
    super(id);
  }

  toString() {
    return "CSepObject";
  }

  dotStyle() {
    return `[xlabel="${this.id.replace(/"/g, '\\"')}",label="",shape="doublecircle",style="filled", fillcolor="yellow"]`;
  }
}

//
// OrdinaryObject
//
export class OrdinaryObject extends PTANode {
  constructor(id: string) {
    super(id);
  }

  toString() {
    return "OrdinaryObject";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="square"]`;
  }
}

//
// OrdinaryFunctionObject
//
export type OrdinaryFunctionObject_meth =
  | ISP_ObjectMethod
  | IV_FunctionExpression
  | IV_ArrowFunctionExpression;
export class OrdinaryFunctionObject extends PTANode {
  meth: OrdinaryFunctionObject_meth;
  constructor(id: string, meth: OrdinaryFunctionObject_meth) {
    super(id);
    if (meth instanceof ISP_ObjectMethod && meth.kind !== "method") {
      debugConfig.logger.throwIriError(
        "Object methods that are not normal functions cannot occupy a ordinary function object",
      );
    }
    this.meth = meth;
  }

  toString() {
    return "OrdinaryFunctionObject";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="octagon"]`;
  }
}

//
// OrdinaryArrayObject
//
export class OrdinaryArrayObject extends PTANode {
  constructor(id: string) {
    super(id);
  }

  toString() {
    return "OrdinaryArrayObject";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="square"]`;
  }
}

//
// ArrowArrayObject
//
export class ArrowArrayObject extends PTANode {
  constructor(id: string) {
    super(id);
  }

  toString() {
    return "ArrowArrayObject";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="octagon"]`;
  }
}

//
// ClassObject
//
export class ClassObject extends PTANode {
  constructor(id: string) {
    super(id);
  }

  toString() {
    return "ClassObject";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="doubleoctagon"]`;
  }
}

//
// GlobalNode
//
export class GlobalNode extends PTANode {
  constructor(id: string) {
    super(id);
  }

  toString() {
    return "GlobalNode";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="square",style="filled", fillcolor="gray"]`;
  }
}

//
// UnknownResultObj
//
export class UnknownResultObj extends PTANode {
  constructor(id: string) {
    super(id);
  }

  toString() {
    return "UnknownResultObj";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="square",style="filled", fillcolor="gray"]`;
  }
}

//
// KnownResultObj
//
export class KnownResultObj extends PTANode {
  idx: number;
  constructor(id: string, idx: number) {
    super(id);
    this.idx = idx;
  }

  toString() {
    return "KnownResultObj";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="square",style="filled", fillcolor="orange"]`;
  }
}

//
// SetSpecialClosure
//
export type SetSpecialClosure_meth = ISP_ObjectMethod;
export class SetSpecialClosure extends PTANode {
  meth: SetSpecialClosure_meth;
  constructor(id: string, meth: SetSpecialClosure_meth) {
    super(id);
    this.meth = meth;
  }

  toString() {
    return "SetSpecialClosure";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="octagon",style="filled", fillcolor="gray"]`;
  }
}

//
// GetSpecialClosure
//
export type GetSpecialClosure_meth = ISP_ObjectMethod;
export class GetSpecialClosure extends PTANode {
  meth: GetSpecialClosure_meth;
  constructor(id: string, meth: GetSpecialClosure_meth) {
    super(id);
    this.meth = meth;
  }

  toString() {
    return "GetSpecialClosure_meth";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="octagon",style="filled", fillcolor="gray"]`;
  }
}

//
// ImportNode
//
export class ImportNode extends PTANode {
  FROM: IV_StringLiteral;
  isStatic: boolean = true;
  resolvedContainer: I_Container = null;
  constructor(id: string, FROM: IV_StringLiteral, isStatic: boolean) {
    super(id);
    this.FROM = FROM;
    this.isStatic = isStatic;
  }

  isResolved() {
    return this.resolvedContainer !== null;
  }

  addContainer(resolvedContainer: I_Container) {
    this.resolvedContainer = resolvedContainer;
  }

  toString() {
    return `[isStatic: ${this.isStatic}]`;
  }

  dotStyle() {
    if (this.isResolved())
      return `[xlabel="${this.toString().replace(/"/g, '\\"')}",shape="square",style="filled",fillcolor="green"]`;
    return `[xlabel="${this.toString().replace(/"/g, '\\"')}",shape="square",style="filled",fillcolor="yellow"]`;
  }
}

//
// PNode: A proxy node that allows us to keep track of enumerable and non-enumerable nodes
//
export class PNode extends PTANode {
  constructor(id: string) {
    super(id);
  }

  toString() {
    return "PNode";
  }

  dotStyle() {
    return `[xlabel="${this.id.replace(/"/g, '\\"')}",label="",shape="doublecircle",style="filled", fillcolor="gray"]`;
  }
}

//
// Litearal Node
//
export class LiteralNode extends PTANode {
  constructor(id: string) {
    super(id);
  }

  toString() {
    return "LiteralNode";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="rectangle",style="filled", fillcolor="green"]`;
  }
}

//
// Literals
//
export class DecimalNode extends LiteralNode {
  constructor(id: string) {
    super(id);
  }
}

export class BigIntNode extends LiteralNode {
  constructor(id: string) {
    super(id);
  }
}

export class StringNode extends LiteralNode {
  constructor(id: string) {
    super(id);
  }
}

export class NumericNode extends LiteralNode {
  constructor(id: string) {
    super(id);
  }
}

export class NullNode extends LiteralNode {
  constructor(id: string) {
    super(id);
  }
}

export class BooleanNode extends LiteralNode {
  constructor(id: string) {
    super(id);
  }
}

export class SymbolNode extends LiteralNode {
  constructor(id: string) {
    super(id);
  }
}
