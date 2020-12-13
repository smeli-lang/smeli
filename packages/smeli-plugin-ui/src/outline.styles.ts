import { Theme } from "./theme";

export const outlineStyles = (theme: Theme) => ({
  "text-align": "center",
  overflow: "hidden",
  "& h1": {
    "font-size": "1.4em",
    margin: "0.4em 0",
    padding: "0",
  },
  "& h2,h3,h4,h5,h6": {
    "font-size": "1.2em",
    margin: "0.2em 0",
    padding: "0",
  },
});
