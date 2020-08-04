import { Binding, Scope } from "@smeli/core";
import { DomStyles } from "./types";
import { evaluateTheme } from "./theme";

import { containerStyles } from "./container.styles";
import { outlineStyles } from "./outline.styles";
import { plotStyles } from "./plot.styles";
import { sliderStyles } from "./slider.styles";
import { surfaceStyles } from "./surface.styles";
import { textboxStyles } from "./textbox.styles";

export const styles: Binding = {
  name: "#styles",
  evaluate: (scope: Scope) => {
    const theme = evaluateTheme(scope);

    return new DomStyles({
      container: containerStyles(theme),
      outline: outlineStyles(theme),
      plot: plotStyles(theme),
      slider: sliderStyles(theme),
      surface: surfaceStyles(theme),
      textbox: textboxStyles(theme),
    });
  },
};

export const evaluateUiStyles = (scope: Scope) => {
  const globalScope = scope.root();
  const uiScope = globalScope.evaluate("ui").as(Scope);
  const styles = uiScope.evaluate("#styles").as(DomStyles);
  return styles.sheet.classes;
};
