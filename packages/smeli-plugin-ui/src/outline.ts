import { createChildScope, evaluate, StringValue } from "@smeli/core";
import { DomNode } from "./types";
import { evaluateUiStyles } from "./styles";

export const outline = {
  name: "outline",
  evaluate: () =>
    createChildScope([
      {
        name: "#ui:node",
        evaluate: () => {
          const styles = evaluateUiStyles();

          const node = document.createElement("div");
          node.className = "widget " + styles.outline;

          const result = new DomNode(node);

          // cache parent node
          return () => {
            const outlineData = evaluate("#outline").as(StringValue);

            node.innerHTML = outlineData.value;

            return result;
          };
        },
      },
    ]),
};
