import { isJS3FunctionDeclaration, JS3FunctionDeclaration } from "classes/builder/JS3Helpers/JS3Types.ts";
import { FunctionDeclBB } from "../BB.ts";
import { ALL_IS } from "./ALL_IS.ts";
import { printScopedSpace } from "../IRIDIUM.ts";

export class IS_FunDecl extends ALL_IS {
  funBody: FunctionDeclBB
  constructor(node: JS3FunctionDeclaration | undefined = undefined, funBody: FunctionDeclBB) {
    super(node);
    this.funBody = funBody;
  }

  toString(space = 0) {
    let stmts = []
    if (isJS3FunctionDeclaration(this.node)) {
      stmts.push(`${printScopedSpace(space)}█ FUNCDECL { name: ${this.node.id.name}, params: ${this.node.params.length} }`)
    } else {
      stmts.push(`${printScopedSpace(space)}█ FUNCDECL { name: NA, params: NA }`)
    }

    stmts.push(this.funBody.toString(space + 4))
    
    return stmts.join("\n")
  }

}