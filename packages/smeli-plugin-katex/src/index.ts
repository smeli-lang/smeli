import { formula } from "./formula";
import { styles } from "./styles";
import { transpile } from "./transpile";

export type KatexPluginOptions = {};

export const loadPlugin = ({}: KatexPluginOptions = {}) => ({
  name: "katex",
  bindings: [formula, styles, transpile],
});
