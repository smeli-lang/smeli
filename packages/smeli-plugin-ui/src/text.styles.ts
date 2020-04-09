import { Theme } from "./theme";

export const textStyles = (theme: Theme) => ({
  "& .important": {
    opacity: 0.87
  },
  "& .normal": {
    opacity: 0.6
  },
  "& .disabled": {
    opacity: 0.38
  }
});
