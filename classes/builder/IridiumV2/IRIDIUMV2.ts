import debugConfig from "#debugConfig";
import fs from "fs";
import path from "path";
import { VERSION } from "../../../configs/projectStats";
import JS3Builder from "../JS3Builder";
import { JS3Program } from "../JS3Helpers/JS3Types";
import { IRIV2_STMT } from "./handleStatement";
import { BBContainerSEXP, BBSEXP, BBSEXPFlags, BindingsSEXP, EnvBindingSEXP, EnvReadSEXP, EnvWriteSEXP, FileSEXP, getRegularClosureFlag, GlobalBindingSEXP, GotoSEXP, IfJumpSEXP, InvokeFinalizerSEXP, IridiumSEXP, isBBContainerSEXP, isBBSEXP, isBindingsSEXP, isEnvBindingSEXP, isEnvWriteSEXP, isJSAppendSEXP, isJSCatchContextSEXP, isJSCopyDataPropertiesSEXP, isJSDefineObjMethodSEXP, isJSDefineObjPropSEXP, isJSEnvWriteSEXP, isJSForInStartSEXP, isJSFuncDeclSEXP, isJSImplicitBindingDeclarationSEXP, isJSToObjectSEXP, isLambdaSEXP, isListSEXP, isLocalStaticExportSEXP, isNamedReexportSEXP, isPoolBindingSEXP, isRemoteEnvBindingSEXP, isResolveBreakTargetSEXP, isResolveContinueTargetSEXP, isResolveEnvBindingSEXP, isResolvePrivateEnvBindingSEXP, isReturnSEXP, isStarExportSEXP, isStaticImportSEXP, JSEnvBindingFlags, JSFuncDeclSEXP, JSImplicitBindingDeclarationSEXP, JSForOfIteratorCloseSEXP, JSNUBDSEXP, JSSloppyDeclarationCheckSEXP, ListSEXP, ModuleRequestSEXP, NOPSEXP, PoolBindingSEXP, PopCatchContextSEXP, RemoteEnvBindingSEXP, ResolveBreakTargetSEXP, ResolveContinueTargetSEXP, ReturnAsyncSEXP, ReturnSEXP, StaticImportSEXP, isJSForInNextSEXP, isJSForOfNextSEXP } from "./Types/index";

type LoopConfig = {
  kind: "for-of" | "standard",
  loopHeadIDX: number,
  loopBodyIDX: number,
  loopInitIDX: number,
  label: string | null,
  breakTarget: number,
  continueTarget: number
}

type TryContext = {
  tryContextIDX: number,
  tryIDX: number,
  udCatchIDX: number,
  imCatchIDX: number,
  finalizerIDX: number
}

function isLoopConfig(obj: any): obj is LoopConfig {
  return (
    typeof obj === "object" &&
    obj !== null &&
    (obj.kind === "for-of" || obj.kind === "standard") &&
    typeof obj.loopHeadIDX === "number" &&
    typeof obj.loopBodyIDX === "number" &&
    typeof obj.loopInitIDX === "number" &&
    (typeof obj.label === "string" || obj.label === null) &&
    typeof obj.breakTarget === "number" &&
    typeof obj.continueTarget === "number"
  );
}

// Type guard for TryContext
function isTryContext(obj: any): obj is TryContext {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.tryContextIDX === "number" &&
    typeof obj.tryIDX === "number" &&
    typeof obj.udCatchIDX === "number" &&
    typeof obj.imCatchIDX === "number" &&
    typeof obj.finalizerIDX === "number"
  );
}

export class IridiumBuildContext {
  static SID = 0;
  static CONTEXT_MAP = new Map<number, IridiumBuildContext>();
  parent: number;
  scopeIdx: number;
  args: Array<string> = [];
  hasRestArgs: boolean = false;
  nubds: Array<string> = [];

  loopConfig: LoopConfig | null = null;

  tryContext: TryContext | null = null;

  kind: number = 0;
  // 0 -> No Arguments Object
  // 1 -> Mapped Arguments
  // 2 -> Unmapped Arguments
  argumentsKind: number = 0;
  isAsync: boolean = false;
  isGenerator: boolean = false;
  isStrict: boolean = false;
  isModule: boolean = false;

  ecmaArgs: number = 0;

  privateMapping: Map<string, string> | null = null;

  moduleRequestMap: Map<string, ModuleRequestSEXP> | null = null;

  static resetBuildContext() {
    this.SID = 0;
    this.CONTEXT_MAP = new Map<number, IridiumBuildContext>();
  }

  BB: Array<BBSEXP> = [];
  constructor(parent: number, BB: BBSEXP | undefined = undefined, flag: BBSEXPFlags | undefined = undefined) {
    this.scopeIdx = IridiumBuildContext.SID++;
    this.parent = parent;
    if (BB) {
      this.pushBB(BB);
    } else {
      if (!flag) throw new Error("Expected a flag to qualify all the BBs in iridium, not supplied!!!");
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
  container: FileSEXP | null;
  constructor(js3Builder: JS3Builder) {
    this.js3Builder = js3Builder;
    this.buildContext = [];
    this.container = null;
  }

  serialize() {
    if (!this.container) throw new Error("this.container is null");
    return {
      version: VERSION,
      ...this.js3Builder.projectFile.toJSON(),
      iridium: this.container.serialize()
    }
  }

  saveGeneratedFile() {
    if (debugConfig.cli.tout)
      return;

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
    if (this.buildContext.length === 0) throw new Error("Expected atleast one BB to exist in the build context stack!!");
    const contexts = this.buildContext;
    return contexts[contexts.length - 1];
  }

  getCurrentBB() {
    return this.getCurrentContext().getCurrentBB();
  }

  declareAndPushLexicalContext(flags: BBSEXPFlags = "Lexical"): IridiumBuildContext {
    const currentContext = this.getCurrentContext();
    const newContext = new IridiumBuildContext(currentContext.scopeIdx, undefined, flags);
    newContext.isStrict = currentContext.isStrict;
    this.pushContext(newContext);
    return newContext;
  }

  pushContext(cx: IridiumBuildContext) {
    this.buildContext.push(cx);
    if (!this.container) throw new Error("this.container is null");
    this.container.args.push(cx.getCurrentBB());
  }

  popContext() {
    return this.buildContext.pop();
  }

  addContinuation(currContext: IridiumBuildContext) {
    const continuationBB = currContext.addContinuation();
    if (!this.container) throw new Error("this.container is null");
    this.container.args.push(continuationBB);
  }

  build() {
    if (!this.js3Builder) throw new Error("this.js3Builder is null");
    if (!this.js3Builder.generatedAST) throw new Error("this.js3Builder.generatedAST is null");
    const program: JS3Program = this.js3Builder.generatedAST.program;
    const sourceType: "JSModule" | "JSScript" = program.sourceType === "module" ? "JSModule" : "JSScript";
    
    const mainContainer = new FileSEXP(sourceType);
    this.container = mainContainer;
    const topLevelContext = new IridiumBuildContext(-1, undefined, "TopLevel");

    topLevelContext.isModule = sourceType === "JSModule";
    topLevelContext.isStrict = sourceType === "JSModule" || program.directives.some((val) => val.value.value === "use strict");

    topLevelContext.moduleRequestMap = new Map();
    topLevelContext.kind = getRegularClosureFlag();
    this.pushContext(topLevelContext);

    if (sourceType === "JSModule") {
      this.getCurrentBB().args.push(new JSImplicitBindingDeclarationSEXP("this", "JSCONST", 9));
      
      // Early return if we dont need to evaluate the module completely
      const earlyReturnBB = this.declareAndPushLexicalContext();
      const earlyReturnStmt = new ReturnSEXP(new EnvReadSEXP("undefined"));
      earlyReturnStmt.setModuleEarlyReturn();
      this.getCurrentBB().args.push(earlyReturnStmt); // Notice how this is not an async return!!
      this.popContext();

      const ifJump = new IfJumpSEXP(new EnvReadSEXP("this"), earlyReturnBB.BB[0].idx);
      this.getCurrentBB().args.push(ifJump);
      
      this.getCurrentBB().args.push(new JSImplicitBindingDeclarationSEXP("<module_meta>", "JSCONST", 6));
    } else {
      this.getCurrentBB().args.push(new JSImplicitBindingDeclarationSEXP("this", "JSCONST", 9));
      this.getCurrentBB().args.push(new JSImplicitBindingDeclarationSEXP("<ret>", "JSCONST", 11));
    }
    
    const startBB = this.getCurrentBB();
    for (let s of program.body) {
      IRIV2_STMT(this, s);
    }
    if (sourceType === "JSModule") {
      this.getCurrentBB().args.push(new ReturnAsyncSEXP(new EnvReadSEXP("undefined")));
    } else {
      this.getCurrentBB().args.push(new ReturnSEXP(new EnvReadSEXP("undefined")));
    }
    this.popContext();
    if (this.buildContext.length !== 0) throw new Error("Expected buildContext stack to be empty after build()");

    // debugConfig.logger.log(this.container.toString());
    this.normailzeBBFlags();
    this.hoistFunctionDeclarations();
    this.generateBBContainerSEXP();
    this.reduceResolvePrivateEnvBindingSEXP(this.container, 0);
    this.reduceResolveEnvBindingSEXP(this.container, 0);
    this.resolveLambdaTargets();
    this.addIDXForRemoteBindings();
    this.resolveBreakAndContinueTargets(this.container);
    this.decorateReturnTargets(this.container);
    this.promoteAsyncReturns(this.container);
    this.markNamespaceImports(this.container);
    this.markSloppyWrites(this.container);
    this.loosenWritestoASWs(this.container);
    this.saveGeneratedFile();
  }

  // 
  // Helper Functions
  // 

  findLoopControlTarget(localScope: number, node: ResolveContinueTargetSEXP | ResolveBreakTargetSEXP, intermediateContexts: Array<TryContext | LoopConfig> = []): [LoopConfig, Array<TryContext | LoopConfig>] {
    if (localScope === -1) throw new Error("Failed to find loop control target!!!");
    if (!IridiumBuildContext.CONTEXT_MAP.has(localScope)) throw new Error(`build context not found for scope: ${localScope}`);
    let buildContext = IridiumBuildContext.CONTEXT_MAP.get(localScope);
    if (!buildContext) throw new Error("buildContext is undefined");

    if (buildContext.tryContext) {
      intermediateContexts.push(buildContext.tryContext);
    }

    // No loop context
    if (!buildContext.loopConfig) return this.findLoopControlTarget(buildContext.parent, node, intermediateContexts);

    const loopConfig = buildContext.loopConfig;
    // Intermediate loop context, but not the one we are trying to flow to
    if (node.hasLabel() && loopConfig.label !== node.getLabel()) {
      intermediateContexts.push(loopConfig);
      return this.findLoopControlTarget(buildContext.parent, node, intermediateContexts);
    }

    // If we are looking for a continue target, but the resolved target does not have a continue target, keep looking...
    if (isResolveContinueTargetSEXP(node) && loopConfig.continueTarget === -1) {
      intermediateContexts.push(loopConfig);
      return this.findLoopControlTarget(buildContext.parent, node, intermediateContexts);
    }

    return isResolveBreakTargetSEXP(node) ? [loopConfig, intermediateContexts] : [loopConfig, intermediateContexts];
  }

  findReturnTarget(localScope: number, intermediateContexts: Array<TryContext | LoopConfig> = []): [IridiumBuildContext, Array<TryContext | LoopConfig>] {
    if (localScope === -1) throw new Error("Failed to find return target!!!");
    if (!IridiumBuildContext.CONTEXT_MAP.has(localScope)) throw new Error(`build context not found for scope: ${localScope}`);
    let buildContext = IridiumBuildContext.CONTEXT_MAP.get(localScope);

    if (!buildContext) throw new Error("buildContext is undefined");
    if (buildContext.tryContext) {
      intermediateContexts.push(buildContext.tryContext);
    }

    if (buildContext.loopConfig) {
      intermediateContexts.push(buildContext.loopConfig);
    }

    let startBB = buildContext.BB[0];
    if (startBB.isTopLevel()) {
      // Ensure no intermediate contexts
      if (intermediateContexts.length > 0) throw new Error("Top level return not expected to be wrapped inside intermediate contexts");
      // Ensure script mode code
      if (buildContext.isModule === true) {
        throw new Error("Expected async returns in module top level code...");}
    }
    if (startBB.isClosureBoundary()) return [buildContext, intermediateContexts];

    return this.findReturnTarget(buildContext.parent, intermediateContexts)
  }

  // findIfReturnNeedsDecoration(localScope: number, finalizerTarget: number = -2): number {
  //   if (localScope === -1) return -1;
  //   if (!IridiumBuildContext.CONTEXT_MAP.has(localScope)) throw new Error(`build context not found for scope: ${localScope}`)

  //   let buildContext = IridiumBuildContext.CONTEXT_MAP.get(localScope);

  //   if (buildContext.tryContext && finalizerTarget === -2) {
  //     finalizerTarget = buildContext.tryContext.finalizerIDX;
  //   }

  //   let startBB = buildContext.BB[0];
  //   if (startBB.isTopLevel()) throw new Error("Matched return with top level block, something's broken sire!");
  //   if (startBB.isClosureBoundary()) return finalizerTarget;
  //   else return this.findIfReturnNeedsDecoration(buildContext.parent, finalizerTarget);
  // }

  findParentClosureScope(localScope: number): number {
    if (localScope === -1) return -1;
    if (!IridiumBuildContext.CONTEXT_MAP.has(localScope)) throw new Error(`build context not found for scope: ${localScope}`)

    let buildContext = IridiumBuildContext.CONTEXT_MAP.get(localScope);
    if (!buildContext) throw new Error("buildContext is undefined");
    let startBB = buildContext.BB[0];
    if (startBB.isClosureBoundary() || startBB.isTopLevel()) return localScope;
    else return this.findParentClosureScope(buildContext.parent);
  }

  getBBContainerSEXPByScopeId(idx: number): BBContainerSEXP {
    const fileSexp = this.container;

    if (!fileSexp) throw new Error("fileSexp is undefined");

    for (let bbContainer of fileSexp.args) {
      if (isListSEXP(bbContainer)) continue;
      if (isBBContainerSEXP(bbContainer)) {
        if (bbContainer.getScopeIDX() === idx) return bbContainer;
      } else throw new Error("Expected BBContainerSEXP to exist")
    }
    throw new Error("BBContainerSEXP not found for idx " + idx)
  }

  resolveScopedLookup(name: string, startScope: number, bindingsSEXP: BindingsSEXP): RemoteEnvBindingSEXP | EnvBindingSEXP {
    let res = bindingsSEXP.getBinding(name, startScope);
    if (res) return res;
    else {
      const parentScope = this.findParentClosureScope(bindingsSEXP.getParentScope());
      if (parentScope === -1) throw new Error("Failed to resolve lookup");
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

  insertBefore(arr: Array<any>, target: any, newElement: any) {
    const index = arr.indexOf(target);
    if (index === -1) {
      throw new Error(`Element "${target}" not found in array`);
    }
    arr.splice(index, 0, newElement);
    return arr;
  }

  loosenWritestoASWs(currSEXP: IridiumSEXP) {
    if (isBindingsSEXP(currSEXP) || isPoolBindingSEXP(currSEXP)) {
      return;
    }

    if (isEnvWriteSEXP(currSEXP) || isJSEnvWriteSEXP(currSEXP)) {
      let left = currSEXP.args[0];
      if (isEnvBindingSEXP(left) && left.isASW()) currSEXP.setSafe(true);
    }

    if (isJSCopyDataPropertiesSEXP(currSEXP)) {
      let store = currSEXP.args[3];
      if (isEnvBindingSEXP(store) && store.isASW()) currSEXP.setSafe(true);
    }

    if (isJSAppendSEXP(currSEXP)) {
      let store1 = currSEXP.args[3];
      if (isEnvBindingSEXP(store1) && store1.isASW()) currSEXP.setSafe(true);
      let store2 = currSEXP.args[4];
      if (isEnvBindingSEXP(store2) && store2.isASW()) currSEXP.setSafe(true);
    }

    if (isJSDefineObjPropSEXP(currSEXP)) {
      let store = currSEXP.args[3];
      if (isEnvBindingSEXP(store) && store.isASW()) currSEXP.setSafe(true);
    }
    
    if (isJSDefineObjMethodSEXP(currSEXP)) {
      let store = currSEXP.args[3];
      if (isEnvBindingSEXP(store) && store.isASW()) currSEXP.setSafe(true);
    }

    if (isBBSEXP(currSEXP)) {
      currSEXP.args.forEach(e => this.loosenWritestoASWs(e))
    } else {
      currSEXP.args.forEach(e => this.loosenWritestoASWs(e));
    }
  }

  markSloppyWrites(currSEXP: IridiumSEXP, currBBScope: number = -1) {
    if (isBindingsSEXP(currSEXP) || isPoolBindingSEXP(currSEXP)) {
      return;
    }
    let buildContext = IridiumBuildContext.CONTEXT_MAP.get(currBBScope);
    if (
      isEnvWriteSEXP(currSEXP) 
      || isJSEnvWriteSEXP(currSEXP) 
      || isJSCopyDataPropertiesSEXP(currSEXP) 
      || isJSAppendSEXP(currSEXP) 
      || isJSDefineObjPropSEXP(currSEXP) 
      || isJSDefineObjMethodSEXP(currSEXP)
      || isJSToObjectSEXP(currSEXP)
      || isJSImplicitBindingDeclarationSEXP(currSEXP)
      || isJSForInStartSEXP(currSEXP)
      || isJSForInNextSEXP(currSEXP)
      || isJSForOfNextSEXP(currSEXP)
    ) {
      if (!buildContext) throw new Error("buildContext is undefined");
      if (!buildContext.isStrict) {
        currSEXP.markSloppy();
      }
    }

    if (isBBSEXP(currSEXP)) {
      currSEXP.args.forEach(e => this.markSloppyWrites(e, currSEXP.getScopeIDX()))
    } else {
      currSEXP.args.forEach(e => this.markSloppyWrites(e, currBBScope));
    }
  }

  markNamespaceImports(currSEXP: IridiumSEXP) {
    if (isListSEXP(currSEXP)) {

      for (let e of currSEXP.args) {
        if (isStaticImportSEXP(e)) {
          let literal = e.getField();
          let binding = e.getStorageLocation();
          if (literal === "*") {
            if (isRemoteEnvBindingSEXP(binding)) {
              binding.setNSImport();
            } else throw new Error("Expected a remote env binding SEXP here...."); 
          }
        }
      }
      
    }
    currSEXP.args.forEach(e => this.markNamespaceImports(e));
  }

  // 
  // PromoteAsyncReturns
  // 
  promoteAsyncReturns(currSEXP: IridiumSEXP) {
    if (isBindingsSEXP(currSEXP)) {
      return;
    }
    if (isBBSEXP(currSEXP)) { // Break and Continue are statements, old tricks wont work here!!
      for (let i = 0; i < currSEXP.args.length; i++) {
        let s = currSEXP.args[i];
        if (isReturnSEXP(s)) {
          if (currSEXP.isTopLevel()) continue;
          if (s.isModuleEarlyReturn()) continue;
          let [target, ] = this.findReturnTarget(currSEXP.getScopeIDX());
          if (target.isAsync || target.isGenerator) {
            currSEXP.args[i] = new ReturnAsyncSEXP(s.args[0]);
          }
        }
      }
    }
    currSEXP.args.forEach(e => this.promoteAsyncReturns(e));
  }

  // 
  // DecorateReturnTargets
  // 
  decorateReturnTargets(currSEXP: IridiumSEXP) {
    if (isBindingsSEXP(currSEXP)) {
      return;
    }
    if (isBBSEXP(currSEXP)) { // Break and Continue are statements, old tricks wont work here!!
      let decoratorMap: Map<IridiumSEXP, Array<LoopConfig | TryContext>> = new Map();
      for (let i = 0; i < currSEXP.args.length; i++) {
        let s = currSEXP.args[i];
        if (isReturnSEXP(s)) {
          if (currSEXP.isTopLevel()) continue;
          if (s.isModuleEarlyReturn()) continue;
          let [target, intermediateContexts] = this.findReturnTarget(currSEXP.getScopeIDX());
          s.setFlag(`Depth[${intermediateContexts.length}]`);
          decoratorMap.set(currSEXP.args[i], intermediateContexts);
        }
      }
      for (let [element, intermediateContexts] of decoratorMap) {
        for (let intermediateContext of intermediateContexts) {
          if (isLoopConfig(intermediateContext)) {
            if (intermediateContext.kind === "for-of") {
              // Call Iterator close
              this.insertBefore(currSEXP.args, element, new JSForOfIteratorCloseSEXP());
            }
          } else {
            this.insertBefore(currSEXP.args, element, new PopCatchContextSEXP());
            if (intermediateContext.finalizerIDX > -1) {
              this.insertBefore(currSEXP.args, element, new InvokeFinalizerSEXP(intermediateContext.finalizerIDX));
            }
          }
        }
      }
    }
    currSEXP.args.forEach(e => this.decorateReturnTargets(e));
  }

  // 
  // ResolveBreakAndContinueTargets: Resolves break and continue targets, also decorates them if they are inside a try block.
  // 

  resolveBreakAndContinueTargets(currSEXP: IridiumSEXP) {
    if (isBindingsSEXP(currSEXP)) {
      return;
    }
    if (isBBSEXP(currSEXP)) { // Break and Continue are statements, old tricks wont work here!!
      let decoratorMap: Map<IridiumSEXP, Array<LoopConfig | TryContext>> = new Map();
      let isBreakTarget: Map<IridiumSEXP, LoopConfig> = new Map();
      for (let i = 0; i < currSEXP.args.length; i++) {
        let s = currSEXP.args[i];
        if (isResolveBreakTargetSEXP(s) || isResolveContinueTargetSEXP(s)) {        
          let [target, intermediateContexts] = this.findLoopControlTarget(currSEXP.getScopeIDX(), s);
          const goto = new GotoSEXP(isResolveBreakTargetSEXP(s) ? target.breakTarget : target.continueTarget);
          goto.setFlag(isResolveBreakTargetSEXP(s) ? `Break[${target.kind}]` : `Continue[${target.kind}]`);
          currSEXP.args[i] = goto;
          decoratorMap.set(currSEXP.args[i], intermediateContexts);
          if (isResolveBreakTargetSEXP(s)) {
            isBreakTarget.set(currSEXP.args[i], target);
          }
        }
      }
      for (let [element, intermediateContexts] of decoratorMap) {
        for (let intermediateContext of intermediateContexts) {
          if (isLoopConfig(intermediateContext)) {
            if (intermediateContext.kind === "for-of") {
              // Call Iterator close
              this.insertBefore(currSEXP.args, element, new JSForOfIteratorCloseSEXP());
            }
          } else {
            this.insertBefore(currSEXP.args, element, new PopCatchContextSEXP());
            if (intermediateContext.finalizerIDX > -1) {
              this.insertBefore(currSEXP.args, element, new InvokeFinalizerSEXP(intermediateContext.finalizerIDX));
            }
          }
        }

        // Handle final target, if the element is a break context, emit the corresponding cleanup code if required, otherwise ignore
        if (isBreakTarget.has(element)) {
          let finalLoopConfig = isBreakTarget.get(element);
          if (!finalLoopConfig) throw new Error("finalLoopConfig is undefined");
          if (finalLoopConfig.kind === "for-of") {
            // Call Iterator close
            this.insertBefore(currSEXP.args, element, new JSForOfIteratorCloseSEXP());
          }
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
    if (!fileSexp) throw new Error("fileSexp is undefined");
    for (let bb of fileSexp.args) {
      if (isBBContainerSEXP(bb)) {
        const bindings = bb.getBindings();
        const remoteBindings = bindings.getRemoteBindings().args;
        let i = 0;
        for (let remoteBinding of remoteBindings) {
          if (isRemoteEnvBindingSEXP(remoteBinding)) {
            remoteBinding.setREFIDX(i++);
          } else throw new Error("Expected RemoteEnvBindingSEXP");
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
        if (targetScopeIDX < 0) throw new Error("A binding must resolve in a valid scope, none found");
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
    if (!startSEXP) throw new Error("startSEXP is null");
    this.reduceLambdaTargets(startSEXP, startScope);
    // Assign reference IDX for pool lookups, during execution they will be resolved to contant pool + REFIDX, the REFIDX is assigned here
    for(let bbContainerSEXP of startSEXP.args) {
      let i = 0;
      if (isListSEXP(bbContainerSEXP)) continue;
      if (isBBContainerSEXP(bbContainerSEXP)) {
        for (let poolBinding of bbContainerSEXP.getBindings().getLambdaPoolBindings().args) {
          if (isPoolBindingSEXP(poolBinding)) {
            poolBinding.setREFIDX(i++);
          } else throw new Error("Expected only pool bindings in the lambda pool");
        }
      } else throw new Error("Expected a bbContainerSEXP");
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
        const isASW = s.isASW();
        // We will get the closure scope
        const targetScopeIDX = this.findParentClosureScope(currBBScope);
        if (targetScopeIDX < 0) throw new Error("A binding must resolve in a valid scope, none found");
        const bbContainer = this.getBBContainerSEXPByScopeId(targetScopeIDX);
        const bindingsSEXP = bbContainer.getBindings();

        if (isBindingsSEXP(bindingsSEXP)) {
          const globalBinding = this.isGlobalBinding(s.getBindingName(), currBBScope, bindingsSEXP);
          if (globalBinding) {
            if (isASW) throw new Error("Tried to mark a global binding as an ASW binding");
            currSEXP.args[i] = new GlobalBindingSEXP(s.getBindingName());
          } else {
            const resolvedBinding = this.resolveScopedLookup(s.getBindingName(), currBBScope, bindingsSEXP);
            
            // An ASW binding is an argument binding, if it is lexically reachable it is always trivially safe to write to it
            if (isASW && isEnvBindingSEXP(resolvedBinding)) {
              resolvedBinding.markASW();
            }
            currSEXP.args[i] = resolvedBinding;
          }
        } else throw new Error("Bindings not found, it is needed to resolve bindings");
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
          const buildContext = IridiumBuildContext.CONTEXT_MAP.get(targetScopeIDX);
          if (!buildContext) throw new Error("buildContext is undefined");
          const privateMapping = buildContext.privateMapping;
          if (privateMapping) {
            if (privateMapping.has(s.getBindingName())) {
              const bb = privateMapping.get(s.getBindingName());
              if (!bb) throw new Error("private binding is undefined");
              currSEXP.args[i] = new EnvReadSEXP(bb);
              break;
            }
          }
          targetScopeIDX = this.findParentClosureScope(buildContext.parent);
          if (targetScopeIDX < 0) throw new Error("Failed to resolve private binding!!!");
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
    if (!fileSexp) throw new Error("fileSexp is undefined");
    for (let bb of fileSexp.args) {
      if (isBBSEXP(bb)) {
        let targetScopeIDX = this.findParentClosureScope(bb.getScopeIDX());

        if (!bbGroups.has(targetScopeIDX)) {
          const buildContext = IridiumBuildContext.CONTEXT_MAP.get(targetScopeIDX);
          if (!buildContext) throw new Error("buildContext is undefined");
          let startBB = buildContext.BB[0];
          if (isBBSEXP(startBB)) {
            let bbContainer = new BBContainerSEXP(startBB.idx, targetScopeIDX, []);
            const currContext = IridiumBuildContext.CONTEXT_MAP.get(targetScopeIDX);
            if (!currContext) throw new Error("currContext is undefined");
            if (currContext.isAsync) bbContainer.setAsync();
            if (currContext.isGenerator) bbContainer.setGenerator();
            if (currContext.isStrict) bbContainer.setStrict();
            bbContainer.setClosureFlags(currContext.kind);
            bbGroups.set(targetScopeIDX, bbContainer);
          } else throw new Error("Expected BBSEXP")
        }
        const bbGroup = bbGroups.get(targetScopeIDX);
        if (!bbGroup) throw new Error("bbGroup is undefined");
        bbGroup.addBB(bb);
      }
    }

    fileSexp.args = [...bbGroups.values()];

    // const isSloppy = !IridiumBuildContext.CONTEXT_MAP.get(0).isStrict;
    const buildContext = IridiumBuildContext.CONTEXT_MAP.get(0);
    if (!buildContext) throw new Error("buildContext is undefined");
    const isModule = buildContext.isModule;
    const moduleRequests = new ListSEXP([]);
    moduleRequests.setType("ModuleRequest");

    const staticImports = new ListSEXP([]);
    staticImports.setType("StaticImport");

    const staticExports = new ListSEXP([]);
    
    const staticStarExports = new ListSEXP([]);
    staticStarExports.setType("StarExport");

    for (let bbContainer of fileSexp.args) {
      if (isBBContainerSEXP(bbContainer)) {
        const bbContainerScopeIDX = bbContainer.getScopeIDX();
        const buildContext = IridiumBuildContext.CONTEXT_MAP.get(bbContainerScopeIDX);
        if (!buildContext) throw new Error("buildContext is undefined");
        const bbContainerParentScopeIDX = buildContext.parent;
        let isTopLevelContainer = bbContainerParentScopeIDX === -1;
        if (isTopLevelContainer) {
          bbContainer.setFlag("TopLevel");
        }

        // If this is a function, set the number of expected ECMAArgs
        bbContainer.setECMAArgsLen(buildContext.ecmaArgs);

        const sloppyDeclarations: Array<[string, JSEnvBindingFlags]> = [];
        const hoistingInfo = new Map<number, Array<[Array<string>, JSEnvBindingFlags]>>();
        const toRemove: Map<BBSEXP, Set<IridiumSEXP>> = new Map();
        const staticModuleImports: Array<StaticImportSEXP> = [];

        const implicitBindings: Set<JSImplicitBindingDeclarationSEXP> = new Set();

        // Identify bindings
        for (let bb of bbContainer.getBBs()) {
          if (isBBSEXP(bb)) {
            const localScope = bb.getScopeIDX();
            if (!hoistingInfo.has(localScope)) hoistingInfo.set(localScope, new Array());

            const parentClosureScope = this.findParentClosureScope(localScope);
            if (!hoistingInfo.has(parentClosureScope)) hoistingInfo.set(parentClosureScope, new Array());

            for (let stmt of bb.args) {

              if (isJSImplicitBindingDeclarationSEXP(stmt)) {
                implicitBindings.add(stmt);
              }

              if (isStarExportSEXP(stmt)) {
                staticStarExports.args.push(stmt);
                if (!toRemove.has(bb)) toRemove.set(bb, new Set());
                const toRemoveList = toRemove.get(bb);
                if (!toRemoveList) throw new Error("toRemoveList is undefined");
                toRemoveList.add(stmt);
              }

              if (isStaticImportSEXP(stmt)) {
                const localBinding = stmt.args[0];
                if (isResolveEnvBindingSEXP(localBinding)) {
                  staticModuleImports.push(stmt);
                } else throw new Error("Expected static imported binding to be ResolveEnvBindingSEXP");
                if (!toRemove.has(bb)) toRemove.set(bb, new Set());
                const toRemoveList = toRemove.get(bb);
                if (!toRemoveList) throw new Error("toRemoveList is undefined");
                toRemoveList.add(stmt);
              }

              if (isLocalStaticExportSEXP(stmt)) {
                const localBinding = stmt.args[0];
                if (isResolveEnvBindingSEXP(localBinding)) {
                  staticExports.args.push(stmt);
                } else throw new Error("Expected static imported binding to be ResolveEnvBindingSEXP");
                if (!toRemove.has(bb)) toRemove.set(bb, new Set());
                const toRemoveList = toRemove.get(bb);
                if (!toRemoveList) throw new Error("toRemoveList is undefined");
                toRemoveList.add(stmt);
              }

              if (isNamedReexportSEXP(stmt)) {
                staticExports.args.push(stmt);
                if (!toRemove.has(bb)) toRemove.set(bb, new Set());
                const toRemoveList = toRemove.get(bb);
                if (!toRemoveList) throw new Error("toRemoveList is undefined");
                toRemoveList.add(stmt);
              }
              
              if (isJSCatchContextSEXP(stmt)) {
                const hoistingInfoList = hoistingInfo.get(localScope);
                if (!hoistingInfoList) throw new Error("hoistingInfoList is undefined");
                hoistingInfoList.push([[stmt.getBindingName()], "JSLET"]);
              }

              // Function Declaration
              if (isJSFuncDeclSEXP(stmt)) {
                if (!isModule && localScope === 0) {
                  // NADA
                } else {
                  stmt.reduceDecl();
                }

                // Dont break here!!!

                // const lval = stmt.args[0];
                // if (!isResolveEnvBindingSEXP(lval)) throw new Error("Expected unresolved name for function declarations");
                // const bindingName = lval.getBindingName();

                // // Case 1: non-module code
                // //    a. outer scope, treat binding as a global
                // //    b. inner scope, declare local binding -> put_loc
                // // Case 2: module code
                // //    a. outer scope, treat a closure var -> put_var
                // //    b. inner scope, declare local binding -> put_loc
                // if (!isModule && localScope === 0) {
                //   // NADA
                // } else {
                //   const hoistingInfoList = hoistingInfo.get(localScope);
                //   if (!hoistingInfoList) throw new Error("hoistingInfoList is undefined");
                //   hoistingInfoList.push([[bindingName], "JSVAR"]);
                // }
              }

              // Declaration Statements
              if (isJSEnvWriteSEXP(stmt) && stmt.isDecl()) {
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
                    const toRemoveList = toRemove.get(bb);
                    if (!toRemoveList) throw new Error("toRemoveList is undefined");
                    toRemoveList.add(stmt);
                  } else if (stmt.isLetDecl()) {
                    stmt.setRVal(new GlobalBindingSEXP("undefined"));
                  } else {
                    throw new Error("Const declaration without RVal");
                  }
                }

                // This statement is no longer a declaration 
                stmt.reduceJSDecl();

                if (scopeToHoistTo === 0 && !isModule) { // Top Level Global Declaration for script mode
                  declarations.forEach(d => sloppyDeclarations.push([d, hoistingKind]));
                  // stmt.markSloppyDecl();
                } else {
                  // Scope where these bindings must be initialized
                  const hoistingInfoList = hoistingInfo.get(scopeToHoistTo);
                  if (!hoistingInfoList) throw new Error("hoistingInfoList is undefined");
                  hoistingInfoList.push([declarations, hoistingKind]);
                }
              }
            }
            
          } else throw new Error("Expected BBSEXP");
        }

        // Remote uninitialized declarations
        for (let [bb, toRemoveStmts] of toRemove) bb.args = bb.args.filter(e => !toRemoveStmts.has(e));

        // Create Scope Descriptor
        let i = 0, j = 0;
        const bindingsSEXP = new BindingsSEXP(bbContainerParentScopeIDX);

        // Scope bindings that will not be initialized implicitly by the codegen
        const toSkipInit: Set<IridiumSEXP> = new Set();

        // Add implicit bindings
        for (const stmt of implicitBindings) {
          const name = stmt.getName();
          const kind = stmt.getKind();
          const skipInit = stmt.isSkipInit();
          const binding = new EnvBindingSEXP(i++, bbContainerScopeIDX, name, [[kind, null]], bbContainerScopeIDX, bbContainerParentScopeIDX);
          bindingsSEXP.addLocalBinding(binding);
          if (skipInit) toSkipInit.add(binding);
        }

        if (buildContext.moduleRequestMap) {
          // Initialize Module Imports 
          if (bbContainerScopeIDX !== 0) throw new Error("Expected module imports only to be resolved for the top level container with scopeIDX 0");
          for (let b of staticModuleImports) {
            // Get the name of the binding we want...
            const bb = b.args[0];
            let bindingName: string;
            if (isResolveEnvBindingSEXP(bb)) bindingName = bb.getBindingName();
            else throw new Error("Expected the binding name to be resolveEnvBindingSEXP");

            // Declare the binding in the bindings object
            let binding = new EnvBindingSEXP(j++, bbContainerScopeIDX, bindingName, [["JSLET", null]], bbContainerScopeIDX, bbContainerParentScopeIDX);
            let remoteBinding = new RemoteEnvBindingSEXP(binding, -1);
            bindingsSEXP.addRemoteBinding(remoteBinding);
            toSkipInit.add(remoteBinding);
            staticImports.args.push(b);
          }

          for (let [,v] of buildContext.moduleRequestMap) {
            moduleRequests.args.push(v);  
          }
        }
        
        for (let [localScope, bindings] of hoistingInfo) {
          const currentContext = IridiumBuildContext.CONTEXT_MAP.get(localScope);
          if (!currentContext) throw new Error("currentContext is undefined");

          let parentScope = currentContext.parent;
          const isTopLevel = currentContext.BB[0].isTopLevel();
          for (let [bbs, flag] of bindings) {
            for (let b of bbs) {
              if (!bindingsSEXP.hasBindingReference(bbContainerScopeIDX, b, flag, localScope, parentScope)) {
                if (isTopLevel) {
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

        // 0 -> No Arguments Object
        // 1 -> Mapped Arguments
        // 2 -> Unmapped Arguments
        if (buildContext.argumentsKind > 0) {
          bbContainer.setArguments();
          const bindingName = "arguments";
          const flags: [JSEnvBindingFlags, null][] = [];
          flags.push(["JSVAR", null]);
          let binding = new EnvBindingSEXP(i++, bbContainerScopeIDX, bindingName, flags, bbContainerScopeIDX, bbContainerParentScopeIDX);
          bindingsSEXP.addLocalBinding(binding);

          let stmt = new JSImplicitBindingDeclarationSEXP(bindingName, "JSVAR", buildContext.argumentsKind === 1 ? 1 : 0);

          let startBB = buildContext.BB[0];
          startBB.args = [stmt,...startBB.args]
        }

        // Adding function arguments, if required
        const argsList: Array<EnvBindingSEXP> = [];
        for (let k = 0; k < buildContext.args.length; k++) {
          const flags: [JSEnvBindingFlags, null][] = [];
          if (k + 1 === buildContext.args.length && buildContext.hasRestArgs) {
            flags.push(["JSRESTARG", null]);
          } else {
            flags.push(["JSARG", null]);
          }
          let binding = new EnvBindingSEXP(k, bbContainerScopeIDX, buildContext.args[k], flags, bbContainerScopeIDX, bbContainerParentScopeIDX);
          
          argsList.push(binding);
        }

        bindingsSEXP.getLocalBindings().args = [...argsList, ...bindingsSEXP.getLocalBindings().args]
        
        // Add initializers to local scopes
        const bindingsToInit = [...bindingsSEXP.getLocalBindings().args, ...bindingsSEXP.getRemoteBindings().args].filter(b => !toSkipInit.has(b));
        
        for (let binding of bindingsToInit) {
          if (isEnvBindingSEXP(binding)) {
            const bindingContext = IridiumBuildContext.CONTEXT_MAP.get(binding.getScope());
            if (!bindingContext) throw new Error("bindingContext is undefined");
            let startBB = bindingContext.BB[0];
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
              const resolvedBindingContext = IridiumBuildContext.CONTEXT_MAP.get(resolvedBinding.getScope());
              if (!resolvedBindingContext) throw new Error("resolvedBindingContext is undefined");
              let startBB = resolvedBindingContext.BB[0];
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
            throw new Error("Expected EnvBindingSEXP");
        }

        const topLevelContext = IridiumBuildContext.CONTEXT_MAP.get(0);
        if (!topLevelContext) throw new Error("topLevelContext is undefined");

        for (let [name, kind] of sloppyDeclarations) {
          let startBB = topLevelContext.BB[0];
          let lValName = name;
          let rVal;
          if (kind === "JSVAR") {
            rVal = new EnvReadSEXP("undefined");
          } else {
            rVal = new JSNUBDSEXP();
          }
          const val = new EnvWriteSEXP(lValName, rVal, true, false);
          // val.markSloppyDecl();
          startBB.args = [val, ...startBB.args];
        }

        for (let [name, kind] of sloppyDeclarations) {
          if (kind === "JSLET" || kind === "JSCONST" || kind === "JSVAR") {
            let startBB = topLevelContext.BB[0];
            startBB.args = [new JSSloppyDeclarationCheckSEXP(name, kind), ...startBB.args];
          } else throw new Error("The declaration kind for SloppyDeclarationCheck is invalid!!!");
        }
        
        bbContainer.setBindings(bindingsSEXP);
      } else throw new Error("Expected BBContainerSEXP");
    }

    fileSexp.initializeModuleRequests(moduleRequests, staticImports, staticExports, staticStarExports);
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
        const funDeclList = res.get(currScope);
        if (!funDeclList) throw new Error("funDeclList is undefined");
        funDeclList.add(s);
        currSEXP.args[i] = new NOPSEXP();
      }
    }
    currSEXP.args.forEach(e => this.funcDeclHandler(e, currScope, res));
  }
  
  hoistFunctionDeclarations() {
    let toHoist: Map<number, Set<JSFuncDeclSEXP>> = new Map();
    if (!this.container) throw new Error("this.container is null");
    this.funcDeclHandler(this.container, -1, toHoist);

    for (let [scope, funDeclarations] of toHoist) {
      const buildContext = IridiumBuildContext.CONTEXT_MAP.get(scope);
      if (!buildContext) throw new Error("buildContext is undefined");
      const targetBB = buildContext.BB[0];
      targetBB.args = [...funDeclarations, ...targetBB.args];
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

