import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';

module.exports = {
  input: 'src/index.js',

  output: {
    format: 'cjs',

    file: 'index.js',
  },

  plugins: [
    babel({
      exclude: 'node_modules',
    }),
    uglify(),
  ],
}