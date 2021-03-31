import { createChildScope, BoolValue, evaluate, Vec2, Vec3 } from "@smeli/core";

import { evaluateTheme } from "@smeli/plugin-ui";

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
  evaluate: () =>
    createChildScope([
      {
        name: "color",
        evaluate: () => evaluateTheme().colors.on_background,
      },
      {
        name: "step",
        evaluate: () => new Vec2(1, 1),
      },
      {
        name: "axis",
        evaluate: () => new BoolValue(true),
      },
      {
        name: "axis_step",
        evaluate: () => new Vec2(1, 1),
      },
      {
        name: "#plot:item",
        evaluate: () => {
          const color = evaluate("color").as(Vec3);
          const step = evaluate("step").as(Vec2);
          const axis = evaluate("axis").as(BoolValue);
          const axis_step = evaluate("axis_step").as(Vec2);

          return new PlotItem(({ canvas, context, viewport }) => {
            context.strokeStyle = color.toCssColor(0.38);
            context.lineWidth = 1;

            // horizontal lines
            if (step.x != 0) {
              for (let y of quantize(
                viewport.bounds[1],
                viewport.bounds[3],
                step.y
              )) {
                const pixelY = viewport.toPixels(0, y).y;

                context.beginPath();
                context.moveTo(0, pixelY);
                context.lineTo(canvas.width, pixelY);
                context.stroke();
              }
            }

            // vertical lines
            if (step.y != 0) {
              for (let x of quantize(
                viewport.bounds[0],
                viewport.bounds[2],
                step.x
              )) {
                const pixelX = viewport.toPixels(x, 0).x;

                context.beginPath();
                context.moveTo(pixelX, 0);
                context.lineTo(pixelX, canvas.height);
                context.stroke();
              }
            }

            if (axis.value) {
              const origin = viewport.toPixels(0, 0);

              context.strokeStyle = color.toCssColor(0.6);
              context.lineWidth = 2;

              if (step.x != 0) {
                context.beginPath();
                context.moveTo(0, origin.y);
                context.lineTo(canvas.width, origin.y);
                context.stroke();
              }

              if (step.y != 0) {
                context.beginPath();
                context.moveTo(origin.x, 0);
                context.lineTo(origin.x, canvas.height);
                context.stroke();
              }

              context.strokeStyle = color.toCssColor(0.6);
              context.fillStyle = color.toCssColor(0.38);
              context.lineWidth = 2;

              const oldFont = context.font;
              context.font = "0.9em verdana";

              // X markers
              for (let x of quantize(
                viewport.bounds[0],
                viewport.bounds[2],
                axis_step.x
              )) {
                const pixelX = viewport.toPixels(x, 0).x;

                context.beginPath();
                context.moveTo(pixelX, origin.y - 4);
                context.lineTo(pixelX, origin.y + 4);
                context.stroke();

                context.fillText(x.toString(), pixelX + 8, origin.y - 8);
              }

              // Y markers
              for (let y of quantize(
                viewport.bounds[1],
                viewport.bounds[3],
                axis_step.y
              )) {
                const pixelY = viewport.toPixels(0, y).y;

                context.beginPath();
                context.moveTo(origin.x - 4, pixelY);
                context.lineTo(origin.x + 4, pixelY);
                context.stroke();

                context.fillText(y.toString(), origin.x + 8, pixelY - 8);
              }

              context.font = oldFont;
            }
          });
        },
      },
    ]),
};
