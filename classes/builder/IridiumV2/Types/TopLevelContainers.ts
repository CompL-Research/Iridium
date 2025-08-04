import { IridiumPrimitives, IridiumSEXP } from "./General";
import { ListSEXP } from "./Primitives";

/**
 * Top level container for script mode JS code.
 */
export class JSScriptSEXP extends IridiumSEXP {
  constructor() {
    super("JSScript");
  }
};

/**
 * Top level container for Module mode JS code.
 */
export class JSModuleSEXP extends IridiumSEXP {
  constructor() {
    super("JSModule");
  }

  initializeModuleRequests(moduleRequests: ListSEXP, staticImports: ListSEXP, staticExports: ListSEXP, staticStarExports: ListSEXP) {
    this.args = [moduleRequests, staticImports, staticExports, staticStarExports, ...this.args];
  }
};

/**
 * Flags used to distinguish FileSEXP contents
 * @deprecated
 */
export type FileSEXPFlags = "JSScript" | "JSModule";

/**
 * Old common container for JSScript and JSModule
 * @deprecated
 */
export class FileSEXP extends IridiumSEXP {
  constructor(flag: FileSEXPFlags | undefined = undefined) {
    super("File");
    if (flag) this.setFlag(flag, null);
  }

  // Flags
  setFlag(flag: FileSEXPFlags, val: IridiumPrimitives) {
    super.setFlag(flag, val);
  }

  initializeModuleRequests(moduleRequests: ListSEXP, staticImports: ListSEXP, staticExports: ListSEXP, staticStarExports: ListSEXP) {
    this.args = [moduleRequests, staticImports, staticExports, staticStarExports, ...this.args];
  }
};

export * from "./JSModuleHelpers/index";