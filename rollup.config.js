import pkg from './package.json' with { type: 'json' };
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import terser from '@rollup/plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';
import dts from 'rollup-plugin-dts';
import tsc from 'typescript';

function bundle(format, filename, options = {}) {
  return {
    input: 'src/index.ts',
    output: {
      file: filename,
      format: format,
      name: 'cpt2js',
      sourcemap: true,
      banner: `/*!
* Copyright (c) 2022 WeatherLayers.com
*
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/`,
    },
    external: [
      'fs',
      'path',
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        typescript: tsc,
        clean: options.stats,
      }),
      options.minimize ? terser() : false,
      options.stats ? visualizer({
        filename: filename + '.stats.html',
      }) : false,
    ],
  };
}

export default [
  bundle('cjs', pkg.main),
  bundle('es', pkg.module),
  bundle('umd', pkg.browser.replace('.min', ''), { stats: true }),
  bundle('umd', pkg.browser, { minimize: true }),
  {
    input: 'src/index.ts',
    output: {
      file: pkg.types,
      format: 'es',
    },
    plugins: [dts()],
  },
];
