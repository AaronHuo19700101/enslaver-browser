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
      runtimeHelpers: true,

      presets: [
        "@babel/preset-env"
      ],

      plugins: [
        "@babel/plugin-proposal-class-properties",
        "@babel/plugin-transform-runtime"
      ]
    }),
    uglify(),
  ],
}
