import { printIriSpace } from "#utils";
import { IridiumBuildContext } from "../../IRIDIUMV2";
import { IridiumSEXP } from "../Structural/General";
import { ListSEXP } from "../RVAL/Primitives";
import { EnvBindingSEXP, isEnvBindingSEXP, isRemoteEnvBindingSEXP, JSEnvBindingFlags, PoolBindingSEXP, RemoteEnvBindingSEXP } from "./BindingsObjectConstituents";
/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group STRUCTURAL
 * 
 * @remarks
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
   * @returns EnvBindingSEXP | RemoteEnvBindingSEXP | null
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
   * @returns EnvBindingSEXP
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

/**
 * @hidden
 */
export function isBindingsSEXP(o: any): o is BindingsSEXP {
  // @ts-ignore
  return o.tag === "Bindings";
}
