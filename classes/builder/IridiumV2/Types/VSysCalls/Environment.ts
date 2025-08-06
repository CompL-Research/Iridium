import { JSEnvBindingFlags } from "../Environment";
import { IridiumSEXP } from "../General";

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group JSClass Add Brand
 * 
 * @description
 * 
 * Top level declarations in **Sloppy** Mode are not stored on the stack frame, but instead become
 * fields of the global object.
 * This call is used to declare such fields.
 * 
 * #### Structure
 * 
 * - `FLAG(NAME)`: The name of the declaration.
 * 
 * - `FLAG(JSARG | JSRESTARG | JSLET | JSCONST | JSVAR)`: The kind of the declaration, one of these allowed types. `JSARG | JSRESTARG` will never show up, but allowed for the sake of consistency.
 * 
 */
export class JSSloppyDeclarationCheckSEXP extends IridiumSEXP {
  constructor(decl: string, kind: JSEnvBindingFlags) {
    super("JSSloppyDeclarationCheck");
    this.setFlag("NAME", decl);
    this.setFlag(kind);
  }
}

/**
 * @group TSHelper
 */
export function isJSSloppyDeclarationCheckSEXP(o: any): o is JSSloppyDeclarationCheckSEXP {
  // @ts-ignore
  return o.tag === "JSSloppyDeclarationCheck";
}