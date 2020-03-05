import { Engine } from "./engine";
import { TypedValue } from "./types";

export { Scope } from "./scope";
export * from "./types";

const load = (code: string, plugins: TypedValue[] = []) => {
  return new Engine(code, plugins);
};

export { load };
