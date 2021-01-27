import {
  Scope,
  Binding,
  currentEvaluationContext,
  evaluate,
} from "@smeli/core";
import { evaluateTheme, DomStyles } from "@smeli/plugin-ui";

import { editorStyles } from "./editor.styles";

export const styles: Binding = {
  name: "#styles",
  evaluate: () => {
    const theme = evaluateTheme();

    return new DomStyles({
      editor: editorStyles(theme),
    });
  },
};

export const evaluateAceStyles = () => {
  const context = currentEvaluationContext();
  const globalScope = context.as(Scope).root();
  const uiScope = evaluate("ace", globalScope).as(Scope);
  const styles = evaluate("#styles", uiScope).as(DomStyles);
  return styles.sheet.classes;
};
