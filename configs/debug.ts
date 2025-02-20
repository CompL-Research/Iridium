import { IRIDIUM_FG } from "classes/builder/IridiumHelpers/IRIDIUM.ts";
import Logger from "../classes/debugger/Logger.ts";

const config : {
  operationMode: "analyze" | "js3" | "iri",
  cli: {
    allowLangWithSupport: boolean,
    outputsPath: string,
    test262: boolean,
    sourceType: string,
    printModuleGraphPng: boolean,
    savePTAGraph: boolean,
    enablePlayground: boolean,
    playgroundPort: number,
  },
  logger: Logger,
  versionNumber: string,
  throwJS3Errors: boolean,
  throwIRIErrors: boolean,  
  DOTContext: Set<IRIDIUM_FG> | undefined
} = {
  operationMode: "analyze",
  cli: {
    allowLangWithSupport: false,
    outputsPath: undefined,
    test262: false,
    sourceType: "unambiguous",
    printModuleGraphPng: false,
    savePTAGraph: false,
    enablePlayground: false,
    playgroundPort: 4000,
  },
  logger: new Logger(),
  versionNumber: "",
  throwJS3Errors: false,
  throwIRIErrors: false,
  DOTContext: undefined
}

export default config;

