import { ALL_IS } from "./ALL_IS/ALL_IS.ts"

type BBScopes = "Script" | "Module" | "Function" | "AnonFunction" | "Block" | "CKE"

            // IS_Debugger
            // | IS_VarDecl
            // | IS_Return
            // | IS_ES
            // | IS_Throw
            // | IS_FunDecl

export class BB {
  scope : BBScopes
  statements : Array<ALL_IS>

  constructor(scope: BBScopes) {
    this.scope = scope
  }

}

export class ScriptBB extends BB {

  constructor() {
    super("Script")
  }

}

export class ModuleBB extends BB {

  constructor() {
    super("Module")
  }

}

export class FunctionBB extends BB {

  constructor() {
    super("Function")
  }

}

export class AnonFunctionBB extends BB {

  constructor() {
    super("AnonFunction")
  }

}

export class BlockBB extends BB {

  constructor() {
    super("Block")
  }

}

export class CKEBB extends BB {

  constructor() {
    super("CKE")
  }

}