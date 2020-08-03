import { Theme } from "./theme";

export const surfaceStyles = (theme: Theme) => ({
  display: "flex",
  flex: 1,
  overflow: "hidden",

  "&.direction-row": {
    "flex-direction": "row",
  },
  "&.direction-column": {
    "flex-direction": "column",
    "justify-content": "space-evenly",
  },

  "@media(orientation: landscape)": {
    "&.direction-column.responsive": {
      "flex-direction": "row",
    },
  },
  "@media(orientation: portrait)": {
    "&.direction-row.responsive": {
      "flex-direction": "column",
      "justify-content": "space-evenly",
    },
  },

  margin: "0px",
  "border-radius": "0px",

  // optional fade animation
  "&.fade": {
    opacity: 0,
    transition: "opacity .5s",
  },

  // elevated surfaces get round corners and a shadow
  "&.elevated": {
    margin: "16px",
    "border-radius": "16px",
  },

  // surface colors
  "&.color-background": {
    "background-color": theme.colors.background.toCssColor(),
    color: theme.colors.on_background.toCssColor(),
  },
  "&.color-primary": {
    "background-color": theme.colors.primary.toCssColor(),
    color: theme.colors.on_primary.toCssColor(),
  },
  "&.color-secondary": {
    "background-color": theme.colors.secondary.toCssColor(),
    color: theme.colors.on_secondary.toCssColor(),
  },
});
