import { IRIDIUM_FG } from "classes/builder/IridiumHelpers/I_GENERAL/IRIDIUM_FG.ts";
import Logger from "../classes/debugger/Logger.ts";

const config: {
  operationMode: "analyze" | "js3" | "iri";
  cli: {
    allowLangWithSupport: boolean;
    outputsPath: string;
    test262: boolean;
    sourceType: string;
    printModuleGraphPng: boolean;
    savePTAGraph: boolean;
    saveFlowGraph: boolean;
    enablePlayground: boolean;
    playgroundPort: number;
    projectBase: string;
  };
  logger: Logger;
  versionNumber: string;
  throwJS3Errors: boolean;
  throwIRIErrors: boolean;
  DOTContext: Set<IRIDIUM_FG> | undefined;
} = {
  operationMode: "analyze",
  cli: {
    allowLangWithSupport: false,
    outputsPath: undefined,
    test262: false,
    sourceType: "unambiguous",
    printModuleGraphPng: false,
    savePTAGraph: false,
    saveFlowGraph: false,
    enablePlayground: false,
    playgroundPort: 4000,
    projectBase: undefined,
  },
  logger: new Logger(),
  versionNumber: "",
  throwJS3Errors: false,
  throwIRIErrors: false,
  DOTContext: undefined,
};

export default config;
