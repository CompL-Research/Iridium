import { ResolveEnvBindingSEXP } from "../AbstractOperations/Resolution";
import { IridiumPrimitives, IridiumSEXP } from "./General";
import { ListSEXP } from "../RVAL/Primitives";
import { getLocInfoIfAvailable } from "#utils";

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

/**
 * 
 * @extends {IridiumSEXP}
 *
 * @group JSModuleExtensions
 * 
 * @remarks
 * 
 * A module may request to load several modules or a single module several times.
 * Whenever this happens a unique ModuleRequest is created.
 * 
 * #### Trigger
 * 
 * ```
 * import {foo as bar} from "SOURCE"; 
 * import a from "SOURCE";
 * import "SOURCE";
 * export * from "SOURCE";
 * export * as boo from "SOURCE";
 * ```
 * 
 * #### Structure
 * 
 * - `FLAG(SOURCE)`: Lookup source (the string used for import, different strings may actually resolve to the same file, this is handled durint runtime).
 * 
 * - `FLAG(REQIDX)`: A unique IDX associated with each ModuleRequest.
 * 
 */
export class ModuleRequestSEXP extends IridiumSEXP {
  constructor(lookupSource: string, idx: number) {
    super("ModuleRequest");
    this.setSource(lookupSource);
    this.setReqIDX(idx);
  }

  // Flags
  setSource(source: string) {
    this.setFlag("SOURCE", source);
  }

  getSource(): string {
    return this.getFlagString("SOURCE");
  }
  
  setReqIDX(reqIDX: number) {
    this.setFlag("REQIDX", reqIDX);
  }

  getReqIDX(): number {
    return this.getFlagNumber("REQIDX");
  }
}

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group JSModuleExtensions
 * 
 * @remarks
 * 
 * Represents a static import expression (`StaticImportSEXP`) in Iridium IR.
 *
 * This is used when a file imports bindings from another file. 
 * 
 * #### Trigger
 * 
 * ```
 * import a from "SOURCE";
 * ```
 * 
 * #### Structure
 * 
 * - `ARG(storageLocation)`: Location where the import will be stored, initially a stub {@link ResolveEnvBindingSEXP}.
 * 
 * - `FLAG(FIELD)`: Field to import from the remote module.
 * 
 * - `FLAG(MODULEREQIDX)`: The index (REQIDX) of the corresponding {@link ModuleRequestSEXP}.
 * 
 */
export class StaticImportSEXP extends IridiumSEXP {
  constructor(storageLocation: string, fieldToImport: string, reqIdx: number) {
    super("StaticImport");
    this.setStorageLocation(new ResolveEnvBindingSEXP(storageLocation, getLocInfoIfAvailable()));
    this.setField(fieldToImport);
    this.setModuleReqIDX(reqIdx);
  }

  // Args
  setStorageLocation(storageLocation: IridiumSEXP) {
    this.args[0] = storageLocation;
  }

  getStorageLocation(): IridiumSEXP {
    return this.args[0];
  }

  // Flags
  setField(field: string) {
    this.setFlag("FIELD", field);
  }

  getField(): string {
    return this.getFlagString("FIELD");
  }

  setModuleReqIDX(reqIDX: number) {
    this.setFlag("MODULEREQIDX", reqIDX);
  }

  getModuleReqIDX(): number {
    return this.getFlagNumber("MODULEREQIDX");
  }
}

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group JSModuleExtensions
 * 
 * @remarks
 * 
 * Represents a local export.
 * 
 * #### Trigger
 * 
 * ```
 * export {a as default};
 * export {a as boo};
 * ```
 * 
 * #### Structure
 * 
 * - `ARG(storageLocation)`: Local Binding to export, initially a stub {@link ResolveEnvBindingSEXP}.
 * 
 * - `FLAG(LOCALNAME)`: Name of the local binding.
 * 
 * - `FLAG(EXPORTNAME)`: Name of the exported binding.
 * 
 */
export class LocalStaticExportSEXP extends IridiumSEXP {
  constructor(localName: string, exportName: string) {
    super("LocalStaticExport");
    this.setStorageLocation(new ResolveEnvBindingSEXP(localName, getLocInfoIfAvailable()));
    this.setLocalName(localName);
    this.setExportName(exportName);
  }

  // Args
  setStorageLocation(storageLocation: IridiumSEXP) {
    this.args[0] = storageLocation;
  }

  getStorageLocation(): IridiumSEXP {
    return this.args[0];
  }

  // Flags
  setLocalName(field: string) {
    this.setFlag("LOCALNAME", field);
  }

  getLocalName(): string {
    return this.getFlagString("LOCALNAME");
  }

  setExportName(field: string) {
    this.setFlag("EXPORTNAME", field);
  }

  getExportName(): string {
    return this.getFlagString("EXPORTNAME");
  }

}

/**
 * @extends {IridiumSEXP}
 * 
 * @group JSModuleExtensions
 * 
 * @remarks
 * 
 * Represents a named re-export of the form.
 * 
 * #### Trigger
 * 
 * ```
 * export * as boo from "SOURCE";
 * ```
 * 
 * #### Structure
 * 
 * - `FLAG(MODULEREQIDX)`: The index (REQIDX) of the corresponding {@link ModuleRequestSEXP}.
 * 
 * - `FLAG(EXPORTNAME)`: Name of the exported binding.
 * 
 */
export class NamedReexportSEXP extends IridiumSEXP {
  constructor(reqIdx: number, exportName: string) {
    super("NamedReexport");
    this.setModuleReqIDX(reqIdx);
    this.setFlag("EXPORTNAME", exportName);
  }

  // Flags
  setModuleReqIDX(reqIDX: number) {
    this.setFlag("MODULEREQIDX", reqIDX);
  }

  getModuleReqIDX(): number {
    return this.getFlagNumber("MODULEREQIDX");
  }

  setExportName(field: string) {
    this.setFlag("EXPORTNAME", field);
  }

  getExportName(): string {
    return this.getFlagString("EXPORTNAME");
  }
}

/**
 * @extends {IridiumSEXP}
 * 
 * @group JSModuleExtensions
 * 
 * @remarks
 * 
 * Represents a direct re-export of the form.
 * 
 * #### Trigger
 * 
 * ```
 * export * from "SOURCE";
 * ```
 * 
 * #### Structure
 * 
 * - `FLAG(MODULEREQIDX)`: The index (REQIDX) of the corresponding {@link ModuleRequestSEXP}.
 * 
 * 
 */
export class StarExportSEXP extends IridiumSEXP {
  constructor(reqIdx: number) {
    super("StarExport");
    this.setModuleReqIDX(reqIdx);
  }

  // Flags
  setModuleReqIDX(reqIDX: number) {
    this.setFlag("MODULEREQIDX", reqIDX);
  }

  getModuleReqIDX(): number {
    return this.getFlagNumber("MODULEREQIDX");
  }
}

/**
 * @group TSHelper
 */
export function isStarExportSEXP(o: any): o is StarExportSEXP {
  return o.tag === "StarExport";
}

/**
 * @group TSHelper
 */
export function isStaticImportSEXP(o: any): o is StaticImportSEXP {
  return o.tag === "StaticImport";
}

/**
 * @group TSHelper
 */
export function isLocalStaticExportSEXP(o: any): o is LocalStaticExportSEXP {
  return o.tag === "LocalStaticExport";
}

/**
 * @group TSHelper
 */
export function isNamedReexportSEXP(o: any): o is NamedReexportSEXP {
  return o.tag === "NamedReexport";
}