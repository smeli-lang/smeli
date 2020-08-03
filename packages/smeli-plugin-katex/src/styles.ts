import { Scope, Binding } from "@smeli/core";
import { evaluateTheme, DomStyles } from "@smeli/plugin-ui";

import { formulaStyles } from "./formula.styles";

export const styles: Binding = {
  name: "#styles",
  evaluate: (scope: Scope) => {
    const theme = evaluateTheme(scope);

    return new DomStyles({
      formula: formulaStyles(theme),
    });
  },
};

export const evaluateKatexStyles = (scope: Scope) => {
  const globalScope = scope.root();
  const uiScope = globalScope.evaluate("katex").as(Scope);
  const styles = uiScope.evaluate("#styles").as(DomStyles);
  return styles.sheet.classes;
};
