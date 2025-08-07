import { printFlagString, printIriSpace } from "#utils";
import { IridiumSEXP } from "../General";

/**
 * @group TSHelper
 * 
 * @remarks
 * 
 * Flags indicating the kind of BB.
 * 
 * - `TopLevel`: Represents that the BB operates on the topmost scope.
 * 
 * - `ClosureBoundary`: Represents that the BB operates on the topmost scope of a closure.
 * 
 * - `Lexical`: Represents that the BB operates on a lexical scope.
 */
export type BBSEXPFlags = "TopLevel" | "ClosureBoundary" | "Lexical";

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group Sequential Instruction Block
 * 
 * @remarks
 * 
 * An Iridium Basic Block Object. It is used to hold a contigious sequence Iridium code.
 * 
 * #### Structure
 * 
 * - `FLAG(TopLevel | ClosureBoundary | Lexical)`: Flag indicating the operating scope of the BB.
 * 
 * - `FLAG(IDX)`: An auto populated unique IDX given to each BB instance.
 * 
 * - `FLAG(ScopeIDX)`: Scope IDX represents the environment/scope IDX, this is used for logical separation of bindings.
 * 
 */
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


/**
 * @group TSHelper
 */
export function isBBSEXP(o: any): o is BBSEXP {
  // @ts-ignore
  return o.tag === "BB";
}