import { Theme } from "./theme";

export const sliderStyles = (theme: Theme) => ({
  // background
  "-webkit-appearance": "none",
  "-moz-appearance": "none",
  margin: "12px",
  padding: "4px",
  height: "32px",
  background: "transparent",
  "border-radius": "16px",
  "border-color": theme.colors.primary + "00",
  transition: "background .2s, border-color .2s",

  "&.override": {
    background: "#0002",
    //"box-shadow": "0px 4px 8px #0008",
    margin: "10px",
    border: "2px solid " + theme.colors.primary,
  },

  "&:focus": {
    outline: "none",
  },

  "&::-moz-focus-outer": {
    border: 0,
  },

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
