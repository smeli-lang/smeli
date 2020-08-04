import "katex/dist/katex.min.css";

import { Theme } from "@smeli/plugin-ui";

export const formulaStyles = (theme: Theme) => ({
  display: "flex",
  "flex-direction": "column",
  "justify-content": "center",
  "align-items": "center",
  "text-align": "center",

  "& .katex": {
    "font-size": "48px",
  },
});
