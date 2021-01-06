// rollup.config.js
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import typescript from "@rollup/plugin-typescript";
import sveltePreprocess from "svelte-preprocess";
import postcss from 'rollup-plugin-postcss';
import path from "path";
import fs from "fs";
////import { terser } from "rollup-plugin-terser";


function typeCheck() {

    return {
      writeBundle() {
        require('child_process').spawn('svelte-check', {
          stdio: ['ignore', 'inherit', 'inherit'],
          shell: true
        });
      }
    };
  }
  const production = !process.env.ROLLUP_WATCH;


export default fs
.readdirSync(path.join(__dirname, "webviews", "panels"))
.map((input) => {
  const name = input.split(".")[0];
  console.log(name);
  return {
  input: 'webviews/panels/' + name + '/index.ts',
  output: {
    file: 'out/' + name + '/' +  'bundle.js',
    format: 'iife'
  },
  plugins: [
    typeCheck(),
    typescript({tsconfig : "webviews/tsconfig.json", sourceMap: !production }),
    svelte({
      preprocess: sveltePreprocess(),
      dev: !production,
    }),
    postcss({
      extract: true,
      // Or with custom file name, it will generate file relative to bundle.js in v3
      extract:    'style.css',
      inject: false,
      plugins: []
    }),
    resolve({ browser: true,
			dedupe: ['svelte'] }),

    // ...
  ]
  };
}
);