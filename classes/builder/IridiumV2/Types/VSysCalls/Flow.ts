import { printIriSpace } from "#utils";
import { IridiumSEXP } from "../General";

export class JSModuleStartSEXP extends IridiumSEXP {
  constructor() {
    super("JSModuleStart");
  }
  toString(space?: number): string {
    return `${printIriSpace(space)}🟢`;
  }
}

// (Extension) JSModuleEnd
export class JSModuleEndSEXP extends IridiumSEXP {
  constructor() {
    super("JSModuleEnd");
  }
  toString(space?: number): string {
    return `${printIriSpace(space)}🔴`;
  }
}

// (Extension) JSScriptReturn
export class JSScriptReturnSEXP extends IridiumSEXP {
  constructor() {
    super("JSScriptReturn");
  }
}

/**
 * @group TSHelper
 */
export function isJSModuleStartSEXP(o: any): o is JSModuleStartSEXP {
  // @ts-ignore
  return o.tag === "JSModuleStart";
}

/**
 * @group TSHelper
 */
export function isJSScriptReturnSEXP(o: any): o is JSScriptReturnSEXP {
  // @ts-ignore
  return o.tag === "JSScriptReturn";
}