import { Theme } from "./theme";

export const shaderStyles = (theme: Theme) => ({
  display: "flex",
  flex: 1,

  "background-color": theme.colors.background.toCssColor(),
});