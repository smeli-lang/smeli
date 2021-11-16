import { Theme } from "./theme";

export const containerStyles = (theme: Theme) => ({
  "--fluid-ratio": "calc((100vw - 300px) / 700)",

  "background-color": theme.colors.background.toCssColor(
    theme.background_opacity.value
  ),
  color: theme.colors.on_background.toCssColor(),
  "font-family": "verdana",
  "font-size": "clamp(16px, calc(16px + 8 * var(--fluid-ratio)), 24px)",

  "--gutter": "clamp(4px, calc(2px + 4 * var(--fluid-ratio)), 8px)",
  "--negative-gutter": "calc(var(--gutter) * -1)",

  display: "flex",
  "flex-direction": "column",
  padding: 0,

  // common text styles
  "& .important": {
    opacity: 0.87,
  },
  "& .normal": {
    opacity: 0.6,
  },
  "& .disabled": {
    opacity: 0.38,
  },

  // common widget styles
  "& .widget": {
    flex: "1 0",
    "box-sizing": "border-box",
    margin: "var(--gutter)",
  },

  // common container styles
  "& .container": {
    margin: 0,
  },

  "& .direction-row > .container": {
    "margin-block-start": "var(--negative-gutter)",
    "margin-block-end": "var(--negative-gutter)",
    "margin-inline-start": 0,
    "margin-inline-end": 0,

    "&:first-child": {
      "margin-inline-start": "var(--negative-gutter)",
    },

    "&:last-child": {
      "margin-inline-end": "var(--negative-gutter)",
    },
  },

  "& .direction-column > .container": {
    "margin-inline-start": "var(--negative-gutter)",
    "margin-inline-end": "var(--negative-gutter)",
    "margin-block-start": 0,
    "margin-block-end": 0,

    "&:first-child": {
      "margin-block-start": "var(--negative-gutter)",
    },

    "&:last-child": {
      "margin-block-end": "var(--negative-gutter)",
    },
  },

  "@media(orientation: portrait)": {
    "& .direction-column.responsive > .container": {
      "margin-block-start": "var(--negative-gutter)",
      "margin-block-end": "var(--negative-gutter)",
      "margin-inline-start": 0,
      "margin-inline-end": 0,

      "&:first-child": {
        "margin-inline-start": "var(--negative-gutter)",
      },

      "&:last-child": {
        "margin-inline-end": "var(--negative-gutter)",
      },
    },

    "& .direction-row.responsive > .container": {
      "margin-inline-start": "var(--negative-gutter)",
      "margin-inline-end": "var(--negative-gutter)",
      "margin-block-start": 0,
      "margin-block-end": 0,

      "&:first-child": {
        "margin-block-start": "var(--negative-gutter)",
      },

      "&:last-child": {
        "margin-block-end": "var(--negative-gutter)",
      },
    },
  },
});
