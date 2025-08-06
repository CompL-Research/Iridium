import { printFlagString, printIriSpace } from "#utils";
import { IridiumBuildContext } from "../IRIDIUMV2";
import { isResolveEnvBindingSEXP, ResolveEnvBindingSEXP, ResolvePrivateEnvBindingSEXP } from "./AbstractOperations";
import { IridiumSEXP } from "./General";
import { isLambdaSEXP, isListSEXP, LambdaSEXP, ListSEXP, NullSEXP, StringSEXP } from "./Primitives";

/**
 * @group Environment
 * 
 * @description
 * 
 * Flags indicating the kind of binding.
 */
export type JSEnvBindingFlags = "JSARG" | "JSRESTARG" | "JSLET" | "JSCONST" | "JSVAR";


/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group Environment
 * 
 * @description
 * 
 * EnvBinding represents an environment binding.
 * 
 * #### Structure
 * 
 * - `FLAG(NAME)`: The name of the binding.
 * 
 * - `FLAG(ASW)`: Always Safe Write. Bindings like argument bindings are declared as ASWs as writing to them is always safe in any scope.
 * 
 * - `FLAG(JSARG | JSRESTARG | JSLET | JSCONST | JSVAR)`: A JS binding can be one of this type {@link}.
 * 
 * - `FLAG(IDX)`: A unique index is assigned to each binding.
 * 
 * - `FLAG(REFIDX)`: Reference IDX refers to the offset of the binding on the stack frame.
 * 
 * - `FLAG(Scope)`: The scope number of the identifier, useful during analysis and code generation.
 * 
 * - `FLAG(ParentScope)`: The scope number of the enclosing lexical scope.
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

  // Utility
  getDeclaration(): string {
    return this.getName();
  }

  getKind(): string {
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
 * @group Environment
 * 
 * @description
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
 * @group Environment
 * 
 * @description
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
 * @group Environment
 * 
 * @description
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
 * 
 * @extends {IridiumSEXP}
 * 
 * @group Environment
 * 
 * @description
 * 
 * This object stores the bindings used in a logical stack frame.
 * The bindings may be local to the frame or may reference remote objects.
 * This also stores the references made to closure objects in the LambdaPool.
 * 
 * #### Structure
 * 
 * - `ARG(localBindings)`: A {@link ListSEXP} object containing local bindings {@link EnvBindingSEXP}.
 * 
 * - `ARG(remoteBindings)`: A {@link ListSEXP} object containing remote bindings {@link RemoteEnvBindingSEXP}.
 * 
 * - `ARG(lambdas)`: A {@link ListSEXP} object containing pool bindings {@link PoolBindingSEXP} (used to store lambdas in Iridium).
 * 
 * - `FLAG(ParentScope)`: IDX of parent closure scope.
 * 
 */
export class BindingsSEXP extends IridiumSEXP {
  constructor(parentScope: number) {
    super("Bindings");
    this.setParentScope(parentScope);

    const localBindings = new ListSEXP([]);
    localBindings.setType("EnvBinding");
    this.setLocalBindings(localBindings);

    const remoteBindings = new ListSEXP([]);
    remoteBindings.setType("RemoteEnvBinding");
    this.setRemoteBindings(remoteBindings);

    const lambdas = new ListSEXP([]);
    lambdas.setType("PoolBinding");
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
  addLocalBinding(binding: EnvBindingSEXP) {
    let localBindings = this.getLocalBindings().args;
    localBindings.push(binding);
  }

  addRemoteBinding(binding: RemoteEnvBindingSEXP) {
    this.getRemoteBindings().args.push(binding);
  }

  addLambdaPoolBinding(binding: PoolBindingSEXP) {
    let poolBindings = this.getLambdaPoolBindings().args;
    poolBindings.push(binding);
  }

  /**
   * 
   * This function returns the binding for a given lookup. 
   * If the binding cannot be found, it returns a null.
   * 
   * @param name Identifier to lookup
   * @param lookupScope Current lookup scope
   * @returns {@link EnvBindingSEXP} | {@link RemoteEnvBindingSEXP} | null
   */
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

  /**
   * Returns true if a binding of the specific shape already exists in the Bindings object.
   * 
   * @param idx Binding IDX
   * @param name Name of the binding
   * @param flag binding kind
   * @param localScope declared scope
   * @param parentScope parent scope
   * @returns 
   */

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

  /**
   * 
   * Given a {@link RemoteEnvBindingSEXP} it returns the effective resultant {@link EnvBindingSEXP}.
   * 
   * @param binding Name of the binding
   * @returns {@link EnvBindingSEXP}
   */
  resolveRemoteBinding(binding: RemoteEnvBindingSEXP): EnvBindingSEXP {
    let containedBinding = binding.args[0];
    if (isEnvBindingSEXP(containedBinding)) {
      return containedBinding;
    } else if (isRemoteEnvBindingSEXP(containedBinding)) {
      return this.resolveRemoteBinding(containedBinding);
    }
    throw new Error("RemoteEnvBindingSEXP contains invalid object");
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


export class EnvReadSEXP extends IridiumSEXP {
  constructor(id: string) {
    super("EnvRead");
    this.args.push(new ResolveEnvBindingSEXP(id));
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}EnvRead [${this.args[0].toString(0)}]`
  }
}

export type EnvWriteFlags = "SAFE" | "THISINIT" | "SLOPPY";
export class EnvWriteSEXP extends IridiumSEXP {
  lval: string
  constructor(lval: string, rval: IridiumSEXP, safe: boolean, thisInit: boolean) {
    super("EnvWrite");
    this.lval = lval
    this.setLValTarget(new ResolveEnvBindingSEXP(lval));
    this.setRVal(rval);
    this.setSafe(safe);
    this.setThisInit(thisInit);
  }

  // Args
  setLValTarget(target: IridiumSEXP) {
    this.args[0] = target;
  }

  getLValTarget(): IridiumSEXP {
    return this.args[0];
  }

  setRVal(rval: IridiumSEXP) {
    this.args[1] = rval;
  }

  getRVal(): IridiumSEXP {
    return this.args[1];
  }

  // Flags
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
    this.setLValTarget(lval);
    if (rval) this.setRVal(rval);
    if (flag) this.flags.push([flag, null]);
    this.setSafe(flag ? true : false);
    this.setThisInit(thisInit);
  }

  // Args
  setLValTarget(target: IridiumSEXP) {
    this.args[0] = target;
  }

  getLValTarget(): IridiumSEXP {
    return this.args[0];
  }

  setRVal(rval: IridiumSEXP) {
    this.args[1] = rval;
  }

  getRVal(): IridiumSEXP {
    return this.args[1];
  }

  hasRVal() {
    return this.args.length > 1
  }

  // Flags

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


export function isJSEnvWriteSEXP(o: any): o is JSEnvWriteSEXP {
  // @ts-ignore
  return o.tag === "JSEnvWrite";
}


// @ts-ignore
export function isEnvReadSEXP(o: any): o is EnvReadSEXP {
  // @ts-ignore
  return o.tag === "EnvRead";
}

/**
 * @group TSHelper
 */
export function isBindingsSEXP(o: any): o is BindingsSEXP {
  // @ts-ignore
  return o.tag === "Bindings";
}

/**
 * @group TSHelper
 */
export function isPoolBindingSEXP(o: any): o is PoolBindingSEXP {
  // @ts-ignore
  return o.tag === "PoolBinding";
}

/**
 * @group TSHelper
 */
export function isGlobalBindingSEXP(o: any): o is GlobalBindingSEXP {
  // @ts-ignore
  return o.tag === "GlobalBinding";
}

/**
 * @group TSHelper
 */
export function isRemoteEnvBindingSEXP(o: any): o is RemoteEnvBindingSEXP {
  // @ts-ignore
  return o.tag === "RemoteEnvBinding";
}

/**
 * @group TSHelper
 */
export function isEnvBindingSEXP(o: any): o is EnvBindingSEXP {
  // @ts-ignore
  return o.tag === "EnvBinding";
}

