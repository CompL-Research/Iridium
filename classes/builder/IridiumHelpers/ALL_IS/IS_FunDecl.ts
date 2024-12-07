import { isJS3FunctionDeclaration, JS3FunctionDeclaration } from "classes/builder/JS3Helpers/JS3Types.ts";
import { FunctionInitBB } from "../BB.ts";
import { ALL_IS } from "./ALL_IS.ts";
import { printScopedSpace } from "../IRIDIUM.ts";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { ISP_RestElement } from "../ALL_RVal/ALL_ISP.ts";

export class IS_FunDecl extends ALL_IS {
  funBody: FunctionInitBB
  params : Array<IV_Identifier | ISP_RestElement>

  constructor(node: JS3FunctionDeclaration | undefined = undefined, funBody: FunctionInitBB, params : Array<IV_Identifier | ISP_RestElement>) {
    super(node);
    this.funBody = funBody;
    this.params = params
  }

  toString(space = 0) {

    let params = this.params.map(i => i.toString()).join(",")

    let stmts = []
    if (isJS3FunctionDeclaration(this.node)) {
      stmts.push(`${printScopedSpace(space)}█ FUNCDECL { name: ${this.node.id.name}, params: [${params}] }`)
    } else {
      stmts.push(`${printScopedSpace(space)}█ FUNCDECL { name: UKN, params: [${params}] }`)
    }

    stmts.push(this.funBody.toString(space + 4))
    
    return stmts.join("\n")
  }

}