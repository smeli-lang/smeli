import { editor } from "./editor";
import { styles } from "./styles";

export type AcePluginOptions = {};

export const loadPlugin = ({}: AcePluginOptions = {}) => ({
  name: "ace",
  bindings: [editor, styles],
});
