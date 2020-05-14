import "katex/dist/katex.min.css";

import { Theme } from "@smeli/plugin-ui";

export const formulaStyles = (theme: Theme) => ({
  "text-align": "center",
  margin: "16px",
  "& .katex": {
    "font-size": "64px",
  },
});
