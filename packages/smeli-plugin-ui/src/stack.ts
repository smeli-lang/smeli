import { createChildScope, Scope, NumberValue, evaluate } from "@smeli/core";
import { DomNode } from "./types";
import { evaluateUiStyles } from "./styles";

export const stack = {
  name: "stack",
  evaluate: () =>
    createChildScope([
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
        evaluate: () => {
          const styles = evaluateUiStyles();

          const node = document.createElement("div");
          node.className = `${styles.stack} container`;

          const result = new DomNode(node);

          // cache the parent node creation
          return () => {
            // evaluate valid children items
            const items = [
              evaluate("item0"),
              evaluate("item1"),
              evaluate("item2"),
              evaluate("item3"),
            ];
            const itemNodes = items
              .filter((item) => item.is(Scope))
              .map((item) => evaluate("#ui:node", item as Scope).as(DomNode));

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
    ]),
};
