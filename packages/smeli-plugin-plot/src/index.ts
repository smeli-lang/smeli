import { angle } from "./angle";
import { circle } from "./circle";
import { functionItem } from "./function";
import { grid } from "./grid";
import { label } from "./label";
import { point } from "./point";
import { polygon } from "./polygon";
import { vector } from "./vector";
import { view } from "./view";
import { styles } from "./styles";

export type PlotPluginOptions = {};

export const loadPlugin = ({}: PlotPluginOptions = {}) => ({
  name: "plot",
  bindings: [
    angle,
    circle,
    functionItem,
    grid,
    label,
    point,
    polygon,
    vector,
    view,
    styles,
  ],
});
