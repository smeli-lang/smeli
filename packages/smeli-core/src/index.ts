import { Engine } from "./engine";
import { TypedValue } from "./types";

const compile = (code: string, plugins: TypedValue[] = []) => {
  return new Engine(code, plugins);
};

export { compile };

export { Scope } from "./scope";
export { TypedValue, TypeDefinition, TypeTraits } from "./types";
