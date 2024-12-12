import { ALL_RVal } from "./ALL_RVal.ts";

export class IV_NUBD extends ALL_RVal {  
  constructor(node: any | undefined = undefined) {
    super(node, "NUBD");
  }

  toString() {
    return `<NUBD> ( ཀ ʖ̯ ཀ)`
  }
}