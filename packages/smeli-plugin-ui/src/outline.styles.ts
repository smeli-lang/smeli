import { Theme } from "./theme";

export const outlineStyles = (theme: Theme) => ({
  "text-align": "center",
  overflow: "hidden",
  "& h1": {
    margin: "16px 0px",
    padding: "0px",
  },
  "& h2,h3,h4,h5,h6": {
    margin: "8px 0px",
    padding: "0px",
  },
});
