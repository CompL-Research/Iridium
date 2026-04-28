import { ProjectFile } from "../ProjectFile";
import { gen$JS3 } from "./JS3Helpers/HandleProgram";
import { generateJS3File } from "./JS3Helpers/JS3Constructors";
import {
  JS3AllowedBlockStatement,
  JS3File,
  JS3Program_body,
} from "./JS3Helpers/JS3Types";
import _generate from "@babel/generator";
const generate = (_generate as any).default || _generate;

export type JS3BuilderUtils = {
  iridiumArgContext: boolean;
  others?: {
    holder: JS3Program_body | Array<JS3AllowedBlockStatement> | null;
    prefix?: string;
  };
};

export default class JS3Builder {
  projectFile: ProjectFile;

  utils: JS3BuilderUtils = {
    iridiumArgContext: false,
  };

  constructor(file: ProjectFile) {
    this.projectFile = file;
  }

  build() {
    const info = this.projectFile.info;
    const file = this.projectFile.getBabelPayload();
    const js3Program = gen$JS3(
      file.program,
      this.utils,
      this.projectFile,
    );
    if (!js3Program) {
      return;
    }
    const js3Payload = generateJS3File(js3Program, file);
    this.projectFile.payload.js3 = js3Payload;
    info.js3 = "transformed";

    const js3Str = this.genCodeString(js3Payload);
    if (!js3Str) {
      return;
    }
    this.projectFile.payload.js3CodeString = js3Str;
    info.js3 = "parsed";
  }

  genCodeString(file: JS3File): string | null {
    try {
      const res = generate(file, {
        sourceMaps: false,
        comments: false,
        compact: true,
        minified: true,
        jsescOption: {
          minimal: true,
        },
      });
      return res.code;
    } catch (e) {
      this.projectFile.errLog.push(e);
      return null;
    }
  }
}
