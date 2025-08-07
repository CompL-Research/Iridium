import { IridiumSEXP } from "../../General";

/**
 * @group TSHelper
 */
export type JSSloppyDeclarationTypes = "JSLET" | "JSCONST" | "JSVAR";

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group STMT
 * 
 * @remarks
 * 
 * Top level declarations in **Sloppy** Mode are not stored on the stack frame, but instead become
 * fields of the global object.
 * This call is used to declare such fields.
 * 
 * #### Structure
 * 
 * - `FLAG(NAME)`: The name of the declaration.
 * 
 * - `FLAG(JSLET | JSCONST | JSVAR)`: The kind of the declaration, one of these allowed types.
 * 
 */
export class JSSloppyDeclarationCheckSEXP extends IridiumSEXP {
  constructor(decl: string, kind: JSSloppyDeclarationTypes) {
    super("JSSloppyDeclarationCheck");
    this.setName(decl);
    this.setKind(kind);
  }

  // Flags
  setName(name: string) {
    this.setFlag("NAME", name);
  }

  getName(): string {
    return this.getFlagString("NAME");
  }

  setKind(kind: JSSloppyDeclarationTypes) {
    this.setFlag(kind);
  }

  getKind(): JSSloppyDeclarationTypes {
    if (this.hasFlag("JSLET")) return "JSLET";
    if (this.hasFlag("JSCONST")) return "JSCONST";
    if (this.hasFlag("JSVAR")) return "JSVAR";
    throw new Error("JSSloppyDeclarationCheckSEXP, unknown kind");
  }
}

/**
 * @hidden
 */
export function isJSSloppyDeclarationCheckSEXP(o: any): o is JSSloppyDeclarationCheckSEXP {
  // @ts-ignore
  return o.tag === "JSSloppyDeclarationCheck";
}