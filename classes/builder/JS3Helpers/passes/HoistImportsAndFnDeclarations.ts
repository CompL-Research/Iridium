// 
// Move all the imports to the top of the file
// 

import { isJS3FunctionDeclaration, isJS3ImportDeclaration, JS3File, JS3FunctionDeclaration, JS3ImportDeclaration } from "../JS3Types.ts";
// Algorithm
// 1. Move all top-level imports to the top
// 2. Move all function declarations to the top

export function transform(node : JS3File) {
  let imports : Array<JS3ImportDeclaration> = node.program.body.filter(s => isJS3ImportDeclaration(s))
  let fnDecls : Array<JS3FunctionDeclaration> = node.program.body.filter(s => isJS3FunctionDeclaration(s))

  let rest = node.program.body.filter(s => !isJS3ImportDeclaration(s) && !isJS3FunctionDeclaration(s))
  node.program.body = [...imports, ...fnDecls, ...rest]
}