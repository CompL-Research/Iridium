import { ALL_RVal } from "./ALL_RVal.ts";
import { Identifier } from "@babel/types"

export class IV_Identifer extends ALL_RVal {
  name: string
  constructor(node: Identifier | undefined = undefined, name: string) {
    super(node);
    this.name = name
  }
}
