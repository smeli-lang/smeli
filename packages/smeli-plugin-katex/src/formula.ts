import katex from "katex";

import {
  createChildScope,
  evaluate,
  NumberValue,
  StringValue,
} from "@smeli/core";
import { DomNode } from "@smeli/plugin-ui";

import { evaluateKatexStyles } from "./styles";

export const formula = {
  name: "formula",
  evaluate: () =>
    createChildScope([
      {
        name: "code",
        evaluate: () => new StringValue("l = \\sqrt(x^2 + y^2)"),
      },
      {
        name: "size",
        evaluate: () => new NumberValue(1.4),
      },
      {
        name: "#ui:node",
        evaluate: () => {
          const katexStyles = evaluateKatexStyles();

          const code = evaluate("code").as(StringValue);
          const size = evaluate("size").as(NumberValue);

          const element = document.createElement("div");
          element.className = "widget " + katexStyles.formula;

          try {
            katex.render(code.value, element);

            const katexRoot = element.querySelector(".katex") as HTMLElement;
            katexRoot.classList.add("important");
            katexRoot.style.fontSize = size.value + "em";
          } catch (error) {
            element.innerHTML = "<p>" + error.message + "</p>";
            element.classList.add("normal");
          }

          return new DomNode(element);
        },
      },
    ]),
};
