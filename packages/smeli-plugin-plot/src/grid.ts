import { Scope, Vec3 } from "@smeli/core";

import { evaluateTheme } from "@smeli/plugin-ui";

import { Renderer } from "./renderer";
import { PlotItem } from "./types";

export const grid = {
  name: "grid",
  evaluate: (parentScope: Scope) => {
    const scope = new Scope(parentScope);
    scope.push([
      {
        name: "color",
        evaluate: (scope: Scope) => evaluateTheme(scope).colors.on_background,
      },
      {
        name: "#plot:item",
        evaluate: (scope: Scope) => {
          const color = scope.evaluate("color").as(Vec3);

          return new PlotItem((renderer: Renderer) => {
            renderer.queueDraw((context: CanvasRenderingContext2D) => {
              const minX = Math.ceil(renderer.viewport[0]);
              const maxX = Math.floor(renderer.viewport[2]);
              const minY = Math.ceil(renderer.viewport[1]);
              const maxY = Math.floor(renderer.viewport[3]);

              context.strokeStyle = color.toCssColor(0.38);
              context.lineWidth = 1;

              // horizontal lines
              for (let y = minY; y <= maxY; y += 1) {
                const pixelY = renderer.viewportPositionToPixels(0, y).y;

                context.beginPath();
                context.moveTo(0, pixelY);
                context.lineTo(renderer.canvas.width, pixelY);
                context.stroke();
              }

              // vertical lines
              for (let x = minX; x <= maxX; x += 1) {
                const pixelX = renderer.viewportPositionToPixels(x, 0).x;

                context.beginPath();
                context.moveTo(pixelX, 0);
                context.lineTo(pixelX, renderer.canvas.height);
                context.stroke();
              }
            });
          });
        },
      },
    ]);

    return scope;
  },
};
