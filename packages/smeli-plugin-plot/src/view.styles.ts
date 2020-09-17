import { Theme } from "@smeli/plugin-ui";

export const viewStyles = (theme: Theme) => ({
  display: "flex",
  flex: 1,

  "background-color": theme.colors.background.toCssColor(),

  "& canvas": {
    display: "block",
    margin: 0,
    padding: 0,
  },
});
