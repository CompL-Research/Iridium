import chalk from 'chalk'
import debugConfig from "#debugConfig"
import commandLineUsage from 'command-line-usage'

type UsageSectionObject = {
  content?: any,
  raw?: boolean,
  header?: String,
  optionList?: any
}
type UsageSectionsArray = Array<UsageSectionObject>

const COMMON_OPTIONS = [
  {
    name: 'outputs-path',
    description: 'Path to outputs directory (For JS3 this must be an file path).',
    alias: 'o',
    type: String,
    typeLabel: '{underline path} ...'
  },
]

const JS3_OPTIONAL_LANGUAGE_SUPPORT = [
  {
    name: 'allow-lang-with-support',
    description: 'Allow js3 syntax support for `with`',
    type: Boolean
  }
]

const defaultUsageInfo : UsageSectionsArray = [
  {
    header: "=== Iridium ===",
    content: [
      'This project provides infrastructure to allow static analysis of {italic react} based applications.',
      '$ ./iridium <command> [OPTIONS]',
      '$ ./iridium help'
    ]
  },
  {
    header: 'Command List',
    content: [
      { name: 'help', summary: 'Display this information.' },
      { name: 'analyze', summary: 'Run static analysis over a project.' },
      { name: 'js3', summary: 'Generate JS3 file and print to stdout' },
      { name: 'iri', summary: 'Generate Iridium file (.iri) and print to stdout' },
      { name: 'stats', summary: 'Codespace stats.' },
      { name: 'version', summary: 'Print the version.' }
    ]
  },
]

export const analyzeUsageInfo : UsageSectionsArray = [
  {
    header: "=== Analyze ===",
    content: [
      `$ ./iridium analyze {bold <path-to-project>} [OPTIONS]`
    ]
  },
  {
    header: 'Analyze Options',
    optionList: [
      ...COMMON_OPTIONS,
      {
        name: 'folder',
        description: 'Specify a folder where the analysis should begin (relative path such as {italic ./app}, {italic ./src}, {italic ./src/pages/}).',
        alias: 'f',
        type: String,
        typeLabel: '{underline path} ...'
      },
      {
        name: 'enable-playground',
        description: `Enable interactive playground for Iridium (default: ${debugConfig.enablePlayground})`,
        alias: 'p',
        type: Boolean,
      },
      {
        name: 'module-graph-png',
        description: `Save the generated module graph as a png (default: ${debugConfig.printModuleGraphPng})`,
        type: Boolean,
      },
      {
        name: 'port',
        description: `The port used by Iridium backend server (Default: ${debugConfig.playgroundPort})`,
        type: Number,
      },
      ...JS3_OPTIONAL_LANGUAGE_SUPPORT
    ]
  }
]

export const js3UsageInfo : UsageSectionsArray= [
  {
    header: "=== JS3 ===",
    content: [
      `$ ./iridium js3 {bold <path-to-js-file>} [OPTIONS]`
    ]
  },
  {
    header: 'JS3 Options',
    optionList: [
      ...COMMON_OPTIONS,
      {
        name: 'source-type',
        description: 'Source Type ("module" | "script" | "unambigious" (default)).',
        alias: 's',
        type: String
      },
      ...JS3_OPTIONAL_LANGUAGE_SUPPORT
    ]
  }
]

export const iriUsageInfo : UsageSectionsArray= [
  {
    header: "=== IRI ===",
    content: [
      `$ ./iridium iri {bold <path-to-js-file>} [OPTIONS]`
    ]
  },
  {
    header: 'Iridium Options',
    optionList: [
      ...COMMON_OPTIONS,
      {
        name: 'source-type',
        description: 'Source Type ("module" | "script" | "unambigious" (default)).',
        alias: 's',
        type: String
      },
      ...JS3_OPTIONAL_LANGUAGE_SUPPORT
    ]
  }
]

export function printDefaultUsage(header: String) {
  let sections: UsageSectionsArray = [ // Sometimes the type system is just annoying
    {
      content: chalk.red(header),
      raw: true
    },
    
    ...defaultUsageInfo,
  ]
  const usage = commandLineUsage(sections)
  console.log(usage)
}

export function printAnalyzeUsage(header: String) {
  let sections: UsageSectionsArray = [ // Sometimes the type system is just annoying
    {
      content: chalk.red(header),
      raw: true
    },

    ...analyzeUsageInfo
  ]
  const usage = commandLineUsage(sections)
  console.log(usage)
}

export function printJS3Usage(header: String) {
  let sections: UsageSectionsArray = [ // Sometimes the type system is just annoying
    {
      content: chalk.red(header),
      raw: true
    },

    ...js3UsageInfo
  ]
  const usage = commandLineUsage(sections)
  console.log(usage)
}

export function printIRIUsage(header: String) {
  let sections: UsageSectionsArray = [ // Sometimes the type system is just annoying
    {
      content: chalk.red(header),
      raw: true
    },

    ...iriUsageInfo
  ]
  const usage = commandLineUsage(sections)
  console.log(usage)
}
