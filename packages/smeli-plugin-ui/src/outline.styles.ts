import { Theme } from "./theme";

export const outlineStyles = (theme: Theme) => ({
  "text-align": "center",
  padding: "32px",
  flex: 1,
  overflow: "hidden",
  "& h1": {
    margin: "0px",
    "margin-top": "32px",
    padding: "0px",
  },
  "& h2,h3,h4,h5,h6": {
    margin: "16px",
    padding: "0px",
  },
  "& h2": {
    "margin-left": "32px",
  },
  "& h3": {
    "margin-left": "64px",
  },
  "& h4": {
    "margin-left": "96px",
  },
  "& h5": {
    "margin-left": "128px",
  },
  "& h6": {
    "margin-left": "160px",
  },
});
