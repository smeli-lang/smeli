import pug from "rollup-plugin-pug";
import ts from "@wessberg/rollup-plugin-ts";
import { terser } from "rollup-plugin-terser";

const makeRollupLibrary = (pkg, name) => ({
  input: "src/index.ts",
  plugins: [pug(), ts(), terser()],
  output: [
    // UMD for browser and node
    {
      file: pkg.main,
      format: "umd",
      name,
      globals: {
        "@smeli/core": "smeli"
      }
    },

    // ES module
    {
      file: pkg.module,
      format: "es"
    }
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {})
  ]
});

export { makeRollupLibrary };
