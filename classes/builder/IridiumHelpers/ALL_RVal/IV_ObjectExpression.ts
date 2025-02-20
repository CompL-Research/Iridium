import { printScopedSpace, printSpace } from "#utils";
import { JS3ObjectExpression } from "classes/builder/JS3Helpers/JS3Types.ts";
import {
  ISP_ArgSpread,
  ISP_ObjectMethod,
  ISP_ObjectProperty,
} from "./ALL_ISP.ts";
import { ALL_RVal } from "./ALL_RVal.ts";
import { IRIDIUM_FG } from "../Passes/PTA/IRIDIUM_FG.ts";

export class IV_ObjectExpression extends ALL_RVal {
  properties: Array<ISP_ObjectMethod | ISP_ObjectProperty | ISP_ArgSpread>;

  constructor(
    node: JS3ObjectExpression | undefined = undefined,
    properties: Array<ISP_ObjectMethod | ISP_ObjectProperty | ISP_ArgSpread>,
  ) {
    super(node, "ObjectExpression");
    this.properties = properties;
  }

  declaredClosure(): Array<IRIDIUM_FG> | undefined {
    return this.properties.map((p) => p.declaredClosure()).flat(1);
  }

  usedIdentifiers(): Set<string> {
    const res: Set<string> = new Set();
    this.properties
      .filter(
        (p) => p instanceof ISP_ObjectMethod || p instanceof ISP_ObjectProperty,
      )
      .forEach((p) => {
        p.usedIdentifiers().forEach((u) => res.add(u));
      });
    this.properties
      .filter((p) => p instanceof ISP_ArgSpread)
      .forEach((i) => res.add(i.arg.lookupName()));
    return res;
  }

  toString(space = 0) {
    return `<ObjectExpression> {\n${printScopedSpace(space + 2)}${this.properties.map((e) => e.toString(space + 4)).join(`,\n${printScopedSpace(space + 2)}`)}\n${printScopedSpace(space)}}`;
  }

  toDOT(space = 0) {
    return `<ObjectExpression> {\\l${printSpace(space + 2)}${this.properties.map((e) => e.toDOT(space + 4)).join(`,\\l${printSpace(space + 2)}`)}\\l${printSpace(space)}}`;
  }
}
