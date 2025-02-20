import debugConfig from "#debugConfig";
import { printScopedSpace } from "#utils";
import { JS3FunctionExpression } from "classes/builder/JS3Helpers/JS3Types.ts";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { I_Function } from "../I_GENERAL/I_Function.ts";
import { ISP_RestElement } from "./ALL_ISP.ts";
import { ALL_RVal } from "./ALL_RVal.ts";
import { IV_CTHIS } from "./IV_NonLang.ts";
import { IRIDIUM_FG } from "../Passes/PTA/IRIDIUM_FG.ts";

export class IV_FunctionExpression extends ALL_RVal {
  func: I_Function;
  name: IV_Identifier | undefined;
  dropName: boolean;

  constructor(
    node: JS3FunctionExpression | undefined = undefined,
    params: Array<IV_Identifier | ISP_RestElement>,
    funBody: IRIDIUM_FG,
    name: IV_Identifier | undefined,
    isGenerator: boolean,
    isAsync: boolean,
    dropName: boolean = false,
  ) {
    super(node, "FunctionExpression");
    this.func = new I_Function(node, params, funBody, isGenerator, isAsync);
    this.name = name;
    this.dropName = dropName;
    this.func.funBody.rootBB.env.declareBinding(
      IV_CTHIS.lookupName(),
      undefined,
      this.func.funBody.rootBB,
      "var",
    );
  }

  declaredClosure(): Array<IRIDIUM_FG> | undefined {
    return [this.func.funBody];
  }

  toString(space = 0) {
    return `<FunctionExpression> { ${this.dropName ? "" : this.name ? `name: ${this.name.toString()}` : "name: UKN"} }\n${printScopedSpace(space)}${this.func.toString(space + 2)}`;
  }

  toDOT() {
    debugConfig.DOTContext.add(this.func.funBody);
    return `<FunctionExpression> { ${this.dropName ? "" : this.name ? `name: ${this.name.toString()}` : "name: UKN"} } = ${this.func.funBody.getName()}`;
  }
}
