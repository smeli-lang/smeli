import { Scope, ScopeType, TypedValue, Binding } from "@smeli/core";
import { DomStyles, DomStylesType } from "./types";
import { defaultThemeLight } from "./theme";

import { containerStyles } from "./container.styles";
import { outlineStyles } from "./outline.styles";

export const styles: Binding = {
  name: "#styles",
  evaluate: (scope: Scope) => {
    // next step: evaluate theme from scope here
    const theme = defaultThemeLight;

    return new DomStyles({
      container: containerStyles(theme),
      outline: outlineStyles(theme)
    });
  },
  invalidate: (value: TypedValue) => (value as DomStyles).dispose()
};

export const evaluateStyles = (scope: Scope) => {
  const globalScope = scope.root();
  const uiScope = globalScope.evaluate("ui", ScopeType) as Scope;
  const styles = uiScope.evaluate("#styles", DomStylesType) as DomStyles;
  return styles.sheet.classes;
};
