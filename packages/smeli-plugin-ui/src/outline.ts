import { Scope, StringType, StringValue, TypedValue } from "@smeli/core";
import { DomNode } from "./types";

export const outline = {
  name: "outline",
  evaluate: (parentScope: Scope) => {
    const scope = new Scope(parentScope);
    scope.push({
      name: "#node",
      evaluate: (scope: Scope) => {
        const outlineData = scope.evaluate(
          "#outline",
          StringType
        ) as StringValue;
        const outlineHtml = outlineData.value;

        const node = document.createElement("div");
        node.innerHTML = outlineHtml;

        return new DomNode(node);
      }
    });

    return scope;
  },
  invalidate: (value: TypedValue) => (value as Scope).dispose()
};
