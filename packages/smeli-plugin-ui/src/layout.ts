import {
  Scope,
  TypedValue,
  StringValue,
  StringType,
  NumberValue,
  ScopeType,
  NumberType,
} from "@smeli/core";
import { DomNode, DomNodeType } from "./types";
import { evaluateStyles } from "./styles";

export const layout = {
  name: "layout",
  evaluate: (parentScope: Scope) => {
    const scope = new Scope(parentScope);
    scope.push([
      {
        name: "direction",
        evaluate: () => new StringValue("row"),
      },
      {
        name: "surface",
        evaluate: () => new StringValue("none"),
      },
      {
        name: "elevation",
        evaluate: () => new NumberValue(0),
      },

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
        name: "#ui:node",
        evaluate: (scope: Scope) => {
          const styles = evaluateStyles(scope);
          const direction = scope.evaluate(
            "direction",
            StringType
          ) as StringValue;

          const surface = scope.evaluate("surface", StringType) as StringValue;

          const elevation = scope.evaluate(
            "elevation",
            NumberType
          ) as NumberValue;

          const node = document.createElement("div");
          node.className = `${styles.layout} direction-${direction.value} surface-${surface.value}`;

          // append drop shadows dynamically depending on elevation
          node.style.boxShadow = `0px 4px ${elevation.value * 4}px #0008`;

          const result = scope.evaluate(() => new DomNode(node));

          // cache the parent node creation
          return (scope: Scope) => {
            // evaluate valid children items
            const items = [scope.evaluate("item0"), scope.evaluate("item1")];
            const itemNodes = items
              .filter((item) => item.type() === ScopeType)
              .map(
                (item) =>
                  (item as Scope).evaluate("#ui:node", DomNodeType) as DomNode
              );

            // cheap diff to limit the number of DOM operations
            const currentChildren = node.childNodes;
            itemNodes.forEach((itemNode, index) => {
              if (currentChildren.length <= index) {
                node.appendChild(itemNode.node);
              } else {
                const currentChild = currentChildren[index];
                if (currentChild !== itemNode.node) {
                  node.replaceChild(itemNode.node, currentChild);
                }
              }
            });

            return result;
          };
        },
      },
    ]);

    return scope;
  },
};
