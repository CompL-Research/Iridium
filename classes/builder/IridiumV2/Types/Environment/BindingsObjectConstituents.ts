import { printFlagString, printIriSpace } from "#utils";
import { IridiumSEXP } from "../Structural/General";
import { isLambdaSEXP, LambdaSEXP } from "../RVAL/Primitives";

/**
 * 
 * @group TSHelper
 * 
 */
export type JSEnvBindingFlags = "JSARG" | "JSRESTARG" | "JSLET" | "JSCONST" | "JSVAR";


/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group RVAL
 * 
 * @remarks
 * 
 * EnvBinding represents an environment binding.
 * 
 * #### Structure
 * 
 * - `FLAG(NAME)`: The name of the binding.
 * 
 * - `FLAG(ASW)`: Always Safe Write. Bindings like argument bindings are declared as ASWs as writing to them is always safe in any scope.
 * 
 * - `FLAG(JSARG | JSRESTARG | JSLET | JSCONST | JSVAR)`: A JS binding can be one of this type {@link JSEnvBindingFlags}.
 * 
 * - `FLAG(IDX)`: A unique index is assigned to each binding.
 * 
 * - `FLAG(REFIDX)`: Reference IDX refers to the offset of the binding on the stack frame.
 * 
 * - `FLAG(Scope)`: The scope number of the identifier, useful during analysis and code generation.
 * 
 * - `FLAG(ParentScope)`: The scope number of the enclosing lexical scope.
 * 
 * - `FLAG(NEXT)`: The REFIDX of the NEXT lexical variable.
 * 
 */
export class EnvBindingSEXP extends IridiumSEXP {
  constructor(refIdx: number, idx: number, b: string, flags: [JSEnvBindingFlags, null][], scope: number, parentScope: number) {
    super("EnvBinding");
    this.setName(b);
    flags.forEach(flag => this.flags.push(flag));
    this.setIDX(idx);
    this.setREFIDX(refIdx);
    this.setScope(scope);
    this.setParentScope(parentScope);
  }

  // Flags
  setName(name: string) {
    this.setFlag("NAME", name);
  }

  getName(): string {
    return this.getFlagString("NAME");
  }

  markASW() {
    this.setFlag("ASW");
  }

  isASW() {
    return this.hasFlag("ASW");
  }

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

  setNEXT(idx: number) {
    this.setFlag("NEXT", idx);
  }

  getNEXT(): number {
    return this.getFlagNumber("NEXT");
  }

  // Utility
  getDeclaration(): string {
    return this.getName();
  }

  getKind(): JSEnvBindingFlags {
    if (this.hasFlag("JSLET")) return "JSLET";
    if (this.hasFlag("JSCONST")) return "JSCONST";
    if (this.hasFlag("JSVAR")) return "JSVAR";
    if (this.hasFlag("JSARG")) return "JSARG";
    if (this.hasFlag("JSRESTARG")) return "JSRESTARG";
    throw new Error("EnvBindingSEXP, unknown kind");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}[${this.getREFIDX()}] ${this.isASW() ? "{ASW}" : ""} ${this.getKind()} ${this.getDeclaration()}`
  }
}

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group RVAL
 * 
 * @remarks
 * 
 * RemoteEnvBinding represents a reference to a remote binding (i.e. from an enclosing parent scope).
 * Its argument may contain nested {@link RemoteEnvBindingSEXP}, but it always terminates with a {@link EnvBindingSEXP}.
 * 
 * #### Structure
 * 
 * - `ARG(parentReference)`: An {@link EnvBindingSEXP} or {@link RemoteEnvBindingSEXP}.
 * 
 * - `FLAG(REFIDX)`: Reference IDX refers to the offset of the binding on the stack frame.
 * 
 * - `FLAG(NSIMPORT)`: Indicates that the current binding stores the result of a namespace import.
 * 
 */
export class RemoteEnvBindingSEXP extends IridiumSEXP {
  constructor(binding: IridiumSEXP, refIDX: number) {
    super("RemoteEnvBinding");
    this.setREFIDX(refIDX);
    this.setParentReference(binding);
  }

  // Args
  setParentReference(binding: IridiumSEXP) {
    this.args[0] = binding;
  }

  getParentReference(): IridiumSEXP {
    return this.args[0];
  }

  // Flags
  setREFIDX(val: number) {
    this.setFlag("REFIDX", val);
  }

  getREFIDX(): number {
    return this.getFlagNumber("REFIDX");
  }

  setNSImport() {
    this.setFlag("NSIMPORT");
  }

  unsetNSImport() {
    this.removeFlag("NSIMPORT");
  }

  isNSImport(): boolean {
    return this.hasFlag("NSIMPORT");
  }

  // Utility
  resolveRemoteBinding(binding: RemoteEnvBindingSEXP): EnvBindingSEXP {
    let containedBinding = binding.args[0];
    if (isEnvBindingSEXP(containedBinding)) {
      return containedBinding;
    } else if (isRemoteEnvBindingSEXP(containedBinding)) {
      return this.resolveRemoteBinding(containedBinding);
    }
    throw new Error("RemoteEnvBindingSEXP contains invalid object");
  }

  getLookupTrace(binding: RemoteEnvBindingSEXP, res: Array<any> = []): Array<any> {
    res.push(binding.getREFIDX());
    let containedBinding = binding.args[0];
    if (isEnvBindingSEXP(containedBinding)) {
      res.push(containedBinding.getREFIDX());
      return res;
    } else if (isRemoteEnvBindingSEXP(containedBinding)) {
      res.push(containedBinding.getREFIDX());
      return this.getLookupTrace(containedBinding);
    }
    throw new Error("RemoteEnvBindingSEXP, failed to get lookup trace");
  }

  toString(space?: number): string {
    if (isEnvBindingSEXP(this.args[0])) { // Top Level Binding
      return `${printIriSpace(space)}🟧${this.isNSImport() ? "[NS]" : ""}(${this.getLookupTrace(this).join("-")})${this.resolveRemoteBinding(this).toString()}`;
    }
    return `${printIriSpace(space)}🟥${this.isNSImport() ? "[NS]" : ""}(${this.getLookupTrace(this).join("-")})${this.resolveRemoteBinding(this).toString()}`;
  }
}


/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group RVAL
 * 
 * @remarks
 * 
 * GlobalBinding represents a reference to a global binding (i.e. not declared in any declared scope).
 * 
 * #### Structure
 * 
 * - `FLAG(NAME)`: The name of the binding.
 * 
 */
export class GlobalBindingSEXP extends IridiumSEXP {
  constructor(id: string) {
    super("GlobalBinding");
    this.setName(id);
  }

  // Flags
  setName(name: string) {
    this.setFlag("NAME", name);
  }

  getName(): string {
    return this.getFlagString("NAME");
  }

  getDeclaration(): string {
    return this.getName();
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}🟪[${this.getName()}]`
  }

}

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group RVAL
 * 
 * @remarks
 * 
 * PoolBinding represents a reference to a global binding (i.e. not declared in any declared scope).
 * 
 * #### Structure
 * 
 * - `ARG(lambda)`: A {@link LambdaSEXP} object.
 * 
 * - `FLAG(StartBBIDX)`: IDX of the start BB.
 * 
 * - `FLAG(REFIDX)`: Reference IDX refers to the offset of the binding on the iridium constant pool.
 * 
 */
export class PoolBindingSEXP extends IridiumSEXP {
  constructor(idx: number, refIdx: number, lambda: LambdaSEXP) {
    super("PoolBinding");
    this.setLambda(lambda);
    this.setStartBBIDX(idx);
    this.setREFIDX(refIdx);
  }

  // Args
  setLambda(lambda: LambdaSEXP) {
    this.args[0] = lambda;
  }

  getLambda(): LambdaSEXP {
    if (!isLambdaSEXP(this.args[0])) throw new Error("Expected LambdaSEXP");
    return this.args[0];
  }
  
  // Flags
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

/**
 * @hidden
 */
export function isPoolBindingSEXP(o: any): o is PoolBindingSEXP {
  // @ts-ignore
  return o.tag === "PoolBinding";
}

/**
 * @hidden
 */
export function isGlobalBindingSEXP(o: any): o is GlobalBindingSEXP {
  // @ts-ignore
  return o.tag === "GlobalBinding";
}

/**
 * @hidden
 */
export function isRemoteEnvBindingSEXP(o: any): o is RemoteEnvBindingSEXP {
  // @ts-ignore
  return o.tag === "RemoteEnvBinding";
}

/**
 * @hidden
 */
export function isEnvBindingSEXP(o: any): o is EnvBindingSEXP {
  // @ts-ignore
  return o.tag === "EnvBinding";
}
