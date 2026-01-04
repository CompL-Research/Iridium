import { printFlagString, printIriSpace } from "#utils";
import { BindingsSEXP, isBindingsSEXP } from "../Environment";
import { IridiumSEXP } from "./General";
import { ListSEXP } from "../RVAL/Primitives";
import { BBSEXP } from "./BB";

/**
 * @group TSHelper
 */
export const getRegularClosureFlag = () => 1;
/**
 * @group TSHelper
 */
export const getConstructorClosureFlag = () => 2;
/**
 * @group TSHelper
 */
export const getDerivedConstructorClosureFlag = () => 3;
/**
 * @group TSHelper
 */
export const getDerivedMethodClosureFlag = () => 4;
/**
 * @group TSHelper
 */
export const getPrivateMethodClosureFlag = () => 5;
/**
 * @group TSHelper
 */
export const getPropInitNoPrivateClosureFlag = () => 6;
/**
 * @group TSHelper
 */
export const getPropInitDerivedNoPrivateClosureFlag = () => 7;
/**
 * @group TSHelper
 */
export const getPropInitPrivateClosureFlag = () => 8;
/**
 * @group TSHelper
 */
export const getPropInitDerivedPrivateClosureFlag = () => 9;
/**
 * @group TSHelper
 */
export const getPrivateDerivedMethodClosureFlag = () => 10;
/**
 * @group TSHelper
 */
export const getStaticPropInitClosureFlag = () => 11;
/**
 * @group TSHelper
 */
export const getStaticPropInitDerivedClosureFlag = () => 12;


/**
 * @group TSHelper
 * 
 * @remarks
 * 
 * Flags applicable to a BBContainer.
 * 
 */
export type BBContainerSEXPFlags = "ARGUMENTS" | "ASYNC" | "GENERATOR" | "PROTO" | "NEW" | "SCALL" | "SOBJ" | "HOME" | "DERIVED";

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group Logical Compilation Unit
 * 
 * @remarks
 * 
 * BBContainer represents a logical piece of compilable code, it consists of two parts.
 * The first arg contains a {@link BindingsSEXP} which is used to create and populate a stack frame.
 * The second arg contains a {@link ListSEXP} of type {@link BBSEXP} which contains the instructions to execute.
 * 
 * #### Structure
 * 
 * - `ARG(bindings)`: Stores a {@link BindingsSEXP}.
 * 
 * - `ARG(BB)`: Stores a {@link ListSEXP} of type {@link BBSEXP}.
 * 
 * - `FLAG(ECMAArgs)`: Used to set the `length` property for functions, which indicates the number of expected arguments as per the ECMAScript spec.
 * 
 * - `FLAG(StartBBIDX)`: IDX of the entry BB.
 * 
 * - `FLAG(ScopeIDX)`: Scope/environment IDX of top level scope for this container.
 * 
 * - `FLAG(ARGUMENTS)`: Is the `arguments` object allowed in this scope?
 * 
 * - `FLAG(ASYNC)`: Is this an asynchronous function/module?
 * 
 * - `FLAG(STRICT)`: Is the code in strict mode?
 * 
 * - `FLAG(GENERATOR)`: Is this a generator function?
 * 
 * - `FLAG(PROTO)`: Does the function have a prototype?
 * 
 * - `FLAG(NEW)`: Is new.target lookup allowed in this function?
 * 
 * - `FLAG(SCALL)`: Is super call allowed in this function?
 * 
 * - `FLAG(SOBJ)`: Is super object allowed in this function?
 * 
 * - `FLAG(HOME)`: Does this function need the home object?
 * 
 * - `FLAG(DERIVED)`: Is this a derived constructor function?
 * 
 * - `FLAG(TopLevel)`: Is top Level?
 * 
 * - `FLAG(ContainerFlagID)`: A number.
 * 
 * - `FLAG(NAME)`: string function name.
 * 
 * #### Closure Type Map
 * 
 * 1. Regular Closure = { }
 * 
 * 2. Constructor = { PROTO, NEW }
 * 
 * 3. Derived Constructor = { PROTO, NEW, SCALL, SOBJ, HOME, DERIVED }
 * 
 * 4. Derived Method = { SOBJ, HOME }
 * 
 * 5. Private Method = { HOME }
 * 
 * 6. Prop Init + no_private = {  }
 * 
 * 7. Prop Init Derived + no_private = { SOBJ, HOME }
 * 
 * 8. Prop Init + private = { HOME }
 * 
 * 9. Prop Init Derived + private = { SOBJ, HOME }
 * 
 * 10. Private Derived Method = { SOBJ, HOME }
 * 
 * 11. Static Prop Init = {  }
 * 
 * 12. Static Prop Init Derived = { SOBJ, HOME }
 * 
 */
export class BBContainerSEXP extends IridiumSEXP {
  constructor(startBBIDx: number, scopeIDX: number, bbs: Array<BBSEXP>) {
    super("BBContainer");
    this.setStartBBIDX(startBBIDx);
    this.setScopeIDX(scopeIDX);
    this.setBindings(new BindingsSEXP(-1));
    const bbsSEXP = new ListSEXP(bbs);
    bbsSEXP.setType("BB");
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

  setTopLevel() {
    this.setFlag("TopLevel");
  }

  unsetTopLevel() {
    this.removeFlag("TopLevel");
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

/**
 * @group TSHelper
 */
export function isBBContainerSEXP(o: any): o is BBContainerSEXP {
  // @ts-ignore
  return o.tag === "BBContainer";
}
