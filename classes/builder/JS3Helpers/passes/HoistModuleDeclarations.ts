// 
// Move all the imports to the top of the file
// 

import { generateJS3VariableDeclarationfromBaseNode } from "../JS3Constructors.ts";
import { isJS3FunctionDeclaration, isJS3ImportDeclaration, isJS3VariableDeclaration, JS3File, JS3FunctionDeclaration, JS3ImportDeclaration, JS3VariableDeclaration } from "../JS3Types.ts";

// Algorithm
// 1. Move all top-level imports to the top
// 2. Move all function declarations to the top
// 3. Hoist all 'var' declrations to the top

export function transform(node : JS3File) {
  let imports : Array<JS3ImportDeclaration> = node.program.body.filter(s => isJS3ImportDeclaration(s))
  let fnDecls : Array<JS3FunctionDeclaration> = node.program.body.filter(s => isJS3FunctionDeclaration(s))
  let varDecls : Array<JS3VariableDeclaration> = node.program.body.filter(s => isJS3VariableDeclaration(s))
  varDecls = varDecls.filter(s => s.kind === "var")
  
  // let finDecls : Array<JS3VariableDeclaration> = varDecls.map(orig => {
  //   generateJS3VariableDeclarationfromBaseNode(orig.)
  // })
  
  // let rest = node.program.body.filter(s => !isJS3ImportDeclaration(s))
  // node.program.body = [...imports, ...rest]
}