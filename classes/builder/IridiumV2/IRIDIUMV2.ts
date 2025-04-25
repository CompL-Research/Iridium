import debugConfig from "#debugConfig";
import { VERSION } from "configs/projectStats.ts";
import fs from "fs";
import path from "path";
import JS3Builder from "../JS3Builder.ts";
import { JS3Program } from "../JS3Helpers/JS3Types.ts";
import { IRIV2_STMT } from "./handleStatement.ts";
import { BBSEXP, BBSEXPFlags, EnvDeclareSEXP, FileSEXP, IridiumSEXP, isBBSEXP, isEnvDeclareSEXP, isJSEnvWrite, isResolveEnvBindingSEXP, JSEnvDeclareFlags } from "./Types.ts";

export class IridiumBuildContext {
  static SID = 1;
  static CONTEXT_MAP = new Map<number, IridiumBuildContext>();
  parent: number;
  scopeIdx: number;
  BB: Array<BBSEXP> = [];
  constructor(parent: number, BB: BBSEXP = undefined, flag: BBSEXPFlags = undefined) {
    this.scopeIdx = IridiumBuildContext.SID++;
    this.parent = parent;
    if (BB) {
      this.pushBB(BB);
    } else {
      if (!flag) debugConfig.logger.throwIriError("Expected a flag to qualify all the BBs in iridium, not supplied!!!");
      this.pushBB(new BBSEXP(this.scopeIdx, flag));
    }
    IridiumBuildContext.CONTEXT_MAP.set(this.scopeIdx, this);
  }

  pushBB(BB: BBSEXP) {
    this.BB.push(BB);
  }

  getCurrentBB() {
    return this.BB[this.BB.length - 1];
  }

  addContinuation() {
    const continuationBB = new BBSEXP(this.scopeIdx, "Lexical");
    const currentScope = this.getCurrentBB().flags.filter(e => e[0] === "Scope");
    if (currentScope.length !== 1) debugConfig.logger.throwIriError("Expected exactly 1 Scope flag in every BB");
    continuationBB.flags.map(e => e[0] === "Scope" && currentScope);
    this.pushBB(continuationBB);
    return continuationBB;
  }
}

export class IRIDIUMV2 {
  js3Builder: JS3Builder;
  buildContext: Array<IridiumBuildContext>;
  container: FileSEXP;
  constructor(js3Builder: JS3Builder) {
    this.js3Builder = js3Builder;
    this.buildContext = [];
    this.container = null;
  }

  serialize() {
    return {
      version: VERSION,
      ...this.js3Builder.projectFile.toJSON(),
      iridium: this.container.serialize()
    }
  }

  saveGeneratedFile() {
    const filePath = debugConfig.cli.outputsPath + "/" + path.basename(this.js3Builder.projectFile.uname, this.js3Builder.projectFile.extension) + ".json";
    fs.writeFile(
      filePath,
      JSON.stringify(this.serialize())
      , (e) => {
        if (e) debugConfig.logger.error(`[Failed to save Iridium]: ${path.basename(this.js3Builder.projectFile.uname, this.js3Builder.projectFile.extension)}`);
      }
    );
  }

  getCurrentContext() {
    if (this.buildContext.length === 0) debugConfig.logger.throwIriError("Expected atleast one BB to exist in the build context stack!!");
    const contexts = this.buildContext;
    return contexts[contexts.length - 1];
  }

  getCurrentBB() {
    return this.getCurrentContext().getCurrentBB();
  }

  declareAndPushLexicalContext(flags: BBSEXPFlags = "Lexical"): IridiumBuildContext {
    const currentContext = this.getCurrentContext();
    const newContext = new IridiumBuildContext(currentContext.scopeIdx, undefined, flags);
    this.pushContext(newContext);
    return newContext;
  }

  pushContext(cx: IridiumBuildContext) {
    this.buildContext.push(cx);
    this.container.args.push(cx.getCurrentBB());
  }

  popContext() {
    return this.buildContext.pop();
  }

  addContinuation(currContext: IridiumBuildContext) {
    const continuationBB = currContext.addContinuation();
    this.container.args.push(continuationBB);
  }

  build() {
    const program: JS3Program = this.js3Builder.generatedAST.program;
    if (program.sourceType !== "module") debugConfig.logger.throwIriError("only module mode code is currently supported!!");
    
    const mainContainer = new FileSEXP("JSModule");
    this.container = mainContainer;
    const topLevelContext = new IridiumBuildContext(0, undefined, "TopLevel");
    this.pushContext(topLevelContext);
    for (let s of program.body) {
      IRIV2_STMT(this, s);
    }
    this.popContext();
    if (this.buildContext.length !== 0) debugConfig.logger.throwIriError("Expected buildContext stack to be empty after build()");
    
    this.hoistDeclarations();
    this.resolveEnvReads(this.container, 0);
  }

  findParentClosureScope(localScope: number) {
    if (localScope === 0) return 0;
    if (!IridiumBuildContext.CONTEXT_MAP.has(localScope)) debugConfig.logger.throwIriError(`build context not found for scope: ${localScope}`)
    
    let buildContext = IridiumBuildContext.CONTEXT_MAP.get(localScope);
    let startBB = buildContext.BB[0];
    if (startBB.isClosureBoundary() || startBB.isTopLevel()) return localScope;
    else return this.findParentClosureScope(buildContext.parent);
  }

  findBinding(scope: number, binding: string): EnvDeclareSEXP {
    if (scope === 0) return null;
    if (!IridiumBuildContext.CONTEXT_MAP.has(scope)) debugConfig.logger.throwIriError(`build context not found for scope: ${scope}`)
    
    let buildContext = IridiumBuildContext.CONTEXT_MAP.get(scope);
    let startBB = buildContext.BB[0];
    for (let s of startBB.args) {
      if (isEnvDeclareSEXP(s) && s.getDeclaration() === binding) return s;
    }

    return this.findParentClosureScope(buildContext.parent);
  }

  resolveEnvReads(currSEXP: IridiumSEXP, currBBScope: number) {
    if (isResolveEnvBindingSEXP(currSEXP)) {
      const res = this.findBinding(currBBScope, currSEXP.getBindingName());
      if (res) {
        Object.setPrototypeOf(currSEXP, res);
        currSEXP.tag = res.tag;
        currSEXP.args = res.args;
        currSEXP.flags = res.flags;
      } else {
        debugConfig.logger.throwIriError("TODO: handle global env reads");
      }
    }
    if (isBBSEXP(currSEXP)) {
      currSEXP.args.forEach(e => this.resolveEnvReads(e, currSEXP.getScope()))
    } else currSEXP.args.forEach(e => this.resolveEnvReads(e, currBBScope));
  }

  // 
  // f: HoistDeclarations
  //    1. Iterate over all declarations
  //    2. case 'KIND StringSEXP = IridiumSEXP'
  //        i. StringSEXP = IridiumSEXP
  // 

  hoistDeclarations() {
    const fileSexp = this.container;
    const hoistingInfo = new Map<number, Array<[Array<string>, JSEnvDeclareFlags]>>();

    for (let bb of fileSexp.args) {
      if (isBBSEXP(bb)) {
        const localScope = bb.getScope();
        const parentClosureScope = this.findParentClosureScope(localScope);
        for (let stmt of bb.args) {
          if (isJSEnvWrite(stmt) && stmt.isDecl()) {
            let scopeToHoistTo: number;
            let hoistingKind: JSEnvDeclareFlags;
            if (stmt.isLetDecl() || stmt.isConstDecl()) {
              scopeToHoistTo = localScope;
              if (stmt.isLetDecl()) hoistingKind = "JSLET";
              else hoistingKind = "JSCONST";
            } else {
              scopeToHoistTo = parentClosureScope;
              hoistingKind = "JSVAR";
            }

            let declarations = stmt.getDeclaredBindings();
            stmt.reduceJSDecl();

            if (!hoistingInfo.has(scopeToHoistTo)) hoistingInfo.set(scopeToHoistTo, new Array());
            hoistingInfo.get(scopeToHoistTo).push([declarations, hoistingKind]);
          }
        }
      } else debugConfig.logger.throwIriError("Expected BBSEXP")
    }
    
    // Hoist Declarations
    for (let [scopeIdx, bindingsToCreate] of hoistingInfo) {
      let hoistingContext = IridiumBuildContext.CONTEXT_MAP.get(scopeIdx);
      let hoistingTargetBB = hoistingContext.BB[0];
      let decls = []
      for (let b of bindingsToCreate) {
        const flags: [JSEnvDeclareFlags, null][] = []
        flags.push([b[1], null])
        b[0].forEach(n => decls.push(new EnvDeclareSEXP(n, flags)));
      }
      hoistingTargetBB.args = [...decls, ...hoistingTargetBB.args]
    }
  }

}

