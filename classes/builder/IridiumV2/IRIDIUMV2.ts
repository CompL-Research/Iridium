import debugConfig from "#debugConfig";
import { VERSION } from "configs/projectStats.ts";
import fs from "fs";
import path from "path";
import JS3Builder from "../JS3Builder.ts";
import { JS3Program } from "../JS3Helpers/JS3Types.ts";
import { IRIV2_STMT } from "./handleStatement.ts";
import { BBContainerSEXP, BBSEXP, BBSEXPFlags, EnvBindingSEXP, EnvReadSEXP, EnvWriteSEXP, FileSEXP, GlobalBindingSEXP, IridiumSEXP, isBBContainerSEXP, isBBSEXP, isEnvBindingSEXP, isGlobalBindingSEXP, isJSEnvWrite, isResolveEnvBindingSEXP, isScopeDescriptorContainerSEXP, isScopeDescriptorSEXP, JSEnvBindingFlags, JSEnvWriteSEXP, JSNUBDSEXP, ListSEXP, ScopeDescriptorContainerSEXP, ScopeDescriptorSEXP } from "./Types.ts";
import { dumpSEXP } from "./PP.ts";

export class IridiumBuildContext {
  static SID = 1;
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
    const topLevelContext = new IridiumBuildContext(0, undefined, "TopLevel");
    this.pushContext(topLevelContext);
    for (let s of program.body) {
      IRIV2_STMT(this, s);
    }
    this.popContext();
    if (this.buildContext.length !== 0) debugConfig.logger.throwIriError("Expected buildContext stack to be empty after build()");

    // debugConfig.logger.log("" + dumpSEXP(this.container));

    debugConfig.logger.log("Initial code: " + dumpSEXP(this.container));
    this.normailzeBBFlags();
    debugConfig.logger.log("After 1st pass: " + dumpSEXP(this.container));
    this.addScopeDescriptors();
    debugConfig.logger.log("After 2nd pass: " + dumpSEXP(this.container));
    this.resolveBindings(this.container, 0);
    debugConfig.logger.log("After 3rd pass: " + dumpSEXP(this.container));
    this.populateClosureReads(this.container, 0);
    debugConfig.logger.log("After 4th pass: " + dumpSEXP(this.container));
    this.assignStackIdx();
    debugConfig.logger.log("After 5th pass: " + dumpSEXP(this.container));
    this.countContainerStackSize();
    debugConfig.logger.log("After 6th pass: " + dumpSEXP(this.container));
  }

  // 
  // Given a scopeIDX it returns its parent closure scopeIDX.
  // 
  findParentClosureScope(localScope: number) {
    if (localScope === 0) return 0;
    if (!IridiumBuildContext.CONTEXT_MAP.has(localScope)) debugConfig.logger.throwIriError(`build context not found for scope: ${localScope}`)

    let buildContext = IridiumBuildContext.CONTEXT_MAP.get(localScope);
    let startBB = buildContext.BB[0];
    if (startBB.isClosureBoundary() || startBB.isTopLevel()) return localScope;
    else return this.findParentClosureScope(buildContext.parent);
  }

  // 
  // Checks if a environment lookup crosses the closure boundary
  // 
  checkIfLexicalBinding(scopeIDX: number, binding: string, reachedBoundary: boolean = false): boolean {
    let descriptors = this.container.args[0];
    if (reachedBoundary) return true;
    if (isScopeDescriptorContainerSEXP(descriptors)) {
      for (let descriptor of descriptors.args) {
        if (isScopeDescriptorSEXP(descriptor)) {
          if (descriptor.getScopeIDX() === scopeIDX) {
            if (descriptor.isTopLevel() || descriptor.isClosureBoundary()) reachedBoundary = true;
            if (descriptor.hasDeclaration(binding)) return false;
            
            let parentIDX = descriptor.getParentIDX();
            if (parentIDX != -1) return this.checkIfLexicalBinding(parentIDX, binding, reachedBoundary);
          }
        } else debugConfig.logger.throwIriError("Expected Scope Descriptor");
      }
    } else debugConfig.logger.throwIriError("Expected Scope Descriptors to be resolved before resolving bindings");
    debugConfig.logger.throwIriError("Failed to check if binding is lexical binding");
  }

  // 
  // Declare a global environment read
  // 
  declareGlobal(binding :GlobalBindingSEXP) {
    let descriptors = this.container.args[0];
    if (isScopeDescriptorContainerSEXP(descriptors)) {
      for (let descriptor of descriptors.args) {
        if (isScopeDescriptorSEXP(descriptor)) {
          if (descriptor.getScopeIDX() === 0) {
            descriptor.addDeclaration(binding);
            return;
          }
        } else debugConfig.logger.throwIriError("Expected Scope Descriptor");
      }
    } else debugConfig.logger.throwIriError("Expected Scope Descriptors to be resolved before resolving bindings");
    debugConfig.logger.throwIriError("Expected global binding declaration");
  }

  // 
  // Given a starting scope and a binding, returns the actual declared binding
  // 
  findBinding(scopeIDX: number, binding: string): EnvBindingSEXP | GlobalBindingSEXP {
    let descriptors = this.container.args[0];
    if (isScopeDescriptorContainerSEXP(descriptors)) {
      for (let descriptor of descriptors.args) {
        if (isScopeDescriptorSEXP(descriptor)) {
          if (descriptor.getScopeIDX() === scopeIDX) {
            if (descriptor.hasDeclaration(binding)) return descriptor.getDeclaration(binding);

            let parentIDX = descriptor.getParentIDX();
            if (parentIDX != -1) return this.findBinding(parentIDX, binding);
          }
        } else debugConfig.logger.throwIriError("Expected Scope Descriptor");
      }
    } else debugConfig.logger.throwIriError("Expected Scope Descriptors to be resolved before resolving bindings");
    return null;
  }

  // 
  // Given a scopeIDX, adds a lexical read entry to the scope descriptor
  // 
  addClosureReadToScopeDescriptor(scopeIDX: number, binding: EnvBindingSEXP | GlobalBindingSEXP) {
    let descriptors = this.container.args[0];
    if (isScopeDescriptorContainerSEXP(descriptors)) {
      for (let descriptor of descriptors.args) {
        if (isScopeDescriptorSEXP(descriptor)) {
          if (descriptor.getScopeIDX() === scopeIDX) {
            descriptor.addLexicalRead(binding);
          }
        } else debugConfig.logger.throwIriError("Expected Scope Descriptor");
      }
    } else debugConfig.logger.throwIriError("Expected Scope Descriptors to be resolved before resolving bindings");
  }

  getScopeDescriptor(idx:number) : ScopeDescriptorSEXP {
    const fileSexp = this.container;
    const scopeDescriptors = fileSexp.args[0];
    if (!isScopeDescriptorContainerSEXP(scopeDescriptors)) debugConfig.logger.throwIriError("Expected Scope Descriptor Container");
    for (let descriptor of scopeDescriptors.args) {
      if (isScopeDescriptorSEXP(descriptor)) {
        if (descriptor.getScopeIDX() === idx) {
          return descriptor;
        }
      } else debugConfig.logger.throwIriError("Expected Scope Descriptor");
    }
    debugConfig.logger.throwIriError("Failed to get scope descriptor");
  }

  // 
  // 6. Each BContainer is assigned the local and closure var count
  // 
  countContainerStackSize() {
    const fileSexp = this.container;
    const scopeDescriptors = fileSexp.args[0];
    if (!isScopeDescriptorContainerSEXP(scopeDescriptors)) debugConfig.logger.throwIriError("Expected Scope Descriptor Container");
    for (let bbContainer of fileSexp.args) {
      if (isBBContainerSEXP(bbContainer)) {
        let descriptors: Set<ScopeDescriptorSEXP> = new Set();
        for (let bb of bbContainer.args) {
          if (isBBSEXP(bb)) {
            let scope = this.getScopeDescriptor(bb.getScope());
            if (descriptors.has(scope)) continue;
            descriptors.add(scope);
          } else debugConfig.logger.throwIriError("Expected BBSEXP");
        }
        let localVARs = 0;
        let closureVARs = 0;
        for (let descriptor of descriptors) {
          localVARs += descriptor.getLocalVarCount();
          closureVARs += descriptor.getClosureVarCount();
        }
        bbContainer.setClosureVarCount(closureVARs);
        bbContainer.setLocalVarCount(localVARs);
      }
    }
  }

  // 
  // 5. Assign stack IDX to EnvBindings
  // 
  assignStackIdx() {
    const fileSexp = this.container;
    for (let bb of fileSexp.args) {
      if (isScopeDescriptorContainerSEXP(bb)) {
        const scopes = bb.args;
        for (let scope of scopes) {
          let i = 0;
          if (isScopeDescriptorSEXP(scope)) {
            let bindings = scope.getBindings().args;
            for (let binding of bindings) {
              if (isEnvBindingSEXP(binding)) {
                binding.setRefIDX(i++);
                if (scope.isTopLevel() || scope.isClosureBoundary()) {
                  binding.setFlag("ClosureVAR");
                } else {
                  binding.setFlag("LocalVAR");
                }
              } else if (isGlobalBindingSEXP(binding)) {
                debugConfig.logger.throwIriError("TODO: Global Binding Stack IDX");
              } else {
                debugConfig.logger.throwIriError("Unexpected binding type" + binding.tag);
              }
            }
          } else debugConfig.logger.throwIriError("Expected Scope Descriptor");
        }
      }
    }
  }

  // 
  // 4. PopulateClosureReads: Populate the scope descriptor with lexical reads.
  // 

  populateClosureReads(currSEXP: IridiumSEXP, currBBScope: number) {
    if (isEnvBindingSEXP(currSEXP)) {
      // If it leaves the closure binding, add to lexical reads list
      if (this.checkIfLexicalBinding(currBBScope, currSEXP.getDeclaration())) {
        let res = this.findBinding(currBBScope, currSEXP.getDeclaration());
        if (!res) {
          debugConfig.logger.throwIriError("Failed to find binding even though it was lexical");
        }
        let closureScope = this.findParentClosureScope(currBBScope);
        this.addClosureReadToScopeDescriptor(closureScope, res);
      }
    } else if (isGlobalBindingSEXP(currSEXP)) {
      let res = new GlobalBindingSEXP(currSEXP.getDeclaration());
      let closureScope = this.findParentClosureScope(currBBScope);
      this.addClosureReadToScopeDescriptor(closureScope, res);
    }

    if (isBBSEXP(currSEXP)) {
      currSEXP.args.forEach(e => this.populateClosureReads(e, currSEXP.getScope()))
    } else if (isScopeDescriptorContainerSEXP(currSEXP)) {
      return;
    } else {
      currSEXP.args.forEach(e => this.populateClosureReads(e, currBBScope));
    }
  }

  // 
  // 3. ResolveBindings: Operations on environment are resolved to their declarations. 
  // 
  resolveBindings(currSEXP: IridiumSEXP, currBBScope: number) {
    for (let i = 0; i < currSEXP.args.length; i++) {
      let s = currSEXP.args[i];
      if (isResolveEnvBindingSEXP(s)) {
        let res = this.findBinding(currBBScope, s.getBindingName());
        if (!res) {
          res = new GlobalBindingSEXP(s.getBindingName());
        }
        currSEXP.args[i] = res;
      }
    }
    if (isBBSEXP(currSEXP)) {
      currSEXP.args.forEach(e => this.resolveBindings(e, currSEXP.getScope()))
    } else if (isScopeDescriptorContainerSEXP(currSEXP)) {
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
    const hoistingInfo = new Map<number, Array<[Array<string>, JSEnvBindingFlags]>>();

    for (let bb of fileSexp.args) {
      if (isBBSEXP(bb)) {
        const localScope = bb.getScope();
        if (!hoistingInfo.has(localScope)) hoistingInfo.set(localScope, new Array());

        const parentClosureScope = this.findParentClosureScope(localScope);
        if (!hoistingInfo.has(parentClosureScope)) hoistingInfo.set(parentClosureScope, new Array());

        for (let stmt of bb.args) {
          if (isJSEnvWrite(stmt) && stmt.isDecl()) {
            let scopeToHoistTo: number;
            let hoistingKind: JSEnvBindingFlags;
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

            hoistingInfo.get(scopeToHoistTo).push([declarations, hoistingKind]);
          }
        }
      } else {
        debugConfig.logger.throwIriError("Expected BBSEXP");
      }
    }

    let descriptors: Array<ScopeDescriptorSEXP> = [];

    descriptors.push(new ScopeDescriptorSEXP(0, "GlobalEnv"));

    for (const [scopeIDX, buildContext] of IridiumBuildContext.CONTEXT_MAP) {
      if (!hoistingInfo.has(scopeIDX)) debugConfig.logger.throwIriError(`no hoisting info for scope ${scopeIDX}`);
      const bindingsToCreate = hoistingInfo.get(scopeIDX);

      let undefDeclarations: Array<string> = []
      let nubdDeclarations: Array<string> = []

      // Add all declarations to scope descriptor
      let descriptor = new ScopeDescriptorSEXP(scopeIDX, buildContext.BB[0].getBBFlag());
      descriptor.setParentIDX(buildContext.parent);
      for (let b of bindingsToCreate) {
        const flags: [JSEnvBindingFlags, null][] = [];
        flags.push([b[1], null]);
        b[0].forEach(n => descriptor.addDeclaration(new EnvBindingSEXP(n, flags)));

        if (b[1] === "JSVAR") b[0].forEach(e => undefDeclarations.push(e));
        else b[0].forEach(e => nubdDeclarations.push(e));
      }

      // Add args to descriptor
      for (let arg of buildContext.args) {
        const flags: [JSEnvBindingFlags, null][] = [];
        flags.push(["JSARG", null]);
        descriptor.addDeclaration(new EnvBindingSEXP(arg, flags))
      }

      descriptors.push(descriptor);
      
      // NUBD for arg inits
      for (let arg of buildContext.nubds) {
        nubdDeclarations.push(arg);
      }
      
      // Add scope initializations to startBBs
      let startBB = buildContext.BB[0];
      let scopeInits: Array<IridiumSEXP> = []
      for (let ud of undefDeclarations) {
        scopeInits.push(new EnvWriteSEXP(ud, new EnvReadSEXP("undefined")));
      }

      for (let nubd of nubdDeclarations) {
        scopeInits.push(new EnvWriteSEXP(nubd, new JSNUBDSEXP()));
      }
      
      startBB.args = [...scopeInits,...startBB.args]
    }

    descriptors.sort((a, b) => {
      let aVal = a.getFlag("ScopeIDX"); 
      let bVal = b.getFlag("ScopeIDX"); 
      if (typeof aVal === "number" && typeof bVal === "number") {
        return aVal - bVal; 
      } else {
        debugConfig.logger.throwIriError("Expected ScopeIDX to be a number...");
        return 0;
      }
    });

    let scopeDescriptors = new ScopeDescriptorContainerSEXP(descriptors);
    let newArgs: Array<IridiumSEXP> = [scopeDescriptors];
    
    // Group BBs into groups
    let bbGroups: Map<number, BBContainerSEXP> = new Map();
    for (let bb of fileSexp.args) {
      if (isBBSEXP(bb)) {
        let targetScopeIDX = this.findParentClosureScope(bb.getScope());
        if (!bbGroups.has(targetScopeIDX)) bbGroups.set(targetScopeIDX, new BBContainerSEXP([]));
        bbGroups.get(targetScopeIDX).addBB(bb);
      }
    }

    // newArgs for file
    for (let [scopeIDX, bbContainerSEXP] of bbGroups) {
      newArgs.push(bbContainerSEXP);
    }

    // Update the fileArgs
    fileSexp.args = newArgs;
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

