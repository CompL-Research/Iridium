import { JS3MetaProperty } from "classes/builder/JS3Helpers/JS3Types.ts";
import { ALL_RVal } from "./ALL_RVal.ts";

export class IV_ModuleMeta extends ALL_RVal {
  
  constructor(node: JS3MetaProperty | undefined = undefined) {
    super(node, "ModuleMeta");
  }

  toString() {
    return `<ModuleMeta> IMPORT.META`
  }

  toDOT() {
    return this.toString();
  }
}

export class IV_NewTarget extends ALL_RVal {
  
  constructor(node: JS3MetaProperty | undefined = undefined) {
    super(node, "NewTarget");
  }

  toString() {
    return `<NewTarget> NEW.TARGET`
  }

  toDOT() {
    return this.toString();
  }
}
