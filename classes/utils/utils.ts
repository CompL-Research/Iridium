import debugConfig from '#debugConfig';
import { CommentLine, Identifier, LVal, Node } from '@babel/types';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { JS3CallExpression, JS3RVal, JS3VariableDeclaration, JS3VariableDeclarator } from '../builder/JS3Instructions';
export class JS3GenerationError extends Error { }

// interface CallExpression extends BaseNode {
//   type: "CallExpression";
//   callee: Expression | Super | V8IntrinsicIdentifier;
//   arguments: Array<Expression | SpreadElement | ArgumentPlaceholder>;
//   optional?: true | false | null;
//   typeArguments?: TypeParameterInstantiation | null;
//   typeParameters?: TSTypeParameterInstantiation | null;
// }
export function generateJS3CallExpression(from: Node, callee: Identifier, args: Array<Identifier>, optional: true | false | null | undefined, typeArguments: any, typeParameters: any): JS3CallExpression {
  const result = generateBaseNodeFrom(from) as JS3CallExpression
  result.type = "CallExpression"
  result.callee = callee
  result.arguments = args
  result.optional = optional
  result.typeArguments = typeArguments
  result.typeParameters = typeParameters
  return result
}

export function generateIdentifier(from: Node, name: string): Identifier {
  const result = generateBaseNodeFrom(from) as Identifier
  result.type = "Identifier"
  result.name = name
  return result
}

// interface VariableDeclaration extends BaseNode {
//   type: "VariableDeclaration";
//   kind: "var" | "let" | "const" | "using" | "await using";
//   declarations: Array<VariableDeclarator>;
//   declare?: boolean | null;
// }

// interface VariableDeclarator extends BaseNode {
//   type: "VariableDeclarator";
//   id: LVal;
//   init?: Expression | null;
//   definite?: boolean | null;
// }
export function generateJS3VariableDeclaration(
  from: Node, 
  lVal: LVal, 
  init: JS3RVal, 
  kind: "var" | "let" | "const" | "using" | "await using" = "let", 
  declare: boolean | null | undefined = undefined,
  definite: boolean | null | undefined = undefined
): JS3VariableDeclaration {
  const result = generateBaseNodeFrom(from) as JS3VariableDeclaration
  result.type = "VariableDeclaration";
  result.kind =  kind;
  result.declarations = new Array<JS3VariableDeclarator>()
  result.declare = declare

  const declarator = generateBaseNodeFrom(from) as JS3VariableDeclarator
  declarator.type = "VariableDeclarator";
  declarator.id = lVal;
  declarator.init = init;
  declarator.definite = definite

  result.declarations.push(declarator)
  return result
}

// interface BaseNode {
//   type: Node["type"];
//   leadingComments?: Comment[] | null;
//   innerComments?: Comment[] | null;
//   trailingComments?: Comment[] | null;
//   start?: number | null;
//   end?: number | null;
//   loc?: SourceLocation | null;
//   range?: [number, number];
//   extra?: Record<string, unknown>;
// }
export function generateBaseNodeFrom(from: Node): Node {
  const { start, end, loc, range, extra } = from
  const result = { start, end, loc, range, extra } as Node
  return result
}

export function generateCommentLine(comment: string): CommentLine {
  return {
    type: "CommentLine",
    value: comment,
  } as CommentLine
}

export function resolveModuleImport(source: string, absoluteFilePath: string, projectBasePath: string): string | undefined {
  let nodeResolutionError
  // Try resolving using node.resolve
  try {
    const command = `node -e "process.stdout.write(require.resolve('${source}', { paths: [ '${path.dirname(absoluteFilePath)}' ] }))" 2>/dev/null`
    // Execute the command synchronously with the specified working directory
    const result = execSync(command, {
      cwd: projectBasePath,
      encoding: 'utf-8',
    });
    return result
  } catch (error) {
    nodeResolutionError = error
  }
  // Try resolution of possible NextJs aliased import
  try {
    const componentsData = fs.readFileSync(`${projectBasePath}/components.json`, 'utf8')
    const jsonData = JSON.parse(componentsData)
    const declaredAliases = jsonData["aliases"]
    const aliases = Object.keys(declaredAliases)
    const performReplacement = (src, before, after) => src.startsWith(before) ? src.replace(before, `${after}`) : src;
    let modifiedSource = source
    for (let key of aliases) {
      const replacement = aliases[key]
      if (modifiedSource.startsWith(key)) {
        modifiedSource = performReplacement(modifiedSource, key, replacement)
        break;
      }
    }
    let final = performReplacement(modifiedSource, "@/", `${projectBasePath}/`)
    // Handle relative imports
    if (final.startsWith("./")) {
      final = performReplacement(final, "./", `${path.dirname(absoluteFilePath)}/`)
      final = path.resolve(final)
    }
    // Handle relative imports
    if (final.startsWith("../")) {
      final = performReplacement(final, "../", `${path.dirname(absoluteFilePath)}/../`)
      final = path.resolve(final)
    }
    let searchDir = path.dirname(final)
    const command = `find ${searchDir} -type f -name '${path.basename(final)}.*'`
    // Execute the command synchronously with the specified working directory
    // console.log(`(${source}) Executed: ${command}`)
    const result = execSync(command, {
      cwd: projectBasePath,
      encoding: 'utf-8', // Get the output as a string
    });
    const parsedResult = result.split("\n")
    // Preserve only valid candidates
    const basename = path.basename(final)
    const regex = new RegExp(`^${basename}\\.[^.]+$`);
    const candidates = parsedResult.filter(item => regex.test(path.basename(item)));
    if (candidates.length !== 1) {
      throw new Error(result)
    }
    // Ensure file exists
    if (!fs.existsSync(candidates[0])) {
      throw new Error()
    }
    return candidates[0];
  } catch (e) {
    // Log any errors or standard error output
    debugConfig.logger.error(`======================= IMPORT ERR =====================`);
    debugConfig.logger.error(`Import resolution failed for specifier ${source}`);
    if (nodeResolutionError.stderr) {
      debugConfig.logger.error(`Node ERR: ${nodeResolutionError.stderr.toString()}`);
    }
    debugConfig.logger.error(`NextJs ERR: ${e}`);
    debugConfig.logger.error(`======================= XXXXXXXXXX =====================`);
  }
  return undefined
}