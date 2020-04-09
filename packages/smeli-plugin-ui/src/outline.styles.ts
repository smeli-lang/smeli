import { Theme } from "./theme";

export const outlineStyles = (theme: Theme) => ({
  "background-color": theme.colors.background,
  "& h1": {
    color: "#f00"
  }
});
