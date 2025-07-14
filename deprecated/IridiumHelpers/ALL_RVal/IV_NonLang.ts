import { ALL_RVal, ALL_RVal_NODE } from "./ALL_RVal.ts";

export class IV_NUBD extends ALL_RVal {
  constructor(node: ALL_RVal_NODE | undefined = undefined) {
    super(node, "NUBD");
  }

  static lookupName() {
    return "NUBD";
  }

  usedIdentifiers(): Set<string> {
    const res: Set<string> = new Set();
    res.add(IV_NUBD.lookupName());
    return res;
  }

  toString() {
    return `<NUBD> ( ཀ ʖ̯ ཀ) ${IV_NUBD.lookupName()}`;
  }

  toDOT() {
    return this.toString();
  }
}

export class IV_CTHIS extends ALL_RVal {
  constructor(node: ALL_RVal_NODE = undefined) {
    super(node, "CTHIS");
  }

  static lookupName() {
    return "C_THIS";
  }

  usedIdentifiers(): Set<string> {
    const res: Set<string> = new Set();
    res.add(IV_CTHIS.lookupName());
    return res;
  }

  toString() {
    return `<CTHIS> 🤺 ${IV_CTHIS.lookupName()}`;
  }

  toDOT() {
    return this.toString();
  }
}

export class IV_STHIS extends ALL_RVal {
  constructor(node: ALL_RVal_NODE | undefined = undefined) {
    super(node, "STHIS");
  }

  static lookupName() {
    return "S_THIS";
  }

  usedIdentifiers(): Set<string> {
    const res: Set<string> = new Set();
    res.add(IV_STHIS.lookupName());
    return res;
  }

  toString() {
    return `<STHIS> 🛡️ ${IV_STHIS.lookupName()}`;
  }

  toDOT() {
    return this.toString();
  }
}
