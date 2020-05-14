import { Scope, ScopeType, Binding } from "@smeli/core";
import { DomStyles, DomStylesType } from "./types";
import { defaultThemeLight } from "./theme";

import { containerStyles } from "./container.styles";
import { layoutStyles } from "./layout.styles";
import { outlineStyles } from "./outline.styles";
import { plotStyles } from "./plot.styles";
import { sliderStyles } from "./slider.styles";
import { textStyles } from "./text.styles";

export const styles: Binding = {
  name: "#styles",
  evaluate: (scope: Scope) => {
    // next step: evaluate theme from scope here
    const theme = defaultThemeLight;

    return new DomStyles({
      container: containerStyles(theme),
      layout: layoutStyles(theme),
      outline: outlineStyles(theme),
      plot: plotStyles(theme),
      slider: sliderStyles(theme),
      text: textStyles(theme),
    });
  },
};

export const evaluateUiStyles = (scope: Scope) => {
  const globalScope = scope.root();
  const uiScope = globalScope.evaluate("ui", ScopeType) as Scope;
  const styles = uiScope.evaluate("#styles", DomStylesType) as DomStyles;
  return styles.sheet.classes;
};
