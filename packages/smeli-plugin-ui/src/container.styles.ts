import { Theme } from "./theme";

export const containerStyles = (theme: Theme) => ({
  "background-color": theme.colors.background,
  "font-family": "verdana",
  "font-size": "32px",
  margin: 0,
  padding: 0,
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  display: "flex",
  "flex-direction": "column"
});
