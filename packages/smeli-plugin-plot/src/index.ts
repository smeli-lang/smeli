import { functionItem } from "./function";
import { grid } from "./grid";
import { point } from "./point";
import { view } from "./view";
import { styles } from "./styles";

export type PlotPluginOptions = {};

export const loadPlugin = ({}: PlotPluginOptions = {}) => ({
  name: "plot",
  bindings: [functionItem, grid, point, view, styles],
});
