import {
  Scope,
  Binding,
  evaluate,
  currentEvaluationContext,
} from "@smeli/core";
import { evaluateTheme, DomStyles } from "@smeli/plugin-ui";

import { formulaStyles } from "./formula.styles";

export const styles: Binding = {
  name: "#styles",
  evaluate: () => {
    const theme = evaluateTheme();

    return new DomStyles({
      formula: formulaStyles(theme),
    });
  },
};

export const evaluateKatexStyles = () => {
  const context = currentEvaluationContext();
  const globalScope = context.as(Scope).root();
  const katexScope = evaluate("katex", globalScope).as(Scope);
  const styles = evaluate("#styles", katexScope).as(DomStyles);
  return styles.sheet.classes;
};
