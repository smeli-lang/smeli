import { Scope, Binding } from "@smeli/core";
import { evaluateTheme, DomStyles } from "@smeli/plugin-ui";

import { viewStyles } from "./view.styles";

export const styles: Binding = {
  name: "#styles",
  evaluate: (scope: Scope) => {
    const theme = evaluateTheme(scope);

    return new DomStyles({
      view: viewStyles(theme),
    });
  },
};

export const evaluatePlotStyles = (scope: Scope) => {
  const globalScope = scope.root();
  const uiScope = globalScope.evaluate("plot").as(Scope);
  const styles = uiScope.evaluate("#styles").as(DomStyles);
  return styles.sheet.classes;
};
