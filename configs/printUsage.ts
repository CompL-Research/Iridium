/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk from "chalk";
import debugConfig from "#debugConfig";
import commandLineUsage from "command-line-usage";
import path from "path";
import fs from "fs";

type UsageSectionObject = {
  content?: any;
  raw?: boolean;
  header?: string;
  optionList?: any;
};

//
// General Usage Info
//
const defaultUsageInfo: UsageSectionsArray = [
  {
    header: "=== Iridium ===",
    content: [
      "This project provides infrastructure to allow static analysis of {italic react} based applications.",
      "$ ./iridium <command> [OPTIONS]",
      "$ ./iridium js3 help",
      "$ ./iridium iri help",
      "$ ./iridium help",
    ],
  },
  {
    header: "Command List",
    content: [
      { name: "help", summary: "Display this information." },
      // { name: 'analyze', summary: 'Run static analysis over a project.' },
      { name: "js3", summary: "Generate JS3 file and print to stdout" },
      {
        name: "iri",
        summary: "Generate Iridium file (.iri) and print to stdout",
      },
      { name: "stats", summary: "Codespace stats." },
      { name: "version", summary: "Print the version." },
    ],
  },
];

type UsageSectionsArray = Array<UsageSectionObject>;

//
// === JS3 Related ===
//

const JS3_OPTIONS = [
  {
    name: "outputs-path",
    description:
      "Path to outputs directory (For JS3 this must be an file path).",
    alias: "o",
    type: String,
    typeLabel: "{underline path} ...",
  },
  {
    name: "test-262",
    description:
      "Preserves comments when translating to JS3 (needed for test262 tests to run).",
    alias: "t",
    type: Boolean,
  },
  {
    name: "source-type",
    description: 'Source Type ("module" | "script" | "unambigious" (default)).',
    alias: "s",
    type: String,
  },
  {
    name: "allow-lang-with-support",
    description: "Allow js3 syntax support for `with`",
    alias: "w",
    type: Boolean,
  },
];

export const js3UsageInfo: UsageSectionsArray = [
  {
    header: "=== JS3 ===",
    content: [`$ ./iridium js3 {bold <path-to-js-file>} [OPTIONS]`],
  },
  {
    header: "JS3 Options",
    optionList: [...JS3_OPTIONS],
  },
];

//
// === IRIDIUM Related ===
//

const IRI_OPTIONS = [
  {
    name: "outputs-path",
    description:
      "Path to outputs directory (For JS3 this must be an file path).",
    alias: "o",
    type: String,
    typeLabel: "{underline path} ...",
  },
  {
    name: "test-262",
    description:
      "Preserves comments when translating to JS3 (needed for test262 tests to run).",
    alias: "t",
    type: Boolean,
  },
  {
    name: "source-type",
    description: 'Source Type ("module" | "script" | "unambigious" (default)).',
    alias: "s",
    type: String,
  },
  {
    name: "allow-lang-with-support",
    description: "Allow js3 syntax support for `with`",
    alias: "w",
    type: Boolean,
  },
  {
    name: "save-pta-graph",
    description: "Save generated PTA graphs",
    alias: "g",
    type: Boolean,
  },
];

export const iriUsageInfo: UsageSectionsArray = [
  {
    header: "=== IRI ===",
    content: [`$ ./iridium iri {bold <path-to-js-file>} [OPTIONS]`],
  },
  {
    header: "Iridium Options",
    optionList: [...IRI_OPTIONS],
  },
];

//
// General Exports
//
export const handleOutputsPath = (options: any) => {
  if (options["outputs-path"] === null) {
    console.log(chalk.red("Outputs path not provided"));
    process.exit(1);
  }
  debugConfig.cli.outputsPath = path.resolve("./" + options["outputs-path"]);
};
export const handleProjectBasePath = (options: any) => {
  if (options["base-path"] === null) {
    console.log(chalk.red("Project Base Path"));
    process.exit(1);
  }
  const basePath = options["base-path"];

  if (!fs.existsSync(basePath)) {
    console.error(`[ERROR] Project base path does not exist: ${basePath}`);
    process.exit(1);
  }
};

export const handleTest262 = () => (debugConfig.cli.test262 = true);
export const handleLangWithSupport = () =>
  (debugConfig.cli.allowLangWithSupport = true);
export const handleSavePTAGraph = () => (debugConfig.cli.savePTAGraph = true);

export const handleSourceType = (options: any) => {
  if (options["source-type"] === null) {
    console.log(chalk.red("JS3 mode is not provided"));
    process.exit(1);
  }
  debugConfig.cli.sourceType = options["source-type"];
};

// export const analyzeUsageInfo : UsageSectionsArray = [
//   {
//     header: "=== Analyze ===",
//     content: [
//       `$ ./iridium analyze {bold <path-to-project>} [OPTIONS]`
//     ]
//   },
//   {
//     header: 'Analyze Options',
//     optionList: [
//       ...COMMON_OPTIONS,
//       {
//         name: 'folder',
//         description: 'Specify a folder where the analysis should begin (relative path such as {italic ./app}, {italic ./src}, {italic ./src/pages/}).',
//         alias: 'f',
//         type: String,
//         typeLabel: '{underline path} ...'
//       },
//       {
//         name: 'enable-playground',
//         description: `Enable interactive playground for Iridium (default: ${debugConfig.enablePlayground})`,
//         alias: 'p',
//         type: Boolean,
//       },
//       {
//         name: 'module-graph-png',
//         description: `Save the generated module graph as a png (default: ${debugConfig.cli.printModuleGraphPng})`,
//         type: Boolean,
//       },
//       {
//         name: 'port',
//         description: `The port used by Iridium backend server (Default: ${debugConfig.playgroundPort})`,
//         type: Number,
//       },
//       ...JS3_OPTIONAL_LANGUAGE_SUPPORT
//     ]
//   }
// ]

export function printDefaultUsage(header: string) {
  const sections: UsageSectionsArray = [
    // Sometimes the type system is just annoying
    {
      content: chalk.red(header),
      raw: true,
    },

    ...defaultUsageInfo,
  ];
  const usage = commandLineUsage(sections);
  console.log(usage);
}

// export function printAnalyzeUsage(header: String) {
//   let sections: UsageSectionsArray = [ // Sometimes the type system is just annoying
//     {
//       content: chalk.red(header),
//       raw: true
//     },

//     ...analyzeUsageInfo
//   ]
//   const usage = commandLineUsage(sections)
//   console.log(usage)
// }

export function printJS3Usage(header: string) {
  const sections: UsageSectionsArray = [
    // Sometimes the type system is just annoying
    {
      content: chalk.red(header),
      raw: true,
    },

    ...js3UsageInfo,
  ];
  const usage = commandLineUsage(sections);
  console.log(usage);
}

export function printIRIUsage(header: string) {
  const sections: UsageSectionsArray = [
    // Sometimes the type system is just annoying
    {
      content: chalk.red(header),
      raw: true,
    },

    ...iriUsageInfo,
  ];
  const usage = commandLineUsage(sections);
  console.log(usage);
}
