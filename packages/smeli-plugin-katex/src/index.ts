import { formula } from "./formula";
import { styles } from "./styles";

export type KatexPluginOptions = {};

export const loadPlugin = ({}: KatexPluginOptions = {}) => ({
  name: "katex",
  bindings: [formula, styles],
});
