import { printFlagString, printIriSpace } from "#utils";
import { IridiumSEXP } from "./General";
import { ListSEXP } from "./Primitives";
/**
 * Allowed binding kinds for JSImplicitBindingDeclarations
 */
export type JSImplicitBindingDeclarationTypes = "JSLET" | "JSCONST" | "JSVAR";

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group Abstract Operations
 * 
 * @description
 * 
 * JSImplicitBindingDecl is a way to add and initialize implicit bindings to an environment.
 * 
 * #### Possible OPID's
 * 
 * -1. `No init`:  Binding is created in the environment, but this statement does not initialize it in any way.
 * 
 * OP_SPECIAL_OBJECT_ARGUMENTS
 * OP_SPECIAL_OBJECT_MAPPED_ARGUMENTS
 * OP_SPECIAL_OBJECT_THIS_FUNC
 * OP_SPECIAL_OBJECT_NEW_TARGET
 * OP_SPECIAL_OBJECT_HOME_OBJECT
 * OP_SPECIAL_OBJECT_VAR_OBJECT
 * OP_SPECIAL_OBJECT_IMPORT_META
 * 
 * 0. `arguments`: Declares and initializes the `arguments` object.
 * 
 * 1. `arguments`: Declares and initializes the **mapped** `arguments` object.
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
 * 9. `this`: Declares and initializes the `this` object.
 * 
 * 10. `this`: Declares and initializes it to NUBD (this initialization is needed in constructor functions with heritage).
 * 
 * 11. `<ret>`: Declares and initializes it to undefined.
 * 
 * #### Structure
 * 
 * - `ARG(Store)`: Location on stack where the result is stored.
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
 * @group Abstract Operations
 * 
 * @description
 * 
 * ResolveEnvBinding is an abstract operation in the Iridium IR.
 * It indicates a reference to an unresolved identifier.
 * Upon resolution, this is replaced by its corresponding binding.
 * 
 * #### Resolutions
 * 
 * - {@link Environment.EnvBindingSEXP}: A binding found in the immediate enclosing closure scope.
 * - {@link Environment.RemoteEnvBindingSEXP}: A binding found in a non-parent closure scope (this is also the case for top-level bindings of a module).
 * - {@link Environment.GlobalBindingSEXP}: A binding not found in any declared scope, it is expected to be provided by the global environment.
 * 
 * #### Structure
 * 
 * - `FLAG(ASW)`: Always Safe Write. Bindings like argument bindings are declared as ASWs as writing to them is always safe in any scope.
 * 
 * - `FLAG(NAME)`: Binding name to resolve.
 * 
 */
export class ResolveEnvBindingSEXP extends IridiumSEXP {
  constructor(id: string) {
    super("ResolveEnvBinding");
    this.setName(id);
  }

  // Flags
  markASW() {
    this.setFlag("ASW");
  }

  isASW() {
    return this.hasFlag("ASW");
  }

  setName(name: string) {
    this.setFlag("NAME", name);
  }

  getName(): string {
    return this.getFlagString("NAME");
  }

  getBindingName(): string {
    return this.getName();
  }
}

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group Abstract Operations
 * 
 * @description
 * 
 * ResolvePrivateEnvBinding is an abstract operation in the Iridium IR.
 * It indicates a reference to an unresolved private identifier reference.
 * 
 * #### Resolutions
 * 
 * - {@link EnvReadSEXP}: Environment Read that leads to a Private Symbol or a Private Closure object (lexical).
 * 
 * #### Structure
 * 
 * - `FLAG(NAME)`: Binding name to resolve.
 * 
 */
export class ResolvePrivateEnvBindingSEXP extends IridiumSEXP {
  constructor(id: string) {
    super("ResolvePrivateEnvBinding");
    this.setName(id);
  }

  // Flags
  setName(name: string) {
    this.setFlag("NAME", name);
  }

  getName(): string {
    return this.getFlagString("NAME");
  }

  getBindingName(): string {
    return this.getName();
  }
}

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group Abstract Operations
 * 
 * @description
 * 
 * Represents an unresolved continue statement.
 * 
 * #### Resolutions
 * 
 * - {@link GotoSEXP}: An unconditional Goto.
 * 
 * #### Structure
 * 
 * - `FLAG(Label)`: Optional flag representing the target label.
 * 
 */
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

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group Abstract Operations
 * 
 * @description
 * 
 * Represents an unresolved break statement.
 * 
 * #### Resolutions
 * 
 * - {@link GotoSEXP}: An unconditional Goto.
 * 
 * #### Structure
 * 
 * - `FLAG(Label)`: Optional flag representing the target label.
 * 
 */
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

/**
 * @group TSHelper
 */
export function isResolvePrivateEnvBindingSEXP(o: any): o is ResolvePrivateEnvBindingSEXP {
  // @ts-ignore
  return o.tag === "ResolvePrivateEnvBinding";
}

/**
 * @group TSHelper
 */
export function isResolveBreakTargetSEXP(o: any): o is ResolveBreakTargetSEXP {
  // @ts-ignore
  return o.tag === "ResolveBreakTarget";
}

/**
 * @group TSHelper
 */
export function isResolveContinueTargetSEXP(o: any): o is ResolveContinueTargetSEXP {
  // @ts-ignore
  return o.tag === "ResolveContinueTarget";
}

/**
 * @group TSHelper
 */
export function isResolveEnvBindingSEXP(o: any): o is ResolveEnvBindingSEXP {
  return o.tag === "ResolveEnvBinding";
}

/**
 * @group TSHelper
 */
export function isJSImplicitBindingDeclarationSEXP(o: any): o is JSImplicitBindingDeclarationSEXP {
  return o.tag === "JSImplicitBindingDeclaration";
}
