import { Engine } from "./engine";
import { TypedValue } from "./types";

export { Scope } from "./scope";
export * from "./types";

const smeli = (code: string, plugins: TypedValue[] = []) => {
  return new Engine(code, plugins);
};

export default smeli;

// this small exports hack improves DX for the consumers of the library
// it allows to call the entry point directly with the shorthand form:
// const engine = smeli("code", [plugins])

const namedExports = module.exports;

module.exports = smeli;
for (const name in namedExports) {
  module.exports[name] = namedExports[name];
}
