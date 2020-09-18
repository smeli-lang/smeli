import { BoolValue, Scope, Vec2, Vec3 } from "@smeli/core";

import { evaluateTheme } from "@smeli/plugin-ui";

import { Renderer } from "./renderer";
import { PlotItem } from "./types";

function* quantize(min: number, max: number, step: number) {
  step = Math.abs(step);

  if (step === 0) {
    return;
  }

  const start = Math.ceil(min / step) * step;
  const end = Math.floor(max / step) * step;
  for (let value = start; value <= end; value += step) {
    yield value;
  }
}

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
        name: "step",
        evaluate: (scope: Scope) => new Vec2(1, 1),
      },
      {
        name: "axis",
        evaluate: (scope: Scope) => new BoolValue(true),
      },
      {
        name: "axis_step",
        evaluate: (scope: Scope) => new Vec2(1, 1),
      },
      {
        name: "#plot:item",
        evaluate: (scope: Scope) => {
          const color = scope.evaluate("color").as(Vec3);
          const step = scope.evaluate("step").as(Vec2);
          const axis = scope.evaluate("axis").as(BoolValue);
          const axis_step = scope.evaluate("axis_step").as(Vec2);

          return new PlotItem((renderer: Renderer) => {
            renderer.queueDraw((context: CanvasRenderingContext2D) => {
              context.strokeStyle = color.toCssColor(0.38);
              context.lineWidth = 1;

              // horizontal lines
              for (let y of quantize(
                renderer.viewport[1],
                renderer.viewport[3],
                step.y
              )) {
                const pixelY = renderer.viewportPositionToPixels(0, y).y;

                context.beginPath();
                context.moveTo(0, pixelY);
                context.lineTo(renderer.canvas.width, pixelY);
                context.stroke();
              }

              // vertical lines
              for (let x of quantize(
                renderer.viewport[0],
                renderer.viewport[2],
                step.x
              )) {
                const pixelX = renderer.viewportPositionToPixels(x, 0).x;

                context.beginPath();
                context.moveTo(pixelX, 0);
                context.lineTo(pixelX, renderer.canvas.height);
                context.stroke();
              }

              if (axis.value) {
                const origin = renderer.viewportPositionToPixels(0, 0);

                context.strokeStyle = color.toCssColor(0.6);
                context.lineWidth = 2;

                context.beginPath();
                context.moveTo(0, origin.y);
                context.lineTo(renderer.canvas.width, origin.y);
                context.stroke();

                context.beginPath();
                context.moveTo(origin.x, 0);
                context.lineTo(origin.x, renderer.canvas.height);
                context.stroke();

                context.strokeStyle = color.toCssColor(0.6);
                context.fillStyle = color.toCssColor(0.38);
                context.lineWidth = 2;

                const oldFont = context.font;
                context.font = "16px verdana";

                // X markers
                for (let x of quantize(
                  renderer.viewport[0],
                  renderer.viewport[2],
                  axis_step.x
                )) {
                  const pixelX = renderer.viewportPositionToPixels(x, 0).x;

                  context.beginPath();
                  context.moveTo(pixelX, origin.y - 4);
                  context.lineTo(pixelX, origin.y + 4);
                  context.stroke();

                  context.fillText(x.toString(), pixelX + 8, origin.y - 8);
                }

                // Y markers
                for (let y of quantize(
                  renderer.viewport[1],
                  renderer.viewport[3],
                  axis_step.y
                )) {
                  const pixelY = renderer.viewportPositionToPixels(0, y).y;

                  context.beginPath();
                  context.moveTo(origin.x - 4, pixelY);
                  context.lineTo(origin.x + 4, pixelY);
                  context.stroke();

                  context.fillText(y.toString(), origin.x + 8, pixelY - 8);
                }

                context.font = oldFont;
              }
            });
          });
        },
      },
    ]);

    return scope;
  },
};
