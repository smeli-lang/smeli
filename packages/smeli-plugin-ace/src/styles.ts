import { Scope, Binding } from "@smeli/core";
import { evaluateTheme, DomStyles } from "@smeli/plugin-ui";

import { editorStyles } from "./editor.styles";

export const styles: Binding = {
  name: "#styles",
  evaluate: (scope: Scope) => {
    const theme = evaluateTheme(scope);

    return new DomStyles({
      editor: editorStyles(theme),
    });
  },
};

export const evaluateAceStyles = (scope: Scope) => {
  const globalScope = scope.root();
  const uiScope = globalScope.evaluate("ace").as(Scope);
  const styles = uiScope.evaluate("#styles").as(DomStyles);
  return styles.sheet.classes;
};
