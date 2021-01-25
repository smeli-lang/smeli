import { Scope, StringValue } from "@smeli/core";
import { DomNode } from "./types";
import { evaluateUiStyles } from "./styles";

export const outline = {
  name: "outline",
  evaluate: (parentScope: Scope) => {
    const scope = new Scope(parentScope);
    scope.push({
      name: "#ui:node",
      evaluate: (scope: Scope) => {
        const styles = evaluateUiStyles(scope);

        const node = document.createElement("div");
        node.className = "widget " + styles.outline;

        const result = new DomNode(node);

        // cache parent node
        return (scope: Scope) => {
          const outlineData = scope.evaluate("#outline").as(StringValue);

          node.innerHTML = outlineData.value;

          return result;
        };
      },
    });

    return scope;
  },
};
