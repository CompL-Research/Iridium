import Logger from "../classes/debugger/Logger";

const config : {
  js3DebugPath: string,
  iridiumDebugPath: string,
  outputsPath: string,
  printModuleGraphPng: boolean,
  includeLibrariesInComponentGraph: boolean,
  resolveImportsToCjs: boolean,
  printTransformedImports: boolean,
  dontColorRootNodes: boolean,
  enablePlayground: boolean,
  playgroundPort: number,
  logger: Logger,
  enableParallelizedImportsGraphCreation: boolean 
} = {
  js3DebugPath: "",
  iridiumDebugPath: "",
  outputsPath: "",
  printModuleGraphPng: false,
  includeLibrariesInComponentGraph: false,
  resolveImportsToCjs: false,
  printTransformedImports: false,
  dontColorRootNodes: false,
  enablePlayground: false,
  playgroundPort: 4000,
  logger: new Logger(),
  enableParallelizedImportsGraphCreation: false
}

export default config;

