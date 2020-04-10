export type Theme = {
  colors: {
    background: string;
    primary: string;
    secondary: string;

    onBackground: string;
    onPrimary: string;
    onSecondary: string;
  };
};

export const defaultThemeLight: Theme = {
  colors: {
    background: "#ffffff",
    primary: "#c5e1a5",
    secondary: "#80cbc4",

    onBackground: "#000000",
    onPrimary: "#000000",
    onSecondary: "#000000"
  }
};

/*export const defaultThemeDark: Theme = {
  colors: {
    background: "#121212"
  }
};*/
