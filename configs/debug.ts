import { IRIDIUM_FG } from "classes/builder/IridiumHelpers/I_GENERAL/IRIDIUM_FG.ts";
import Logger from "../classes/debugger/Logger.ts";

const config: {
  operationMode: "js3" | "iri" | "pika";
  cli: {
    allowLangWithSupport: boolean;
    outputsPath: string;
    comments: boolean;
    tout: boolean;
    sourceType: string;
    projectBase: string;
  };
  logger: Logger;
  versionNumber: string;
  DOTContext: Set<IRIDIUM_FG> | undefined;
} = {
  operationMode: "js3",
  cli: {
    allowLangWithSupport: false,
    outputsPath: undefined,
    comments: false,
    tout: false,
    sourceType: "unambiguous",
    projectBase: undefined,
  },
  logger: new Logger(),
  versionNumber: "",
  DOTContext: undefined,
};

export default config;
