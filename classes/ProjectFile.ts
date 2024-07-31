import * as babel from '@babel/core'
import parser, { ParserPlugin } from '@babel/parser'
import _traverse from "@babel/traverse"
import _generate from "@babel/generator"
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import t, { ImportDeclaration } from '@babel/types'
import { execSync } from 'child_process';

import debugConfig from '../configs/debug.js'
import { resolveESM } from './util/ESMResolve.cjs'
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
  unresolvedModuleImports = new Map<t.Node, string>
  resolvedRequireImports = new Map<t.Node, readonly [string, string]>
  unresolvedRequireImports = new Map<t.Node, string>
  ignoredModuleImports = new Map<t.Node, string>
  ignoredRequireImports = new Map<t.Node, string>
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

    this.transformAndParse()
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

    const nodeLibraries = [
      'assert', 
      'buffer', 
      'child_process', 
      'cluster', 
      'console', 
      'crypto', 
      'dgram', 
      'dns', 
      'events', 
      'fs', 
      'http', 
      'https', 
      'net', 
      'os', 
      'path', 
      'punycode', 
      'querystring', 
      'readline', 
      'stream', 
      'string_decoder', 
      'timers', 
      'tls', 
      'tty', 
      'url', 
      'util', 
      'v8', 
      'vm', 
      'zlib'
    ];
    

    const ignoredImports = [...nodeLibraries, "debug"]
    const ignoredPatterns = ["@mui", "engine.io-client"]

    const isIgnoredPattern = (source: string) => {
      for (const patt of ignoredPatterns) {
        if (source.includes(patt)) return true
      }
      return false
    }

    const that = this

    const handleModuleImport = (source) => {
      let resolved
      try {
        try {
          const command = `node -e "process.stdout.write(require.resolve('${source}', { paths: [ '${path.dirname(that.absoluteFilePath)}' ] }))"`
          // Execute the command synchronously with the specified working directory
          const result = execSync(command, {
            cwd: that.projectBasePath,
            encoding: 'utf-8', // Get the output as a string
          });

          if (!debugConfig.includeLibrariesInComponentGraph && result.includes("node_modules")) {
            resolved = undefined
          } else {
            resolved = result
          }


        } catch (error) {
          // Log any errors or standard error output
          console.error(`Error executing command: ${error.message}`);
          if (error.stderr) {
            console.error(`stderr: ${error.stderr.toString()}`);
          }
          process.exit(1);
        }
      } catch (e) {
        return null
      }

      return resolved
    }

    // const resolutionPaths = [path.dirname(that.absoluteFilePath), that.analysisPath, that.projectBasePath]

    // Translate imports
    traverse(ast, {
      ImportDeclaration({ node }) {
        const importSpecifier = node.source.value
        const resolved = handleModuleImport(importSpecifier)

        if (resolved) {
          if (ignoredImports.includes(importSpecifier) || isIgnoredPattern(importSpecifier)) {
            debugConfig.logger.warn(`[Ignored import] ${importSpecifier}`)
            that.ignoredModuleImports.set(node, importSpecifier)
          } else {
            debugConfig.logger.log(`[Added to import list] ${importSpecifier} ${isIgnoredPattern(importSpecifier)}`)
            that.resolvedModuleImports.set(node, [importSpecifier, resolved])
            if (debugConfig.printTransformedImports) {
              node.source.value = resolved
            }
          }
        } else {
          that.unresolvedModuleImports.set(node, importSpecifier)
          debugConfig.logger.error(`[Failed import] ${importSpecifier}`)
        }

      },
      CallExpression({ node }) {
        // Handle require separately
        if (node.callee.name === 'require') {
          if (node.arguments[0] && node.arguments[0].type === 'StringLiteral') {


            const importSpecifier = node.arguments[0].value
            const resolved = handleModuleImport(importSpecifier)

            if (resolved) {
              if (ignoredImports.includes(importSpecifier) || isIgnoredPattern(importSpecifier)) {
                debugConfig.logger.warn(`[Ignored import] ${importSpecifier}`)
                that.ignoredRequireImports.set(node, importSpecifier)
              } else {
                debugConfig.logger.log(`[Added to import list] ${importSpecifier} ${isIgnoredPattern(importSpecifier)}`)
                that.resolvedRequireImports.set(node, [importSpecifier, resolved])
                if (debugConfig.printTransformedImports) {
                  node.arguments[0] = resolved
                }
              }
            } else {
              that.unresolvedRequireImports.set(node, importSpecifier)
              debugConfig.logger.error(`[Failed import] ${importSpecifier}`)
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