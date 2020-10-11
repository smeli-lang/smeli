import { Theme } from "./theme";

export const shaderStyles = (theme: Theme) => ({
  display: "flex",
  flex: 1,
  position: "relative",

  "& canvas": {
    display: "block",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
