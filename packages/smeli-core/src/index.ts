import { Engine } from "./engine";
import { TypeTraits } from "./types";

export * from "./scope";
export * from "./types";

const load = (code: string, plugins: TypeTraits[] = []) => {
  return new Engine(code, plugins);
};

export { load };
