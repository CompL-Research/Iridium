import debugConfig from "#debugConfig";
import fs from "fs";
import { pack } from "msgpackr";
import path from "path";
import { gzipSync } from "zlib";
import { VERSION } from "../../../configs/projectStats";
import JS3Builder from "../JS3Builder";
import { JS3Program } from "../JS3Helpers/JS3Types";
import { PrivateMapping } from "./handleRVal";
import { IRIV2_STMT } from "./handleStatement";
import { BBSEXP, BBSEXPFlags, EnvReadSEXP, FileSEXP, getRegularClosureFlag, IfElseJumpSEXP, JSImplicitBindingDeclarationSEXP, ModuleRequestSEXP, ReturnAsyncSEXP, ReturnSEXP } from "./Types/index";

// @ts-expect-error
import iridiumForge from '#forge';
import { getLocInfoIfAvailable } from "#utils";

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

//
// Function to serialize the Iridium build context, this information is needed by many main passes to perform resolution
//

type SerializableIridiumBuildContextObject = {
  parent: number;
  scopeIdx: number;
  args: Array<string>;
  isArgInitContext: boolean;
  bypassParent: number;
  argInitContextWhitelist: Array<string>; // Set
  hasRestArgs: boolean;
  loopConfig: {
    kind: "for-of" | "standard",
    loopHeadIDX: number,
    loopBodyIDX: number,
    loopInitIDX: number,
    label: string | null,
    breakTarget: number,
    continueTarget: number
  } | null;
  tryContext: {
    tryContextIDX: number,
    tryIDX: number,
    udCatchIDX: number,
    imCatchIDX: number,
    finalizerIDX: number
  } | null;
  kind: number;
  propInitClos: string | null;
  argumentsKind: number;
  isAsync: boolean;
  isGenerator: boolean;
  isStrict: boolean;
  isModule: boolean;

  ecmaArgs: number;

  name: string;

  privateMapping: Array<[
    string,
    [string, string]
  ]> | null

  moduleRequestMap: Array<[string, Array<any>]> | null; // Array<any> are interpreted as IridiumSEXPs

  BB: Array<number>; // This must be resolved to their respective BBs at init time...

}

function serializeBuildContext(): Array<SerializableIridiumBuildContextObject> {
  const res: Array<SerializableIridiumBuildContextObject> = new Array();
  const contexts = IridiumBuildContext.CONTEXT_MAP;

  for (let e of contexts) {
    const buildContext: IridiumBuildContext = e[1];

    const privateMapping: Array<[
      string,
      [string, string]
    ]> = [];

    if (buildContext.privateMapping) {
      for (let p of buildContext.privateMapping) {
        privateMapping.push([p[0], [p[1][0], p[1][1]]])
      }
    }

    const moduleRequestMap: Array<[string, Array<any>]> = [];

    if (buildContext.moduleRequestMap) {
      for (let p of buildContext.moduleRequestMap) {
        moduleRequestMap.push([p[0], p[1].serialize()])
      }
    }

    // Create Serializable Iridium Build Context from buildContext
    const serializedContext: SerializableIridiumBuildContextObject = {
      parent: buildContext.parent,
      scopeIdx: buildContext.scopeIdx,
      args: buildContext.args,
      isArgInitContext: buildContext.isArgInitContext,
      bypassParent: buildContext.bypassParent,
      argInitContextWhitelist: [...buildContext.argInitContextWhitelist], // Set
      hasRestArgs: buildContext.hasRestArgs,
      loopConfig: buildContext.loopConfig ? {
        kind: buildContext.loopConfig.kind,
        loopHeadIDX: buildContext.loopConfig.loopHeadIDX,
        loopBodyIDX: buildContext.loopConfig.loopBodyIDX,
        loopInitIDX: buildContext.loopConfig.loopInitIDX,
        label: buildContext.loopConfig.label,
        breakTarget: buildContext.loopConfig.breakTarget,
        continueTarget: buildContext.loopConfig.continueTarget
      } : null,
      tryContext: buildContext.tryContext ? {
        tryContextIDX: buildContext.tryContext.tryContextIDX,
        tryIDX: buildContext.tryContext.tryIDX,
        udCatchIDX: buildContext.tryContext.udCatchIDX,
        imCatchIDX: buildContext.tryContext.imCatchIDX,
        finalizerIDX: buildContext.tryContext.finalizerIDX
      } : null,

      kind: buildContext.kind,
      propInitClos: buildContext.propInitClos,
      argumentsKind: buildContext.argumentsKind,
      isAsync: buildContext.isAsync,
      isGenerator: buildContext.isGenerator,
      isStrict: buildContext.isStrict,
      isModule: buildContext.isModule,
      ecmaArgs: buildContext.ecmaArgs,
      name: buildContext.name,

      privateMapping: buildContext.privateMapping ? privateMapping : null,

      moduleRequestMap: buildContext.moduleRequestMap ? moduleRequestMap : null,

      BB: [...buildContext.BB.map(e => e.getIDX())]
    };

    res.push(serializedContext)
  }

  return res;
}

export class IridiumBuildContext {
  static SID = 0;
  static CONTEXT_MAP = new Map<number, IridiumBuildContext>();
  parent: number;
  scopeIdx: number;
  args: Array<string> = [];
  isArgInitContext: boolean = false;
  bypassParent: number = -1;
  argInitContextWhitelist: Set<string> = new Set();
  hasRestArgs: boolean = false;

  loopConfig: LoopConfig | null = null;

  tryContext: TryContext | null = null;

  kind: number = 0;
  propInitClos: string | null = null;
  // 0 -> No Arguments Object
  // 1 -> Mapped Arguments
  // 2 -> Unmapped Arguments
  argumentsKind: number = 0;
  isAsync: boolean = false;
  isGenerator: boolean = false;
  isStrict: boolean = false;
  isModule: boolean = false;

  ecmaArgs: number = 0;
  name: string = "";

  privateMapping: PrivateMapping | null = null;

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
  result: Buffer | null = null;
  constructor(js3Builder: JS3Builder) {
    this.js3Builder = js3Builder;
    this.buildContext = [];
    this.container = null;
  }

  saveToDisk() {
    const filePath = debugConfig.cli.outputsPath + "/" + path.basename(this.js3Builder.projectFile.uname, this.js3Builder.projectFile.extension) + (debugConfig.cli.ljson ? ".json" : ".iri");

    if (!this.result) throw new Error("Run build before calling 'saveToDisk'");

    // @ts-ignore
    fs.writeFileSync(filePath, this.result);
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
    topLevelContext.isAsync = sourceType === "JSModule";

    topLevelContext.moduleRequestMap = new Map();
    topLevelContext.kind = sourceType === "JSModule" ? 13 : getRegularClosureFlag();
    this.pushContext(topLevelContext);

    if (sourceType === "JSModule") {
      this.getCurrentBB().args.push(new JSImplicitBindingDeclarationSEXP("this", "JSCONST", 9));

      // Early return if we dont need to evaluate the module completely
      const earlyReturnBB = this.declareAndPushLexicalContext();
      const earlyReturnStmt = new ReturnSEXP(new EnvReadSEXP("undefined", getLocInfoIfAvailable()));
      earlyReturnStmt.setModuleEarlyReturn();
      this.getCurrentBB().args.push(earlyReturnStmt); // Notice how this is not an async return!!
      this.popContext();

      const ifJump = new IfElseJumpSEXP(new EnvReadSEXP("this", getLocInfoIfAvailable()), earlyReturnBB.BB[0].idx, -1);
      this.getCurrentBB().args.push(ifJump);

      this.addContinuation(this.getCurrentContext());
      ifJump.setFALSE(this.getCurrentBB().getIDX());

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
      this.getCurrentBB().args.push(new ReturnAsyncSEXP(new EnvReadSEXP("undefined", getLocInfoIfAvailable())));
    } else {
      this.getCurrentBB().args.push(new ReturnSEXP(new EnvReadSEXP("undefined", getLocInfoIfAvailable())));
    }
    this.popContext();
    if (this.buildContext.length !== 0) throw new Error("Expected buildContext stack to be empty after build()");

    const packed = pack(
      {
        version: VERSION,
        absoluteFilePath: this.js3Builder.projectFile.absoluteFilePath,
        iridium: this.container.serialize(),
        buildContext: serializeBuildContext(),
      }
    );

    // @ts-ignore
    const gzipped = gzipSync(packed);

    if (debugConfig.cli.debugIri) {
      this.result = gzipped;
      return;
    }
    this.result = iridiumForge.execute(gzipped, 0, debugConfig.cli.ljson);
    if (!this.result) throw new Error("Forge project returned null");
  }

}
