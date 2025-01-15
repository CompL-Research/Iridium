import { JS3ObjectExpression } from "classes/builder/JS3Helpers/JS3Types.ts";
import { ALL_RVal } from "./ALL_RVal.ts";
import { ISP_ArgSpread, ISP_ObjectMethod, ISP_ObjectProperty } from "./ALL_ISP.ts";
import { printScopedSpace, printSpace } from "../IRIDIUM.ts";

export class IV_ObjectExpression extends ALL_RVal {
  
  properties: Array<ISP_ObjectMethod | ISP_ObjectProperty | ISP_ArgSpread>
  
  constructor(node: JS3ObjectExpression | undefined = undefined, properties: Array<ISP_ObjectMethod | ISP_ObjectProperty | ISP_ArgSpread>) {
    super(node, "ObjectExpression");
    this.properties = properties
  }

  toString(space = 0) {
    return `<ObjectExpression> {\n${printScopedSpace(space+2)}${this.properties.map(e => e.toString(space + 4)).join(`,\n${printScopedSpace(space+2)}`)}\n${printScopedSpace(space)}}`;
  }

  toDOT(space = 0) {
    return `<ObjectExpression> {\\l${printSpace(space+2)}${this.properties.map(e => e.toString(space + 4)).join(`,\\l${printSpace(space+2)}`)}\\l${printSpace(space)}}`;
  }
}
