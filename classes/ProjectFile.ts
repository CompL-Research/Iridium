import * as babel from '@babel/core'
import parser, { ParserPlugin } from '@babel/parser'
import _traverse from "@babel/traverse"
import _generate from "@babel/generator"
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import t from '@babel/types'

import debugConfig from '../configs/debug.js'

const traverse = _traverse.default;
const generate = _generate.default;


export class ProjectFile {
  absoluteFilePath
  projectBasePath
  relativeFilePath
  uname
  isRelative
  extension
  ast : t.Node | undefined = undefined
  transformedCode = null
  filename
  loc = 0

  constructor(absoluteFilePath, projectBasePath) {
    assert(absoluteFilePath !== null)
    assert(projectBasePath !== null)
    if (absoluteFilePath.startsWith(projectBasePath) === false) {
      console.error("File path does not start with project base path")
      console.error("File path: ", absoluteFilePath)
      console.error("Base path: ", projectBasePath)
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

    let presets = [
      ["@babel/preset-env", { "modules": debugConfig.resolveImportsToCjs ? "cjs" : false }], 
      ['@babel/preset-react', { runtime: "automatic", importSource: true }]
    ]
    let plugins : Array<ParserPlugin> = ['jsx']

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
        if (isValidPath(res)) {
          return res;
        } else {
          for (const extension of ['.js', '.jsx', '.ts', '.tsx']) {
            const resolved = path.resolve(`${res}${extension}`);

            if (isValidPath(resolved)) {
              return resolved
            }
          }
        }
        return source
      } else if (source.startsWith('.')) {
        // Extract folder path
        const folderPath = path.dirname(this.absoluteFilePath);

        // let res =  source.replace('./', `${folderPath}/`);
        let res = path.resolve(`${folderPath}/${source}`)
        if (isValidPath(res)) {
          return res;
        } else {
          for (const extension of ['.js', '.jsx', '.ts', '.tsx']) {
            const resolved = path.resolve(`${res}${extension}`);

            if (isValidPath(resolved)) {
              return resolved
            }
          }
          return source
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
      return source;
    };

    // Translate imports
    traverse(ast, {
      ImportDeclaration({ node }) {
        node.source.value = resolvePath(node.source.value);
      },
      CallExpression({ node }) {
        if (node.callee.name === 'require' && node.arguments[0] && node.arguments[0].type === 'StringLiteral') {
          node.arguments[0].value = resolvePath(node.arguments[0].value);
        }
      },
    });

    const output = generate(
      ast,
      {
        /* options */
      },
      code
    );

    this.transformedCode = output.code
    this.ast = ast


    // DEBUG
    fs.writeFile(debugConfig.outputsPath + "/" + this.uname, output.code, 'utf8', (err) => {
      if (err) {
        console.error('Error writing to file', err);
      }
    });
  }

}