const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const assert = require('node:assert/strict');
const generate = require("@babel/generator").default;
const shell = require('shelljs');


const OUTPUTS_FOLDER = "outputs"

class ProjectFile {
  imports = []
  absoluteFilePath
  projectBasePath
  relativeFilePath
  uname
  isRelative
  extension
  ast = null
  transformedCode = null
  filename
  loc = 0
  
  constructor(absoluteFilePath, projectBasePath) {
    assert(absoluteFilePath !== null)
    assert(projectBasePath !== null)
    assert(absoluteFilePath.startsWith(projectBasePath) === true)
    
    this.absoluteFilePath = absoluteFilePath
    this.projectBasePath  = projectBasePath
    this.relativeFilePath = absoluteFilePath.substr(projectBasePath.length + 1)
    this.uname = this.relativeFilePath.replace(/\//g, '_')

    this.isRelative = true
    this.extension = absoluteFilePath.split('.').pop()
    this.filename = absoluteFilePath.replace(/^.*[\\/]/, '')

    this.transformAndParse()
  }

  transformAndParse() {
    // console.log("Transform and parse: ", this.uname)
    const code = fs.readFileSync(this.absoluteFilePath, 'utf-8');

    let presets = [["@babel/preset-env", { "modules": false }], ['@babel/preset-react', { runtime: "automatic", importSource: true }]]
    let plugins = ['jsx']

    if (this.extension === 'ts' || this.extension === 'tsx') {
      presets.push('@babel/preset-typescript')
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
        let res =  path.resolve(source.replace('@/', `${this.projectBasePath}/`));
        if (isValidPath(res)) {
          return res;
        } else {
          for(const extension of ['.js', '.jsx', '.ts', '.tsx']) {
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
          for(const extension of ['.js', '.jsx', '.ts', '.tsx']) {
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
        return source
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
    fs.writeFile(OUTPUTS_FOLDER + "/" + this.uname, output.code, 'utf8', (err) => {
      if (err) {
        console.error('Error writing to file', err);
      }
    });
  }

  toString() {
    if (this.isRelative) return this.relativePath
    else this.path
  }
}

class ImportsGraph {
  #nodes
  #edges
  constructor() {
    this.#nodes = new Set()
    this.#edges = {}
  }

  getNodes() {
    return this.#nodes
  }

  getEdges() {
    return this.#edges
  }

  addNode(n) {
    // console.log("Adding Node", n)
    this.#nodes.add(n)
  }

  addEdge(n, m) {
    // console.log("Adding Edge: ", n, m)
    this.#nodes.add(n); this.#nodes.add(m); // Ensure the nodes are declared
    if (n in this.#edges) {
      this.#edges[n].add(m)
    } else {
      this.#edges[n] = new Set()
      this.#edges[n].add(m)
    }
  }

  dumpDOT() {

    var stream = fs.createWriteStream(OUTPUTS_FOLDER + "/" + 'importsMap.DOT', {flags: 'w'});
    stream.write("digraph {\n")
    this.#nodes.forEach(n => {
      stream.write(`  "${n}";\n`)
    })

    for (let key in this.#edges) {
      if (this.#edges.hasOwnProperty(key)) { // Ensure it's not iterating over prototype properties
        let nn = this.#edges[key]
        nn.forEach(m => stream.write(`  "${key}" -> "${m}";\n`))
      }
    }
    

    stream.write("}")

    stream.close(() => {
      // dot -Grankdir=TB -Gnodesep=1.0 -Granksep=1.0 -Gconcentrate=true -Gsplines=true -Tpng graph.dot -o large_graph.png
      shell.exec(`dot -Grankdir=TB -Gnodesep=1.0 -Granksep=1.0 -Gconcentrate=true -Gsplines=true -Tpng ${OUTPUTS_FOLDER + "/" + 'importsMap.DOT'} > ${OUTPUTS_FOLDER + "/" + 'importsMap.png'}`)

      // shell.exec(`dot -Tpng ${OUTPUTS_FOLDER + "/" + 'importsMap.DOT'} > ${OUTPUTS_FOLDER + "/" + 'importsMap.png'}`)

    });

    // console.log(this.#nodes)
    // console.log(this.#edges)


    // spawn(`dot -Tpng ${OUTPUTS_FOLDER + "/" + 'importsMap.DOT'} > ${OUTPUTS_FOLDER + "/" + 'importsMap.png'}`);



  }
}

class Project {
  base
  analyzePath
  importsGraph = new ImportsGraph()
  processedFilePaths = new Set()
  files = {}
  usesJSConfigRelativeImports
  failedImports = new Set()
  constructor(projectBasePath, analyzePath) {
    this.base = projectBasePath;
    this.analyzePath = analyzePath
    this.usesJSConfigRelativeImports = false

    // Generate an output folder for intermediate outputs
    if (fs.existsSync(OUTPUTS_FOLDER)) {
      fs.rmSync(OUTPUTS_FOLDER, { recursive: true, force: true });
    }

    fs.mkdirSync(OUTPUTS_FOLDER);

    // Load up all the files from analyze path
    this.#populateJSFiles(this.files, this.analyzePath, this.base)
  }

  #handleFileImport = (results, file, projectBase) => {
    if (['js', 'jsx', 'ts', 'tsx'].includes(file.split('.').pop())) {
      // // Ignore d.ts files
      // if (!file.endsWith('d.ts')) {
        if (!(file in results)) {
          results[file] = new ProjectFile(file, projectBase)
          return results[file]
        } else {
          return results[file]
        }
      // }
    }
    if (!['ico', 'css', 'json'].includes(file.split('.').pop()) && file !== "true/jsx-runtime") {
      this.failedImports.add(file)    }
    return null
  }

  #populateJSFiles = (results, dir, projectBase) => {
    const list = fs.readdirSync(dir);
    
    list.forEach((file) => {
      file = path.resolve(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        this.#populateJSFiles(results, file, projectBase)
      } else {
        this.#handleFileImport(results, file, projectBase)
      }
    });
  };

  processImportsGraph() {
    const projectBase = this.base
    const importsGraph = this.importsGraph
    const processNewImport = this.#handleFileImport
    const oldFiles = {...this.files}
    const result = this.files 

    for (const key in oldFiles) {
      const file = oldFiles[key]
      if (file in result) continue;
      traverse(file.ast, {
        enter(nodePath) {
          importsGraph.addNode(file.uname)
          if (nodePath.isImportDeclaration()) {
            const importPath = nodePath.node.source.value;
            let i = processNewImport(result, importPath, projectBase)
            if (i) {
              importsGraph.addEdge(file.uname, i.uname)
            } else {
              // importsGraph.addEdge(file.uname, importPath)
            }
          }
        }
      })
    }

    const newSet = Object.keys(result)
    const oldSet = Object.keys(oldFiles)
    
    if (newSet.length !== oldSet.length) {
      return this.processImportsGraph()
    }
    console.warn(`Loaded: ${newSet.length} files`)
    let LOC = 0
    for (const [key, value] of Object.entries(result)) {
      console.warn(`  ├── ${value.uname}: ${value.loc}`);
      LOC += value.loc
    }
    console.warn(`  └── LOC: ${LOC}`)
    console.warn("Failed to import: ")
    this.failedImports.forEach(f => console.warn(`  ├── ${f}`))
    console.warn(`  └── Total: ${this.failedImports.size}`)
    importsGraph.dumpDOT();
  }
}

function main(mainProjectPath, analyzePath) {
  let project = new Project(mainProjectPath, analyzePath)
  project.processImportsGraph()
}


let projectPath = process.argv[2];
let analyzePath = process.argv[3]
if (!projectPath) {
  projectPath = "tests/next-shadcn-dashboard-starter/";
  analyzePath = "tests/next-shadcn-dashboard-starter/app";
}

absolutePath = path.resolve(projectPath);
analyzePath = path.resolve(analyzePath);

main(absolutePath, analyzePath)

