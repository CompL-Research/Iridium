import debugConfig from '#debugConfig';
import { CommentBlock, CommentLine } from '@babel/types';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
export class JS3GenerationError extends Error { }

export function popSet<T>(s : Set<T>) : T {
  for (const value of s) {
    s.delete(value)
    return value
  }
}

export const printScopedSpace = (space) => {
  let res = "";
  for (let i = 0; i < space; i++) {
    res += (i >= 2 && (i % 2 === 0)) ? "░" : " "
  }
  return res;
}

export const printSpace = (space) => {
  let res = "";
  for (let i = 0; i < space; i++) {
    res += " "
  }
  return res;
}


export function getRandomElement(set) {
  const array = Array.from(set);
  return array[Math.floor(Math.random() * array.length)];
}

export function generateCommentLine(comment: string): CommentLine {
  return {
    type: "CommentLine",
    value: comment,
  } as CommentLine
}

export function generateCommentBlock(comment: string): CommentBlock {
  return {
    type: "CommentBlock",
    value: comment,
  } as CommentBlock
}

export function resolveModuleImport(source: string, absoluteFilePath: string, projectBasePath: string): string | undefined {
  let nodeResolutionError
  // Try resolving using node.resolve
  const command = `node -e "process.stdout.write(require.resolve('${source}', { paths: [ '${path.dirname(absoluteFilePath)}' ] }))" 2>/dev/null`
  try {
    
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
    debugConfig.logger.error(`command: ${command}`);
    debugConfig.logger.error(`Working with: ${absoluteFilePath}`);

    debugConfig.logger.error(`Import resolution failed for specifier ${source}`);
    if (nodeResolutionError.stderr) {
      debugConfig.logger.error(`Node ERR: ${nodeResolutionError.stderr.toString()}`);
    }
    debugConfig.logger.error(`NextJs ERR: ${e}`);
    debugConfig.logger.error(`======================= XXXXXXXXXX =====================`);
  }
  return undefined
}