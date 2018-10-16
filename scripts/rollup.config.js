import path from 'path'
import { readJSONSync } from 'fs-extra'
import json from 'rollup-plugin-json'
import commonjs from 'rollup-plugin-commonjs'
import license from 'rollup-plugin-license'
import defaultsDeep from 'lodash/defaultsDeep'

import { builtins } from './builtins'

export default function rollupConfig({
  rootDir = process.cwd(),
  plugins = [],
  input = 'src/index.js',
  ...options
}, pkg) {
  if (!pkg) {
    pkg = readJSONSync(path.resolve(rootDir, 'package.json'))
  }

  return defaultsDeep({}, options, {
    input: path.resolve(rootDir, input),
    output: {
      format: 'cjs',
      sourcemap: false,
      file: `${pkg.name.replace('-edge', '')}.js`,
      dir: path.resolve(rootDir, 'dist')
    },
    external: [
      // Dependencies that will be installed alongise with the nuxt package
      ...Object.keys(pkg.dependencies || {}),
      // Builtin node modules
      ...builtins,
      // Dependencies of nuxt-legacy
      '@babel/polyfill'
    ],
    plugins: [
      commonjs(),
      json(),
      license({
        banner: [
          `/*!`,
          ` * ${pkg.name} v${pkg.version} (c) 2016-${new Date().getFullYear()}`,
          `${(pkg.contributors || []).map(c => ` * - ${c.name}`).join('\n')}`,
          ` * - All the amazing contributors`,
          ` * Released under the MIT License.`,
          ` * Website: https://nuxtjs.org`,
          `*/`
        ].join('\n')
      })
    ].concat(plugins)
  })
}