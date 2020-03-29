import { Engine } from "./engine";
import { PluginDefinition } from "./plugins";

export * from "./scope";
export * from "./types";
export { PluginDefinition } from "./plugins";

const load = (code: string, plugins: PluginDefinition[] = []) => {
  return new Engine(code, plugins);
};

export { load };
