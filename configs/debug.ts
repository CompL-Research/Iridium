import Logger from "../classes/debugger/Logger.ts";

const config : {
  operationMode: "analyze" | "js3" | "iri",
  outputsPath: string,
  printModuleGraphPng: boolean,
  enablePlayground: boolean,
  playgroundPort: number,
  logger: Logger,
  versionNumber: string,
  throwJS3Errors: boolean,
  throwIRIErrors: boolean,
  js3SourceType: string,
  allowLangWithSupport: boolean
} = {
  operationMode: "analyze",
  outputsPath: "",
  printModuleGraphPng: false,
  enablePlayground: false,
  playgroundPort: 4000,
  logger: new Logger(),
  versionNumber: "",
  throwJS3Errors: false,
  throwIRIErrors: false,
  js3SourceType: "unambiguous",
  allowLangWithSupport: false
}

export default config;

