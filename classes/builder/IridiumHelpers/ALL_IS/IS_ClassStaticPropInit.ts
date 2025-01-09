import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { ISP_ClassProperty_key } from "../ALL_RVal/ALL_ISP.ts";
import { printScopedSpace } from "../IRIDIUM.ts";
import { ALL_IS } from "./ALL_IS.ts";

export class IS_ClassStaticPropInit extends ALL_IS {
  obj  : IV_Identifier 
  prop : ISP_ClassProperty_key 
  
  RVal : IV_Identifier = new IV_Identifier(undefined, "undefined");
  computed : boolean

  constructor(node: any, obj: IV_Identifier, prop: ISP_ClassProperty_key, RVal: IV_Identifier, computed: boolean) {
    super(node)
    this.obj = obj
    this.prop = prop
    this.RVal = RVal
    this.computed = computed
  }

  toString(space: number = 0) {
    return `${printScopedSpace(space)}▏ <ClassStaticPropInit> ${this.obj.toString()}${this.computed ? `[${this.prop.toString()}]` : `.${this.prop.toString()}`} = ${this.RVal.toString()};`
  }

}