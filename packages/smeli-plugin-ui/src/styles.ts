import { Scope, ScopeType, TypedValue, Binding } from "@smeli/core";
import { DomStyles, DomStylesType } from "./types";

import { outlineStyle } from "./outline.style";

export const styles: Binding = {
  name: "#styles",
  evaluate: (scope: Scope) => {
    // next step: evaluate theme from scope here
    const theme = {
      colors: {
        background: "#125012"
      }
    };

    return new DomStyles({
      outline: outlineStyle(theme)
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
