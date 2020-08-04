import { Theme } from "./theme";

export const plotStyles = (theme: Theme) => ({
  display: "flex",
  flex: 1,

  "background-color": theme.colors.background.toCssColor(),

  "& canvas": {
    display: "block",
    margin: 0,
    padding: 0,
  },
});
