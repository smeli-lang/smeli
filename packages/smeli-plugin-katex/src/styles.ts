import { Scope, Binding } from "@smeli/core";
import { defaultThemeLight, DomStyles } from "@smeli/plugin-ui";

import { formulaStyles } from "./formula.styles";

export const styles: Binding = {
  name: "#styles",
  evaluate: (scope: Scope) => {
    // next step: evaluate theme from scope here
    const theme = defaultThemeLight;

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
