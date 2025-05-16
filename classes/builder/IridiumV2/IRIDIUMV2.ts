import debugConfig from "#debugConfig";
import { VERSION } from "configs/projectStats.ts";
import fs from "fs";
import path from "path";
import JS3Builder from "../JS3Builder.ts";
import { JS3Program } from "../JS3Helpers/JS3Types.ts";
import { IRIV2_STMT } from "./handleStatement.ts";
import { BBContainerSEXP, BBSEXP, BBSEXPFlags, BindingsSEXP, EnvBindingSEXP, EnvReadSEXP, EnvWriteSEXP, FileSEXP, GlobalBindingSEXP, IridiumSEXP, isBBContainerSEXP, isBBSEXP, isBindingsSEXP, isEnvBindingSEXP, isGlobalBindingSEXP, isJSEnvWrite, isLambdaSEXP, isRemoteEnvBindingSEXP, isResolveEnvBindingSEXP, isScopeDescriptorContainerSEXP, isScopeDescriptorSEXP, JSEnvBindingFlags, JSEnvWriteSEXP, JSNUBDSEXP, ListSEXP, RemoteEnvBindingSEXP, ScopeDescriptorContainerSEXP, ScopeDescriptorSEXP } from "./Types.ts";
import { dumpSEXP } from "./PP.ts";
import { file } from "bun";

export class IridiumBuildContext {
  static SID = 0;
  static CONTEXT_MAP = new Map<number, IridiumBuildContext>();
  parent: number;
  scopeIdx: number;
  args: Array<string> = [];
  nubds: Array<string> = [];

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
    const topLevelContext = new IridiumBuildContext(-1, undefined, "TopLevel");
    this.pushContext(topLevelContext);
    for (let s of program.body) {
      IRIV2_STMT(this, s);
    }
    this.popContext();
    if (this.buildContext.length !== 0) debugConfig.logger.throwIriError("Expected buildContext stack to be empty after build()");

    // debugConfig.logger.log("" + dumpSEXP(this.container));

    // debugConfig.logger.log("Initial code: " + dumpSEXP(this.container));
    this.normailzeBBFlags();
    // debugConfig.logger.log("After 1st pass: " + dumpSEXP(this.container));
    this.addScopeDescriptors();
    // debugConfig.logger.log("After 2nd pass: " + dumpSEXP(this.container));
    this.resolveBindings(this.container, 0);
    // debugConfig.logger.log("After 3rd pass: " + dumpSEXP(this.container));
    this.populateClosureReads(this.container, 0);
    // debugConfig.logger.log("After 4th pass: " + dumpSEXP(this.container));
    this.addIDXForRemoteBindings();
    // debugConfig.logger.log("After 5th pass: " + dumpSEXP(this.container));
    // this.countContainerStackSize();
    // debugConfig.logger.log("After 6th pass: " + dumpSEXP(this.container));
  }

  // 
  // Given a scopeIDX it returns its parent closure scopeIDX.
  // 
  findParentClosureScope(localScope: number) {
    if (localScope === -1) return -1;
    if (!IridiumBuildContext.CONTEXT_MAP.has(localScope)) debugConfig.logger.throwIriError(`build context not found for scope: ${localScope}`)

    let buildContext = IridiumBuildContext.CONTEXT_MAP.get(localScope);
    let startBB = buildContext.BB[0];
    if (startBB.isClosureBoundary() || startBB.isTopLevel()) return localScope;
    else return this.findParentClosureScope(buildContext.parent);
  }

  // 
  // 5. Assign stack IDX to RemoteEnvBindingSEXP
  // 
  addIDXForRemoteBindings() {
    const fileSexp = this.container;
    for (let bb of fileSexp.args) {
      if (isBBContainerSEXP(bb)) {
        const bindings = bb.getBindings();
        let i = 0;
        for (let remoteBinding of bindings.args[1].args) {
          if (isRemoteEnvBindingSEXP(remoteBinding)) {
            remoteBinding.setREFIDX(i++);
          } else debugConfig.logger.throwIriError("Expected RemoteEnvBindingSEXP");
        }
      }
    }
  }

  // 
  // 4. PopulateClosurePool: Populate the scope descriptor with lexical reads.
  // 

  populateClosureReads(currSEXP: IridiumSEXP, currBBScope: number) {
    if (isLambdaSEXP(currSEXP)) {
      // We will get the closure scope
      const targetScopeIDX = this.findParentClosureScope(currBBScope);
      if (targetScopeIDX < 0) debugConfig.logger.throwIriError("A binding must resolve in a valid scope, none found");
      const bbContainer = this.getBBContainerSEXPByScopeId(targetScopeIDX);
      const bindingsSEXP = bbContainer.getBindings();
      bindingsSEXP.addLambdaIDX(currSEXP.getStartBBIDX());
    }

    if (isBBSEXP(currSEXP)) {
      currSEXP.args.forEach(e => this.populateClosureReads(e, currSEXP.getScope()))
    } else if (isScopeDescriptorContainerSEXP(currSEXP)) {
      return;
    } else {
      currSEXP.args.forEach(e => this.populateClosureReads(e, currBBScope));
    }
  }

  getBBContainerSEXPByScopeId(idx: number): BBContainerSEXP {
    const fileSexp = this.container;

    for (let bbContainer of fileSexp.args) {
      if (isBBContainerSEXP(bbContainer)) {
        if (bbContainer.getScopeIDX() === idx) return bbContainer;
      } else debugConfig.logger.throwIriError("Expected BBContainerSEXP to exist")
    }
    debugConfig.logger.throwIriError("BBContainerSEXP not found for idx " + idx)
  }

  resolveScopedLookup(name: string, startScope: number, bindingsSEXP: BindingsSEXP): RemoteEnvBindingSEXP | EnvBindingSEXP {    
    let res = bindingsSEXP.getBinding(name, startScope);
    if (res) return res;
    else {
      const parentScope = bindingsSEXP.getParentScope();
      if (parentScope === -1) debugConfig.logger.throwIriError("Failed to resolve lookup");
      const bbContainer = this.getBBContainerSEXPByScopeId(parentScope);
      const parentBindingsSEXP = bbContainer.getBindings();
      const res = new RemoteEnvBindingSEXP(this.resolveScopedLookup(name, startScope, parentBindingsSEXP), -1);
      bindingsSEXP.addRemoteBinding(res);
      return res;
    }
  }

  isGlobalBinding(name: string, startScope: number, bindingsSEXP: BindingsSEXP): boolean {
    let res = bindingsSEXP.getBinding(name, startScope);
    if (res) return false;
    const parentScope = bindingsSEXP.getParentScope();
    if (parentScope === -1) return true;
    const bbContainer = this.getBBContainerSEXPByScopeId(parentScope);
    const parentBindingsSEXP = bbContainer.getBindings();
    return this.isGlobalBinding(name, startScope, parentBindingsSEXP);
  }

  // 
  // 3. ResolveBindings: Operations on environment are resolved to their declarations. 
  // 
  resolveBindings(currSEXP: IridiumSEXP, currBBScope: number ) {
    for (let i = 0; i < currSEXP.args.length; i++) {
      let s = currSEXP.args[i];
      if (isResolveEnvBindingSEXP(s)) {
        // We will get the closure scope
        const targetScopeIDX = this.findParentClosureScope(currBBScope);
        if (targetScopeIDX < 0) debugConfig.logger.throwIriError("A binding must resolve in a valid scope, none found");
        const bbContainer = this.getBBContainerSEXPByScopeId(targetScopeIDX);
        const bindingsSEXP = bbContainer.getBindings();

        if (isBindingsSEXP(bindingsSEXP)) {
          const globalBinding = this.isGlobalBinding(s.getBindingName(), currBBScope, bindingsSEXP);
          if (globalBinding)
            currSEXP.args[i] = new GlobalBindingSEXP(s.getBindingName());
          else {
            const resolvedBinding = this.resolveScopedLookup(s.getBindingName(), currBBScope, bindingsSEXP);
            currSEXP.args[i] = resolvedBinding;
          }
        } else debugConfig.logger.throwIriError("Bindings not found, it is needed to resolve bindings");
      }
    }
    if (isBBSEXP(currSEXP)) {
      currSEXP.args.forEach(e => this.resolveBindings(e, currSEXP.getScope()));
    } else if (isBindingsSEXP(currSEXP)) {
      return;
    } else {
      currSEXP.args.forEach(e => this.resolveBindings(e, currBBScope));
    }
  }

  // 
  // 2. AddScopeDescriptors: Scope descriptor for each scope describes the bindings created in that scope, 
  //                         metadata about that scope and lexical reads (this pass does not populate the lexical reads).
  // 

  addScopeDescriptors() {
    const fileSexp = this.container;

    // Group BBs into closure groups
    let bbGroups: Map<number, BBContainerSEXP> = new Map();
    for (let bb of fileSexp.args) {
      if (isBBSEXP(bb)) {
        let targetScopeIDX = this.findParentClosureScope(bb.getScope());
        
        if (!bbGroups.has(targetScopeIDX)) {
          let startBB = IridiumBuildContext.CONTEXT_MAP.get(targetScopeIDX).BB[0];
          if (isBBSEXP(startBB)) {
            bbGroups.set(targetScopeIDX, new BBContainerSEXP(startBB.idx, targetScopeIDX, []));
          }else debugConfig.logger.throwIriError("Expected BBSEXP")
        }
        bbGroups.get(targetScopeIDX).addBB(bb);
      }
    }

    fileSexp.args = [...bbGroups.values()];

    for (let bbContainer of fileSexp.args) {
      if (isBBContainerSEXP(bbContainer)) {
        const bbContainerScopeIDX = bbContainer.getScopeIDX();
        const bbContainerParentScopeIDX = IridiumBuildContext.CONTEXT_MAP.get(bbContainerScopeIDX).parent;
        let isTopLevelContainer = bbContainerParentScopeIDX === -1;
        if (isTopLevelContainer) {
          bbContainer.setFlag("TopLevel");
        }

        const hoistingInfo = new Map<number, Array<[Array<string>, JSEnvBindingFlags]>>();
        const toRemove: Map<BBSEXP, Set<IridiumSEXP>> = new Map();

        // Identify bindings
        for (let bb of bbContainer.BBs()) {
          if (isBBSEXP(bb)) {
            const localScope = bb.getScope();
            if (!hoistingInfo.has(localScope)) hoistingInfo.set(localScope, new Array());

            const parentClosureScope = this.findParentClosureScope(localScope);
            if (!hoistingInfo.has(parentClosureScope)) hoistingInfo.set(parentClosureScope, new Array());

            for (let stmt of bb.args) {
              // Declaration Statements
              if (isJSEnvWrite(stmt) && stmt.isDecl()) {
                let scopeToHoistTo: number;
                let hoistingKind: JSEnvBindingFlags;

                // Depending on the declaration kind they must be hoisted to different scopes
                if (stmt.isLetDecl() || stmt.isConstDecl()) {
                  scopeToHoistTo = localScope;
                  if (stmt.isLetDecl()) hoistingKind = "JSLET";
                  else hoistingKind = "JSCONST";
                } else {
                  scopeToHoistTo = parentClosureScope;
                  hoistingKind = "JSVAR";
                }

                // Bindings created at this statement
                let declarations = stmt.getDeclaredBindings();

                // If the statement has no RVal, set it to undefined
                if (!stmt.hasRVal()) {
                  if (stmt.isVarDecl()) {
                    // This statement must be removed
                    if (!toRemove.has(bb)) toRemove.set(bb, new Set());
                    toRemove.get(bb).add(stmt);
                  } else if (stmt.isLetDecl()) {
                    stmt.setRVal(new GlobalBindingSEXP("undefined"));
                  } else {
                    debugConfig.logger.throwIriError("Const declaration without RVal");
                  }
                }

                // This statement is no longer a declaration 
                stmt.reduceJSDecl();

                // Scope where these bindings must be initialized
                hoistingInfo.get(scopeToHoistTo).push([declarations, hoistingKind]);
              }
            }
            for (let [bb, toRemoveStmts] of toRemove) bb.args = bb.args.filter(e => !toRemoveStmts.has(e));
          } else debugConfig.logger.throwIriError("Expected BBSEXP");
        }

        // Create Scope Descriptor
        const bindingsSEXP = new BindingsSEXP(bbContainerParentScopeIDX);
        let i = 0, j = 0;
        for (let [localScope, bindings] of hoistingInfo) {
          let parentScope = IridiumBuildContext.CONTEXT_MAP.get(localScope).parent;
          for (let [bbs, flag] of bindings) {
            for (let b of bbs) {
              if (!bindingsSEXP.hasBindingReference(bbContainerScopeIDX, b, flag, localScope, parentScope)) {
                if (IridiumBuildContext.CONTEXT_MAP.get(localScope).BB[0].isTopLevel()) {
                  let binding = new EnvBindingSEXP(j++, bbContainerScopeIDX, b, [[flag, null]], localScope, parentScope);
                  let remoteBinding = new RemoteEnvBindingSEXP(binding, -1);
                  bindingsSEXP.addRemoteBinding(remoteBinding);
                } else {
                  let binding = new EnvBindingSEXP(i++, bbContainerScopeIDX, b, [[flag, null]], localScope, parentScope);
                  bindingsSEXP.addLocalBinding(binding);
                }
              }
            }
          }
        }

        // If this is a function, add arguments to the scope descriptor
        let k = 0;
        for (let b of IridiumBuildContext.CONTEXT_MAP.get(bbContainerScopeIDX).args) {
          const flags: [JSEnvBindingFlags, null][] = [];
          flags.push(["JSARG", null]);
          let binding = new EnvBindingSEXP(k++, bbContainerScopeIDX, b, [["JSARG", null]], bbContainerScopeIDX, bbContainerParentScopeIDX);
          bindingsSEXP.addLocalBinding(binding);
        }

        // Add initializers to local scopes
        for (let binding of [...bindingsSEXP.args[0].args, ...bindingsSEXP.args[1].args]) {
          if (isEnvBindingSEXP(binding)) {
            let startBB = IridiumBuildContext.CONTEXT_MAP.get(binding.getScope()).BB[0];
            let lValName = binding.getDeclaration();
            let rVal;
            if (binding.getKind() === "JSVAR") {
              rVal = new EnvReadSEXP("undefined");
            } else if (binding.getKind() === "JSLET" || binding.getKind() === "JSCONST") {
              rVal = new JSNUBDSEXP();
            } else {
              continue;
            }
            startBB.args = [new EnvWriteSEXP(lValName, rVal), ...startBB.args];
          } else if (isRemoteEnvBindingSEXP(binding)) {
            if (isTopLevelContainer) {
              let resolvedBinding = bindingsSEXP.resolveRemoteBinding(binding);
              let startBB = IridiumBuildContext.CONTEXT_MAP.get(resolvedBinding.getScope()).BB[0];
              let lValName = resolvedBinding.getDeclaration();
              let rVal;
              if (resolvedBinding.getKind() === "JSVAR") {
                rVal = new EnvReadSEXP("undefined");
              } else if (resolvedBinding.getKind() === "JSLET" || resolvedBinding.getKind() === "JSCONST") {
                rVal = new JSNUBDSEXP();
              } else {
                continue;
              }
              startBB.args = [new EnvWriteSEXP(lValName, rVal), ...startBB.args];
            }
          } else 
            debugConfig.logger.throwIriError("Expected EnvBindingSEXP");
        }

        bbContainer.setBindings(bindingsSEXP);
      } else debugConfig.logger.throwIriError("Expected BBContainerSEXP");
    }
  }

  // 
  // 1. NormalizeBBFlags: all BBs operating on the same scope has the same scope flag 
  // 
  normailzeBBFlags() {
    for (let [scopeIdx, buildContext] of IridiumBuildContext.CONTEXT_MAP) {
      let mainBBFlag: BBSEXPFlags = buildContext.BB[0].getBBFlag();
      buildContext.BB.forEach(bb => {
        if (isBBSEXP(bb)) {
          bb.setBBFlag(mainBBFlag);
        }
      });
    }
  }
}

