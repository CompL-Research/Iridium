import Logger from "../classes/debugger/Logger.ts";

const config : {
  js3DebugPath: string,
  iridiumDebugPath: string,
  outputsPath: string,
  printModuleGraphPng: boolean,
  enablePlayground: boolean,
  playgroundPort: number,
  logger: Logger,
  versionNumber: string,
} = {
  js3DebugPath: "",
  iridiumDebugPath: "",
  outputsPath: "",
  printModuleGraphPng: false,
  enablePlayground: false,
  playgroundPort: 4000,
  logger: new Logger(),
  versionNumber: "",
}

export default config;

