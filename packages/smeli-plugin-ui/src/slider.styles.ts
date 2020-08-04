import { Theme } from "./theme";

export const sliderStyles = (theme: Theme) => ({
  display: "flex",
  "flex-direction": "column",
  "justify-content": "center",
  "align-items": "center",

  "& input": {
    display: "block",
    "box-sizing": "border-box",
    margin: 0,
    padding: "2px",
    width: "100%",
    height: "32px",
    "min-height": "32px",

    // browsers override the css color for range inputs
    color: "inherit",

    // background
    "-webkit-appearance": "none",
    "-moz-appearance": "none",
    background: "transparent",
    "border-radius": "16px",
    "border-color": theme.colors.secondary.toCssColor(0),
    transition: "background .2s, border-color .2s",

    "&.override": {
      background: theme.colors.on_background.toCssColor(0.1),
      border: "2px solid " + theme.colors.secondary.toCssColor(1),
      padding: 0,
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

      background: theme.colors.secondary.toCssColor(),
      "box-shadow": "0px 2px 2px #0004",
      "box-sizing": "border-box",
      width: "32px",
      height: "32px",
      "margin-top": "-15px",
      "border-radius": "16px",
      border: "none",
    },

    "&::-moz-range-thumb": {
      background: theme.colors.secondary.toCssColor(),
      "box-shadow": "0px 0px 2px #0004",
      "box-sizing": "border-box",
      width: "32px",
      height: "32px",
      "border-radius": "16px",
      border: "none",
    },

    // track
    "&::-webkit-slider-runnable-track": {
      background: theme.colors.on_background.toCssColor(0.6),
      height: "2px",
      "box-shadow": "0px 2px 2px #0002",
      "border-radius": "2px",
    },

    "&::-moz-range-track": {
      background: theme.colors.on_background.toCssColor(0.6),
      height: "2px",
      "box-shadow": "0px 2px 2px #0002",
      "border-radius": "2px",
    },
  },

  // label
  "& .label": {
    "font-size": "0.6em",
    "margin-top": "8px",
    overflow: "hidden",
    height: "24px",
    "line-height": "24px",
  },

  "& .override + .label": {
    opacity: 0.87,
  },
});
