import { ALL_RVal } from "./ALL_RVal.ts";

export class IV_NUBD extends ALL_RVal {  
  constructor(node: any | undefined = undefined) {
    super(node, "NUBD");
  }

  static lookupName() {
    return "NUBD"
  }

  toString() {
    return `<NUBD> ( ཀ ʖ̯ ཀ) ${IV_NUBD.lookupName()}`
  }

  toDOT() {
    return this.toString()
  }
}

export class IV_CTHIS extends ALL_RVal {  
  constructor(node: any | undefined = undefined) {
    super(node, "CTHIS");
  }

  static lookupName() {
    return "C_THIS"
  }

  toString() {
    return `<CTHIS> 🤺 ${IV_CTHIS.lookupName()}`
  }

  toDOT() {
    return this.toString()
  }
}

export class IV_STHIS extends ALL_RVal {  
  constructor(node: any | undefined = undefined) {
    super(node, "STHIS");
  }

  static lookupName() {
    return "S_THIS"
  }

  toString() {
    return `<STHIS> 🛡️ ${IV_STHIS.lookupName()}`
  }

  toDOT() {
    return this.toString()
  }
}