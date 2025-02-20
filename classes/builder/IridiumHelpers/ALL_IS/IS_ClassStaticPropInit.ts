import { printScopedSpace, printSpace } from "#utils";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { ISP_ClassProperty_key } from "../ALL_RVal/ALL_ISP.ts";
import { ALL_IS, ALL_IS_NODE } from "./ALL_IS.ts";

export class IS_ClassStaticPropInit extends ALL_IS {
  obj: IV_Identifier;
  prop: ISP_ClassProperty_key;

  RVal: IV_Identifier = new IV_Identifier(undefined, "undefined");
  computed: boolean;

  constructor(
    node: ALL_IS_NODE,
    obj: IV_Identifier,
    prop: ISP_ClassProperty_key,
    RVal: IV_Identifier,
    computed: boolean,
  ) {
    super(node);
    this.obj = obj;
    this.prop = prop;
    this.RVal = RVal;
    this.computed = computed;
  }

  usedIdentifiers(): Set<string> {
    const res: Set<string> = new Set();
    if (this.RVal instanceof IV_Identifier) {
      res.add(this.RVal.lookupName());
    }
    res.add(this.obj.lookupName());
    return res;
  }

  toString(space: number = 0) {
    return `${printScopedSpace(space)}▏ <ClassStaticPropInit> ${this.obj.lookupName()}${this.computed ? `[${this.prop.toString()}]` : `.${this.prop.toString()}`} = ${this.RVal.toString()};`;
  }

  toDOT(space: number = 0) {
    return `${printSpace(space)}▏ <ClassStaticPropInit> ${this.obj.lookupName()}${this.computed ? `[${this.prop.toString()}]` : `.${this.prop.toString()}`} = ${this.RVal.toString()};`;
  }
}
