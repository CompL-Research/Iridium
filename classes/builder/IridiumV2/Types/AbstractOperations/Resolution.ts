import { IridiumSEXP } from "../Structural/General";
import { EnvBindingSEXP, RemoteEnvBindingSEXP, GlobalBindingSEXP, EnvReadSEXP } from "../Environment";
import { GotoSEXP } from "../Flow";

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group RVAL
 * 
 * @remarks
 * 
 * A No op node, removed before final codegen. 
 * 
 */
export class NOPSEXP extends IridiumSEXP {
  constructor() {
    super("NOP");
  }
}

/**
 * @hidden
 */
export function isNOPSEXP(o: any): o is NOPSEXP {
  // @ts-ignore
  return o.tag === "NOP";
}

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group RVAL
 * 
 * @remarks
 * 
 * ResolveEnvBinding is an abstract operation in the Iridium IR.
 * It indicates a reference to an unresolved identifier.
 * Upon resolution, this is replaced by its corresponding binding.
 * 
 * #### Resolutions
 * 
 * - {@link EnvBindingSEXP}: A binding found in the immediate enclosing closure scope.
 * - {@link RemoteEnvBindingSEXP}: A binding found in a non-parent closure scope (this is also the case for top-level bindings of a module).
 * - {@link GlobalBindingSEXP}: A binding not found in any declared scope, it is expected to be provided by the global environment.
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
 * @group RVAL
 * 
 * @remarks
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
 * @group STMT
 * 
 * @remarks
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
 * @group STMT
 * 
 * @remarks
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
 * @hidden
 */
export function isResolvePrivateEnvBindingSEXP(o: any): o is ResolvePrivateEnvBindingSEXP {
  // @ts-ignore
  return o.tag === "ResolvePrivateEnvBinding";
}

/**
 * @hidden
 */
export function isResolveBreakTargetSEXP(o: any): o is ResolveBreakTargetSEXP {
  // @ts-ignore
  return o.tag === "ResolveBreakTarget";
}

/**
 * @hidden
 */
export function isResolveContinueTargetSEXP(o: any): o is ResolveContinueTargetSEXP {
  // @ts-ignore
  return o.tag === "ResolveContinueTarget";
}

/**
 * @hidden
 */
export function isResolveEnvBindingSEXP(o: any): o is ResolveEnvBindingSEXP {
  return o.tag === "ResolveEnvBinding";
}

