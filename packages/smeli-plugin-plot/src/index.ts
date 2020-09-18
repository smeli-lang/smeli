import { angle } from "./angle";
import { functionItem } from "./function";
import { grid } from "./grid";
import { point } from "./point";
import { polygon } from "./polygon";
import { view } from "./view";
import { styles } from "./styles";

export type PlotPluginOptions = {};

export const loadPlugin = ({}: PlotPluginOptions = {}) => ({
  name: "plot",
  bindings: [angle, functionItem, grid, point, polygon, view, styles],
});
