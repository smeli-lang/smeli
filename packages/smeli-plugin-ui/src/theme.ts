import { BoolValue, Scope, Vec3 } from "@smeli/core";

export type Theme = {
  is_dark: BoolValue;

  colors: {
    background: Vec3;
    primary: Vec3;
    secondary: Vec3;

    on_background: Vec3;
    on_primary: Vec3;
    on_secondary: Vec3;
  };
};

export const themeCode = `
  default_themes: {
    light: {
      is_dark: false

      colors: {
        background: color_from_hex("#ffffff")
        primary: color_from_hex("#c5e1a5")
        secondary: color_from_hex("#80cbc4")

        on_background: color_from_hex("#000000")
        on_primary: color_from_hex("#000000")
        on_secondary: color_from_hex("#000000")
      }
    }

    dark: {
      is_dark: true

      colors: {
        background: color_from_hex("#121212")
        primary: color_from_hex("#deab54")
        secondary: color_from_hex("#2497c8")

        on_background: color_from_hex("#ffffff")
        on_primary: color_from_hex("#000000")
        on_secondary: color_from_hex("#000000")
      }
    }
  }

  theme: default_themes.light
`;

export function evaluateTheme(scope: Scope): Theme {
  const globalScope = scope.root();
  const uiScope = globalScope.evaluate("ui").as(Scope);
  const theme = uiScope
    .evaluate("theme")
    .as(Scope)
    .evaluateNested({
      is_dark: BoolValue,

      colors: {
        background: Vec3,
        primary: Vec3,
        secondary: Vec3,

        on_background: Vec3,
        on_primary: Vec3,
        on_secondary: Vec3,
      },
    });

  return theme as Theme;
}
