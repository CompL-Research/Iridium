import debugConfig from "#debugConfig";
import { IridiumBuildContext } from "./IRIDIUMV2.ts";

export type IridiumPrimitives = number | boolean | string | null;
export class IridiumSEXP {
  tag: string = "IridiumSEXP";
  args: Array<IridiumSEXP> = [];
  flags: Array<[string, IridiumPrimitives]> = [];

  constructor(tag: string) {
    this.tag = tag;
  }

  serialize() {
    return [
      this.tag,
      this.args.map((e) => e.serialize()),
      this.flags.map(([flagName, e]) => [flagName, e])
    ];
  }

  hasFlag(flag: string) {
    return this.flags.filter(e => e[0] === flag).length === 1
  }

  removeFlag(flag: string) {
    this.flags = this.flags.filter(e => e[0] !== flag);
  }

  setFlag(flag: string, val: IridiumPrimitives = null) {
    if (this.hasFlag(flag)) {
      this.removeFlag(flag);
    }
    this.flags.push([flag, val])
  }

  getFlag(flag: string): IridiumPrimitives {
    const currFlag = this.flags.filter(e => e[0] === flag);
    if (this.flags.filter(e => e[0] === flag).length === 1) {
      return currFlag[0][1];
    }
    debugConfig.logger.throwIriError(`Failed to get flag: ${flag}`)
  }

  getFlagNumber(flag: string): number {
    const currFlag = this.flags.filter(e => e[0] === flag);
    if (this.flags.filter(e => e[0] === flag).length === 1) {
      let res = currFlag[0][1];
      if (typeof res === "number") return res;
      debugConfig.logger.throwIriError("Expected scope to be a number");
    }
    debugConfig.logger.throwIriError(`Failed to get flag: ${flag}`)
  }

  getFlagString(flag: string): string {
    const currFlag = this.flags.filter(e => e[0] === flag);
    if (this.flags.filter(e => e[0] === flag).length === 1) {
      let res = currFlag[0][1];
      if (typeof res === "string") return res;
      debugConfig.logger.throwIriError("Expected scope to be a number");
    }
    debugConfig.logger.throwIriError(`Failed to get flag: ${flag}`)
  }

  getFlagBoolean(flag: string): boolean {
    const currFlag = this.flags.filter(e => e[0] === flag);
    if (this.flags.filter(e => e[0] === flag).length === 1) {
      let res = currFlag[0][1];
      if (typeof res === "boolean") return res;
      debugConfig.logger.throwIriError("Expected scope to be a number");
    }
    debugConfig.logger.throwIriError(`Failed to get flag: ${flag}`)
  }
  
}

// =============== TopLevel ===============
// (Primitive) File
export type FileSEXPFlags = "JSScript" | "JSModule";
export class FileSEXP extends IridiumSEXP {
  constructor(flag: FileSEXPFlags = undefined) {
    super("File");
    if (flag) this.setFlag(flag, null);
  }

  // Flags
  setFlag(flag: FileSEXPFlags, val: IridiumPrimitives) {
    super.setFlag(flag, val);
  }
};

// =============== Bindings ===============
// (Primitive) Bindings
export type BindingsSEXPFlags = "ParentScope";
export class BindingsSEXP extends IridiumSEXP {
  constructor(parentScope: number) {
    super("Bindings");
    this.setParentScope(parentScope);

    const localBindings = new ListSEXP([]);
    localBindings.setFlag("LocalBindings");
    this.setLocalBindings(localBindings);

    const remoteBindings = new ListSEXP([]);
    remoteBindings.setFlag("RemoteBindings");
    this.setRemoteBindings(remoteBindings);

    const lambdas = new ListSEXP([]);
    lambdas.setFlag("Lambdas");
    this.setLambdas(lambdas);
  }

  // Flags
  setParentScope(parentScope: number) {
    this.setFlag("ParentScope", parentScope);
  }

  getParentScope(): number {
    return this.getFlagNumber("ParentScope");
  }

  // Args
  setLocalBindings(bindingsListSEXP: ListSEXP) {
    this.args[0] = bindingsListSEXP;
  }

  getLocalBindings() {
    return this.args[0];
  }

  setRemoteBindings(remoteBindingsListSEXP: ListSEXP) {
    this.args[1] = remoteBindingsListSEXP;
  }

  getRemoteBindings() {
    return this.args[1];
  }

  setLambdas(lambdasListSEXP: ListSEXP) {
    this.args[2] = lambdasListSEXP;
  }

  getLambdas() {
    return this.args[2];
  }

  // Utility
  getBinding(name: string, lookupScope: number): EnvBindingSEXP | RemoteEnvBindingSEXP | null {
    if (lookupScope === -1) return null;
    // Check if a local is declared
    for (let b of this.getLocalBindings().args) {
      if (isEnvBindingSEXP(b)) {
        if (b.getScope() === lookupScope && b.getDeclaration() === name) return b;
      } else 
        debugConfig.logger.throwIriError("Expected EnvBindingSEXP");
    }

    // Check if we referenced this as a remote binding
    for (let b of this.getRemoteBindings().args) {
      if (isRemoteEnvBindingSEXP(b)) {
        let binding = this.resolveRemoteBinding(b);
        if (binding.getScope() === lookupScope && binding.getDeclaration() === name) return b;
      } else 
        debugConfig.logger.throwIriError("Expected EnvBindingSEXP");
    }
    const nextScope = IridiumBuildContext.CONTEXT_MAP.get(lookupScope).parent;

    return this.getBinding(name, nextScope);
  }

  hasBindingReference(idx: number, name: string, flag: JSEnvBindingFlags, localScope: number, parentScope: number) {
    let localBindings = this.getLocalBindings().args;
    let remoteBindings = this.getRemoteBindings().args;
    for (let b of localBindings) {
      if (isEnvBindingSEXP(b)) {
        if (
          b.getIDX() === idx && 
          b.getDeclaration() === name && 
          b.getKind() === flag && 
          b.getScope() === localScope && 
          b.getParentScope() === parentScope) {
          return true;
        } 
      } else
        debugConfig.logger.throwIriError("Expected EnvBindingSEXP");
    }
    for (let b of remoteBindings) {
      if (isRemoteEnvBindingSEXP(b)) {
        let resolvedB = this.resolveRemoteBinding(b);
        if (isEnvBindingSEXP(resolvedB)) {
          if (
            resolvedB.getIDX() === idx && 
            resolvedB.getDeclaration() === name && 
            resolvedB.getKind() === flag && 
            resolvedB.getScope() === localScope && 
            resolvedB.getParentScope() === parentScope) {
            return true;
          }
        } else 
          debugConfig.logger.throwIriError("Expected EnvBindingSEXP at the end of a RemoteEnvBindingSEXP");

      } else 
        debugConfig.logger.throwIriError("Expected RemoteEnvBindingSEXP");
    }
    return false;
  }

  addLambdaIDX(idx: number) {
    let localBindings = this.getLambdas().args;
    localBindings.push(new NumberSEXP(idx));
  }

  addLocalBinding(binding: EnvBindingSEXP) {
    let localBindings = this.getLocalBindings().args;
    localBindings.push(binding);
  }

  resolveRemoteBinding(binding: RemoteEnvBindingSEXP): EnvBindingSEXP {
    let containedBinding = binding.args[0];
    if (isEnvBindingSEXP(containedBinding)) {
      return containedBinding;
    } else if (isRemoteEnvBindingSEXP(containedBinding)) {
      return this.resolveRemoteBinding(containedBinding);
    }
    debugConfig.logger.throwIriError("RemoteEnvBindingSEXP contains invalid object");
  }

  addRemoteBinding(binding: RemoteEnvBindingSEXP) {
    this.getRemoteBindings().args.push(binding);
  }
}

// @ts-ignore
export function isBindingsSEXP(o: any): o is BindingsSEXP {
  // @ts-ignore
  return o.tag === "Bindings";
}

// =============== BBs ===============
// (Primitive) BB
export type BBSEXPFlags = "IDX" | "ScopeIDX" | "TopLevel" | "ClosureBoundary" | "Lexical";
export class BBSEXP extends IridiumSEXP {
  static bbIdx: number = 0;
  idx: number
  constructor(scopeIDX: number, flag: BBSEXPFlags = undefined) {
    super("BB");
    this.idx = BBSEXP.bbIdx++;
    this.setIDX(this.idx);
    this.setScopeIDX(scopeIDX);
    if (flag) this.flags.push([flag, null]);
  }

  // Flags
  setIDX(idx: number) {
    super.setFlag("IDX", idx);
  }

  getIDX(): number {
    return this.getFlagNumber("IDX");
  }

  setScopeIDX(scopeIDX: number) {
    super.setFlag("ScopeIDX", scopeIDX);
  }

  getScopeIDX(): number {
    return this.getFlagNumber("ScopeIDX");
  }

  setBBFlag(flag: BBSEXPFlags) {
    if (this.isTopLevel())        this.removeFlag("TopLevel");
    if (this.isClosureBoundary()) this.removeFlag("ClosureBoundary");
    if (this.isLexical())         this.removeFlag("Lexical");
    this.setFlag(flag);
  }

  getBBFlag(): BBSEXPFlags {
    if (this.isTopLevel())        return "TopLevel";
    if (this.isClosureBoundary()) return "ClosureBoundary";
    if (this.isLexical())         return "Lexical";
    debugConfig.logger.throwIriError("No BB Flag found...");
  }

  // Utility
  isTopLevel() {
    return this.hasFlag("TopLevel");
  }

  isClosureBoundary() {
    return this.hasFlag("ClosureBoundary");
  }

  isLexical() {
    return this.hasFlag("Lexical");
  }
}

// @ts-ignore
export function isBBSEXP(o: any): o is BBSEXP {
  // @ts-ignore
  return o.tag === "BB";
}

export type BBContainerSEXPFlags = "StartBBIDX" | "ScopeIDX";
export class BBContainerSEXP extends IridiumSEXP {
  constructor(startBBIDx: number, scopeIDX: number, bbs: Array<BBSEXP>) {
    super("BBContainer");
    this.setStartBBIDX(startBBIDx);
    this.setScopeIDX(scopeIDX);
    this.setBindings(new BindingsSEXP(-1));
    const bbsSEXP = new ListSEXP(bbs);
    bbsSEXP.setFlag("BBs");
    this.setBBs(bbsSEXP)
  }

  // Flags
  setStartBBIDX(startBBIDX: number) {
    this.setFlag("StartBBIDX", startBBIDX);
  }

  getStartBBIDX(): number {
    return this.getFlagNumber("StartBBIDX");
  }

  setScopeIDX(startBBIDX: number) {
    this.setFlag("ScopeIDX", startBBIDX);
  }

  getScopeIDX(): number {
    return this.getFlagNumber("ScopeIDX");
  }

  // Args
  setBindings(descriptor: BindingsSEXP) {
    this.args[0] = descriptor;
  }

  getBindings(): BindingsSEXP {
    let res = this.args[0]
    if (isBindingsSEXP(res)) return res;
    else debugConfig.logger.throwIriError("Expected BindingsSEXP");
  }

  setBBs(bbs: ListSEXP) {
    this.args[1] = bbs;
  }

  getBBs() {
    return this.args[1].args;
  }

  // Utility
  addBB(bb: BBSEXP) {
    this.getBBs().push(bb);
  }
}

// @ts-ignore
export function isBBContainerSEXP(o: any): o is BBContainerSEXP {
  // @ts-ignore
  return o.tag === "BBContainer";
}

// =============== RVals ===============
// Literals

// (Primitive) Number
export class NumberSEXP extends IridiumSEXP {
  constructor(number: number) {
    super("Number");
    this.flags.push(["IridiumPrimitive", number]);
  }

  getVal(): number {
    return this.getFlagNumber("IridiumPrimitive");
  }
}

// @ts-ignore
export function isNumberSEXP(o: any): o is NumberSEXP {
  // @ts-ignore
  return o.tag === "Number";
}

// (Primitive) String
export class StringSEXP extends IridiumSEXP {
  constructor(str: string) {
    super("String");
    this.flags.push(["IridiumPrimitive", str]);
  }

  getVal(): string {
    return this.getFlagString("IridiumPrimitive");
  }
}

// @ts-ignore
export function isStringSEXP(o: any): o is StringSEXP {
  // @ts-ignore
  return o.tag === "String";
}

// (Primitive) List
export type ListSEXPFlags = "LocalBindings" | "RemoteBindings" | "Lambdas" | "BBs";
export class ListSEXP extends IridiumSEXP {
  constructor(elems: Array<IridiumSEXP>) {
    super("List");
    elems.forEach(e => this.args.push(e));
  }

  setFlag(flag: ListSEXPFlags) {
    super.setFlag(flag);
  }
}

// @ts-ignore
export function isListSEXP(o: any): o is ListSEXP {
  // @ts-ignore
  return o.tag === "List";
}

// (Primitive) Boolean
export class BooleanSEXP extends IridiumSEXP {
  constructor(value: boolean) {
    super("Boolean");
    this.flags.push(["IridiumPrimitive", value]);
  }

  getVal(): boolean {
    return this.getFlagBoolean("IridiumPrimitive");
  }
}

// @ts-ignore
export function isBooleanSEXP(o: any): o is BooleanSEXP {
  // @ts-ignore
  return o.tag === "Boolean";
}

// type JSBINOPS =  "**" | ">>>" | "==" | "===" | "!=" | "!==" | "in" | "instanceof" | "|>";
const PrimitiveArithOP = ["+", "-", "/", "%", "*"];
const PrimitiveBitwiseOP = ["&", "|", "^", "<<", ">>"];
const PrimitiveComparisonOP = [">", "<", ">=", "<="];

const isPrimitiveBinop = (b: string) => {
  return PrimitiveArithOP.includes(b) || PrimitiveBitwiseOP.includes(b) || PrimitiveComparisonOP.includes(b)
}

// (Primitive) Binop
export type BinopSEXPFlags = "Primitive" | "JSBINOP";
export class BinopSEXP extends IridiumSEXP {
  constructor(op: string, lBinop: IridiumSEXP, rBinop: IridiumSEXP) {
    super("Binop");
    this.args.push(new StringSEXP(op));
    this.args.push(lBinop);
    this.args.push(rBinop);
    if (isPrimitiveBinop(op)) this.flags.push(["Primitive", null]);
    else this.flags.push(["JSBINOP", null]);
  }
}
// @ts-ignore
export function isBinopSEXP(o: any): o is BinopSEXP {
  // @ts-ignore
  return o.tag === "Binop";
}

// (Extension) JSArray
export class JSArraySEXP extends IridiumSEXP {
  constructor(vals: Array<IridiumSEXP>) {
    super("JSArray");
    vals.forEach(e => this.args.push(e));
  }
}

// @ts-ignore
export function isJSArraySEXP(o: any): o is JSArraySEXP {
  // @ts-ignore
  return o.tag === "JSArray";
}

// (Extension) JSObjectProp
export class JSComputedObjectPropSEXP extends IridiumSEXP {
  constructor(key: IridiumSEXP, value: IridiumSEXP) {
    super("JSComputedObjectProp");
    this.args.push(key);
    this.args.push(value);
  }
}

// @ts-ignore
export function isJSComputedObjectPropSEXP(o: any): o is JSComputedObjectPropSEXP {
  // @ts-ignore
  return o.tag === "JSComputedObjectProp";
}

// (Extension) JSObjectProp
export class JSObjectPropSEXP extends IridiumSEXP {
  constructor(key: string, value: IridiumSEXP) {
    super("JSObjectProp");
    this.args.push(new StringSEXP(key));
    this.args.push(value);
  }
}

// @ts-ignore
export function isJSObjectPropSEXP(o: any): o is JSObjectPropSEXP {
  // @ts-ignore
  return o.tag === "JSObjectProp";
}

// (Extension) JSComputedObjectMethod
type JSComputedObjectMethodSEXPFlags = "GET" | "SET" | "METHOD";
export class JSComputedObjectMethodSEXP extends IridiumSEXP {
  constructor(key: IridiumSEXP, value: IridiumSEXP, kind: string) {
    super("JSComputedObjectMethod");
    this.args.push(key);
    this.args.push(value);
    if (kind === "method") this.setFlag("METHOD");
    else if (kind === "get") this.setFlag("GET");
    else if (kind === "set") this.setFlag("SET");
    else debugConfig.logger.throwIriError("Object method kind is invalid");
  }
}

// @ts-ignore
export function isJSComputedObjectMethodSEXP(o: any): o is JSComputedObjectMethodSEXP {
  // @ts-ignore
  return o.tag === "JSComputedObjectMethod";
}

// (Extension) JSObjectMethod
type JSObjectMethodSEXPFlags = "GET" | "SET" | "METHOD";
export class JSObjectMethodSEXP extends IridiumSEXP {
  constructor(key: string, value: IridiumSEXP, kind: string) {
    super("JSObjectMethod");
    this.args.push(new StringSEXP(key));
    this.args.push(value);
    if (kind === "method") this.setFlag("METHOD");
    else if (kind === "get") this.setFlag("GET");
    else if (kind === "set") this.setFlag("SET");
    else debugConfig.logger.throwIriError("Object method kind is invalid");
  }
}

// @ts-ignore
export function isJSObjectMethodSEXP(o: any): o is JSObjectMethodSEXP {
  // @ts-ignore
  return o.tag === "JSObjectMethod";
}

// (Extension) JSObject
export class JSObjectSEXP extends IridiumSEXP {
  constructor(vals: Array<IridiumSEXP>) {
    super("JSObject");
    vals.forEach(e => this.args.push(e));
  }
}

// (Extension) JSTHISINIT
export class JSTHISINITSEXP extends IridiumSEXP {
  constructor(ref: IridiumSEXP) {
    super("JSTHISINIT");
    this.args.push(ref);
  }
}

// @ts-ignore
export function isJSObjectSEXP(o: any): o is JSObjectSEXP {
  // @ts-ignore
  return o.tag === "JSObject";
}

// (Extension) JSSpread
export class JSSpreadSEXP extends IridiumSEXP {
  constructor(id: IridiumSEXP) {
    super("JSSpread");
    this.args.push(id);
  }
}

// (Extension) JSNUBD
export class JSNUBDSEXP extends IridiumSEXP {
  constructor() {
    super("JSNUBD");
  }
}

// (Extension) JSModuleStart
export class JSModuleStartSEXP extends IridiumSEXP {
  constructor() {
    super("JSModuleStart");
  }
}

// (Extension) JSModuleEnd
export class JSModuleEndSEXP extends IridiumSEXP {
  constructor() {
    super("JSModuleEnd");
  }
}

// Abstraction
// (Primitive) Lambda
export type JSLambdaFlags = "InferredName" | "StaticName" | "Strict";
export class LambdaSEXP extends IridiumSEXP {
  constructor(bbIdx: number) {
    super("Lambda");
    this.setStartBBIDX(bbIdx);
  }

  // Flags
  setStartBBIDX(startBBIDX: number) {
    this.setFlag("StartBBIDX", startBBIDX);
  }

  getStartBBIDX() {
    return this.getFlagNumber("StartBBIDX");
  }
}


// @ts-ignore
export function isLambdaSEXP(o: any): o is LambdaSEXP {
  // @ts-ignore
  return o.tag === "Lambda";
}

// (Primitive) Call
export type CallSiteSEXPFlags = "Import" | "Super" | "V8Intrinsic" | "CCall";
export class CallSiteSEXP extends IridiumSEXP {
  constructor(args: Array<IridiumSEXP>, closureFlag: [CallSiteSEXPFlags, IridiumPrimitives][]) {
    super("CallSiteSEXP");
    args.forEach(a => this.args.push(a));
    closureFlag.forEach(flag => this.flags.push(flag));
  }

  // Utility
  isImportCall() {
    return this.hasFlag("Import");
  }

  isSuperCall() {
    return this.hasFlag("Super");
  }

  isV8IntrinsicCall() {
    return this.hasFlag("V8Intrinsic");
  }

  isSimpleCall() {
    return !(this.isImportCall() || this.isSuperCall() || this.isV8IntrinsicCall());
  }
}


// Environment Operations
// (Primitive) EnvRead
export class EnvReadSEXP extends IridiumSEXP {
  constructor(id: string) {
    super("EnvRead");
    this.args.push(new ResolveEnvBindingSEXP(id));
  }
}

// (Primitive) GlobalBinding
export class GlobalBindingSEXP extends IridiumSEXP {
  constructor(id: string) {
    super("GlobalBinding");
    this.args.push(new StringSEXP(id));
  }

  // Utility
  getDeclaration(): string {
    if (isStringSEXP(this.args[0])) return this.args[0].getVal();
    debugConfig.logger.throwIriError("Expected Env Declaration to declare a string");
  }

}

// @ts-ignore
export function isGlobalBindingSEXP(o: any): o is GlobalBindingSEXP {
  // @ts-ignore
  return o.tag === "GlobalBinding";
}

export type RemoteEnvBindingSEXPFlags = "REFIDX";
export class RemoteEnvBindingSEXP extends IridiumSEXP {
  constructor(binding: IridiumSEXP, refIDX: number) {
    super("RemoteEnvBinding");
    this.setREFIDX(refIDX);
    this.args.push(binding);
  }

  // Flags
  setREFIDX(val: number) {
    this.setFlag("REFIDX", val);
  }

  getREFIDX(): number {
    return this.getFlagNumber("REFIDX");
  }
}

// @ts-ignore
export function isRemoteEnvBindingSEXP(o: any): o is RemoteEnvBindingSEXP {
  // @ts-ignore
  return o.tag === "RemoteEnvBinding";
}

// (Primitive) EnvBinding
export type JSEnvBindingFlags = "JSARG" | "JSLET" | "JSCONST" | "JSVAR";
export type EnvBindingFlags = "IDX" | "REFIDX" | "Scope" | "ParentScope" | JSEnvBindingFlags;
export class EnvBindingSEXP extends IridiumSEXP {
  constructor(refIdx:number, idx: number, b: string, flags: [JSEnvBindingFlags, null][], scope: number, parentScope: number) {
    super("EnvBinding");
    this.args.push(new StringSEXP(b));
    flags.forEach(flag => this.flags.push(flag));
    this.setIDX(idx);
    this.setREFIDX(refIdx);
    this.setScope(scope);
    this.setParentScope(parentScope);
  }

  // Flags
  setIDX(idx: number) {
    this.setFlag("IDX", idx);
  }

  getIDX(): number {
    return this.getFlagNumber("IDX");
  }

  setREFIDX(idx: number) {
    this.setFlag("REFIDX", idx);
  }

  getREFIDX(): number {
    return this.getFlagNumber("REFIDX");
  }

  setScope(idx: number) {
    this.setFlag("Scope", idx);
  }

  getScope(): number {
    return this.getFlagNumber("Scope");
  }

  setParentScope(idx: number) {
    this.setFlag("ParentScope", idx);
  }

  getParentScope(): number {
    return this.getFlagNumber("ParentScope");
  }

  // Utility
  getDeclaration(): string {
    if (isStringSEXP(this.args[0])) return this.args[0].getVal();
    debugConfig.logger.throwIriError("Expected Env Declaration to declare a string");
  }

  getKind(): string {
    if (this.hasFlag("JSLET")) return "JSLET";
    if (this.hasFlag("JSCONST")) return "JSCONST";
    if (this.hasFlag("JSVAR")) return "JSVAR";
    if (this.hasFlag("JSARG")) return "JSARG";
    debugConfig.logger.throwIriError("EnvBindingSEXP, unknown kind");
  }
}

// @ts-ignore
export function isEnvBindingSEXP(o: any): o is EnvBindingSEXP {
  // @ts-ignore
  return o.tag === "EnvBinding";
}

// (Extension) JSThisContext
export class JSThisContextSEXP extends IridiumSEXP {
  constructor() {
    super("JSThisContext");
  }
}

// @ts-ignore
export function isJSThisContextSEXP(o: any): o is JSThisContextSEXP {
  // @ts-ignore
  return o.tag === "JSThisContext";
}

// (Primitive) EnvWrite
export class EnvWriteSEXP extends IridiumSEXP {
  lval: string
  constructor(lval: string, rval: IridiumSEXP) {
    super("EnvWrite");
    this.lval = lval
    this.args.push(new ResolveEnvBindingSEXP(lval));
    this.args.push(rval);
  }
}

// @ts-ignore
export function isEnvWriteSEXP(o: any): o is EnvWriteSEXP {
  // @ts-ignore
  return o.tag === "EnvWrite";
}

// (Extension) JSEnvWrite
export type JSEnvWriteFlags = "JSLET" | "JSCONST" | "JSVAR" | "JSREST" | "JSARRDES" | "JSOBJDES";
export class JSEnvWriteSEXP extends IridiumSEXP {
  constructor(lval: IridiumSEXP, rval: IridiumSEXP, flag: JSEnvWriteFlags = undefined) {
    super("JSEnvWrite");
    this.args.push(lval);
    if (rval) this.args.push(rval);
    if (flag) this.flags.push([flag, null]);
  }

  // Utility
  isSimpleDecl() {
    return !(this.isArrayDecl() || this.isObjDecl());
  }

  isArrayDecl() {
    return this.hasFlag("JSARRDES")
  }

  isObjDecl() {
    return this.hasFlag("JSOBJDES")
  }

  setRVal(val: IridiumSEXP) {
    this.args[1] = val;
  }

  hasRVal() {
    return this.args.length > 1
  }

  isDecl() {
    return this.isLetDecl() || this.isConstDecl() || this.isVarDecl()
  }

  isLetDecl() {
    return this.hasFlag("JSLET")
  }

  isConstDecl() {
    return this.hasFlag("JSCONST")
  }

  isVarDecl() {
    return this.hasFlag("JSVAR")
  }

  reduceJSDecl() {
    if (this.isSimpleDecl()) {
      this.tag = "EnvWrite";
      Object.setPrototypeOf(this, new EnvWriteSEXP("", null))
    }
    this.flags = this.flags.filter(e => e[0] !== "JSLET" && e[0] !== "JSCONST" && e[0] !== "JSVAR")
  }

  hasRest() {
    return this.flags.filter(e => e[0] === "JSREST").length > 0
  }

  getDeclaredBindings() {
    let lVal = this.args[0];
    const res: Array<string> = [];
    if (isResolveEnvBindingSEXP(lVal)) {
      res.push(lVal.getBindingName());
    } else if (this.isArrayDecl()) {
      for (let l of lVal.args) {
        if (isResolveEnvBindingSEXP(l)) {
          res.push(l.getBindingName());
        } else debugConfig.logger.throwIriError("In Arr Decl, only expected StringSEXP");
      }
    } else if (this.isObjDecl()) {
      for (let p of lVal.args) {
        if (isResolveEnvBindingSEXP(p)) { // Rest case
          res.push(p.getBindingName());
        } else if (isListSEXP(p)) {
          if (isResolveEnvBindingSEXP(p.args[1])) res.push(p.args[1].getBindingName());
          else {
            debugConfig.logger.throwIriError("In Obj Decl, expected the created binding to be a StringSEXP");
          }

        }
      }
    }
    return res;
  }
}

// (Extension) JSEnvWrite
export class JSFuncDeclSEXP extends IridiumSEXP {
  constructor(lval: IridiumSEXP, rval: IridiumSEXP) {
    super("JSFuncDecl");
    this.args.push(lval);
    this.args.push(rval);
  }
}

// @ts-ignore
export function isJSFuncDeclSEXP(o: any): o is JSFuncDeclSEXP {
  // @ts-ignore
  return o.tag === "JSFuncDecl";
}

// (Primitive) NOP
export class NOPSEXP extends IridiumSEXP {
  constructor() {
    super("NOP");
  }
}

// @ts-ignore
export function isJSEnvWrite(o: any): o is JSEnvWriteSEXP {
  // @ts-ignore
  return o.tag === "JSEnvWrite";
}

// (Primitive) FieldRead
export class FieldReadSEXP extends IridiumSEXP {
  constructor(object: string, field: string) {
    super("FieldRead");
    this.args.push(new ResolveEnvBindingSEXP(object));
    this.args.push(new StringSEXP(field));
  }
}

// (Extended) JSComputedFieldRead
export class JSComputedFieldReadSEXP extends IridiumSEXP {
  constructor(object: string, field: string) {
    super("JSComputedFieldRead");
    this.args.push(new ResolveEnvBindingSEXP(object));
    this.args.push(new EnvReadSEXP(field));
  }
}

// (Primitive) FieldWrite
export class FieldWriteSEXP extends IridiumSEXP {
  constructor(object: string, field: string, right: IridiumSEXP) {
    super("FieldWrite");
    this.args.push(new ResolveEnvBindingSEXP(object));
    this.args.push(new StringSEXP(field));
    this.args.push(right);
  }
}

// (Extended) JSComputedFieldRead
export class JSComputedFieldWriteSEXP extends IridiumSEXP {
  constructor(object: string, field: string, right: IridiumSEXP) {
    super("JSComputedFieldWrite");
    this.args.push(new ResolveEnvBindingSEXP(object));
    this.args.push(new StringSEXP(field));
    this.args.push(right);
  }
}

// Control Flow
// (Primitive) Goto
export type GotoSEXPFlags = "IDX";
export class GotoSEXP extends IridiumSEXP {
  constructor(idx: number) {
    super("Goto");
    this.setIDX(idx);
  }

  // Flags
  setIDX(idx: number) {
    this.setFlag("IDX", idx)
  }

  getIDX(): number {
    return this.getFlagNumber("IDX");
  }
}

// (Primitive) Return
export class ReturnSEXP extends IridiumSEXP {
  constructor(val: IridiumSEXP) {
    super("Return");
    this.args.push(val);
  }
}

// (Primitive) IfElseJump
export type IfElseJumpSEXPFlags = "TRUE" | "FALSE";
export class IfElseJumpSEXP extends IridiumSEXP {
  constructor(test: IridiumSEXP, trueTarget: number, falseTarget: number) {
    super("IfElseJump");
    this.args.push(test);
    this.setTRUE(trueTarget);
    this.setFALSE(falseTarget);
  }

  // Flags
  setTRUE(idx: number) {
    this.setFlag("TRUE", idx)
  }

  getTRUE(): number {
    return this.getFlagNumber("TRUE");
  }

  setFALSE(idx: number) {
    this.setFlag("FALSE", idx)
  }

  getFALSE(): number {
    return this.getFlagNumber("FALSE");
  }
}

// (Primitive) IfJumpSEXP
export type IfJumpSEXPFlags = "IDX";
export class IfJumpSEXP extends IridiumSEXP {
  constructor(test: IridiumSEXP, target: number) {
    super("IfJump");
    this.args.push(test);
    this.setIDX(target);
  }

  // Flags
  setIDX(idx: number) {
    this.setFlag("IDX", idx)
  }

  getIDX(): number {
    return this.getFlagNumber("IDX");
  }
}

// Abstract Operations
// (Primitive) ResolveEnvBindingSEXP
export class ResolveEnvBindingSEXP extends IridiumSEXP {
  constructor(id: string) {
    super("ResolveEnvBindingSEXP");
    this.args.push(new StringSEXP(id));
  }

  getBindingName(): string {
    let res = this.args[0]
    if (isStringSEXP(res)) return res.getVal()
    debugConfig.logger.throwIriError("Cant get binding for ResolveEnvBindingSEXP")
  }
}

// @ts-ignore
export function isResolveEnvBindingSEXP(o: any): o is ResolveEnvBindingSEXP {
  // @ts-ignore
  return o.tag === "ResolveEnvBindingSEXP";
}
