import { JS3ClassExpression } from "classes/builder/JS3Helpers/JS3Types.ts";
import { ALL_RVal } from "./ALL_RVal.ts";
import { printScopedSpace } from "../IRIDIUM.ts";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { ISP_ClassProperty, ISP_StaticClassProperty, ISP_ClassMethod } from "./ALL_ISP.ts";

export type IV_ClassExpression_properties = Array<ISP_ClassProperty | ISP_StaticClassProperty | ISP_ClassMethod>

export class IV_ClassExpression extends ALL_RVal {
  name: IV_Identifier | undefined
  heritage: IV_Identifier | undefined
  properties: IV_ClassExpression_properties
  constructor(node: JS3ClassExpression, name: IV_Identifier | undefined, heritage: IV_Identifier | undefined, properties: IV_ClassExpression_properties) {
    super(node, "ClassExpression");
    this.name = name
    this.heritage = heritage
    this.properties = properties
  }

  toString(space = 0) {
    return `<${this.type}> class ${ this.name ? this.name.toString() : "" } ${ this.heritage ? `extends ${this.heritage.toString()}`  : "" } {\n${printScopedSpace(space)}${this.properties.map(e => e.toString(space + 2)).join(`\n${printScopedSpace(space)}`)}\n${printScopedSpace(space - 2)}}`
  }
}