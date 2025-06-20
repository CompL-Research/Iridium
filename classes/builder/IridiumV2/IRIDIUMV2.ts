import debugConfig from "#debugConfig";
import { VERSION } from "configs/projectStats.ts";
import fs from "fs";
import path from "path";
import JS3Builder from "../JS3Builder.ts";
import { JS3Program } from "../JS3Helpers/JS3Types.ts";
import { IRIV2_STMT } from "./handleStatement.ts";
import { BBContainerSEXP, BBSEXP, BBSEXPFlags, BindingsSEXP, EnvBindingSEXP, EnvReadSEXP, EnvWriteSEXP, FileSEXP, getRegularClosureFlag, GlobalBindingSEXP, GotoSEXP, IridiumSEXP, isBBContainerSEXP, isBBSEXP, isBindingsSEXP, isEnvBindingSEXP, isJSEnvWrite, isJSFuncDeclSEXP, isJSHomeObjContextSEXP, isJSSuperContextSEXP, isJSSuperObjContextSEXP, isJSThisContextAltSEXP, isJSThisContextSEXP, isLambdaSEXP, isPoolBindingSEXP, isRemoteEnvBindingSEXP, isResolveBreakTargetSEXP, isResolveContinueTargetSEXP, isResolveEnvBindingSEXP, isResolvePrivateEnvBindingSEXP, JSEnvBindingFlags, JSEnvWriteSEXP, JSFuncDeclSEXP, JSHOMEOBJSEXP, JSModuleEndSEXP, JSModuleStartSEXP, JSNEWTARGETINITSEXP, JSNUBDSEXP, JSSUPERCTRINITSEXP, JSSUPEROBJINITSEXP, JSThisContextSEXP, JSTHISINITSEXP, NOPSEXP, PoolBindingSEXP, RemoteEnvBindingSEXP, ResolveBreakTargetSEXP, ResolveContinueTargetSEXP, ResolveEnvBindingSEXP } from "./Types.ts";
import { dumpSEXP } from "./PP.ts";

export class IridiumBuildContext {
  static SID = 0;
  static CONTEXT_MAP = new Map<number, IridiumBuildContext>();
  parent: number;
  scopeIdx: number;
  args: Array<string> = [];
  nubds: Array<string> = [];

  loopConfig: {
    loopHeadIDX: number,
    loopBodyIDX: number,
    label: string | null,
    breakTarget: number,
    continueTarget: number
  } = null;

  kind: number = 0;

  privateMapping: Map<string, string> = null;

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
    const currentScope = this.getCurrentBB().getScopeIDX();
    const continuationBB = new BBSEXP(currentScope, "Lexical");
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
    topLevelContext.kind = getRegularClosureFlag();
    this.pushContext(topLevelContext);
    this.getCurrentBB().args.push(new JSThisContextSEXP());
    const startBB = this.getCurrentBB();
    for (let s of program.body) {
      IRIV2_STMT(this, s);
    }
    this.getCurrentBB().args.push(new JSModuleEndSEXP());
    this.popContext();
    if (this.buildContext.length !== 0) debugConfig.logger.throwIriError("Expected buildContext stack to be empty after build()");

    this.normailzeBBFlags();
    this.hoistFunctionDeclarations();
    this.generateBBContainerSEXP();
    this.reduceResolvePrivateEnvBindingSEXP(this.container, 0);
    this.reduceResolveEnvBindingSEXP(this.container, 0);
    this.resolveLambdaTargets();
    this.addIDXForRemoteBindings();
    this.resolveBreakAndContinueTargets(this.container);

    // Add Module Init Header, this has to done because of hoisting...
    startBB.args = [new JSModuleStartSEXP(),...startBB.args];
  }

  // 
  // Helper Functions
  // 

  findLoopControlTarget(localScope: number, node: ResolveContinueTargetSEXP | ResolveBreakTargetSEXP): number {
    if (localScope === -1) debugConfig.logger.throwIriError("Failed to find loop control target!!!");
    if (!IridiumBuildContext.CONTEXT_MAP.has(localScope)) debugConfig.logger.throwIriError(`build context not found for scope: ${localScope}`);
    let buildContext = IridiumBuildContext.CONTEXT_MAP.get(localScope);
    if (!buildContext.loopConfig) return this.findLoopControlTarget(buildContext.parent, node);

    const loopConfig = buildContext.loopConfig;
    if (node.hasLabel() && loopConfig.label !== node.getLabel()) return this.findLoopControlTarget(buildContext.parent, node);
    
    return isResolveBreakTargetSEXP(node) ? loopConfig.breakTarget : loopConfig.continueTarget;
  }

  findParentClosureScope(localScope: number) {
    if (localScope === -1) return -1;
    if (!IridiumBuildContext.CONTEXT_MAP.has(localScope)) debugConfig.logger.throwIriError(`build context not found for scope: ${localScope}`)

    let buildContext = IridiumBuildContext.CONTEXT_MAP.get(localScope);
    let startBB = buildContext.BB[0];
    if (startBB.isClosureBoundary() || startBB.isTopLevel()) return localScope;
    else return this.findParentClosureScope(buildContext.parent);
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
      const parentScope = this.findParentClosureScope(bindingsSEXP.getParentScope());
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
    const bbContainer = this.getBBContainerSEXPByScopeId(this.findParentClosureScope(parentScope));
    const parentBindingsSEXP = bbContainer.getBindings();
    return this.isGlobalBinding(name, startScope, parentBindingsSEXP);
  }

  // 
  // 5. PopulateClosurePool: Populate the scope descriptor with lexical reads.
  // 
  resolveBreakAndContinueTargets(currSEXP: IridiumSEXP) {
    if (isBindingsSEXP(currSEXP)) {
      return;
    }
    if (isBBSEXP(currSEXP)) { // Break and Continue are statements, old tricks wont work here!!
      for (let i = 0; i < currSEXP.args.length; i++) {
        let s = currSEXP.args[i];
        if (isResolveBreakTargetSEXP(s) || isResolveContinueTargetSEXP(s)) {        
          let target = this.findLoopControlTarget(currSEXP.getScopeIDX(), s);
          currSEXP.args[i] = new GotoSEXP(target);
        }
      }
    }
    currSEXP.args.forEach(e => this.resolveBreakAndContinueTargets(e));
  }

  // 
  // 6. Assign stack IDX to RemoteEnvBindingSEXP
  // 
  addIDXForRemoteBindings() {
    const fileSexp = this.container;
    for (let bb of fileSexp.args) {
      if (isBBContainerSEXP(bb)) {
        const bindings = bb.getBindings();
        const remoteBindings = bindings.getRemoteBindings().args;
        let i = 0;
        for (let remoteBinding of remoteBindings) {
          if (isRemoteEnvBindingSEXP(remoteBinding)) {
            remoteBinding.setREFIDX(i++);
          } else debugConfig.logger.throwIriError("Expected RemoteEnvBindingSEXP");
        }
      }
    }
  }

  // 
  // 5. PopulateClosurePool: Populate the scope descriptor with lexical reads.
  // 
  reduceLambdaTargets(currSEXP: IridiumSEXP, currBBScope: number) {
    if (isBindingsSEXP(currSEXP) || isPoolBindingSEXP(currSEXP)) {
      return;
    }
    for (let i = 0; i < currSEXP.args.length; i++) {
      let s = currSEXP.args[i];
      if (isLambdaSEXP(s)) {
        const targetScopeIDX = this.findParentClosureScope(currBBScope);
        if (targetScopeIDX < 0) debugConfig.logger.throwIriError("A binding must resolve in a valid scope, none found");
        const bbContainer = this.getBBContainerSEXPByScopeId(targetScopeIDX);
        const bindingsSEXP = bbContainer.getBindings();
        const poolLookupBinding = new PoolBindingSEXP(s.getStartBBIDX(), -1, s);
        bindingsSEXP.addLambdaPoolBinding(poolLookupBinding);
        currSEXP.args[i] = poolLookupBinding;
      }
    }
    if (isBBSEXP(currSEXP)) {
      currSEXP.args.forEach(e => this.reduceLambdaTargets(e, currSEXP.getScopeIDX()))
    } else {
      currSEXP.args.forEach(e => this.reduceLambdaTargets(e, currBBScope));
    }
  }

  resolveLambdaTargets() {
    const startSEXP = this.container;
    const startScope = 0;
    this.reduceLambdaTargets(startSEXP, startScope);
    // Assign reference IDX for pool lookups, during execution they will be resolved to contant pool + REFIDX, the REFIDX is assigned here
    for(let bbContainerSEXP of startSEXP.args) {
      let i = 0;
      if (isBBContainerSEXP(bbContainerSEXP)) {
        for (let poolBinding of bbContainerSEXP.getBindings().getLambdaPoolBindings().args) {
          if (isPoolBindingSEXP(poolBinding)) {
            poolBinding.setREFIDX(i++);
          } else debugConfig.logger.throwIriError("Expected only pool bindings in the lambda pool");
        }
      } else debugConfig.logger.throwIriError("Expected a bbContainerSEXP");
    }
  }

  // 
  // 5. ReduceResolveEnvBindingSEXP: All scope lookups are resolved to their respective scope bindings
  // 
  reduceResolveEnvBindingSEXP(currSEXP: IridiumSEXP, currBBScope: number) {
    if (isBindingsSEXP(currSEXP)) {
      return;
    }
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
      currSEXP.args.forEach(e => this.reduceResolveEnvBindingSEXP(e, currSEXP.getScopeIDX()));
    } else {
      currSEXP.args.forEach(e => this.reduceResolveEnvBindingSEXP(e, currBBScope));
    }
  }

  // 
  // 4. ReduceResolvePrivateEnvBindingSEXP: All private lookups are resolved to their respective symbol holders
  // 
  reduceResolvePrivateEnvBindingSEXP(currSEXP: IridiumSEXP, currBBScope: number) {
    if (isBindingsSEXP(currSEXP)) {
      return;
    }
    for (let i = 0; i < currSEXP.args.length; i++) {
      let s = currSEXP.args[i];
      if (isResolvePrivateEnvBindingSEXP(s)) {
        // We will get the closure scope
        let targetScopeIDX = this.findParentClosureScope(currBBScope);
        while (targetScopeIDX >= 0) {
          const privateMapping = IridiumBuildContext.CONTEXT_MAP.get(targetScopeIDX).privateMapping;
          if (IridiumBuildContext.CONTEXT_MAP.get(targetScopeIDX).privateMapping) {
            if (privateMapping.has(s.getBindingName())) {
              currSEXP.args[i] = new EnvReadSEXP(privateMapping.get(s.getBindingName()));
              break;
            }
          }
          targetScopeIDX = this.findParentClosureScope(IridiumBuildContext.CONTEXT_MAP.get(targetScopeIDX).parent);
          if (targetScopeIDX < 0) debugConfig.logger.throwIriError("Failed to resolve private binding!!!");
        }
      }
    }
    if (isBBSEXP(currSEXP)) {
      currSEXP.args.forEach(e => this.reduceResolvePrivateEnvBindingSEXP(e, currSEXP.getScopeIDX()));
    } else {
      currSEXP.args.forEach(e => this.reduceResolvePrivateEnvBindingSEXP(e, currBBScope));
    }
  }

  // 
  // 3. GenerateBBContainerSEXP: Generate BBContainerSEXP to group compilation targets
  // 
  generateBBContainerSEXP() {
    const fileSexp = this.container;

    // Group BBs into closure groups
    let bbGroups: Map<number, BBContainerSEXP> = new Map();
    for (let bb of fileSexp.args) {
      if (isBBSEXP(bb)) {
        let targetScopeIDX = this.findParentClosureScope(bb.getScopeIDX());

        if (!bbGroups.has(targetScopeIDX)) {
          let startBB = IridiumBuildContext.CONTEXT_MAP.get(targetScopeIDX).BB[0];
          if (isBBSEXP(startBB)) {
            let bbContainer = new BBContainerSEXP(startBB.idx, targetScopeIDX, []);
            bbContainer.setClosureFlags(IridiumBuildContext.CONTEXT_MAP.get(targetScopeIDX).kind);
            bbGroups.set(targetScopeIDX, bbContainer);
          } else debugConfig.logger.throwIriError("Expected BBSEXP")
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
        const contextualInit: Array<[string, IridiumSEXP]> = [];

        // Identify bindings
        for (let bb of bbContainer.getBBs()) {
          if (isBBSEXP(bb)) {
            const localScope = bb.getScopeIDX();
            if (!hoistingInfo.has(localScope)) hoistingInfo.set(localScope, new Array());

            const parentClosureScope = this.findParentClosureScope(localScope);
            if (!hoistingInfo.has(parentClosureScope)) hoistingInfo.set(parentClosureScope, new Array());

            for (let stmt of bb.args) {
              
              if (isJSThisContextAltSEXP(stmt)) {
                contextualInit.push(["this", new EnvWriteSEXP("this", new JSNUBDSEXP(), true, false)]);
                if (!toRemove.has(bb)) toRemove.set(bb, new Set());
                toRemove.get(bb).add(stmt);
              }

              if (isJSThisContextSEXP(stmt)) {
                contextualInit.push(["this", new JSTHISINITSEXP(new ResolveEnvBindingSEXP("this"))]);
                if (!toRemove.has(bb)) toRemove.set(bb, new Set());
                toRemove.get(bb).add(stmt);
              }

              // Super context: add "<super_ctr>", "<new_target>" and "<super_obj>"
              if (isJSSuperContextSEXP(stmt)) {
                contextualInit.push(["<super_ctr>", new JSSUPERCTRINITSEXP(new ResolveEnvBindingSEXP("<super_ctr>"))]);
                contextualInit.push(["<new_target>", new JSNEWTARGETINITSEXP(new ResolveEnvBindingSEXP("<new_target>"))]);
                contextualInit.push(["<super_obj>", new JSSUPEROBJINITSEXP(new ResolveEnvBindingSEXP("<super_obj>"))]);
                if (!toRemove.has(bb)) toRemove.set(bb, new Set());
                toRemove.get(bb).add(stmt);
              }

              // Super context: add "<super_obj>"
              if (isJSSuperObjContextSEXP(stmt)) {
                contextualInit.push(["<super_obj>", new JSSUPEROBJINITSEXP(new ResolveEnvBindingSEXP("<super_obj>"))]);
                if (!toRemove.has(bb)) toRemove.set(bb, new Set());
                toRemove.get(bb).add(stmt);
              }

              // Super context: add "<home_obj>"
              if (isJSHomeObjContextSEXP(stmt)) {
                contextualInit.push(["<home_obj>", new JSHOMEOBJSEXP(new ResolveEnvBindingSEXP("<home_obj>"))]);
                if (!toRemove.has(bb)) toRemove.set(bb, new Set());
                toRemove.get(bb).add(stmt);
              }

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
            
          } else debugConfig.logger.throwIriError("Expected BBSEXP");
        }

        // Remote uninitialized declarations
        for (let [bb, toRemoveStmts] of toRemove) bb.args = bb.args.filter(e => !toRemoveStmts.has(e));

        // Create Scope Descriptor
        let i = 0, j = 0;
        const bindingsSEXP = new BindingsSEXP(bbContainerParentScopeIDX);

        const toSkipInit: Set<IridiumSEXP> = new Set();

        for (let [name, ] of contextualInit) {
          const parentScope = IridiumBuildContext.CONTEXT_MAP.get(bbContainerScopeIDX).parent;
          const binding = new EnvBindingSEXP(i++, bbContainerScopeIDX, name, [["JSCONST", null]], bbContainerScopeIDX, parentScope);
          bindingsSEXP.addLocalBinding(binding);
          toSkipInit.add(binding);
        }
        
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
        const bindingsToInit = [...bindingsSEXP.getLocalBindings().args, ...bindingsSEXP.getRemoteBindings().args].filter(b => !toSkipInit.has(b));
        
        for (let binding of bindingsToInit) {
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
            startBB.args = [new EnvWriteSEXP(lValName, rVal, true, false), ...startBB.args];
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
              startBB.args = [new EnvWriteSEXP(lValName, rVal, true, false), ...startBB.args];
            }
          } else
            debugConfig.logger.throwIriError("Expected EnvBindingSEXP");
        }

        // Prefix contextual init statements
        for (let [, stmt] of contextualInit) {
          let startBB = IridiumBuildContext.CONTEXT_MAP.get(bbContainerScopeIDX).BB[0];
          startBB.args = [stmt,...startBB.args]
        }

        bbContainer.setBindings(bindingsSEXP);
      } else debugConfig.logger.throwIriError("Expected BBContainerSEXP");
    }
  }

  // 
  // 2. HoistFunctionDeclarations: Hoist all function declarations to the top of their scope
  // 
  funcDeclHandler(currSEXP: IridiumSEXP, currScope: number, res: Map<number, Set<JSFuncDeclSEXP>>) {
    if (isBBSEXP(currSEXP)) currScope = currSEXP.getScopeIDX();
    for (let i = 0; i < currSEXP.args.length; i++) {
      let s = currSEXP.args[i];
      if (isJSFuncDeclSEXP(s)) {
        if (!res.has(currScope)) res.set(currScope, new Set());
        res.get(currScope).add(s);
        currSEXP.args[i] = new NOPSEXP();
      }
    }
    currSEXP.args.forEach(e => this.funcDeclHandler(e, currScope, res));
  }
  
  hoistFunctionDeclarations() {
    let toHoist: Map<number, Set<JSFuncDeclSEXP>> = new Map();
    this.funcDeclHandler(this.container, -1, toHoist);

    for (let [scope, funDeclarations] of toHoist) {
      const targetBB = IridiumBuildContext.CONTEXT_MAP.get(scope).BB[0];
      const decls = [...funDeclarations].map(e => new JSEnvWriteSEXP(e.args[0], e.args[1], "JSLET", false));
      targetBB.args = [...decls, ...targetBB.args];
    }
  }

  // 
  // 1. NormalizeBBFlags: Ensure all BBs operating on the same scope has the same scope flag 
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

