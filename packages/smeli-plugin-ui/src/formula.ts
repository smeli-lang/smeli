import katex from "katex";

import { Scope, StringValue, StringType } from "@smeli/core";
import { DomNode } from "./types";
import { evaluateStyles } from "./styles";

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

          const tex = scope.evaluate("tex", StringType) as StringValue;
          const code = tex.value;

          const element = document.createElement("div");
          element.className = styles.formula + " " + styles.text;

          katex.render(code, element);
          element.className += " important";

          return new DomNode(element);
        },
      },
    ]);

    return scope;
  },
};
