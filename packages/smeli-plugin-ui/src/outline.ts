import { Scope, StringType, StringValue, TypedValue } from "@smeli/core";
import { DomNode } from "./types";
import { evaluateStyles } from "./styles";

export const outline = {
  name: "outline",
  evaluate: (parentScope: Scope) => {
    const scope = new Scope(parentScope);
    scope.push({
      name: "#node",
      evaluate: (scope: Scope) => {
        const styles = evaluateStyles(scope);
        const outlineData = scope.evaluate(
          "#outline",
          StringType
        ) as StringValue;
        const outlineHtml = outlineData.value;

        const node = document.createElement("div");
        node.className = styles.outline + " " + styles.text;
        node.innerHTML = outlineHtml;

        return new DomNode(node);
      },
    });

    return scope;
  },
};
