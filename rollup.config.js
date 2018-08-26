import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import babel from 'rollup-plugin-babel';
import pegjs from 'rollup-plugin-pegjs';
import replace from 'rollup-plugin-replace';
import license from 'rollup-plugin-license';
// import builtins from 'rollup-plugin-node-builtins';
import path from 'path';

const pkg = require('./package.json');

const BANNER = `
<%= pkg.name %> - v<%= pkg.version %>
Compiled <%= moment().format() %>

<%= pkg.name %> is licensed under the MIT License.
http://www.opensource.org/licenses/mit-license
`;

export default {
  input: `src/index.js`,
  output: [
    { file: pkg.main, name: 'PIXI.RichText', format: 'umd' },
    { file: pkg.module, format: 'es' },
  ],
  sourcemap: true,
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: ['pixi.js', 'pixi-gl-core'],
  globals: {
    'pixi.js': 'PIXI',
    'pixi-gl-core': 'PIXI.glCore'
  },
  watch: {
    include: 'src/**',
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'VERSION': pkg.version
    }),
    // builtins(),
    // pegjs
    pegjs(),
    // Compile ES6 files
    babel({
      exclude: 'node_modules/**'
    }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve({
      browser: true,
      preferBuiltins: false
    }),

    license({
      banner: BANNER,
      thirdParty: {
        output: path.join(__dirname, 'dist', 'dependencies.txt'),
        includePrivate: false
      }
    }),

    // Resolve source maps to the original source
    sourceMaps(),
  ],
}
