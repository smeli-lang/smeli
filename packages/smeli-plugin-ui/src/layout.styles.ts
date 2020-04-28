import { Theme } from "./theme";

export const layoutStyles = (theme: Theme) => ({
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
    "&.direction-responsive_row": {
      "flex-direction": "row",
    },
  },
  "@media(orientation: portrait)": {
    "&.direction-responsive_row": {
      "flex-direction": "column",
      "justify-content": "space-evenly",
    },
  },

  // surfaces have rounded corners; set it by default
  // and discard if surface is "none"
  margin: "16px",
  "border-radius": "16px",

  "&.surface-none": {
    margin: "0px",
    "border-radius": "0px",
  },

  // surface colors
  "&.surface-background": {
    "background-color": theme.colors.background,
    color: theme.colors.onBackground,
  },
  "&.surface-primary": {
    "background-color": theme.colors.primary,
    color: theme.colors.onPrimary,
  },
  "&.surface-secondary": {
    "background-color": theme.colors.secondary,
    color: theme.colors.onSecondary,
  },
});
