import debugConfig from "#debugConfig";
import { isIdentifier, isImportSpecifier, isStringLiteral } from "@babel/types";
import { isJS3ArrayPattern, isJS3DebuggerStatement, isJS3ExportAllDeclaration, isJS3ExportDefaultDeclaration, isJS3ExportNamedDeclaration, isJS3ExportNamespaceSpecifier, isJS3ExportSpecifier, isJS3FunctionDeclaration, isJS3IfStatement, isJS3ImportDeclaration, isJS3ObjectPattern, isJS3ReturnStatement, isJS3ThrowStatement, isJS3VariableDeclaration, JS3AllowedProgStatement, JS3DebuggerStatement, JS3ExportAllDeclaration, JS3ExportDefaultDeclaration, JS3ExportNamedDeclaration, JS3File, JS3FunctionDeclaration, JS3IfStatement, JS3ImportDeclaration, JS3Program, JS3ReturnStatement, JS3ThrowStatement, JS3VariableDeclaration } from "../JS3Helpers/JS3Types.ts";
import { IS_Debugger, IS_Return, IS_Throw } from "./ALL_IS/IS_Debugger_Return_Throw.ts";
import { IS_FunDecl } from "./ALL_IS/IS_FunDecl.ts";
import { IS_AExport, IS_AImport, IS_BExport, IS_BImport, IS_CExport, IS_CImport, IS_DExport, IS_EExport } from "./ALL_IS/IS_Imports_Exports.ts";
import { IS_ArrPatVarDecl, IS_ObjPatVarDecl, IS_SimpleVarDecl } from "./ALL_IS/IS_VarDecl.ts";
import { IV_Identifer } from "./ALL_RVal/IV_Identifier.ts";
import { IV_StringLiteral } from "./ALL_RVal/IV_StringLiteral.ts";
import { BB, BlockBB, BranchTerminal, ExitNode, FunctionDeclBB, ModuleBB, ScriptBB, UnconditionalGoto } from "./BB.ts";
import { I_File } from "./I_GENERAL/I_File.ts";

export class IRIDIUM_FG {
  bb: BB

  constructor(bb: BB) { this.bb = bb; }
}


export default class IRIDIUM {
  node: JS3Program
  currentBB: BB

  errors: Array<IRI_ERROR>

  // Static Constructor...
  static create(file: JS3File) {
    return new I_File(file)
  }

  constructor(node: JS3Program) {
    this.node = node
    this.errors = []
    this.initialize();
  }

  initialize() {
    if (this.node.sourceType === "module") {
      let bb = new ModuleBB(this.node)
      bb.terminal = new ExitNode()
      this.setCurrentBB(bb);
    } else {
      let bb = new ScriptBB(this.node)
      bb.terminal = new ExitNode()
      this.setCurrentBB(bb);
    }
  }

  setCurrentBB(bb: BB) { this.currentBB = bb; }
  getCurrentBB() { return this.currentBB; }


  handleJS3AllowedProgStatement(stmt: JS3AllowedProgStatement) {
    if      (isJS3ImportDeclaration(stmt))        this.handleJS3ImportDeclaration(stmt)
    else if (isJS3ExportDefaultDeclaration(stmt)) this.handleJS3ExportDefaultDeclaration(stmt)
    else if (isJS3ExportNamedDeclaration(stmt))   this.handleJS3ExportNamedDeclaration(stmt)
    else if (isJS3ExportAllDeclaration(stmt))     this.handleJS3ExportAllDeclaration(stmt)

    else if (isJS3DebuggerStatement(stmt))        this.handleJS3DebuggerStatement(stmt)
    else if (isJS3ReturnStatement(stmt))          this.handleJS3ReturnStatement(stmt)
    else if (isJS3ThrowStatement(stmt))           this.handleJS3ThrowStatement(stmt)

    else if (isJS3VariableDeclaration(stmt))      this.handleJS3VariableDeclaration(stmt)

    else if (isJS3FunctionDeclaration(stmt))      this.handleJS3FunctionDeclaration(stmt)

    else if (isJS3IfStatement(stmt))              this.handleJS3IfStatement(stmt)


    else debugConfig.logger.throwIriError(`IRIDIUM: Unhandled Statement ${stmt.type}, ${stmt.js3type}`)
  }

  handleJS3ProgramBody(body: Array<JS3AllowedProgStatement>) {
    for (let _st of body) {
      this.handleJS3AllowedProgStatement(_st)
    }

  }

  build() {
    let body = new IRIDIUM_FG(this.currentBB)
    this.handleJS3ProgramBody(this.node.body)
    return body
  }

  // *********************** Iridium_IfStatement ***********************

  handleJS3IfStatement(stmt: JS3IfStatement) {
    if (!stmt.alternate) {
      // Case a.
      // if (ID) { CONSEQ }
      let curr = this.getCurrentBB()
      let TrueBB = new BlockBB()
      let PostBB : BB = curr.create() // Create a continuation...
      PostBB.terminal = curr.terminal

      let ID = new IV_Identifer(stmt.test, stmt.test.name)
      curr.terminal = new BranchTerminal(stmt, ID, TrueBB, PostBB)
      TrueBB.terminal = new UnconditionalGoto(PostBB)
      

      this.setCurrentBB(TrueBB)
      stmt.consequent.body.forEach(s => {
        this.handleJS3AllowedProgStatement(s);
      })

      this.setCurrentBB(PostBB)
    } else {
      // Case a.
      // if (ID) { CONSEQ } else { ALT }
      let curr = this.getCurrentBB()
      let TrueBB = new BlockBB()
      let FalseBB = new BlockBB()
      let PostBB : BB = curr.create() // Create a continuation...
      PostBB.terminal = curr.terminal

      let ID = new IV_Identifer(stmt.test, stmt.test.name)
      
      curr.terminal = new BranchTerminal(stmt, ID, TrueBB, FalseBB)
      TrueBB.terminal = new UnconditionalGoto(PostBB)
      FalseBB.terminal = new UnconditionalGoto(PostBB)

      this.setCurrentBB(TrueBB)
      stmt.consequent.body.forEach(s => {
        this.handleJS3AllowedProgStatement(s);
      })

      this.setCurrentBB(FalseBB)
      stmt.alternate.body.forEach(s => {
        this.handleJS3AllowedProgStatement(s);
      })

      this.setCurrentBB(PostBB)
    }
  }

  // *********************** Iridium_FunctionDeclaration *********************** 
  
  handleJS3FunctionDeclaration(stmt: JS3FunctionDeclaration) {
    let curr = this.getCurrentBB()

    // Lower function body
    let funBB = new FunctionDeclBB(stmt)
    funBB.terminal = new ExitNode()
    this.setCurrentBB(funBB)

    for (let s of stmt.body.body) {
      this.handleJS3AllowedProgStatement(s)
    }

    this.setCurrentBB(curr)
    curr.statements.push(new IS_FunDecl(stmt, funBB))
  }

  // *********************** Iridium_VariableDeclarations ***********************  

  handleJS3VariableDeclaration(stmt: JS3VariableDeclaration) {
    let curr = this.getCurrentBB()

    

    // Assert that only one specifier exists
    if (stmt.kind === "using" || stmt.kind === "await using") {
      this.errors.push(new JS3_ASSERTION_FAILED("JS3VariableDeclaration: 'using' and 'await using' not supported in JS3", [stmt]))
      debugConfig.logger.throwIriError("JS3VariableDeclaration: 'using' and 'await using' not supported in JS3")
      return;
    }

    // Assert that only one specifier exists
    if (stmt.declarations.length !== 1) {
      this.errors.push(new JS3_ASSERTION_FAILED("JS3VariableDeclaration: expecting exactly one declaration in JS3", [stmt]))
      debugConfig.logger.throwIriError("JS3VariableDeclaration: expecting exactly one declaration in JS3")
      return;
    }

    let declaration = stmt.declarations[0]
    let KIND = stmt.kind

    // case a.
    // KIND ID = RVal
    
    if (isIdentifier(declaration.id)) {
      let LVal = new IV_Identifer(declaration.id, declaration.id.name)
      let RVal = new IV_StringLiteral(undefined, "TODO") // TODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODO
      curr.statements.push(new IS_SimpleVarDecl(stmt, KIND, LVal, RVal))
      return;
    }

    // case b.
    // KIND [ ID, ...ID ] = RVal
    if (isJS3ArrayPattern(declaration.id)) {
      let LVal = declaration.id
      let RVal = new IV_StringLiteral(undefined, "TODO") // TODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODO
      curr.statements.push(new IS_ArrPatVarDecl(stmt, KIND, LVal, RVal))
      return;
    }

    // case c.
    // KIND { TRIV_KEY: ID, ...ID } = RVal
    if (isJS3ObjectPattern(declaration.id)) {
      
      let LVal = declaration.id
      let RVal = new IV_StringLiteral(undefined, "TODO") // TODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODO
      curr.statements.push(new IS_ObjPatVarDecl(stmt, KIND, LVal, RVal))
      return;
    }

    this.errors.push(new JS3_ASSERTION_FAILED("JS3VariableDeclaration: UNHANDLED", [stmt]))
    debugConfig.logger.throwIriError("JS3VariableDeclaration: UNHANDLED")
    return;
  }


  // *********************** Iridium_Debugger_Return_Throw ***********************  

  handleJS3DebuggerStatement(stmt: JS3DebuggerStatement) {
    let curr = this.getCurrentBB()
    // debugger; 
    curr.statements.push(new IS_Debugger())
  }

  handleJS3ReturnStatement(stmt: JS3ReturnStatement) {
    let curr = this.getCurrentBB()
    // return | return ID
    if (stmt.argument) {
      curr.statements.push(new IS_Return(stmt, new IV_Identifer(stmt.argument, stmt.argument.name)))
    } else {
      curr.statements.push(new IS_Return(stmt, null))
    }
  }

  handleJS3ThrowStatement(stmt: JS3ThrowStatement) {
    let curr = this.getCurrentBB()
    // throw ID
    curr.statements.push(new IS_Throw(stmt, new IV_Identifer(stmt.argument, stmt.argument.name)))
  }

  // *********************** Iridium_Imports_Exports ***********************  

  handleJS3ImportDeclaration(stmt: JS3ImportDeclaration) {
    let curr = this.getCurrentBB()

    // case a.
    // import "FROM"
    if (stmt.specifiers.length === 0) {
      curr.statements.push(new IS_AImport(stmt, new IV_StringLiteral(stmt.source, stmt.source.value)))
      return;
    }

    // Assert that only one specifier exists
    if (stmt.specifiers.length !== 1) {
      this.errors.push(new JS3_ASSERTION_FAILED("JS3ImportDeclaration: Expected a single specifier in JS3", [stmt]))
      debugConfig.logger.throwIriError("JS3ImportDeclaration: Expected a single specifier in JS3")
      return;
    }

    let specifier = stmt.specifiers[0]

    // case b.
    // import { X as Y } from "FROM"
    if (isImportSpecifier(specifier)) {
      let remote: IV_Identifer | IV_StringLiteral
      if (isIdentifier(specifier.imported)) {
        remote = new IV_Identifer(specifier.imported, specifier.imported.name)
      } else {
        remote = new IV_StringLiteral(specifier.imported, specifier.imported.value)
      }
      let local = new IV_Identifer(specifier.local, specifier.local.name)
      let FROM = new IV_StringLiteral(stmt.source, stmt.source.value)
      curr.statements.push(new IS_BImport(stmt, remote, local, FROM));
      return;
    }

    // case c.
    // import * as X from "FROM"
    else {
      let local = new IV_Identifer(specifier.local, specifier.local.name)
      let FROM = new IV_StringLiteral(stmt.source, stmt.source.value)
      curr.statements.push(new IS_CImport(stmt, local, FROM));
      return;
    }
  }

  handleJS3ExportDefaultDeclaration(stmt: JS3ExportDefaultDeclaration) {
    let curr = this.getCurrentBB()
    // export default ID
    curr.statements.push(new IS_AExport(stmt, new IV_Identifer(stmt.declaration, stmt.declaration.name)))
  }

  handleJS3ExportNamedDeclaration(stmt: JS3ExportNamedDeclaration) {
    let curr = this.getCurrentBB()

    // Assert that only one specifier exists
    if (stmt.specifiers.length !== 1) {
      this.errors.push(new JS3_ASSERTION_FAILED("JS3ExportNamedDeclaration: Expected a single specifier in JS3", [stmt]))
      debugConfig.logger.throwIriError("JS3ExportNamedDeclaration: Expected a single specifier in JS3")
      return;
    }

    let specifier = stmt.specifiers[0]

    if (isJS3ExportSpecifier(specifier) && !isStringLiteral(stmt.source)) {
      // case a.
      // export {LOCAL as REMOTE}
      let local = new IV_Identifer(specifier.local, specifier.local.name)
      let remote: IV_Identifer | IV_StringLiteral
      if (isIdentifier(specifier.exported)) {
        remote = new IV_Identifer(specifier.exported, specifier.exported.name)
      } else {
        remote = new IV_StringLiteral(specifier.exported, specifier.exported.value)
      }
      curr.statements.push(new IS_BExport(stmt, local, remote))
      return;
    }

    if (isJS3ExportSpecifier(specifier) && isStringLiteral(stmt.source)) {
      // case b.
      // export {LOCAL as REMOTE} from FROM
      let local = new IV_Identifer(specifier.local, specifier.local.name)
      let remote: IV_Identifer | IV_StringLiteral
      if (isIdentifier(specifier.exported)) {
        remote = new IV_Identifer(specifier.exported, specifier.exported.name)
      } else {
        remote = new IV_StringLiteral(specifier.exported, specifier.exported.value)
      }
      let FROM = new IV_StringLiteral(stmt.source, stmt.source.value)
      curr.statements.push(new IS_CExport(stmt, local, remote, FROM))
      return;
    }

    if (isJS3ExportNamespaceSpecifier(specifier) && isIdentifier(specifier.exported)) {
      // case c.
      // export * as REMOTE FROM
      let remote = new IV_Identifer(specifier.exported, specifier.exported.name)
      let FROM = new IV_StringLiteral(stmt.source, stmt.source.value)
      curr.statements.push(new IS_DExport(stmt, remote, FROM))
      return;
    }

    this.errors.push(new JS3_ASSERTION_FAILED("JS3ExportNamedDeclaration: UNHANDLED", [stmt]))
    debugConfig.logger.throwIriError("JS3ExportNamedDeclaration: UNHANDLED")
    return;

  }

  handleJS3ExportAllDeclaration(stmt: JS3ExportAllDeclaration) {
    let curr = this.getCurrentBB()
    let FROM = new IV_StringLiteral(stmt.source, stmt.source.value)
    curr.statements.push(new IS_EExport(stmt, FROM))
  }
}



export class IRI_ERROR {
  msg: string
  objs: Array<any>
  constructor(msg: string, objs: Array<any> = []) {
    this.msg = msg
    this.objs = objs
  }
}

export class JS3_ASSERTION_FAILED extends IRI_ERROR {
  constructor(msg: string, objs: Array<any>) {
    super(msg, objs);
  }
}