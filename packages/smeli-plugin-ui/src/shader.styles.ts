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

  "& .errors": {
    display: "block",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    margin: 0,
    padding: "8px",

    opacity: 0,

    background: "#822",
    color: "rgba(255, 255, 255, 0.87)",
    "white-space": "pre-wrap",
    "overflow-wrap": "break-word",
    "font-size": "0.9em",
  },
});
