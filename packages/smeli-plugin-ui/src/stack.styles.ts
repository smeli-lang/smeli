import { Theme } from "./theme";

export const stackStyles = (theme: Theme) => ({
  position: "relative",
  display: "flex",
  flex: 1,
  margin: 0,
  padding: 0,

  "& > .layer": {
    display: "flex",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
