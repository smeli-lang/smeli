import { Theme } from "./theme";

export const surfaceStyles = (theme: Theme) => ({
  display: "flex",
  "box-sizing": "border-box",
  overflow: "hidden",

  "&.direction-row": {
    "flex-direction": "row",
  },
  "&.direction-column": {
    "flex-direction": "column",
    "justify-content": "space-evenly",
  },

  "@media(orientation: portrait)": {
    "&.direction-column.responsive": {
      "flex-direction": "row",
    },
    "&.direction-row.responsive": {
      "flex-direction": "column",
      "justify-content": "space-evenly",
    },
  },

  padding: "var(--gutter)",
  "border-radius": "0px",

  // optional fade animation
  "&.fade": {
    opacity: 0,
    transition: "opacity .5s",
  },

  // elevated surfaces get round corners and a shadow
  "&.elevated": {
    margin: "var(--gutter)",
    "border-radius": "16px",
  },
});
