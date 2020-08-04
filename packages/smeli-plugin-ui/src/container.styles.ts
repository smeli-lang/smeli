import { Theme } from "./theme";

export const containerStyles = (theme: Theme) => ({
  "background-color": theme.colors.background.toCssColor(),
  color: theme.colors.on_background.toCssColor(),
  "font-family": "verdana",
  "font-size": "32px",

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
    margin: "8px",
  },

  // common container styles
  "& .container": {
    margin: 0,
  },

  "& .direction-row > .container": {
    "margin-block-start": "-8px",
    "margin-block-end": "-8px",
    "margin-inline-start": 0,
    "margin-inline-end": 0,

    "&:first-child": {
      "margin-inline-start": "-8px",
    },

    "&:last-child": {
      "margin-inline-end": "-8px",
    },
  },

  "& .direction-column > .container": {
    "margin-inline-start": "-8px",
    "margin-inline-end": "-8px",
    "margin-block-start": 0,
    "margin-block-end": 0,

    "&:first-child": {
      "margin-block-start": "-8px",
    },

    "&:last-child": {
      "margin-block-end": "-8px",
    },
  },

  "@media(orientation: portrait)": {
    "& .direction-column.responsive > .container": {
      "margin-block-start": "-8px",
      "margin-block-end": "-8px",
      "margin-inline-start": 0,
      "margin-inline-end": 0,

      "&:first-child": {
        "margin-inline-start": "-8px",
      },

      "&:last-child": {
        "margin-inline-end": "-8px",
      },
    },

    "& .direction-row.responsive > .container": {
      "margin-inline-start": "-8px",
      "margin-inline-end": "-8px",
      "margin-block-start": 0,
      "margin-block-end": 0,

      "&:first-child": {
        "margin-block-start": "-8px",
      },

      "&:last-child": {
        "margin-block-end": "-8px",
      },
    },
  },
});
