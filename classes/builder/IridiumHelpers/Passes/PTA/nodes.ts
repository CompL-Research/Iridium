import { ISP_ObjectMethod } from "../../ALL_RVal/ALL_ISP.ts";
import { IV_StringLiteral } from "../../ALL_RVal/IV_Literals.ts";
import debugConfig from "#debugConfig";
import { IV_FunctionExpression } from "../../ALL_RVal/IV_FunctionExpression.ts";
import { IV_ArrowFunctionExpression } from "../../ALL_RVal/IV_ArrowFunctionExpression.ts";
import { I_Container } from "../../I_GENERAL/I_Container.ts";
import { IS_BImport } from "../../ALL_IS/IS_Imports_Exports.ts";

export class PTANode {
  static DUMMY_THRESHOLD: number = 3;
  dummyLevel: number = 0;
  EXTERNAL_CONTEXT: boolean = false;
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

  color(): string {
    return "black";
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

  color(): string {
    return this.EXTERNAL_CONTEXT ? "darkseagreen2" : "orange";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="octagon",style="filled",fillcolor="${this.color()}"]`;
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

  color(): string {
    return this.EXTERNAL_CONTEXT ? "darkseagreen2" : "aquamarine";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="rectangle",style="filled",fillcolor="${this.color()}"]`;
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

  color(): string {
    return this.EXTERNAL_CONTEXT ? "darkseagreen2" : "aquamarine";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="rectangle",style="filled",fillcolor="${this.color()}"]`;
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

  color(): string {
    return this.EXTERNAL_CONTEXT ? "darkseagreen2" : "orange";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="square",style="filled",fillcolor="${this.color()}"]`;
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

  color(): string {
    return this.EXTERNAL_CONTEXT ? "darkseagreen2" : "white";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="square",style="filled",fillcolor="${this.color()}"]`;
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

  color(): string {
    return this.EXTERNAL_CONTEXT ? "darkseagreen2" : "white";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="square",style="filled",fillcolor="${this.color()}"]`;
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

  color(): string {
    return this.EXTERNAL_CONTEXT ? "darkseagreen2" : "white";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="square",style="filled",fillcolor="${this.color()}"]`;
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

  color(): string {
    return this.EXTERNAL_CONTEXT ? "darkseagreen2" : "yellow";
  }

  dotStyle() {
    return `[xlabel="${this.id.replace(/"/g, '\\"')}",label="",shape="doublecircle",style="filled", fillcolor="${this.color()}"]`;
  }
}

//
// ECall
//
export class ECall extends PTANode {
  iNode: ImportNode;
  constructor(id: string, iNode: ImportNode) {
    super(id);
    this.iNode = iNode;
  }

  toString() {
    return "ECall";
  }

  color(): string {
    return this.EXTERNAL_CONTEXT ? "darkseagreen2" : "yellow";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="rectangle",style="filled",fillcolor="${this.color()}"]`;
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

  color(): string {
    return this.EXTERNAL_CONTEXT ? "darkseagreen2" : "white";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="square",style="filled",fillcolor="${this.color()}"]`;
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

  color(): string {
    return this.EXTERNAL_CONTEXT ? "darkseagreen2" : "white";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="octagon",style="filled",fillcolor="${this.color()}"]`;
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

  color(): string {
    return this.EXTERNAL_CONTEXT ? "darkseagreen2" : "white";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="square",style="filled",fillcolor="${this.color()}"]`;
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

  color(): string {
    return this.EXTERNAL_CONTEXT ? "darkseagreen2" : "white";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="octagon",style="filled",fillcolor="${this.color()}"]`;
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

  color(): string {
    return this.EXTERNAL_CONTEXT ? "darkseagreen2" : "white";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="doubleoctagon",style="filled",fillcolor="${this.color()}"]`;
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

  color(): string {
    return this.EXTERNAL_CONTEXT ? "darkseagreen2" : "gray";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="square",style="filled", fillcolor="${this.color()}"]`;
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

  color(): string {
    return this.EXTERNAL_CONTEXT ? "darkseagreen2" : "gray";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="square",style="filled", fillcolor="${this.color()}"]`;
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

  color(): string {
    return this.EXTERNAL_CONTEXT ? "darkseagreen2" : "orange";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="square",style="filled", fillcolor="${this.color()}"]`;
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

  color(): string {
    return this.EXTERNAL_CONTEXT ? "darkseagreen2" : "gray";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="octagon",style="filled", fillcolor="${this.color()}"]`;
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

  color(): string {
    return this.EXTERNAL_CONTEXT ? "darkseagreen2" : "gray";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="octagon",style="filled", fillcolor="${this.color()}"]`;
  }
}

//
// ImportNode
//
export class ImportNode extends PTANode {
  source: IS_BImport | undefined;
  FROM: IV_StringLiteral;
  isStatic: boolean = true;
  resolvedContainer: I_Container = null;
  constructor(
    source: IS_BImport | undefined,
    id: string,
    FROM: IV_StringLiteral,
    isStatic: boolean,
  ) {
    super(id);
    this.source = source;
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

  color(): string {
    return this.EXTERNAL_CONTEXT
      ? "darkseagreen2"
      : this.isResolved()
        ? "green"
        : "yellow";
  }

  dotStyle() {
    return `[xlabel="${this.toString().replace(/"/g, '\\"')}",shape="square",style="filled",fillcolor="${this.color()}"]`;
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

  color(): string {
    return this.EXTERNAL_CONTEXT ? "darkseagreen2" : "gray";
  }

  dotStyle() {
    return `[xlabel="${this.id.replace(/"/g, '\\"')}",label="",shape="doublecircle",style="filled", fillcolor="${this.color()}"]`;
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

  color(): string {
    return this.EXTERNAL_CONTEXT ? "darkseagreen2" : "green";
  }

  dotStyle() {
    return `[xlabel="${this.toString()}",shape="rectangle",style="filled", fillcolor="${this.color()}"]`;
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
