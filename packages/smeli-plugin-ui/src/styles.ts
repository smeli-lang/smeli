import {
  Binding,
  currentEvaluationContext,
  evaluate,
  Scope,
} from "@smeli/core";
import { DomStyles } from "./types";
import { evaluateTheme } from "./theme";

import { containerStyles } from "./container.styles";
import { outlineStyles } from "./outline.styles";
import { shaderStyles } from "./shader.styles";
import { sliderStyles } from "./slider.styles";
import { stackStyles } from "./stack.styles";
import { surfaceStyles } from "./surface.styles";
import { textboxStyles } from "./textbox.styles";

export const styles: Binding = {
  name: "#styles",
  evaluate: () => {
    const theme = evaluateTheme();

    return new DomStyles({
      container: containerStyles(theme),
      outline: outlineStyles(theme),
      shader: shaderStyles(theme),
      slider: sliderStyles(theme),
      stack: stackStyles(theme),
      surface: surfaceStyles(theme),
      textbox: textboxStyles(theme),
    });
  },
};

export const evaluateUiStyles = () => {
  const context = currentEvaluationContext();
  const globalScope = context.as(Scope).root();
  const uiScope = evaluate("ui", globalScope).as(Scope);
  const styles = evaluate("#styles", uiScope).as(DomStyles);
  return styles.sheet.classes;
};
