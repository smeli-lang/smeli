import katex from "katex";

import { Scope, StringValue } from "@smeli/core";
import { DomNode } from "@smeli/plugin-ui";

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
          const katexStyles = evaluateKatexStyles(scope);

          const code = scope.evaluate("code").as(StringValue);

          const element = document.createElement("div");
          element.className = "widget " + katexStyles.formula;

          try {
            katex.render(code.value, element);

            const katexRoot = element.querySelector(".katex") as HTMLElement;
            katexRoot.classList.add("important");
          } catch (error) {
            element.innerHTML = "<p>" + error.message + "</p>";
            element.classList.add("normal");
          }

          return new DomNode(element);
        },
      },
    ]);

    return scope;
  },
};
