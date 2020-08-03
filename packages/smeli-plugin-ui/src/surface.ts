import { Scope, StringValue, NumberValue, BoolValue } from "@smeli/core";
import { DomNode } from "./types";
import { evaluateUiStyles } from "./styles";

export const surface = {
  name: "surface",
  evaluate: (parentScope: Scope) => {
    const scope = new Scope(parentScope);
    scope.push([
      {
        name: "direction",
        evaluate: () => new StringValue("row"),
      },
      {
        name: "responsive",
        evaluate: () => new BoolValue(false),
      },
      {
        name: "fade",
        evaluate: () => new BoolValue(false),
      },
      {
        name: "color",
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
          const direction = scope.evaluate("direction").as(StringValue);
          const responsive = scope.evaluate("responsive").as(BoolValue);
          const fade = scope.evaluate("fade").as(BoolValue);
          const color = scope.evaluate("color").as(StringValue);

          const node = document.createElement("div");
          node.className = `${styles.surface} direction-${
            direction.value
          } color-${color.value} ${responsive.value ? "responsive" : ""} ${
            fade.value ? "fade" : ""
          }`;

          if (fade.value) {
            requestAnimationFrame(() => {
              node.style.opacity = "1";
            });
          }

          // append drop shadows dynamically depending on elevation
          const elevation = scope.evaluate("elevation").as(NumberValue);
          if (elevation.value !== 0) {
            // clamp height to reasonable limits
            const height = Math.min(Math.max(elevation.value, -16), 16);
            node.style.boxShadow = `${height < 0 ? "inset" : ""} 0px 2px ${
              Math.abs(height) + 4
            }px #0004`;
            node.classList.add("elevated");
          }

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
