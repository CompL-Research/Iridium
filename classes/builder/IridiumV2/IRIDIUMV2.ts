import JS3Builder from "../JS3Builder.ts";
import debugConfig from "#debugConfig";
import { JS3Program } from "../JS3Helpers/JS3Types.ts";
import { IRIV2_STMT } from "./handleStatement.ts";
import { BBSEXP, BBSEXPFlags, FileSEXP } from "./Types.ts";

export class IridiumBuildContext {
  static SID = 1;
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

  getCurrentContext() {
    if (this.buildContext.length === 0) debugConfig.logger.throwIriError("Expected atleast one BB to exist in the build context stack!!");
    const contexts = this.buildContext;
    return contexts[contexts.length - 1];
  }

  getCurrentBB() {
    return this.getCurrentContext().getCurrentBB();
  }

  declareAndPushLexicalContext(): IridiumBuildContext {
    const currentContext = this.getCurrentContext();
    const newContext = new IridiumBuildContext(currentContext.scopeIdx, undefined, "Lexical");
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
  }
}