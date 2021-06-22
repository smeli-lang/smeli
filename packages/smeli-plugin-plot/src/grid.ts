import { createChildScope, BoolValue, evaluate, Vec2, Vec3 } from "@smeli/core";

import { evaluateTheme } from "@smeli/plugin-ui";

import { PlotItem } from "./types";

function* quantize(
  min: number,
  max: number,
  step: number,
  subdivisions: number
): Generator<[number, boolean]> {
  step = Math.abs(step);

  if (step === 0 || subdivisions === 0) {
    return;
  }

  step /= subdivisions;

  const start = Math.ceil(min / step);
  const end = Math.floor(max / step);
  for (let i = start; i <= end; i++) {
    yield [i * step, i % subdivisions != 0];
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
        name: "subdivisions",
        evaluate: () => new Vec2(5, 5),
      },
      {
        name: "#plot:item",
        evaluate: () => {
          const color = evaluate("color").as(Vec3);
          const step = evaluate("step").as(Vec2);
          const axis = evaluate("axis").as(BoolValue);
          const subdivisions = evaluate("subdivisions").as(Vec2);

          return new PlotItem(({ canvas, context, viewport }) => {
            const stepColor = color.toCssColor(0.38);
            const substepColor = color.toCssColor(0.14);

            context.lineWidth = 1;

            // horizontal lines
            if (step.x != 0) {
              for (let [y, isSubstep] of quantize(
                viewport.bounds[1],
                viewport.bounds[3],
                step.y,
                subdivisions.y
              )) {
                const pixelY = viewport.toPixels(0, y).y;

                context.strokeStyle = isSubstep ? substepColor : stepColor;

                context.beginPath();
                context.moveTo(0, pixelY);
                context.lineTo(canvas.width, pixelY);
                context.stroke();
              }
            }

            // vertical lines
            if (step.y != 0) {
              for (let [x, isSubstep] of quantize(
                viewport.bounds[0],
                viewport.bounds[2],
                step.x,
                subdivisions.x
              )) {
                const pixelX = viewport.toPixels(x, 0).x;

                context.strokeStyle = isSubstep ? substepColor : stepColor;

                context.beginPath();
                context.moveTo(pixelX, 0);
                context.lineTo(pixelX, canvas.height);
                context.stroke();
              }
            }

            if (axis.value) {
              const origin = viewport.toPixels(0, 0);

              context.strokeStyle = color.toCssColor(0.87);
              context.fillStyle = color.toCssColor(0.87);

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

              const oldFont = context.font;
              context.font = "italic 0.6em math";

              context.textAlign = "center";
              context.textBaseline = "top";

              // X markers
              for (let [x, _] of quantize(
                viewport.bounds[0],
                viewport.bounds[2],
                step.x,
                1
              )) {
                const pixelX = viewport.toPixels(x, 0).x;
                const zeroOffset = x == 0 ? -8 : 0;

                context.fillText(
                  x.toString(),
                  pixelX + zeroOffset,
                  origin.y + 2
                );
              }

              context.textAlign = "right";
              context.textBaseline = "middle";

              // Y markers
              for (let [y, _] of quantize(
                viewport.bounds[1],
                viewport.bounds[3],
                step.y,
                1
              )) {
                if (y == 0) {
                  continue;
                }

                const pixelY = viewport.toPixels(0, y).y;

                context.fillText(y.toString(), origin.x - 2, pixelY);
              }

              context.font = oldFont;
              context.textAlign = "start";
              context.textBaseline = "alphabetic";
            }
          });
        },
      },
    ]),
};
