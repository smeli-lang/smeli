import katex from "katex";

import { Scope, StringValue, StringType } from "@smeli/core";
import { DomNode, evaluateUiStyles } from "@smeli/plugin-ui";

import { evaluateKatexStyles } from "./styles";

export const formula = {
  name: "formula",
  evaluate: (parentScope: Scope) => {
    const scope = new Scope(parentScope);
    scope.push([
      {
        name: "code",
        evaluate: () => new StringValue("l = \\sqrt(x^2 + y^2)"),
      },
      {
        name: "#ui:node",
        evaluate: (scope: Scope) => {
          const uiStyles = evaluateUiStyles(scope);
          const katexStyles = evaluateKatexStyles(scope);

          const code = scope.evaluate("code", StringType) as StringValue;

          const element = document.createElement("div");
          element.className = katexStyles.formula + " " + uiStyles.text;

          katex.render(code.value, element);

          const katexRoot = element.querySelector(".katex") as HTMLElement;
          katexRoot.className += " important";

          return new DomNode(element);
        },
      },
    ]);

    return scope;
  },
};
