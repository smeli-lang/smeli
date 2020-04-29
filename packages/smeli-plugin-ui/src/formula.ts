import katex from "katex";

import {
  ExpressionType,
  ExpressionValue,
  Scope,
  StringValue,
  StringType,
} from "@smeli/core";

import { DomNode } from "./types";
import { evaluateStyles } from "./styles";

// transform a Smeli AST into a TEX expression
function transpile(value: ExpressionValue): string {
  return value.name + " = " + value.name;
}

export const formula = {
  name: "formula",
  evaluate: (parentScope: Scope) => {
    const scope = new Scope(parentScope);
    scope.push([
      {
        name: "tex",
        evaluate: () => new StringValue("l = \\sqrt(x^2 + y^2)"),
      },
      {
        name: "#node",
        evaluate: (scope: Scope) => {
          const styles = evaluateStyles(scope);

          const tex = scope.evaluate("tex");
          let code = "";
          switch (tex.type()) {
            case StringType:
              code = (tex as StringValue).value;
              break;
            case ExpressionType:
              const expression = tex as ExpressionValue;
              code = transpile(expression);
              break;
          }

          const element = document.createElement("div");
          element.className = styles.formula + " " + styles.text;

          katex.render(code, element);

          const katexRoot = element.querySelector(".katex") as HTMLElement;
          katexRoot.className += " important";

          return new DomNode(element);
        },
      },
    ]);

    return scope;
  },
};
