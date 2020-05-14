import { Scope, StringType, StringValue } from "@smeli/core";
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
        node.className = styles.outline + " " + styles.text;

        const result = scope.evaluate(() => new DomNode(node));

        // cache parent node
        return (scope: Scope) => {
          const outlineData = scope.evaluate(
            "#outline",
            StringType
          ) as StringValue;

          node.innerHTML = outlineData.value;

          return result;
        };
      },
    });

    return scope;
  },
};
