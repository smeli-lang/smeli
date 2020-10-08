import { Scope, NumberValue } from "@smeli/core";
import { DomNode } from "./types";
import { evaluateUiStyles } from "./styles";

export const stack = {
  name: "stack",
  evaluate: (parentScope: Scope) => {
    const scope = new Scope(parentScope);
    scope.push([
      // there's no array support in the langage for now,
      // multiple fields are used as a temporary workaround
      {
        name: "item0",
        evaluate: () => new NumberValue(0),
      },
      {
        name: "item1",
        evaluate: () => new NumberValue(0),
      },
      {
        name: "item2",
        evaluate: () => new NumberValue(0),
      },
      {
        name: "item3",
        evaluate: () => new NumberValue(0),
      },

      {
        name: "#ui:node",
        evaluate: (scope: Scope) => {
          const styles = evaluateUiStyles(scope);

          const node = document.createElement("div");
          node.className = `${styles.stack} container`;

          const result = scope.evaluate(() => new DomNode(node));

          // cache the parent node creation
          return (scope: Scope) => {
            // evaluate valid children items
            const items = [
              scope.evaluate("item0"),
              scope.evaluate("item1"),
              scope.evaluate("item2"),
              scope.evaluate("item3"),
            ];
            const itemNodes = items
              .filter((item) => item.is(Scope))
              .map((item) => (item as Scope).evaluate("#ui:node").as(DomNode));

            // cheap diff to limit the number of DOM operations
            const currentChildren = node.childNodes;
            itemNodes.forEach((itemNode, index) => {
              if (currentChildren.length <= index) {
                const layer = document.createElement("div");
                layer.className = "layer";
                layer.appendChild(itemNode.node);
                node.appendChild(layer);
              } else {
                const currentChild = currentChildren[index];
                if (currentChild.firstChild !== itemNode.node) {
                  const layer = document.createElement("div");
                  layer.className = "layer";
                  layer.appendChild(itemNode.node);
                  node.replaceChild(layer, currentChild);
                }
              }
            });
            for (let i = itemNodes.length; i < currentChildren.length; i++) {
              node.removeChild(currentChildren[i]);
            }

            return result;
          };
        },
      },
    ]);

    return scope;
  },
};
