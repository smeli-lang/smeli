import { Engine } from "./engine";
import { PluginDefinition } from "./plugins";

export * from "./scope";
export * from "./types";
export { PluginDefinition } from "./plugins";

export type SmeliOptions = {
  code?: string;
  plugins?: PluginDefinition[];
};

export const smeli = ({ code = "", plugins = [] }: SmeliOptions) => {
  return new Engine(code, plugins);
};
