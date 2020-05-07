import "katex/dist/katex.min.css";

import { Theme } from "./theme";

export const formulaStyles = (theme: Theme) => ({
  "text-align": "center",
  margin: "16px",
  "& .katex": {
    "font-size": "64px",
  },
});
