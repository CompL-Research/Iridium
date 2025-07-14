import { JS3MetaProperty } from "classes/builder/JS3Helpers/JS3Types.ts";
import { ALL_RVal } from "./ALL_RVal.ts";

export class IV_ModuleMeta extends ALL_RVal {
  constructor(node: JS3MetaProperty | undefined = undefined) {
    super(node, "ModuleMeta");
  }

  usedIdentifiers(): Set<string> {
    const res: Set<string> = new Set();
    res.add(this.lookupName());
    return res;
  }

  lookupName() {
    return `###IMPORT_META`;
  }

  toString() {
    return `<ModuleMeta> ${this.lookupName()}`;
  }

  toDOT() {
    return this.toString();
  }
}

export class IV_NewTarget extends ALL_RVal {
  constructor(node: JS3MetaProperty | undefined = undefined) {
    super(node, "NewTarget");
  }

  usedIdentifiers(): Set<string> {
    const res: Set<string> = new Set();
    res.add(this.lookupName());
    return res;
  }

  lookupName() {
    return `###NEW_TARGET`;
  }

  toString() {
    return `<NewTarget> ${this.lookupName()}`;
  }

  toDOT() {
    return this.toString();
  }
}
