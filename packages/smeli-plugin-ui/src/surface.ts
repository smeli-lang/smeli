import { Scope, StringValue, NumberValue, BoolValue, Vec3 } from "@smeli/core";
import { DomNode } from "./types";
import { evaluateUiStyles } from "./styles";
import { evaluateTheme } from "./theme";

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
        name: "text_color",
        evaluate: () => new StringValue("default"),
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
          const theme = evaluateTheme(scope);
          const styles = evaluateUiStyles(scope);
          const direction = scope.evaluate("direction").as(StringValue);
          const responsive = scope.evaluate("responsive").as(BoolValue);
          const fade = scope.evaluate("fade").as(BoolValue);
          const color = scope.evaluate("color");
          const text_color = scope.evaluate("text_color");

          const node = document.createElement("div");
          node.className = `${styles.surface} direction-${direction.value} ${
            responsive.value ? "responsive" : ""
          } ${fade.value ? "fade" : ""}`;

          if (fade.value) {
            requestAnimationFrame(() => {
              node.style.opacity = "1";
            });
          }

          let backgroundColor: Vec3 | null = null;
          let textColor: Vec3 | null = null;

          if (text_color.is(Vec3)) {
            textColor = text_color;
          }

          if (color.is(Vec3)) {
            backgroundColor = color;
          } else if (color.is(StringValue)) {
            switch (color.value) {
              case "background":
                backgroundColor = theme.colors.background;
                textColor = textColor || theme.colors.on_background;
                break;
              case "primary":
                backgroundColor = theme.colors.primary;
                textColor = textColor || theme.colors.on_primary;
                break;
              case "secondary":
                backgroundColor = theme.colors.secondary;
                textColor = textColor || theme.colors.on_secondary;
                break;
            }
          }

          // append drop shadows dynamically depending on elevation
          const shadowColor = theme.is_dark.value ? "#0008" : "#0004";
          const elevation = scope.evaluate("elevation").as(NumberValue);
          if (elevation.value !== 0) {
            // clamp height to reasonable limits
            const height = Math.min(Math.max(elevation.value, -16), 16);
            node.style.boxShadow = `${height < 0 ? "inset" : ""} 0px 2px ${
              Math.abs(height) + 4
            }px ${shadowColor}`;
            node.classList.add("elevated");

            // brighten surfaces based on elevation when in dark mode
            if (backgroundColor !== null && theme.is_dark.value) {
              let brightenFactor = height / 256.0;
              if (brightenFactor > 0) {
                // brighten with gamma correction
                brightenFactor = Math.pow(brightenFactor, 1.0 / 2.2);
              } else {
                // darken slower
                brightenFactor /= 2;
              }
              backgroundColor = backgroundColor.__add__(
                new Vec3(1.0, 1.0, 1.0).__mul__(new NumberValue(brightenFactor))
              ) as Vec3;
            }
          }

          if (backgroundColor !== null) {
            node.style.backgroundColor = backgroundColor.toCssColor();
          }

          if (textColor !== null) {
            node.style.color = textColor.toCssColor();
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
