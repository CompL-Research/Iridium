import { printFlagString, printIriSpace } from "#utils";
import { IridiumBuildContext } from "./IRIDIUMV2";
import { IridiumSEXP, IridiumPrimitives, ListSEXP, isListSEXP, ResolveEnvBindingSEXP, StringSEXP, isStringSEXP, isResolveEnvBindingSEXP, isEnvBindingSEXP, EnvBindingSEXP, JSEnvBindingFlags, isRemoteEnvBindingSEXP, RemoteEnvBindingSEXP } from "./Types/index";

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
    lambdas.setFlag("LambdaPool");
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

  getLambdaPoolBindings() {
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
        throw new Error("Expected EnvBindingSEXP");
    }

    // Check if we referenced this as a remote binding
    for (let b of this.getRemoteBindings().args) {
      if (isRemoteEnvBindingSEXP(b)) {
        let binding = this.resolveRemoteBinding(b);
        if (binding.getScope() === lookupScope && binding.getDeclaration() === name) return b;
      } else
        throw new Error("Expected EnvBindingSEXP");
    }
    const buildContext = IridiumBuildContext.CONTEXT_MAP.get(lookupScope);
    if (!buildContext) throw new Error("buildContext is undefined");
    const nextScope = buildContext.parent;

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
        throw new Error("Expected EnvBindingSEXP");
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
          throw new Error("Expected EnvBindingSEXP at the end of a RemoteEnvBindingSEXP");

      } else
        throw new Error("Expected RemoteEnvBindingSEXP");
    }
    return false;
  }

  addLambdaPoolBinding(binding: PoolBindingSEXP) {
    let poolBindings = this.getLambdaPoolBindings().args;
    poolBindings.push(binding);
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
    throw new Error("RemoteEnvBindingSEXP contains invalid object");
  }

  addRemoteBinding(binding: RemoteEnvBindingSEXP) {
    this.getRemoteBindings().args.push(binding);
  }

  toString(space?: number): string {
    if (!space) space = 0;
    let res = [];
    res.push(`${printIriSpace(space)}Bindings`);
    const args = this.args.map(e => e.toString(space + 2));
    res = [...res, ...args];
    return res.join("\n");
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
  constructor(scopeIDX: number, flag: BBSEXPFlags | undefined = undefined) {
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
    if (this.isTopLevel()) this.removeFlag("TopLevel");
    if (this.isClosureBoundary()) this.removeFlag("ClosureBoundary");
    if (this.isLexical()) this.removeFlag("Lexical");
    this.setFlag(flag);
  }

  getBBFlag(): BBSEXPFlags {
    if (this.isTopLevel()) return "TopLevel";
    if (this.isClosureBoundary()) return "ClosureBoundary";
    if (this.isLexical()) return "Lexical";
    throw new Error("No BB Flag found...");
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

  toString(space?: number): string {
    const res = [];
    // res.push("\n");
    res.push(`${printIriSpace(space)}██▒${printFlagString(this.flags)}`);
    for (let s of this.args) {
      res.push(`${printIriSpace(space)}█▒ ${s.toString(0)}`);
    }
    res.push(`${printIriSpace(space)}██▒`)
    return res.join("\n");
  }
}

// @ts-ignore
export function isBBSEXP(o: any): o is BBSEXP {
  // @ts-ignore
  return o.tag === "BB";
}

// 
// JS Code Container Flags
// 

// PROTO   -> Has Prototype
// NEW     -> New Target Allowed
// SCALL   -> Super Call Allowed
// SOBJ    -> Super Object Allowed
// HOME    -> Needs Home Object
// DERIVED -> Is Derived Class Constructor

// 
// 1. Regular Closure = { }
// 
// 2. Constructor = { PROTO, NEW }
// 
// 3. Derived Constructor = { PROTO, NEW, SCALL, SOBJ, HOME, DERIVED }
// 
// 4. Derived Method = { SOBJ, HOME }
// 
// 5. Private Method = { HOME }
// 
// 6. Prop Init + no_private = {  }
// 
// 7. Prop Init Derived + no_private = { SOBJ, HOME }
// 
// 8. Prop Init + private = { HOME }
// 
// 9. Prop Init Derived + private = { SOBJ, HOME }
// 
// 10. Private Derived Method = { SOBJ, HOME }
// 
// 11. Static Prop Init = {  }
// 
// 12. Static Prop Init Derived = { SOBJ, HOME }
// 
export const getRegularClosureFlag = () => 1;
export const getConstructorClosureFlag = () => 2;
export const getDerivedConstructorClosureFlag = () => 3;
export const getDerivedMethodClosureFlag = () => 4;
export const getPrivateMethodClosureFlag = () => 5;
export const getPropInitNoPrivateClosureFlag = () => 6;
export const getPropInitDerivedNoPrivateClosureFlag = () => 7;
export const getPropInitPrivateClosureFlag = () => 8;
export const getPropInitDerivedPrivateClosureFlag = () => 9;
export const getPrivateDerivedMethodClosureFlag = () => 10;
export const getStaticPropInitClosureFlag = () => 11;
export const getStaticPropInitDerivedClosureFlag = () => 12;

export type BBContainerSEXPFlags = "ECMAArgs" | "StartBBIDX" | "ScopeIDX" | "ARGUMENTS" | "ASYNC" | "GENERATOR" | "PROTO" | "NEW" | "SCALL" | "SOBJ" | "HOME" | "DERIVED";
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
  setECMAArgsLen(len: number) {
    this.setFlag("ECMAArgs", len);
  }

  getECMAArgsLen(): number {
    return this.getFlagNumber("ECMAArgs");
  }
  
  setArguments() {
    this.setFlag("ARGUMENTS");
  }

  unsetArguments() {
    this.removeFlag("ARGUMENTS");
  }

  setGenerator() {
    this.setFlag("GENERATOR");
  }

  unsetGenerator() {
    this.removeFlag("GENERATOR");
  }

  setAsync() {
    this.setFlag("ASYNC");
  }

  unsetAsync() {
    this.removeFlag("ASYNC");
  }

  setStrict() {
    this.setFlag("STRICT");
  }

  unsetStrict() {
    this.removeFlag("STRICT");
  }

  setClosureFlags(flag: number) {
    const flags: Array<BBContainerSEXPFlags> = [];
    this.setFlag("ContainerFlagID", flag);
    switch (flag) {
      case 0: throw new Error("Invalid closure flag");
      case 1: break;
      case 2: flags.push("PROTO", "NEW"); break;
      case 3: flags.push("PROTO", "NEW", "SCALL", "SOBJ", "HOME", "DERIVED"); break;
      case 4: flags.push("SOBJ", "HOME"); break;
      case 5: flags.push("HOME"); break;
      case 6: flags.push(); break;
      case 7: flags.push("SOBJ", "HOME"); break;
      case 8: flags.push("HOME"); break;
      case 9: flags.push("SOBJ", "HOME"); break;
      case 10: flags.push("SOBJ", "HOME"); break;
      case 11: flags.push(); break;
      case 12: flags.push("SOBJ", "HOME"); break;
      default: throw new Error("expected a valid closure flag");
    }
    flags.forEach(f => this.setFlag(f));
  }

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
  setBBs(bbs: ListSEXP) {
    this.args[1] = bbs;
  }

  getBBs() {
    return this.args[1].args;
  }

  setBindings(descriptor: BindingsSEXP) {
    this.args[0] = descriptor;
  }

  getBindings(): BindingsSEXP {
    let res = this.args[0]
    if (isBindingsSEXP(res)) return res;
    else throw new Error("Expected BindingsSEXP");
  }

  // Utility
  addBB(bb: BBSEXP) {
    this.getBBs().push(bb);
  }

  toString(space?: number): string {
    if (!space) space = 0;
    let res = [];
    res.push(`${printIriSpace(space)}📦${printFlagString(this.flags)}`)
    const args = this.args.map(e => e.toString(space + 2));
    res = [...res, ...args, "\n"];
    return res.join("\n");
  }
}

// @ts-ignore
export function isBBContainerSEXP(o: any): o is BBContainerSEXP {
  // @ts-ignore
  return o.tag === "BBContainer";
}

// =============== RVals ===============
// Literals
// (Primitive) Nope
export class NopeSEXP extends IridiumSEXP {
  constructor() {
    super("Nope");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}🙂‍↔️`
  }
}


// (Primitive) Null
export class NullSEXP extends IridiumSEXP {
  constructor() {
    super("Null");
    this.flags.push(["IridiumPrimitive", null]);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}🤮`
  }

}

// (Primitive) JSTemplateSEXP
export class JSTemplateSEXP extends IridiumSEXP {
  constructor(elements: Array<IridiumSEXP>) {
    super("JSTemplate");
    elements.forEach(e => this.args.push(e));
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}JSTempalte(${this.args.map(e => e.toString(0)).join(", ")})`;
  }
}

// (Primitive) RegExpSEXP
export class RegExpSEXP extends IridiumSEXP {
  constructor(exp: string, flags: string) {
    super("RegExp");
    this.flags.push(["EXP", exp]);
    this.flags.push(["FLAGS", flags]);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}REGEXP(${this.getFlagString("EXP")},${this.getFlagString("FLAGS")})`
  }
}

// (Primitive) Number
export class NumberSEXP extends IridiumSEXP {
  constructor(number: number) {
    super("Number");
    this.flags.push(["IridiumPrimitive", number]);
  }

  getVal(): number {
    return this.getFlagNumber("IridiumPrimitive");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}${this.getVal()}`
  }

}

// @ts-ignore
export function isNumberSEXP(o: any): o is NumberSEXP {
  // @ts-ignore
  return o.tag === "Number";
}

// (Extension) Yield
export class YieldSEXP extends IridiumSEXP {
  constructor(arg: string, yieldReturnIndicator: string, yieldReturnResultHolder: string) {
    super("Yield");
    this.args.push(new EnvReadSEXP(arg));
    this.args.push(new ResolveEnvBindingSEXP(yieldReturnIndicator));
    this.args.push(new ResolveEnvBindingSEXP(yieldReturnResultHolder));
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}YIELD [${this.args[0].toString(0)}] ↝ ${this.args[1].toString(0)}, ${this.args[2].toString(0)}`;
  }
}

// (Extension) Await
export class AwaitSEXP extends IridiumSEXP {
  constructor(arg: string) {
    super("Await");
    this.args.push(new EnvReadSEXP(arg));
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}AWAIT ${this.args[0].toString(0)}`;
  }
}

// (Extension) BitInt
export class BitIntSEXP extends IridiumSEXP {
  constructor(str: string) {
    super("BitInt");
    this.flags.push(["IridiumPrimitive", str]);
  }

  getVal(): string {
    return this.getFlagString("IridiumPrimitive");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}${this.getVal()}n`
  }
}

// @ts-ignore
export function isBitIntSEXP(o: any): o is BitIntSEXP {
  // @ts-ignore
  return o.tag === "BitInt";
}




// (Extension) Private
export class PrivateSEXP extends IridiumSEXP {
  constructor(str: string) {
    super("Private");
    this.flags.push(["IridiumPrimitive", str]);
  }

  getVal(): string {
    return this.getFlagString("IridiumPrimitive");
  }
}

// @ts-ignore
export function isPrivateSEXP(o: any): o is PrivateSEXP {
  // @ts-ignore
  return o.tag === "Private";
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

  toString(space?: number): string {
    return `${printIriSpace(space)}${this.args[1].toString(0)} OP[${this.args[0].toString(0)}] ${this.args[2].toString(0)}`
  }
}
// @ts-ignore
export function isBinopSEXP(o: any): o is BinopSEXP {
  // @ts-ignore
  return o.tag === "Binop";
}

// (Primitive) Unop
export class UnopSEXP extends IridiumSEXP {
  constructor(op: string, val: IridiumSEXP) {
    super("Unop");
    this.args.push(new StringSEXP(op));
    this.args.push(val);
  }

  // toString(space?: number): string {
  //   return `${printIriSpace(space)}UNOP[${this.args[0].toString(0)}] ${this.args[1].toString(0)}`
  // }
  toString(space?: number): string {
    const res = [];
    res.push(`${printIriSpace(space)}${this.tag}`);
    for (let s of this.args) {
      res.push(`${s.toString(10)}`);
    }
    return res.join("\n");
  }
}

// (Extension) JSArray
export class JSArraySEXP extends IridiumSEXP {
  constructor(vals: Array<IridiumSEXP>) {
    super("JSArray");
    vals.forEach(e => this.args.push(e));
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}JSArray [${this.args.map(e => e.toString(0)).join(", ")}]`
  }
}

// @ts-ignore
export function isJSArraySEXP(o: any): o is JSArraySEXP {
  // @ts-ignore
  return o.tag === "JSArray";
}

// (Extension) JSAppend
export class JSAppendSEXP extends IridiumSEXP {
  constructor(tmp: IridiumSEXP, insertionIdx: IridiumSEXP, spreadVal: IridiumSEXP, insertionIdxLoc: string, tmpLoc: string) {
    super("JSAppend");
    this.args.push(tmp);
    this.args.push(insertionIdx);
    this.args.push(spreadVal);
    this.args.push(new ResolveEnvBindingSEXP(insertionIdxLoc));
    this.args.push(new ResolveEnvBindingSEXP(tmpLoc));
    this.setSafe(false);
    this.setThisInit(false);
  }

  markSloppy() {
    this.setFlag("SLOPPY");
  }

  isSloppy() {
    return this.hasFlag("SLOPPY");
  }

  setThisInit(val: boolean) {
    this.setFlag("THISINIT", val);
  }

  isThisInit(): boolean {
    return this.getFlagBoolean("THISINIT")
  }

  setSafe(val: boolean) {
    this.setFlag("SAFE", val);
  }

  isSafe(): boolean {
    return this.getFlagBoolean("SAFE")
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}JSAppend [${this.args.map(e => e.toString(0)).join(", ")}]`
  }
}

// @ts-ignore
export function isJSAppendSEXP(o: any): o is JSAppendSEXP {
  // @ts-ignore
  return o.tag === "JSAppend";
}

// (Extension) JSDefineObjMethod
type JSDefineObjMethodSEXPFlags = "GET" | "SET" | "METHOD";
export class JSDefineObjMethodSEXP extends IridiumSEXP {
  constructor(obj: IridiumSEXP, key: IridiumSEXP, value: IridiumSEXP, kind: "method" | "get" | "set", store: string) {
    super("JSDefineObjMethod");
    this.args.push(obj);
    this.args.push(key);
    this.args.push(value);
    this.args.push(new ResolveEnvBindingSEXP(store));
    if (kind === "method") this.setFlag("METHOD");
    else if (kind === "get") this.setFlag("GET");
    else if (kind === "set") this.setFlag("SET");
    else throw new Error("Object method kind is invalid");
    this.setSafe(false);
    this.setThisInit(false);
  }

  markSloppy() {
    this.setFlag("SLOPPY");
  }

  isSloppy() {
    return this.hasFlag("SLOPPY");
  }

  setThisInit(val: boolean) {
    this.setFlag("THISINIT", val);
  }

  isThisInit(): boolean {
    return this.getFlagBoolean("THISINIT")
  }

  setSafe(val: boolean) {
    this.setFlag("SAFE", val);
  }

  isSafe(): boolean {
    return this.getFlagBoolean("SAFE")
  }

  toString(space?: number): string {
    const res = [];
    res.push(`${printIriSpace(space)}${this.tag}${printFlagString(this.flags)}`);
    for (let s of this.args) {
      res.push(`${printIriSpace(10)}${s.toString(0)}`);
    }
    return res.join("\n");
  }
}

// @ts-ignore
export function isJSDefineObjMethodSEXP(o: any): o is JSDefineObjMethodSEXP {
  // @ts-ignore
  return o.tag === "JSDefineObjMethod";
}

// (Extension) JSDefineObjProp
type JSDefineObjPropSEXPFlags = "GET" | "SET" | "METHOD";
export class JSDefineObjPropSEXP extends IridiumSEXP {
  constructor(obj: IridiumSEXP, key: IridiumSEXP, value: IridiumSEXP, store: string) {
    super("JSDefineObjProp");
    this.args.push(obj);
    this.args.push(key);
    this.args.push(value);
    this.args.push(new ResolveEnvBindingSEXP(store));
    this.setSafe(false);
    this.setThisInit(false);
  }

  markSloppy() {
    this.setFlag("SLOPPY");
  }

  isSloppy() {
    return this.hasFlag("SLOPPY");
  }

  setThisInit(val: boolean) {
    this.setFlag("THISINIT", val);
  }

  isThisInit(): boolean {
    return this.getFlagBoolean("THISINIT")
  }

  setSafe(val: boolean) {
    this.setFlag("SAFE", val);
  }

  isSafe(): boolean {
    return this.getFlagBoolean("SAFE")
  }

  toString(space?: number): string {
    const res = [];
    res.push(`${printIriSpace(space)}${this.tag}`);
    for (let s of this.args) {
      res.push(`${printIriSpace(10)}${s.toString(0)}`);
    }
    return res.join("\n");
  }
}

// @ts-ignore
export function isJSDefineObjPropSEXP(o: any): o is JSDefineObjPropSEXP {
  // @ts-ignore
  return o.tag === "JSDefineObjProp";
}


// (Extension) JSObject
export class JSObjectSEXP extends IridiumSEXP {
  constructor() {
    super("JSObject");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}${this.tag}{}`;
  }
}

// (Extension) JSCATCHINITSEXP
export class JSCATCHINITSEXP extends IridiumSEXP {
  constructor(ref: IridiumSEXP) {
    super("JSCATCHINIT");
    this.args.push(ref);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}CATCH INIT[${this.args[0].toString(0)}]`
  }
}

// (Extension) JSTHISINIT
export class JSTHISINITSEXP extends IridiumSEXP {
  constructor(ref: IridiumSEXP) {
    super("JSTHISINIT");
    this.args.push(ref);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}INIT[this -- ${this.args[0].toString(0)}]`
  }
}

// (Extension) JSSUPERCTRINIT
export class JSHOMEOBJSEXP extends IridiumSEXP {
  constructor(ref: IridiumSEXP) {
    super("JSHOMEOBJ");
    this.args.push(ref);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}INIT[<home_obj> -- ${this.args[0].toString(0)}]]`
  }

}

// (Extension) JSSUPERCTRINIT
export class JSSUPERCTRINITSEXP extends IridiumSEXP {
  constructor(ref: IridiumSEXP) {
    super("JSSUPERCTRINIT");
    this.args.push(ref);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}INIT[<super_ctr> -- ${this.args[0].toString(0)}]`
  }
}

// (Extension) JSNEWTARGETINIT
export class JSNEWTARGETINITSEXP extends IridiumSEXP {
  constructor(ref: IridiumSEXP) {
    super("JSNEWTARGETINIT");
    this.args.push(ref);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}INIT[<new_target> -- ${this.args[0].toString(0)}]`
  }
}

// (Extension) JSSUPEROBJINIT
export class JSSUPEROBJINITSEXP extends IridiumSEXP {
  constructor(ref: IridiumSEXP) {
    super("JSSUPEROBJINIT");
    this.args.push(ref);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}INIT[<super_obj> -- ${this.args[0].toString(0)}]`
  }
}

// // (Extension) JSToForInIterator
// export class JSToForInIteratorSEXP extends IridiumSEXP {
//   constructor(object: IridiumSEXP) {
//     super("JSToForInIterator");
//     this.args.push(object);
//   }

//   toString(space?: number): string {
//     return `${printIriSpace(space)}JSToForInIterator[${this.args[0].toString(0)}]`
//   }
// }

// (Extension) JSToObject
export class JSToObjectSEXP extends IridiumSEXP {
  constructor(obj: IridiumSEXP, target: string) {
    super("JSToObject");
    this.args.push(obj);
    this.args.push(new ResolveEnvBindingSEXP(target));
  }

  toString(space?: number): string {
    const res = [];
    res.push(`${printIriSpace(space)}${this.tag}`);
    for (let s of this.args) {
      res.push(`${printIriSpace(10)}${s.toString(0)}`);
    }
    return res.join("\n");
  }
}

// (Extension) JSInitialYield
export class JSInitialYieldSEXP extends IridiumSEXP {
  constructor() {
    super("JSInitialYield");
  }
}


// (Extension) JSCopyDataProperties
export class JSCopyDataPropertiesSEXP extends IridiumSEXP {
  constructor(exc_obj: string | IridiumSEXP, source: string, target: string, store: string) {
    super("JSCopyDataProperties");
    if (typeof exc_obj === "string") this.args.push(new EnvReadSEXP(exc_obj));
    else this.args.push(exc_obj);
    this.args.push(new EnvReadSEXP(source));
    this.args.push(new EnvReadSEXP(target));
    this.args.push(new ResolveEnvBindingSEXP(store));
    this.setSafe(false);
    this.setThisInit(false);
  }

  // flags
  markSloppy() {
    this.setFlag("SLOPPY");
  }

  isSloppy() {
    return this.hasFlag("SLOPPY");
  }

  setThisInit(val: boolean) {
    this.setFlag("THISINIT", val);
  }

  isThisInit(): boolean {
    return this.getFlagBoolean("THISINIT")
  }

  setSafe(val: boolean) {
    this.setFlag("SAFE", val);
  }

  isSafe(): boolean {
    return this.getFlagBoolean("SAFE")
  }

  toString(space?: number): string {
    const res = [];
    res.push(`${printIriSpace(space)}${this.tag} ${printFlagString(this.flags)}`);
    for (let s of this.args) {
      res.push(`${printIriSpace(10)}${s.toString(0)}`);
    }
    return res.join("\n");
  }
}

// @ts-ignore
export function isJSCopyDataPropertiesSEXP(o: any): o is JSCopyDataPropertiesSEXP {
  // @ts-ignore
  return o.tag === "JSCopyDataProperties";
}

// (Extension) JSForInStart
export class JSForInStartSEXP extends IridiumSEXP {
  constructor(obj: string, target: string) {
    super("JSForInStart");
    this.args.push(new EnvReadSEXP(obj));
    this.args.push(new ResolveEnvBindingSEXP(target));
  }

  toString(space?: number): string {
    const res = [];
    res.push(`${printIriSpace(space)}${this.tag}`);
    for (let s of this.args) {
      res.push(`${printIriSpace(10)}${s.toString(0)}`);
    }
    return res.join("\n");
  }
}

// (Extension) JSIteratorClose
export class JSIteratorCloseSEXP extends IridiumSEXP {
  constructor() {
    super("JSIteratorClose");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}${this.tag}`;
  }
}

// (Extension) JSForOfStart
export class JSForOfStartSEXP extends IridiumSEXP {
  constructor(obj: string | IridiumSEXP) {
    super("JSForOfStart");
    if (typeof (obj) === "string") {
      this.args.push(new EnvReadSEXP(obj));
    } else {
      this.args.push(obj);
    }
  }

  toString(space?: number): string {
    const res = [];
    res.push(`${printIriSpace(space)}${this.tag}`);
    for (let s of this.args) {
      res.push(`${printIriSpace(10)}${s.toString(0)}`);
    }
    return res.join("\n");
  }
}

// (Extension) JSForInNext
export class JSForInNextSEXP extends IridiumSEXP {
  constructor(iterator: string, stackTop: string, stackTopNext: string) {
    super("JSForInNext");
    this.args.push(new EnvReadSEXP(iterator));
    this.args.push(new ResolveEnvBindingSEXP(stackTop));
    this.args.push(new ResolveEnvBindingSEXP(stackTopNext));
  }
}

// (Extension) JSForOfNext
export class JSForOfNextSEXP extends IridiumSEXP {
  constructor(stackTop: string, stackTopNext: string) {
    super("JSForOfNext");
    this.args.push(new ResolveEnvBindingSEXP(stackTop));
    this.args.push(new ResolveEnvBindingSEXP(stackTopNext));
  }

  toString(space?: number): string {
    const res = [];
    res.push(`${printIriSpace(space)}${this.tag}`);
    for (let s of this.args) {
      res.push(`${printIriSpace(10)}${s.toString(0)}`);
    }
    return res.join("\n");
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

  toString(space?: number): string {
    return "❌";
  }
}

// (Extension) JSADDBRAND
export class JSADDBRANDSEXP extends IridiumSEXP {
  constructor(obj: IridiumSEXP, homeObj: IridiumSEXP) {
    super("JSADDBRAND");
    this.args.push(obj);
    this.args.push(homeObj);
  }
}

// (Extension) JSClass
export class JSClassSEXP extends IridiumSEXP {
  constructor(hasSuper: boolean, name: string, parent: IridiumSEXP, constructorLambda: LambdaSEXP, propInitLambda: IridiumSEXP, methodList: IridiumSEXP, staticMethodList: IridiumSEXP, brandPrototype: boolean, brandConstructor: boolean, staticPropInitLambda: IridiumSEXP) {
    super("JSClass");
    if (hasSuper) this.setFlag("Derived");
    if (brandPrototype) this.setFlag("BrandPrototype");
    if (brandConstructor) this.setFlag("BrandConstructor");
    this.args.push(new StringSEXP(name));
    this.args.push(parent);
    this.args.push(constructorLambda);
    this.args.push(propInitLambda);
    this.args.push(methodList);
    this.args.push(staticMethodList);
    this.args.push(staticPropInitLambda);
  }

  toString(space?: number): string {
    let res = [];
    res.push(`${printIriSpace(space)}JSClass`)
    const args = this.args.map(e => e.toString(10));
    res = [...res, ...args];
    return res.join("\n");
  }
}

// (Extension) JSModuleStart
export class JSModuleStartSEXP extends IridiumSEXP {
  constructor() {
    super("JSModuleStart");
  }
  toString(space?: number): string {
    return `${printIriSpace(space)}🟢`;
  }
}

// @ts-ignore
export function isJSModuleStartSEXP(o: any): o is JSModuleStartSEXP {
  // @ts-ignore
  return o.tag === "JSModuleStart";
}

// (Extension) JSModuleEnd
export class JSModuleEndSEXP extends IridiumSEXP {
  constructor() {
    super("JSModuleEnd");
  }
  toString(space?: number): string {
    return `${printIriSpace(space)}🔴`;
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

  toString(space?: number): string {
    return `${printIriSpace(space)}λ[${this.getStartBBIDX()}]`
  }
}

// @ts-ignore
export function isLambdaSEXP(o: any): o is LambdaSEXP {
  // @ts-ignore
  return o.tag === "Lambda";
}

// (Primitive) Call
export type CallSiteSEXPFlags = "Import" | "Super" | "V8Intrinsic" | "CCall" | "ConstructorCall" | "PrivateCall";
export class CallSiteSEXP extends IridiumSEXP {
  constructor(args: Array<IridiumSEXP>, closureFlag: [CallSiteSEXPFlags, IridiumPrimitives][]) {
    super("CallSite");
    args.forEach(a => this.args.push(a));
    closureFlag.forEach(flag => this.flags.push(flag));
  }

  // Utility
  isConstructorCall() {
    return this.hasFlag("ConstructorCall");
  }

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

  toString(space?: number): string {
    return `${printIriSpace(space)}CallSite[${printFlagString(this.flags)}](${this.args.map(e => e.toString(0)).join(", ")})`
  }
}


// Environment Operations
// (Primitive) EnvRead
export class EnvReadSEXP extends IridiumSEXP {
  constructor(id: string) {
    super("EnvRead");
    this.args.push(new ResolveEnvBindingSEXP(id));
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}EnvRead [${this.args[0].toString(0)}]`
  }
}

// @ts-ignore
export function isEnvReadSEXP(o: any): o is EnvReadSEXP {
  // @ts-ignore
  return o.tag === "EnvRead";
}

// (Primitive) Pool Binding
export type PoolBindingSEXPFlags = "StartBBIDX" | "REFIDX";
export class PoolBindingSEXP extends IridiumSEXP {
  constructor(idx: number, refIdx: number, lambda: LambdaSEXP) {
    super("PoolBinding");
    this.args.push(lambda);
    this.setStartBBIDX(idx);
    this.setREFIDX(refIdx);
  }

  setStartBBIDX(idx: number) {
    this.setFlag("StartBBIDX", idx);
  }

  getStartBBIDX(): number {
    return this.getFlagNumber("StartBBIDX");
  }

  setREFIDX(idx: number) {
    this.setFlag("REFIDX", idx);
  }

  getREFIDX(): number {
    return this.getFlagNumber("REFIDX");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}POOL[λ@${this.getStartBBIDX()}]`
  }
}

// @ts-ignore
export function isPoolBindingSEXP(o: any): o is PoolBindingSEXP {
  // @ts-ignore
  return o.tag === "PoolBinding";
}



// (Extension) JSCheckConstructor
export class JSCheckConstructorSEXP extends IridiumSEXP {
  constructor() {
    super("JSCheckConstructor");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}CHECK[CONSTRUCTOR_CALL]`
  }
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

// (Extension) JSModuleMeta
export class JSModuleMetaSEXP extends IridiumSEXP {
  constructor() {
    super("JSModuleMeta");
  }
}

// @ts-ignore
export function isJSModuleMetaSEXP(o: any): o is JSModuleMetaSEXP {
  // @ts-ignore
  return o.tag === "JSModuleMeta";
}

// (Extension) JSMODULEMETAINIT
export class JSMODULEMETAINITSEXP extends IridiumSEXP {
  constructor(ref: IridiumSEXP) {
    super("JSMODULEMETAINIT");
    this.args.push(ref);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}INIT[<module_meta> -- ${this.args[0].toString(0)}]`
  }
}

// @ts-ignore
export function isJSMODULEMETAINITSEXP(o: any): o is JSMODULEMETAINITSEXP {
  // @ts-ignore
  return o.tag === "JSMODULEMETAINIT";
}

// (Extension) JSARGUMENTSINIT
export class JSARGUMENTSINITSEXP extends IridiumSEXP {
  constructor(loc: string) {
    super("JSARGUMENTSINIT");
    this.args.push(new ResolveEnvBindingSEXP(loc));
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}INIT[arguments -- ${this.args[0].toString(0)}]`
  }
}

// @ts-ignore
export function isJSARGUMENTSINITSEXP(o: any): o is JSARGUMENTSINITSEXP {
  // @ts-ignore
  return o.tag === "JSARGUMENTSINIT";
}

// (Extension) JSMARGUMENTSINIT
export class JSMARGUMENTSINITSEXP extends IridiumSEXP {
  constructor(loc: string) {
    super("JSMARGUMENTSINIT");
    this.args.push(new ResolveEnvBindingSEXP(loc));
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}INIT[[m]arguments -- ${this.args[0].toString(0)}]`
  }
}

// @ts-ignore
export function isJSMARGUMENTSINITSEXP(o: any): o is JSMARGUMENTSINITSEXP {
  // @ts-ignore
  return o.tag === "JSMARGUMENTSINIT";
}

// (Extension) JSThisContext
export class JSScriptReturnSEXP extends IridiumSEXP {
  constructor() {
    super("JSScriptReturn");
  }
}

// @ts-ignore
export function isJSScriptReturnSEXP(o: any): o is JSScriptReturnSEXP {
  // @ts-ignore
  return o.tag === "JSScriptReturn";
}


// (Extension) JSCatchContext
export class JSCatchContextSEXP extends IridiumSEXP {
  constructor(val: string) {
    super("JSCatchContext");
    this.args.push(new ResolveEnvBindingSEXP(val));
  }

  getBindingName(): string {
    if (isResolveEnvBindingSEXP(this.args[0])) {
      return this.args[0].getBindingName();
    } else throw new Error("Expected binding in JSCatchContext Node");
  }
}

// @ts-ignore
export function isJSCatchContextSEXP(o: any): o is JSCatchContextSEXP {
  // @ts-ignore
  return o.tag === "JSCatchContext";
}


// (Extension) JSThisContext
export class JSThisContextAltSEXP extends IridiumSEXP {
  constructor() {
    super("JSThisContextAlt");
  }
}

// @ts-ignore
export function isJSThisContextAltSEXP(o: any): o is JSThisContextAltSEXP {
  // @ts-ignore
  return o.tag === "JSThisContextAlt";
}

// (Extension) JSSuperContext
export class JSSuperContextSEXP extends IridiumSEXP {
  constructor() {
    super("JSSuperContext");
  }
}

// @ts-ignore
export function isJSSuperContextSEXP(o: any): o is JSSuperContextSEXP {
  // @ts-ignore
  return o.tag === "JSSuperContext";
}

// (Extension) JSSloppyDeclarationCheck
export class JSSloppyDeclarationCheckSEXP extends IridiumSEXP {
  constructor(decl: string, kind: string) {
    super("JSSloppyDeclarationCheck");
    this.setFlag("NAME", decl);
    this.setFlag(kind);
  }
}

// @ts-ignore
export function isJSSloppyDeclarationCheckSEXP(o: any): o is JSSloppyDeclarationCheckSEXP {
  // @ts-ignore
  return o.tag === "JSSloppyDeclarationCheck";
}

// (Extension) JSSuperObjContext
export class JSSuperObjContextSEXP extends IridiumSEXP {
  constructor() {
    super("JSSuperObjContext");
  }
}

// @ts-ignore
export function isJSSuperObjContextSEXP(o: any): o is JSSuperObjContextSEXP {
  // @ts-ignore
  return o.tag === "JSSuperObjContext";
}

// (Extension) JSHomeObjContext
export class JSHomeObjContextSEXP extends IridiumSEXP {
  constructor() {
    super("JSHomeObjContext");
  }
}

// @ts-ignore
export function isJSHomeObjContextSEXP(o: any): o is JSHomeObjContextSEXP {
  // @ts-ignore
  return o.tag === "JSHomeObjContext";
}

// (Primitive) EnvWrite
export type EnvWriteFlags = "SAFE" | "THISINIT" | "SLOPPY";
export class EnvWriteSEXP extends IridiumSEXP {
  lval: string
  constructor(lval: string, rval: IridiumSEXP, safe: boolean, thisInit: boolean) {
    super("EnvWrite");
    this.lval = lval
    this.args.push(new ResolveEnvBindingSEXP(lval));
    this.args.push(rval);
    this.setSafe(safe);
    this.setThisInit(thisInit);
  }

  // Flags
  // markSloppyDecl() {
  //   this.setFlag("SLOPPYDECL");
  // }

  // isSloppyDecl() {
  //   return this.hasFlag("SLOPPYDECL");
  // }

  markSloppy() {
    this.setFlag("SLOPPY");
  }

  isSloppy() {
    return this.hasFlag("SLOPPY");
  }

  setThisInit(val: boolean) {
    this.setFlag("THISINIT", val);
  }

  isThisInit(): boolean {
    return this.getFlagBoolean("THISINIT")
  }

  setSafe(val: boolean) {
    this.setFlag("SAFE", val);
  }

  isSafe(): boolean {
    return this.getFlagBoolean("SAFE")
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}${this.isSloppy() ? "[SLOP]" : ""}${this.args[0].toString(0)} ${this.isSafe() ? "=" : "=."} ${this.args[1].toString(0)}`
  }
}

// @ts-ignore
export function isEnvWriteSEXP(o: any): o is EnvWriteSEXP {
  // @ts-ignore
  return o.tag === "EnvWrite";
}

// (Extension) JSEnvWrite
export type JSEnvWriteFlags = "SLOPPY" | "SAFE" | "THISINIT" | "JSLET" | "JSCONST" | "JSVAR" | "JSREST" | "JSARRDES" | "JSOBJDES";
export class JSEnvWriteSEXP extends IridiumSEXP {
  constructor(lval: IridiumSEXP, rval: IridiumSEXP | null, flag: JSEnvWriteFlags | undefined = undefined, thisInit: boolean) {
    super("JSEnvWrite");
    this.args.push(lval);
    if (rval) this.args.push(rval);
    if (flag) this.flags.push([flag, null]);
    this.setSafe(flag ? true : false);
    this.setThisInit(thisInit);
  }

  // Utility

  // markSloppyDecl() {
  //   this.setFlag("SLOPPYDECL");
  // }

  // isSloppyDecl() {
  //   return this.hasFlag("SLOPPYDECL");
  // }

  markSloppy() {
    this.setFlag("SLOPPY");
  }

  setThisInit(val: boolean) {
    this.setFlag("THISINIT", val);
  }

  isThisInit(): boolean {
    return this.getFlagBoolean("THISINIT")
  }

  setSafe(val: boolean) {
    this.setFlag("SAFE", val);
  }

  isSafe() {
    return this.getFlagBoolean("SAFE");
  }

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
      Object.setPrototypeOf(this, new EnvWriteSEXP("", new NullSEXP(), this.isSafe(), this.isThisInit()));
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
        } else throw new Error("In Arr Decl, only expected StringSEXP");
      }
    } else if (this.isObjDecl()) {
      for (let p of lVal.args) {
        if (isResolveEnvBindingSEXP(p)) { // Rest case
          res.push(p.getBindingName());
        } else if (isListSEXP(p)) {
          if (isResolveEnvBindingSEXP(p.args[1])) res.push(p.args[1].getBindingName());
          else {
            throw new Error("In Obj Decl, expected the created binding to be a StringSEXP");
          }

        }
      }
    }
    return res;
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}${this.tag}${printFlagString(this.flags)}${this.args.length > 0 ? "\n" + this.args.map(e => e.toString(10)).join("\n") : ""}`;
  }
}

// (Extension) JSEnvWrite
export class JSFuncDeclSEXP extends IridiumSEXP {
  constructor(lval: IridiumSEXP, rval: IridiumSEXP) {
    super("JSFuncDecl");
    this.args.push(lval);
    this.args.push(rval);
  }

  toString(space?: number): string {
    if (!space) space = 0;
    let res = [];
    res.push(`${printIriSpace(space)}${this.tag}`);
    const args = this.args.map(e => e.toString(10));
    res = [...res, ...args];
    return res.join("\n");
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
export function isJSEnvWriteSEXP(o: any): o is JSEnvWriteSEXP {
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

  toString(space?: number): string {
    return `${printIriSpace(space)}${this.args[0].toString(0)}.${this.args[1].toString(0)}`
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

  toString(space?: number): string {
    return `${printIriSpace(space)}${this.args[0].toString(0)}.${this.args[1].toString(0)} = ${this.args[2].toString(0)}`
  }
}

// (Primitive) JSClassMethodDefine
export class JSClassMethodDefineSEXP extends IridiumSEXP {
  constructor(object: string, field: string, right: IridiumSEXP) {
    super("JSClassMethodDefine");
    this.args.push(new ResolveEnvBindingSEXP(object));
    this.args.push(new StringSEXP(field));
    this.args.push(right);
  }
}

// (Extended) JSComputedFieldRead
export class JSComputedFieldReadSEXP extends IridiumSEXP {
  constructor(object: string, field: string | IridiumSEXP) {
    super("JSComputedFieldRead");
    this.args.push(new ResolveEnvBindingSEXP(object));
    if (typeof field === "string")
      this.args.push(new EnvReadSEXP(field));
    else
      this.args.push(field);
  }
}

// (Extended) JSComputedFieldWrite
export class JSComputedFieldWriteSEXP extends IridiumSEXP {
  constructor(object: string, field: string | IridiumSEXP, right: IridiumSEXP) {
    super("JSComputedFieldWrite");
    this.args.push(new ResolveEnvBindingSEXP(object));
    if (typeof field === "string")
      this.args.push(new EnvReadSEXP(field));
    else
      this.args.push(field);
    this.args.push(right);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}${this.args[0].toString(0)}.${this.args[1].toString(0)} = ${this.args[2].toString(0)}`
  }
}

// (Extended) JSPrivateFieldRead
export class JSPrivateFieldReadSEXP extends IridiumSEXP {
  constructor(object: string, field: string) {
    super("JSPrivateFieldRead");
    this.args.push(new ResolveEnvBindingSEXP(object));
    this.args.push(new ResolvePrivateEnvBindingSEXP(field));
  }
}

// (Extended) JSPrivateFieldWrite
export class JSPrivateFieldWriteSEXP extends IridiumSEXP {
  constructor(object: string, field: EnvReadSEXP | string, right: IridiumSEXP) {
    super("JSPrivateFieldWrite");
    this.args.push(new ResolveEnvBindingSEXP(object));
    if (isEnvReadSEXP(field)) this.args.push(field);
    else this.args.push(new ResolvePrivateEnvBindingSEXP(field));
    this.args.push(right);
  }
}

// (Extended) JSSuperFieldRead
export class JSSuperFieldReadSEXP extends IridiumSEXP {
  constructor(field: string) {
    super("JSSuperFieldRead");
    this.args.push(new EnvReadSEXP("this"));
    this.args.push(new EnvReadSEXP("<super_obj>"));
    this.args.push(new StringSEXP(field));
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}[${this.args[0].toString(0)}, ${this.args[1].toString(0)}].${this.args[2].toString(0)}`
  }
}

// (Extended) JSSuperFieldWrite
export class JSSuperFieldWriteSEXP extends IridiumSEXP {
  constructor(field: string, value: IridiumSEXP) {
    super("JSSuperFieldWrite");
    this.args.push(new EnvReadSEXP("this"));
    this.args.push(new EnvReadSEXP("<super_obj>"));
    this.args.push(new StringSEXP(field));
    this.args.push(value);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}super.${this.args[2].toString(0)} = ${this.args[3].toString(0)}`
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

  toString(space?: number): string {
    return `${printIriSpace(space)}GOTO[${this.getIDX()}]`
  }
}

// (Extended) PushCatchContext
export type PushCatchContextFlags = "IDX";
export class PushCatchContextSEXP extends IridiumSEXP {
  constructor(idx: number) {
    super("PushCatchContext");
    this.setIDX(idx);
  }

  // Flags
  setIDX(idx: number) {
    this.setFlag("IDX", idx)
  }

  getIDX(): number {
    return this.getFlagNumber("IDX");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}CATCH[${this.getIDX()}]`
  }
}

// (Extended) PushForOfCatchContext
export type PushForOfCatchContextFlags = "IDX";
export class PushForOfCatchContextSEXP extends IridiumSEXP {
  constructor(obj: IridiumSEXP) {
    super("PushForOfCatchContext");
    this.args.push(obj);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}FOR-OF-CATCH[${this.args[0].toString(0)}]`
  }
}

// (Extended) ThrowSEXP
export class ThrowSEXP extends IridiumSEXP {
  constructor(val: IridiumSEXP) {
    super("Throw");
    this.args.push(val);
  }

  // Flags
  toString(space?: number): string {
    return `${printIriSpace(space)}Throw ${this.args[0].toString(0)}`
  }
}

// (Extended) PopCatchContext
export type PopCatchContextFlags = "IDX";
export class PopCatchContextSEXP extends IridiumSEXP {
  constructor() {
    super("PopCatchContext");
  }

  // Flags
  toString(space?: number): string {
    return `${printIriSpace(space)}POP CATCH`
  }
}

// (Extended) InvokeFinalizer
export type InvokeFinalizerFlags = "IDX";
export class InvokeFinalizerSEXP extends IridiumSEXP {
  constructor(idx: number) {
    super("InvokeFinalizer");
    this.setIDX(idx);
  }

  // Flags
  setIDX(idx: number) {
    this.setFlag("IDX", idx)
  }

  getIDX(): number {
    return this.getFlagNumber("IDX");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}FINALIZER[${this.getIDX()}]`
  }
}

// (Extension) ReturnAsync
export class ReturnAsyncSEXP extends IridiumSEXP {
  constructor(val: IridiumSEXP) {
    super("ReturnAsync");
    this.args.push(val);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}return[async] ${this.args[0].toString(0)}`
  }
}

// (Primitive) Return
export class ReturnSEXP extends IridiumSEXP {
  constructor(val: IridiumSEXP) {
    super("Return");
    this.args.push(val);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}return ${this.args[0].toString(0)}`
  }
}

// @ts-ignore
export function isReturnSEXP(o: any): o is ReturnSEXP {
  // @ts-ignore
  return o.tag === "Return";
}

// (Primitive) Ret
export class RetSEXP extends IridiumSEXP {
  constructor() {
    super("Ret");
  }
}

// (Primitive) IfElseJump
export type IfElseJumpSEXPFlags = "TRUE" | "FALSE";
export class IfElseJumpSEXP extends IridiumSEXP {
  constructor(test: IridiumSEXP | null, trueTarget: number, falseTarget: number) {
    super("IfElseJump");
    if (test) this.setTest(test);
    else this.setTest(new NullSEXP());
    this.setTRUE(trueTarget);
    this.setFALSE(falseTarget);
  }

  // Args
  setTest(test: IridiumSEXP) {
    this.args[0] = test;
  }

  getTest() {
    return this.args[0];
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

  toString(space?: number): string {
    return `${printIriSpace(space)}GOTO (${this.getTest().toString(0)}) ? ${this.getTRUE()} : ${this.getFALSE()}`;
  }
}

// (Primitive) IfJumpSEXP
export type IfJumpSEXPFlags = "IDX" | "NOT";
export class IfJumpSEXP extends IridiumSEXP {
  constructor(test: IridiumSEXP | null, target: number) {
    super("IfJump");
    if (test) this.setTest(test);
    else this.setTest(new NullSEXP());
    this.setIDX(target);
  }

  // Args
  setNot() {
    this.setFlag("NOT");
  }

  unsetNot() {
    this.removeFlag("NOT");
  }

  isNot() {
    return this.hasFlag("NOT");
  }

  setTest(test: IridiumSEXP) {
    this.args[0] = test;
  }

  getTest() {
    return this.args[0];
  }

  // Flags
  setIDX(idx: number) {
    this.setFlag("IDX", idx)
  }

  getIDX(): number {
    return this.getFlagNumber("IDX");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}GOTO (${this.isNot() ? "! " : ""}${this.getTest().toString(0)}) ? GOTO ${this.getIDX()} : 👇`;
  }
}

// Abstract Operations



// (Extension) ResolvePrivateEnvBindingSEXP
export class ResolvePrivateEnvBindingSEXP extends IridiumSEXP {
  constructor(id: string) {
    super("ResolvePrivateEnvBinding");
    this.args.push(new StringSEXP(id));
  }

  getBindingName(): string {
    let res = this.args[0]
    if (isStringSEXP(res)) return res.getVal()
    throw new Error("Cant get binding for ResolvePrivateEnvBindingSEXP")
  }
}

// @ts-ignore
export function isResolvePrivateEnvBindingSEXP(o: any): o is ResolvePrivateEnvBindingSEXP {
  // @ts-ignore
  return o.tag === "ResolvePrivateEnvBinding";
}

// (Extension) ResolveBreakTarget
export class ResolveBreakTargetSEXP extends IridiumSEXP {
  constructor(label: string | null = null) {
    super("ResolveBreakTarget");
    if (label) this.setLabel(label);
  }

  // Args
  hasLabel(): boolean {
    return this.hasFlag("Label");
  }

  setLabel(label: string) {
    this.setFlag("Label", label);
  }

  getLabel(): string {
    return this.getFlagString("Label");
  }
}

// @ts-ignore
export function isResolveBreakTargetSEXP(o: any): o is ResolveBreakTargetSEXP {
  // @ts-ignore
  return o.tag === "ResolveBreakTarget";
}

// (Extension) ContinueTargetSEXP
export class ResolveContinueTargetSEXP extends IridiumSEXP {
  constructor(label: string | null = null) {
    super("ResolveContinueTarget");
    if (label) this.setLabel(label);
  }

  // Args
  hasLabel(): boolean {
    return this.hasFlag("Label");
  }

  setLabel(label: string) {
    this.setFlag("Label", label);
  }

  getLabel(): string {
    return this.getFlagString("Label");
  }
}

// @ts-ignore
export function isResolveContinueTargetSEXP(o: any): o is ResolveContinueTargetSEXP {
  // @ts-ignore
  return o.tag === "ResolveContinueTarget";
}
