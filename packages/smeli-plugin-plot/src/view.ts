import {
  createChildScope,
  currentEvaluationContext,
  evaluate,
  NumberValue,
  Scope,
  ScopeOverride,
  StringValue,
  Vec2,
} from "@smeli/core";

import { DomNode } from "@smeli/plugin-ui";
import { Viewport } from "./viewport";

import { evaluatePlotStyles } from "./styles";
import { PlotItem } from "./types";

// temporary polyfill until Observers are added to the
// official DOM declarations
declare class ResizeObserver {
  constructor(callback: Function);
}

export const view = {
  name: "view",
  evaluate: () =>
    createChildScope([
      {
        name: "viewport",
        evaluate: () =>
          createChildScope([
            {
              name: "center",
              evaluate: () => new Vec2(0, 0),
            },
            {
              name: "size",
              evaluate: () => new Vec2(2, 2),
            },
            {
              name: "ratio",
              evaluate: () => new Vec2(1, 1),
            },
            {
              name: "mode",
              evaluate: () => new StringValue("fit"),
            },
          ]),
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
        name: "#pixel_size",
        evaluate: () => new Vec2(0.0, 0.0),
      },
      {
        name: "ratio",
        evaluate: () => {
          const pixelSize = evaluate("#pixel_size").as(Vec2);
          if (pixelSize.x === 0 || pixelSize.y === 0) {
            return new NumberValue(0);
          } else {
            return new NumberValue(pixelSize.x / pixelSize.y);
          }
        },
      },
      {
        name: "#ui:node",
        evaluate: () => {
          const styles = evaluatePlotStyles();

          const container = document.createElement("div");
          container.className = "container " + styles.view;

          const canvas = document.createElement("canvas");
          container.appendChild(canvas);

          const scope = currentEvaluationContext().as(Scope);
          const pixelSizeOverride = new ScopeOverride(scope, "#pixel_size");
          const resizeObserver = new ResizeObserver((entries: any) => {
            // use only the latest update
            const entry = entries[entries.length - 1];
            const { width, height } = entry.contentRect;
            pixelSizeOverride.bind(() => new Vec2(width, height));
          });

          const result = new DomNode(container, {}, [resizeObserver]);

          // cache DOM element
          return () => {
            // actual pixel size of the canvas
            const pixelSize = evaluate("#pixel_size").as(Vec2);
            if (pixelSize.x === 0 || pixelSize.y === 0) {
              return result;
            }
            canvas.width = pixelSize.x;
            canvas.height = pixelSize.y;

            // viewport parameters
            const viewportScope = evaluate("viewport").as(Scope);
            const viewport = new Viewport(viewportScope, pixelSize);

            // cache view parameters
            return () => {
              const context = canvas.getContext(
                "2d"
              ) as CanvasRenderingContext2D;

              // initial context setup
              context.font = "italic bold 1.0em math";

              // clear everything
              context.clearRect(0, 0, pixelSize.x, pixelSize.y);

              for (let i = 0; i < 8; i++) {
                const itemScope = evaluate("item" + i);

                if (itemScope.is(Scope)) {
                  const item = evaluate("#plot:item", itemScope).as(PlotItem);
                  item.render({
                    canvas,
                    context,
                    viewport,
                  });
                }
              }

              return result;
            };
          };
        },
      },
    ]),
};
