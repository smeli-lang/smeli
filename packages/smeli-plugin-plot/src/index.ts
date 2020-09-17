import { view } from "./view";
import { styles } from "./styles";

export type PlotPluginOptions = {};

export const loadPlugin = ({}: PlotPluginOptions = {}) => ({
  name: "plot",
  bindings: [view, styles],
});
