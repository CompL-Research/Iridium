import { VERSION } from "../../../configs/projectStats";
import { JS3BuilderUtils } from "../JS3Builder";
import { JS3File, JS3Program } from "../JS3Helpers/JS3Types";
import { PrivateMapping } from "./handleRVal";
import { IRIV2_STMT } from "./handleStatement";
import {
  BBSEXP,
  BBSEXPFlags,
  EnvReadSEXP,
  FileSEXP,
  getRegularClosureFlag,
  IfElseJumpSEXP,
  JSImplicitBindingDeclarationSEXP,
  ModuleRequestSEXP,
  ReturnAsyncSEXP,
  ReturnSEXP,
} from "./Types/index";

import iridiumForge from "#forge";
import { tick, tock } from "../../debugger/IRIPerf";
import { ProjectFile } from "../../ProjectFile";

type LoopConfig = {
  kind: "for-of" | "standard";
  loopHeadIDX: number;
  loopBodyIDX: number;
  loopInitIDX: number;
  label: string | null;
  breakTarget: number;
  continueTarget: number;
};

type TryContext = {
  tryContextIDX: number;
  tryIDX: number;
  udCatchIDX: number;
  imCatchIDX: number;
  finalizerIDX: number;
};

//
// Function to serialize the Iridium build context, this information is needed by many main passes to perform resolution
//

type SerializableIridiumBuildContextObject = {
  parent: number;
  scopeIDX: number;
  args: Array<string>;
  isArgInitContext: boolean;
  bypassParent: number;
  argInitContextWhitelist: Array<string>; // Set
  hasRestArgs: boolean;
  loopConfig: {
    kind: "for-of" | "standard";
    loopHeadIDX: number;
    loopBodyIDX: number;
    loopInitIDX: number;
    label: string | null;
    breakTarget: number;
    continueTarget: number;
  } | null;
  tryContext: {
    tryContextIDX: number;
    tryIDX: number;
    udCatchIDX: number;
    imCatchIDX: number;
    finalizerIDX: number;
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
  sourceLine: number;

  privateMapping: Array<[string, [string, string]]> | null;

  moduleRequestMap: Array<[string, Array<any>]> | null; // Array<any> are interpreted as IridiumSEXPs

  BB: Array<number>; // This must be resolved to their respective BBs at init time...
};

function serializeBuildContext(): Array<SerializableIridiumBuildContextObject> {
  const res: Array<SerializableIridiumBuildContextObject> = new Array();
  const contexts = IridiumBuildContext.CONTEXT_MAP;

  for (let e of contexts) {
    const buildContext: IridiumBuildContext = e[1];

    const privateMapping: Array<[string, [string, string]]> = [];

    if (buildContext.privateMapping) {
      for (let p of buildContext.privateMapping) {
        privateMapping.push([p[0], [p[1][0], p[1][1]]]);
      }
    }

    const moduleRequestMap: Array<[string, Array<any>]> = [];

    if (buildContext.moduleRequestMap) {
      for (let p of buildContext.moduleRequestMap) {
        moduleRequestMap.push([p[0], p[1].serializeFlat()]);
      }
    }

    // Create Serializable Iridium Build Context from buildContext
    const serializedContext: SerializableIridiumBuildContextObject = {
      parent: buildContext.parent,
      scopeIDX: buildContext.scopeIdx,
      args: buildContext.args,
      isArgInitContext: buildContext.isArgInitContext,
      bypassParent: buildContext.bypassParent,
      argInitContextWhitelist: [...buildContext.argInitContextWhitelist], // Set
      hasRestArgs: buildContext.hasRestArgs,
      loopConfig: buildContext.loopConfig
        ? {
            kind: buildContext.loopConfig.kind,
            loopHeadIDX: buildContext.loopConfig.loopHeadIDX,
            loopBodyIDX: buildContext.loopConfig.loopBodyIDX,
            loopInitIDX: buildContext.loopConfig.loopInitIDX,
            label: buildContext.loopConfig.label,
            breakTarget: buildContext.loopConfig.breakTarget,
            continueTarget: buildContext.loopConfig.continueTarget,
          }
        : null,
      tryContext: buildContext.tryContext
        ? {
            tryContextIDX: buildContext.tryContext.tryContextIDX,
            tryIDX: buildContext.tryContext.tryIDX,
            udCatchIDX: buildContext.tryContext.udCatchIDX,
            imCatchIDX: buildContext.tryContext.imCatchIDX,
            finalizerIDX: buildContext.tryContext.finalizerIDX,
          }
        : null,

      kind: buildContext.kind,
      propInitClos: buildContext.propInitClos,
      argumentsKind: buildContext.argumentsKind,
      isAsync: buildContext.isAsync,
      isGenerator: buildContext.isGenerator,
      isStrict: buildContext.isStrict,
      isModule: buildContext.isModule,
      ecmaArgs: buildContext.ecmaArgs,
      name: buildContext.name,
      sourceLine: buildContext.sourceLine,

      privateMapping: buildContext.privateMapping ? privateMapping : null,

      moduleRequestMap: buildContext.moduleRequestMap ? moduleRequestMap : null,

      BB: [...buildContext.BB.map((e) => e.getIDX())],
    };

    res.push(serializedContext);
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
  sourceLine: number = -1;

  privateMapping: PrivateMapping | null = null;

  moduleRequestMap: Map<string, ModuleRequestSEXP> | null = null;

  static resetBuildContext() {
    this.SID = 0;
    this.CONTEXT_MAP = new Map<number, IridiumBuildContext>();
  }

  BB: Array<BBSEXP> = [];
  constructor(
    parent: number,
    BB: BBSEXP | undefined = undefined,
    flag: BBSEXPFlags | undefined = undefined,
  ) {
    this.scopeIdx = IridiumBuildContext.SID++;
    this.parent = parent;
    if (BB) {
      this.pushBB(BB);
    } else {
      if (!flag)
        throw new Error(
          "Expected a flag to qualify all the BBs in iridium, not supplied!!!",
        );
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
  projectFile: ProjectFile;
  buildContext: Array<IridiumBuildContext>;
  container: FileSEXP | null;
  utils: JS3BuilderUtils = {
    iridiumArgContext: false,
  };

  constructor(projectFile: ProjectFile, utils: JS3BuilderUtils) {
    this.projectFile = projectFile;
    this.buildContext = [];
    this.container = null;
    this.utils = utils;
  }

  getCurrentContext() {
    if (this.buildContext.length === 0)
      throw new Error(
        "Expected atleast one BB to exist in the build context stack!!",
      );
    const contexts = this.buildContext;
    return contexts[contexts.length - 1];
  }

  getCurrentBB() {
    return this.getCurrentContext().getCurrentBB();
  }

  declareAndPushLexicalContext(
    flags: BBSEXPFlags = "Lexical",
  ): IridiumBuildContext {
    const currentContext = this.getCurrentContext();
    const newContext = new IridiumBuildContext(
      currentContext.scopeIdx,
      undefined,
      flags,
    );
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
    tick("structural");
    const file: JS3File = this.projectFile.getJS3Payload();
    const program: JS3Program = file.program;

    const sourceType: "JSModule" | "JSScript" =
      program.sourceType === "module" ? "JSModule" : "JSScript";

    const mainContainer = new FileSEXP(sourceType);
    this.container = mainContainer;
    const topLevelContext = new IridiumBuildContext(-1, undefined, "TopLevel");

    topLevelContext.isModule = sourceType === "JSModule";
    topLevelContext.isStrict =
      sourceType === "JSModule" ||
      program.directives.some((val) => val.value.value === "use strict");
    topLevelContext.isAsync = sourceType === "JSModule";

    topLevelContext.moduleRequestMap = new Map();
    topLevelContext.kind =
      sourceType === "JSModule" ? 13 : getRegularClosureFlag();
    this.pushContext(topLevelContext);

    if (sourceType === "JSModule") {
      this.getCurrentBB().args.push(
        new JSImplicitBindingDeclarationSEXP("this", "JSCONST", 9),
      );

      // Early return if we dont need to evaluate the module completely
      const earlyReturnBB = this.declareAndPushLexicalContext();
      const earlyReturnStmt = new ReturnSEXP(new EnvReadSEXP("undefined"));
      earlyReturnStmt.setModuleEarlyReturn();
      this.getCurrentBB().args.push(earlyReturnStmt); // Notice how this is not an async return!!
      this.popContext();

      const ifJump = new IfElseJumpSEXP(
        new EnvReadSEXP("this"),
        earlyReturnBB.BB[0].idx,
        -1,
      );
      this.getCurrentBB().args.push(ifJump);

      this.addContinuation(this.getCurrentContext());
      ifJump.setFALSE(this.getCurrentBB().getIDX());

      this.getCurrentBB().args.push(
        new JSImplicitBindingDeclarationSEXP("<module_meta>", "JSCONST", 6),
      );
    } else {
      this.getCurrentBB().args.push(
        new JSImplicitBindingDeclarationSEXP("this", "JSCONST", 9),
      );
      this.getCurrentBB().args.push(
        new JSImplicitBindingDeclarationSEXP("<ret>", "JSCONST", 11),
      );
    }

    try {
      for (let s of program.body) {
        IRIV2_STMT(this, s);
      }
    } catch (e) {
      this.projectFile.errLog.push(e);
      return;
    }

    if (sourceType === "JSModule") {
      this.getCurrentBB().args.push(
        new ReturnAsyncSEXP(new EnvReadSEXP("undefined")),
      );
    } else {
      this.getCurrentBB().args.push(
        new ReturnSEXP(new EnvReadSEXP("undefined")),
      );
    }
    this.popContext();
    if (this.buildContext.length !== 0) {
      this.projectFile.errLog.push(
        "Expected buildContext stack to be empty after build()",
      );
    }

    this.projectFile.info.iri = "structural";
    tock("structural");

    this.projectFile.payload.iriSEXP = mainContainer;

    tick("integrity-check");
    let integrityCheck = this.container.checkIntegrity();
    if (!integrityCheck) {
      this.projectFile.errLog.push("IRIDIUM integrity-check failed");
      return;
    }
    tock("integrity-check");
    tick("serialize");
    tick("code");
    const serializedData = this.container.serializeFlat();
    this.projectFile.payload.irix = serializedData;
    tock("code");
    tick("build-ctx");
    const serializedBuildContext = serializeBuildContext();
    tock("build-ctx");
    tock("serialize");

    try {
      tick("forge");
      const res = iridiumForge.execute(
        VERSION,
        this.projectFile.filepath,
        serializedData,
        serializedBuildContext,
        tick,
        tock,
        true,
      );
      if (!res) throw new Error("Forge compile failed");
      this.projectFile.payload.iri = res.toString();
      tock("forge");
    } catch (e) {
      this.projectFile.errLog.push(e);
      return;
    }

    this.projectFile.info.iri = "normalized";
  }
}
