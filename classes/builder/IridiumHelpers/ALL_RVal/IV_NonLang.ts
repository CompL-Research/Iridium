import { ALL_RVal } from "./ALL_RVal.ts";

export class IV_NUBD extends ALL_RVal {  
  constructor(node: any | undefined = undefined) {
    super(node, "NUBD");
  }

  toString() {
    return `<NUBD> ( ཀ ʖ̯ ཀ)`
  }

  toDOT() {
    return this.toString()
  }
}

export class IV_CTHIS extends ALL_RVal {  
  constructor(node: any | undefined = undefined) {
    super(node, "CTHIS");
  }

  toString() {
    return `<CTHIS> 🤺`
  }

  toDOT() {
    return this.toString()
  }
}

export class IV_STHIS extends ALL_RVal {  
  constructor(node: any | undefined = undefined) {
    super(node, "STHIS");
  }

  toString() {
    return `<STHIS> 🛡️`
  }

  toDOT() {
    return this.toString()
  }
}