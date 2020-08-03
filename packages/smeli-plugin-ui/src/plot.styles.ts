import { Theme } from "./theme";

export const plotStyles = (theme: Theme) => ({
  "background-color": theme.colors.background.toCssColor(),
  flex: 1,
});
