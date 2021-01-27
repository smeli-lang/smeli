import {
  Scope,
  Binding,
  currentEvaluationContext,
  evaluate,
} from "@smeli/core";
import { evaluateTheme, DomStyles } from "@smeli/plugin-ui";

import { viewStyles } from "./view.styles";

export const styles: Binding = {
  name: "#styles",
  evaluate: () => {
    const theme = evaluateTheme();

    return new DomStyles({
      view: viewStyles(theme),
    });
  },
};

export const evaluatePlotStyles = () => {
  const context = currentEvaluationContext();
  const globalScope = context.as(Scope).root();
  const plotScope = evaluate("plot", globalScope).as(Scope);
  const styles = evaluate("#styles", plotScope).as(DomStyles);
  return styles.sheet.classes;
};
