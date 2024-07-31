import * as babel from '@babel/core'
import parser, { ParserPlugin } from '@babel/parser'
import _traverse from "@babel/traverse"
import _generate from "@babel/generator"
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import t, { ImportDeclaration } from '@babel/types'

import debugConfig from '../configs/debug.js'

const traverse = _traverse["default"];
const generate = _generate["default"];


export class ProjectFile {
  absoluteFilePath
  projectBasePath
  relativeFilePath
  uname
  isRelative
  extension
  resolvedModuleImports = new Map<t.Node, readonly [string, string]>
  unresolvedModuleImports = new Map<t.Node, string>
  resolvedRequireImports = new Map<t.Node, readonly[string, string]>
  unresolvedRequireImports = new Map<t.Node, string>
  moduleExportAllDeclarations = new Set<t.Node>
  moduleExportNamedDeclarations = new Set<t.Node>
  moduleExportDefaultDeclarations = new Set<t.Node>
  parseResult: parser.ParseResult<t.File> | undefined = undefined
  transformedCode = null
  filename
  loc = 0

  constructor(absoluteFilePath, projectBasePath) {
    assert(absoluteFilePath !== null)
    assert(projectBasePath !== null)
    if (absoluteFilePath.startsWith(projectBasePath) === false) {
      debugConfig.logger.error("File path does not start with project base path")
      debugConfig.logger.error("File path: ", absoluteFilePath)
      debugConfig.logger.error("Base path: ", projectBasePath)
    }
    assert(absoluteFilePath.startsWith(projectBasePath) === true)

    this.absoluteFilePath = absoluteFilePath
    this.projectBasePath = projectBasePath
    this.relativeFilePath = absoluteFilePath.substr(projectBasePath.length + 1)
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



    const isValidPath = (path) => {
      try {
        return fs.statSync(path).isFile()
      } catch {
        return false;
      }
    }

    const resolvePath = (source) => {
      if (source.startsWith('@/')) {
        let res = path.resolve(source.replace('@/', `${this.projectBasePath}/`));
        for (const extension of ['.js', '.jsx', '.ts', '.tsx']) {
          const resolved = path.resolve(`${res}${extension}`);
          if (isValidPath(resolved)) {
            return resolved
          }
        }
      } else if (source.startsWith('.')) {
        // Extract folder path
        const folderPath = path.dirname(this.absoluteFilePath);
        const res = path.resolve(`${folderPath}/${source}`)
        for (const extension of ['.js', '.jsx', '.ts', '.tsx']) {
          const resolved = path.resolve(`${res}${extension}`);
          if (isValidPath(resolved)) {
            return resolved
          }
        }
      } else {
        // TODO: handle libraries

        // let res =  path.resolve(this.projectBasePath + "/node_modules/" + source)
        // if (isValidPath(res)) {
        //   return res;
        // } else {
        //   for(const extension of ['.js', '.jsx', '.ts', '.tsx']) {
        //     const resolved = path.resolve(`${res}${extension}`);
        //     if (isValidPath(resolved)) {
        //       return resolved
        //     }
        //   }
        // }
      }
      return null;
    };

    const that = this

    // Translate imports
    traverse(ast, {
      ImportDeclaration({ node }) {
        let resolved = resolvePath(node.source.value);
        if (resolved) {
          that.resolvedModuleImports.set(node, [node.source.value, resolved])
          if (debugConfig.printTransformedImports) {
            node.source.value = resolved
          }
        } else {
          that.unresolvedModuleImports.set(node, node.source.value)
        }
      },
      CallExpression({ node }) {
        // Handle require separately
        if (node.callee.name === 'require') {
          if (node.arguments[0] && node.arguments[0].type === 'StringLiteral') {
            let resolved = resolvePath(node.arguments[0].value);
            if (resolved) {
              that.resolvedRequireImports.set(node, [node.arguments[0].value, resolved])
              if (debugConfig.printTransformedImports) {
                node.arguments[0].value = resolved
              }
            } else {
              that.unresolvedRequireImports.set(node, node.arguments[0].value)
            }
          } else {
            that.unresolvedRequireImports.set(node, "ERR_NOSTR")
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