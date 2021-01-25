import { Engine } from "./engine";
import { PluginDefinition } from "./plugins";

export * from "./ast";
export * from "./debug";
export * from "./override";
export * from "./scope";
export * from "./types";
export * from "./traits";

export { PluginDefinition } from "./plugins";

export { currentEvaluationContext, evaluate } from "./cache";
export { stringify } from "./stringify";

export type SmeliOptions = {
  code?: string;
  plugins?: PluginDefinition[];
};

export const smeli = ({ code = "", plugins = [] }: SmeliOptions) => {
  return new Engine(code, plugins);
};
