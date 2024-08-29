import Logger from "../classes/debugger/Logger.ts";

const config : {
  js3DebugPath: string,
  js3ResultPath: string | undefined,
  iridiumDebugPath: string,
  outputsPath: string,
  printModuleGraphPng: boolean,
  enablePlayground: boolean,
  playgroundPort: number,
  logger: Logger,
  versionNumber: string,
  throwJS3Errors: boolean,
  js3SourceType: string
} = {
  js3DebugPath: "./outputs/JS3",
  js3ResultPath: undefined,
  iridiumDebugPath: "./outputs/IRIDIUM",
  outputsPath: "./outputs",
  printModuleGraphPng: false,
  enablePlayground: false,
  playgroundPort: 4000,
  logger: new Logger(),
  versionNumber: "",
  throwJS3Errors: false,
  js3SourceType: "unambiguous"
}

export default config;

