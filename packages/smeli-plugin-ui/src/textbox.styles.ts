import { Theme } from "./theme";

export const textboxStyles = (theme: Theme) => ({
  display: "flex",
  "flex-direction": "column",
  "justify-content": "center",
  "align-items": "center",
  "text-align": "center",

  "& > p": {
    margin: 0,
    padding: 0,
  },
});
