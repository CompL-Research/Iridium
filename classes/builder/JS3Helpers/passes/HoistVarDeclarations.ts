// 
// Move all var declarations to top and init to undefined
// 

// Algorithm
// 1. Identify all permissable 'var' declarations 
// 2. Generate 'var' declarations on the top

import _traverse from "@babel/traverse";
import { isJS3FunctionDeclaration, isJS3ImportDeclaration, JS3File, JS3Program } from "../JS3Types.ts";
import { generateIdentifier, generateJS3VariableDeclarationfromBaseNode, generateJS3VariableDeclaratorfromBaseNode } from "../JS3Constructors.ts";
import debugConfig from "#debugConfig"
const traverse = _traverse.default

// Algorithm
// 1. Move all top-level imports to the top
// 2. Move all function declarations to the top

export function transform(node : JS3File) {
  traverse(node, {
    Program(path) {
      let varBindings = []
      for (let key in path.scope.bindings) {
        let b = path.scope.bindings[key]
        if (b.kind === "var") varBindings.push(b)
      }
      let moduleVarBindings = varBindings.map(a => a.identifier.name)
      // console.log("Top Level Var Decls:", moduleVarBindings);
      let programNode : JS3Program = path.node
      let i = 0
      programNode.body.forEach(n => {
        // All imports and function declarations will already have been hoisted to the top, so we skip that many indices
        if (isJS3ImportDeclaration(n)) i++
        if (isJS3FunctionDeclaration(n)) i++
      })

      for (let binding of moduleVarBindings) {
        let declarators = new Array()
        declarators.push(generateJS3VariableDeclaratorfromBaseNode(generateIdentifier(path.node, binding), generateIdentifier(path.node, "undefined"), null, path.node))
        let toPush = generateJS3VariableDeclarationfromBaseNode(declarators, "var", null, path.node)
        programNode.body.splice(i++, 0, toPush);
      }
    },
    Function(path) {
      // Only do this on functions that are in JS3 format, it is possible that default arguments to a functions have not been simplified to JS3
      // TEST: tests/test262/test/language/eval-code/direct/arrow-fn-body-cntns-arguments-func-decl-arrow-func-declare-arguments-assign-incl-def-param-arrow-arguments.js
      // if (path.node.js3type === undefined) return; 
      if (!Array.isArray(path.node.body.body)) return;

      // Hoist function declarations
      let fnNode = path.node
      let fnDecls = fnNode.body.body.filter(s => isJS3FunctionDeclaration(s))
      let rest = fnNode.body.body.filter(s => !isJS3FunctionDeclaration(s))
      fnNode.body.body = [...fnDecls, ...rest]

      // Hoist function 
      let varBindings = []
      for (let key in path.scope.bindings) {
        let b = path.scope.bindings[key]
        if (b.kind === "var") varBindings.push(b)
      }

      // Find index to insert at
      let i = 0
      path.node.body.body.forEach(n => {
        // All function declarations will already have been hoisted to the top, so we skip that many indices
        if (isJS3FunctionDeclaration(n)) i++
      })

      // Generate 'var' declarations after function declarations
      let fnVarBindings = varBindings.map(a => a.identifier.name)
      for (let binding of fnVarBindings) {
        let declarators = new Array()
        declarators.push(generateJS3VariableDeclaratorfromBaseNode(generateIdentifier(path.node, binding), generateIdentifier(path.node, "undefined"), null, path.node))
        let toPush = generateJS3VariableDeclarationfromBaseNode(declarators, "var", null, path.node)
        path.node.body.body.splice(i++, 0, toPush);
      }
    }
  });
}