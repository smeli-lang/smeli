import { Theme } from "./theme";

export const sliderStyles = (theme: Theme) => ({
  // background
  "-webkit-appearance": "none",
  "-moz-appearance": "none",
  margin: "16px",
  height: "32px",
  background: "transparent",

  // thumb (handle)
  "&::-webkit-slider-thumb": {
    "-webkit-appearance": "none",
    "margin-top": "-14px",

    background: theme.colors.secondary,
    border: "1px solid #0002",
    "box-shadow": "0px 4px 8px #0008",
    width: "32px",
    height: "32px",
    "border-radius": "16px",
  },

  "&::-moz-range-thumb": {
    background: theme.colors.secondary,
    border: "1px solid #0002",
    "box-shadow": "0px 4px 8px #0008",
    width: "32px",
    height: "32px",
    "border-radius": "16px",
  },

  // track
  "&::-webkit-slider-runnable-track": {
    background: theme.colors.background,
    height: "8px",
    border: "1px solid #0002",
    "box-shadow": "0px 4px 4px #0004",
    "border-radius": "4px",
  },

  "&::-moz-range-track": {
    background: theme.colors.background,
    height: "8px",
    border: "1px solid #0002",
    "box-shadow": "0px 4px 4px #0004",
    "border-radius": "4px",
  },
});
