import { NumberValue, Scope, Vec2 } from "@smeli/core";

import { DomNode } from "@smeli/plugin-ui";
import { Renderer } from "./renderer";

import { evaluatePlotStyles } from "./styles";
import { PlotItem } from "./types";

export const view = {
  name: "view",
  evaluate: (parentScope: Scope) => {
    const scope = new Scope(parentScope);
    scope.push([
      {
        name: "viewport",
        evaluate: (parentScope: Scope) => {
          const scope = new Scope(parentScope);
          scope.push([
            {
              name: "center",
              evaluate: () => new Vec2(0, 0),
            },
            {
              name: "size",
              evaluate: () => new Vec2(2, 2),
            },
          ]);
          return scope;
        },
      },
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
        name: "item4",
        evaluate: () => new NumberValue(0),
      },
      {
        name: "item5",
        evaluate: () => new NumberValue(0),
      },
      {
        name: "item6",
        evaluate: () => new NumberValue(0),
      },
      {
        name: "item7",
        evaluate: () => new NumberValue(0),
      },
      {
        name: "#ui:node",
        evaluate: (scope: Scope) => {
          const styles = evaluatePlotStyles(scope);

          const container = document.createElement("div");
          container.className = "container " + styles.view;

          const canvas = document.createElement("canvas");
          container.appendChild(canvas);

          const renderer = new Renderer(canvas);

          const result = scope.evaluate(() => new DomNode(container));

          // cache DOM element
          return (scope: Scope) => {
            // viewport parameters
            const { viewport } = scope.evaluateNested({
              viewport: {
                center: Vec2,
                size: Vec2,
              },
            }) as {
              viewport: {
                center: Vec2;
                size: Vec2;
              };
            };

            // convert to xmin, ymin, xmax, ymax
            const halfWidth = Math.abs(viewport.size.x) * 0.5;
            const halfHeight = Math.abs(viewport.size.y) * 0.5;
            renderer.viewport = [
              viewport.center.x - halfWidth,
              viewport.center.y - halfHeight,
              viewport.center.x + halfWidth,
              viewport.center.y + halfHeight,
            ];

            // cache view parameters
            return (scope: Scope) => {
              for (let i = 0; i < 8; i++) {
                const itemScope = scope.evaluate("item" + i);

                if (itemScope.is(Scope)) {
                  const item = itemScope.evaluate("#plot:item").as(PlotItem);
                  item.prepareFunction(renderer);
                }
              }

              renderer.renderAsync();

              return result;
            };
          };
        },
      },
    ]);

    return scope;
  },
};
