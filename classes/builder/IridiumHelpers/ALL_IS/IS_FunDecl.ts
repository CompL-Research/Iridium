import { JS3FunctionDeclaration } from "classes/builder/JS3Helpers/JS3Types.ts";
import { FunctionBB } from "../BB.ts";
import { ALL_IS } from "./ALL_IS.ts";

export class IS_FunDecl extends ALL_IS {
  funBody: FunctionBB
  constructor(node: JS3FunctionDeclaration | undefined = undefined, funBody: FunctionBB) {
    super(node);
    this.funBody = funBody;
  }
}