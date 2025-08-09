import { printFlagString, printIriSpace } from "#utils";
import { EnvWriteSEXP } from "../Environment";
import { ListSEXP, NullSEXP } from "../RVAL/Primitives";
import { IridiumSEXP } from "../Structural/General";
import { isResolveEnvBindingSEXP, ResolveEnvBindingSEXP } from "./Resolution";

/**
 * @group TSHelper
 */
export type JSEnvWriteTypes = "JSLET" | "JSCONST" | "JSVAR";

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group STMT
 * 
 * @remarks
 * 
 * A JSExplicitBindingDeclaration is used to either declare a new binding, and also (optionally) initialize it.
 * After resolution, all JSWrites are reduced down to {@link EnvWriteSEXP} nodes.
 * In case a new binding was declared, the resolution pass would end up finding the relevant scope,
 * allocate space on the stack and take care of the initialization at scope start.
 * After the initialization is done, all declarations can be basically reduced down to simple environment writes.
 * The `SAFE`, `THISINIT` and `SLOPPY` flags are used to handle features like TDZ where writes/reads to a binding before
 * its declaration is reached is invalid. Such restricted accesses to the environment are made explicit in Iridium.
 * 
 * 
 * #### TODO Notes
 * 
 * See all places this node is created, ensure there is no way it can end up as an RVal.
 * 
 * #### Resolutions
 * 
 * - {@link EnvWriteSEXP}: A binding found in the immediate enclosing closure scope.
 * 
 * #### Structure
 * 
 * - `ARG(lValTarget)`: The storage target location
 * 
 * - `ARG(rVal)`: The value to store (possible nothing, in case of just a declaration).
 * 
 * - `FLAG(JSLET | JSCONST | JSVAR)`: The kind of the declaration, one of these allowed types ({@link JSEnvWriteTypes}).
 * 
 * - `FLAG(SAFE)`: Indicates whether the writes being performed are safe.
 * 
 * - `FLAG(THISINIT)`: Indicates whether the write is being performed to `this`, in this case it will never be true but is kept around for implementation consistency during lowering.
 * 
 * - `FLAG(SLOPPY)`: Indicates whether the writes to target locations is sloppy.
 * 
 */
export class JSExplicitBindingDeclarationSEXP extends IridiumSEXP {
  constructor(lval: IridiumSEXP, rval: IridiumSEXP | null, kind: JSEnvWriteTypes | undefined = undefined, thisInit: boolean) {
    super("JSExplicitBindingDeclaration");
    this.setLValTarget(lval);
    if (rval) this.setRVal(rval);
    if (kind) this.setKind(kind);
    this.setSafe(kind ? true : false); // If this is a declaration, it is safe by default
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
  setKind(kind: JSEnvWriteTypes) {
    this.setFlag(kind);
  }

  getKind(): JSEnvWriteTypes {
    if (this.hasFlag("JSLET")) return "JSLET";
    if (this.hasFlag("JSCONST")) return "JSCONST";
    if (this.hasFlag("JSVAR")) return "JSVAR";
    throw new Error("JSSloppyDeclarationCheckSEXP, unknown kind");
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

  // Utils
  reduceJSDecl() {
    this.tag = "EnvWrite";
    Object.setPrototypeOf(this, new EnvWriteSEXP("", new NullSEXP(), this.isSafe(), this.isThisInit()));
    this.flags = this.flags.filter(e => e[0] !== "JSLET" && e[0] !== "JSCONST" && e[0] !== "JSVAR")
  }

  getDeclaredBindings() {
    let lVal = this.args[0];
    const res: Array<string> = [];
    if (!isResolveEnvBindingSEXP(lVal)) throw new Error("Expected ResolveEnvBindingSEXP");
    res.push(lVal.getBindingName());
    return res;
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}${this.tag}${printFlagString(this.flags)}${this.args.length > 0 ? "\n" + this.args.map(e => e.toString(10)).join("\n") : ""}`;
  }
}

/**
 * @group TSHelper
 */
export type JSImplicitBindingDeclarationTypes = "JSLET" | "JSCONST" | "JSVAR";

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group STMT
 * 
 * @remarks
 * 
 * JSImplicitBindingDecl is a way to add and initialize implicit bindings to an environment.
 * 
 * - The bindings that are contained in square brackets are bindings introduced by Iridium, and do not map to any identifiers created by the user.
 * 
 * - The bindings `arguments` and `this` correspond to the actual bindings visible to user.
 * 
 * #### Possible OPID's
 * 
 * 0. `arguments`: Declares and initializes the `arguments` object (see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments).
 * 
 * 1. `arguments`: Declares and initializes the **mapped** `arguments` object (see: https://medium.com/@dozie22/arguments-object-in-javascript-cf8203d92ab7).
 * 
 * 2. `<this_func>`: Declares and initializes the `<this_func>` special object; the prototype of this object is used to call the `super` class constructor.
 * 
 * 3. `<new_target>`: Declares and initializes the `<new_target>` object; this can be used to check if the function was called as a constructor or not.
 * 
 * 4. `<home_obj>`: Declares and initializes the `<home_obj>` object; the prototype of this object is used to access the `super` class methods.
 * 
 * 5. `<var_obj>`: Declares and initializes the `<var_obj>` object; Not used currently.
 * 
 * 6. `<module_meta>`: Declares and initializes the `<module_meta>` (same as `import.meta` provided in the source code) object; It is generally used to get metadata such as filepath of the module/etc.
 * 
 * 7. `<super_ctr>`: Declares and stores the `super()` at `<super_ctr>`; takes (<this_func>) as an argument.
 * 
 * 8. `<super_obj>`: Declares and stores the `super` at `<super_obj>`; takes (<home_obj>) as an argument.
 * 
 * 9. `this`: Declares and initializes the `this` object (see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this).
 * 
 * 10. `this`: Declares and initializes it to NUBD (this initialization is needed in constructor functions with heritage).
 * 
 * 11. `<ret>`: Declares and initializes it to undefined.
 * 
 * #### Structure
 * 
 * - `ARG(Store)`: Location on stack where the result is stored (usually {@link ResolveEnvBindingSEXP} before transition).
 * 
 * - `ARG(Args)`: A {@link ListSEXP}, that can pass additional arguments to the initializer. An empty list by default.
 * 
 * - `FLAG(NAME)`: Name of the created binding.
 * 
 * - `FLAG(JSLET | JSCONST | JSVAR)`: The JSkind for the created binding.
 * 
 * - `FLAG(OPID)`: The Operation ID.
 * 
 * - `FLAG(SAFE)`: Indicates whether the writes being performed are safe.
 * 
 * - `FLAG(THISINIT)`: Indicates whether the write is being performed to `this`, in this case it will never be true but is kept around for implementation consistency during lowering.
 * 
 * - `FLAG(SLOPPY)`: Indicates whether the writes to target locations is sloppy.
 * 
 * - `FLAG(SKIPINIT)`: This flag is set by default, this ensures that the bindings declared are not initialized by the codegen at scope entry.
 * 
 */
export class JSImplicitBindingDeclarationSEXP extends IridiumSEXP {
  constructor(bindingName: string, kind: JSImplicitBindingDeclarationTypes, opid: number, args: ListSEXP = new ListSEXP([])) {
    super("JSImplicitBindingDeclaration");
    this.setStore(new ResolveEnvBindingSEXP(bindingName));
    this.setArgs(args);
    this.setName(bindingName);
    this.setKind(kind);
    this.setOPID(opid);
    this.setThisInit(false);
    this.setSafe(true);
    this.setSkipInit();
  }

  // Args
  setStore(store: IridiumSEXP) {
    this.args[0] = store;
  }

  getStore(): IridiumSEXP {
    return this.args[0];
  }

  setArgs(args: IridiumSEXP) {
    this.args[1] = args;
  }

  getArgs(): IridiumSEXP {
    return this.args[1];
  }

  // Flags
  setName(name: string) {
    this.setFlag("NAME", name);
  }

  getName(): string {
    return this.getFlagString("NAME");
  }

  setKind(kind: JSImplicitBindingDeclarationTypes) {
    this.setFlag(kind);
  }

  getKind(): JSImplicitBindingDeclarationTypes {
    if (this.hasFlag("JSLET")) return "JSLET";
    if (this.hasFlag("JSCONST")) return "JSCONST";
    if (this.hasFlag("JSVAR")) return "JSVAR";
    throw new Error("JSImplicitBindingDeclarationTypes, unknown kind");
  }

  setOPID(opid: number) {
    this.setFlag("OPID", opid);
  }

  getOPID(): number {
    return this.getFlagNumber("OPID");
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

  setSkipInit() {
    this.setFlag("SKIPINIT");
  }

  isSkipInit(): boolean {
    return this.hasFlag("SKIPINIT");
  }

  unsetSkipInit() {
    this.removeFlag("SKIPINIT");
  }

  // Utility
  toString(space?: number): string {
    return `${printIriSpace(space)}JSImplicitBindingDeclaration ${printFlagString(this.flags)} ==> ${this.getStore().toString(0)} (${this.getArgs().args.length === 1 ? this.getArgs().args[0].toString(0) : ""})`;
  }
}

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group STMT
 * 
 * @remarks
 * 
 * Declares a function available in the entire scope, there are no temporal dead zones for functions declared in this fashion.
 * The hoisting pass moves this declaration to the top of the scope to achieve this.
 * In most cases this will be reduced down to an EnvWrite.
 * A special node is only needed in case of top level sloppy declarations.
 * 
 * #### Resolutions
 * 
 * - {@link EnvWriteSEXP}: A binding found in the immediate enclosing closure scope.
 * 
 * - {@link JSFuncDeclSEXP}: It is possible that node does not change its form; this happens for top-level declarations in sloppy mode code.
 * 
 * #### Structure
 * 
 * - `ARG(lValTarget)`: The storage target location
 * 
 * - `ARG(rVal)`: The value to store (possible nothing, in case of just a declaration).
 * 
 * - `FLAG(JSLET | JSCONST | JSVAR)`: This is always gonna be JSVAR, just leaving it the same because of consistency sake.
 * 
 * - `FLAG(SAFE)`: Indicates whether the writes being performed are safe.
 * 
 * - `FLAG(THISINIT)`: Indicates whether the write is being performed to `this`, in this case it will never be true but is kept around for implementation consistency during lowering.
 * 
 * - `FLAG(SLOPPY)`: Indicates whether the writes to target locations is sloppy.
 * 
 */
export class JSFuncDeclSEXP extends IridiumSEXP {
  constructor(lval: IridiumSEXP, rval: IridiumSEXP) {
    super("JSFuncDecl");
    this.setLValTarget(lval);
    this.setRVal(rval);
    this.setSafe(true);
    this.setThisInit(false);
    this.setFlag("JSVAR");
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
  
  isDecl() {
    return true;
  }

  setSkipInit() {
    this.setFlag("SKIPINIT");
  }

  isSkipInit(): boolean {
    return this.hasFlag("SKIPINIT");
  }

  unsetSkipInit() {
    this.removeFlag("SKIPINIT");
  }

  // Utils
  reduceDecl() {
    this.tag = "JSEnvWrite";
    Object.setPrototypeOf(this, new JSExplicitBindingDeclarationSEXP(new NullSEXP(), null, "JSVAR",false));
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


/**
 * @hidden
 */
export function isJSFuncDeclSEXP(o: any): o is JSFuncDeclSEXP {
  // @ts-ignore
  return o.tag === "JSFuncDecl";
}

/**
 * @hidden
 */
export function isJSImplicitBindingDeclarationSEXP(o: any): o is JSImplicitBindingDeclarationSEXP {
  return o.tag === "JSImplicitBindingDeclaration";
}

/**
 * @hidden
 */
export function isJSExplicitBindingDeclarationSEXP(o: any): o is JSExplicitBindingDeclarationSEXP {
  // @ts-ignore
  return o.tag === "JSExplicitBindingDeclaration";
}