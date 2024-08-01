import * as babel from '@babel/core'
import _generate from "@babel/generator"
import parser, { ParserPlugin } from '@babel/parser'
import _traverse from "@babel/traverse"
import t from '@babel/types'
import { execSync } from 'child_process'
import fs from 'fs'
import assert from 'node:assert/strict'
import path from 'path'

import debugConfig from "#debugConfig"
const traverse = _traverse["default"];
const generate = _generate["default"];


export class ProjectFile {
  absoluteFilePath
  projectBasePath
  relativeFilePath
  analysisPath
  uname
  isRelative
  extension
  resolvedModuleImports = new Map<t.Node, readonly [string, string]>
  resolvedRequireImports = new Map<t.Node, readonly [string, string]>
  unresolvedModuleImports = new Map<t.Node, string>
  unresolvedRequireImports = new Map<t.Node, string>
  moduleExportAllDeclarations = new Set<t.Node>
  moduleExportNamedDeclarations = new Set<t.Node>
  moduleExportDefaultDeclarations = new Set<t.Node>
  parseResult: parser.ParseResult<t.File> | undefined = undefined
  transformedCode = null
  filename
  loc = 0

  constructor(absoluteFilePath, projectBasePath, analysisPath) {
    assert(absoluteFilePath !== null)
    assert(projectBasePath !== null)
    assert(analysisPath !== null)
    if (absoluteFilePath.startsWith(projectBasePath) === false) {
      debugConfig.logger.error("File path does not start with project base path")
      debugConfig.logger.error("File path: ", absoluteFilePath)
      debugConfig.logger.error("Base path: ", projectBasePath)
    }
    assert(absoluteFilePath.startsWith(projectBasePath) === true)

    this.absoluteFilePath = absoluteFilePath
    this.projectBasePath = projectBasePath
    this.relativeFilePath = absoluteFilePath.substr(projectBasePath.length + 1)
    this.analysisPath = analysisPath
    this.uname = this.relativeFilePath.replace(/\//g, '_')

    this.isRelative = true
    this.extension = absoluteFilePath.split('.').pop()
    this.filename = absoluteFilePath.replace(/^.*[\\/]/, '')
  }

  transformAndParse() {
    const code = fs.readFileSync(this.absoluteFilePath, 'utf-8');

    let presets = [ // last 2 Chrome versions
      ["@babel/preset-env", { targets: "> 0.25%, not dead", "modules": debugConfig.resolveImportsToCjs ? "cjs" : false }],
      ['@babel/preset-react'] // { runtime: "automatic", importSource: true }
    ]
    let plugins: Array<ParserPlugin> = ['jsx']

    if (this.extension === 'ts' || this.extension === 'tsx') {
      presets.push(['@babel/preset-typescript'])
      plugins.push(["typescript", { disallowAmbiguousJSXLike: true }])
    }

    this.loc = code.split(/\r\n|\r|\n/).length

    const transformedCode = babel.transformSync(code, {
      cwd: this.projectBasePath,
      filename: this.filename,
      presets,
    });

    const ast = parser.parse(transformedCode.code, {
      sourceType: 'module',
      plugins: plugins,
    });

    // const nodeLibraries = [
    //   'assert',
    //   'buffer',
    //   'child_process',
    //   'cluster',
    //   'console',
    //   'crypto',
    //   'dgram',
    //   'dns',
    //   'events',
    //   'fs',
    //   'http',
    //   'https',
    //   'net',
    //   'os',
    //   'path',
    //   'punycode',
    //   'querystring',
    //   'readline',
    //   'stream',
    //   'string_decoder',
    //   'timers',
    //   'tls',
    //   'tty',
    //   'url',
    //   'util',
    //   'v8',
    //   'vm',
    //   'zlib'
    // ];

    const that = this

    const handleModuleImport = (source: string) => {

      let nodeResolutionError

      // Try resolving using node.resolve
      try {
        const command = `node -e "process.stdout.write(require.resolve('${source}', { paths: [ '${path.dirname(that.absoluteFilePath)}' ] }))" 2>/dev/null`
        // Execute the command synchronously with the specified working directory
        const result = execSync(command, {
          cwd: that.projectBasePath,
          encoding: 'utf-8', // Get the output as a string
        });

        return result
      } catch (error) {
        nodeResolutionError = error
      }

      // Try resolution of possible NextJs aliased import
      try {
        const componentsData = fs.readFileSync(`${that.projectBasePath}/components.json`, 'utf8')
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

        let final = performReplacement(modifiedSource, "@/", `${that.projectBasePath}/`)


        // Handle relative imports
        if (final.startsWith("./")) {
          final = performReplacement(final, "./", `${path.dirname(that.absoluteFilePath)}/`)
          final = path.resolve(final)
        }

        // Handle relative imports
        if (final.startsWith("../")) {
          final = performReplacement(final, "../", `${path.dirname(that.absoluteFilePath)}/../`)
          final = path.resolve(final)
        }

        let searchDir = path.dirname(final)

        const command = `find ${searchDir} -type f -name '${path.basename(final)}.*'`
        // Execute the command synchronously with the specified working directory
        // console.log(`(${source}) Executed: ${command}`)
        const result = execSync(command, {
          cwd: that.projectBasePath,
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
        console.error(`======================= IMPORT ERR =====================`);
        console.error(`Import resolution failed for specifier ${source}`);

        if (nodeResolutionError.stderr) {
          console.error(`Node ERR: ${nodeResolutionError.stderr.toString()}`);
        }
        console.error(`NextJs ERR: ${e}`);

        console.error(`======================= XXXXXXXXXX =====================`);
      }
    }

    // const resolutionPaths = [path.dirname(that.absoluteFilePath), that.analysisPath, that.projectBasePath]

    // Translate imports
    traverse(ast, {
      ImportDeclaration({ node }) {
        const importSpecifier = node.source.value
        const resolved = handleModuleImport(importSpecifier)

        if (!resolved) {
          that.unresolvedModuleImports.set(node, importSpecifier)
          debugConfig.logger.error(`[Failed module import] ${importSpecifier}`)
        } else {
          that.resolvedModuleImports.set(node, [importSpecifier, resolved])
          if (debugConfig.printTransformedImports) {
            node.source.value = resolved
          }
        }



      },
      CallExpression({ node }) {
        // Handle require separately
        if (node.callee.name === 'require') {
          if (node.arguments[0] && node.arguments[0].type === 'StringLiteral') {
            const importSpecifier = node.arguments[0].value
            const resolved = handleModuleImport(importSpecifier)

            if (!resolved) {
              that.unresolvedRequireImports.set(node, importSpecifier)
              debugConfig.logger.error(`[Failed require import] ${importSpecifier}`)
            } else {
              that.resolvedRequireImports.set(node, [importSpecifier, resolved])
              if (debugConfig.printTransformedImports) {
                node.arguments[0].value = resolved
              }
            }



          } else {
            that.unresolvedRequireImports.set(node, "ERR_NOSTR")
            debugConfig.logger.error(`[Failed import] ERR_NOSTR`)
          }
        }
      },
      ExportAllDeclaration({ node }) {
        that.moduleExportAllDeclarations.add(node)
      },
      ExportNamedDeclaration({ node }) {
        that.moduleExportNamedDeclarations.add(node)
      },
      ExportDefaultDeclaration({ node }) {
        that.moduleExportDefaultDeclarations.add(node)
      }
    });

    const output = generate(
      ast,
      {
        /* options */
      },
      code
    );

    this.transformedCode = output.code
    this.parseResult = ast


    // DEBUG
    fs.writeFile(debugConfig.outputsPath + "/" + this.uname, output.code, 'utf8', (err) => {
      if (err) {
        debugConfig.logger.error('Error writing to file', [err]);
      }
    });
  }

  populateImportsAndExports() {

  }

}