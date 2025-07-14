import json from '@rollup/plugin-json';

import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';

export default [
  // ESM JavaScript output
  {
    input: 'iridium.ts',
    output: {
      file: 'dist/iridium.js',
      format: 'esm',
      sourcemap: true,
    },
    external: [
      'fs', 'path', 'os', 'chalk',
      '@babel/core',
      '@babel/preset-env',
      '@babel/preset-react',
      '@babel/preset-typescript',
      '@babel/types',
      '@babel/generator',
      '@babel/traverse',
      '@babel/parser',
      'typescript'
    ],
    plugins: [
      json(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        exclude: ['playground/**', 'classes/builder/IridiumHelpers/**', 'classes/worker/**', 'externalDeps/**']
      }),
    ],
  },

  // Type declarations
  {
    input: 'iridium.ts',
    output: {
      file: 'dist/iridium.d.ts',
      format: 'es',
    },
    plugins: [
      dts({
        exclude: ['playground/**'],
      }),
    ],
  }
];