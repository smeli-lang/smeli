import {
  createChildScope,
  evaluate,
  StringValue,
  Vec2,
  Vec3,
} from "@smeli/core";

import { evaluateTheme } from "@smeli/plugin-ui";

import { PlotItem } from "./types";

function rotateScale(
  vec: { x: number; y: number },
  angle: number,
  scale: number
) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  return {
    x: (vec.x * c + vec.y * s) * scale,
    y: (-vec.x * s + vec.y * c) * scale,
  };
}

export const vector = {
  name: "vector",
  evaluate: () =>
    createChildScope([
      {
        name: "start",
        evaluate: () => new Vec2(0.0, 0.0),
      },
      {
        name: "end",
        evaluate: () => new Vec2(1.0, 1.0),
      },
      {
        name: "color",
        evaluate: () => evaluateTheme().colors.primary,
      },
      {
        name: "label",
        evaluate: () => new StringValue(""),
      },
      {
        name: "#plot:item",
        evaluate: () => {
          const start = evaluate("start").as(Vec2);
          const end = evaluate("end").as(Vec2);
          const color = evaluate("color").as(Vec3);
          const label = evaluate("label").as(StringValue);

          return new PlotItem(({ canvas, context, viewport }) => {
            const pixelStart = viewport.toPixels(start.x, start.y);
            const pixelEnd = viewport.toPixels(end.x, end.y);

            const direction = {
              x: pixelEnd.x - pixelStart.x,
              y: pixelEnd.y - pixelStart.y,
            };

            const length = Math.sqrt(
              direction.x * direction.x + direction.y * direction.y
            );
            direction.x /= length;
            direction.y /= length;

            const arrowAngle = Math.PI * 0.8; // radians
            const arrowLength = 16; // pixels

            const arrowLeft = rotateScale(direction, arrowAngle, arrowLength);
            const arrowRight = rotateScale(direction, -arrowAngle, arrowLength);

            context.fillStyle = color.toCssColor(1.0);
            context.lineCap = "round";
            context.lineJoin = "round";

            // starting point
            context.beginPath();
            context.arc(pixelStart.x, pixelStart.y, 4, 0, 2.0 * Math.PI);
            context.fill();

            context.strokeStyle = color.toCssColor(0.83);
            context.lineWidth = 4;

            context.beginPath();

            // main vector line
            context.moveTo(pixelStart.x, pixelStart.y);
            context.lineTo(pixelEnd.x, pixelEnd.y);

            // arrow
            context.lineTo(pixelEnd.x + arrowLeft.x, pixelEnd.y + arrowLeft.y);
            context.moveTo(pixelEnd.x, pixelEnd.y);
            context.lineTo(
              pixelEnd.x + arrowRight.x,
              pixelEnd.y + arrowRight.y
            );
            context.stroke();

            const labelOffset = rotateScale(direction, Math.PI * 0.5, 16);
            if (labelOffset.y > 0) {
              labelOffset.x = -labelOffset.x;
              labelOffset.y = -labelOffset.y;
            }

            const labelPosition = {
              x: (pixelStart.x + pixelEnd.x) * 0.5 + labelOffset.x,
              y: (pixelStart.y + pixelEnd.y) * 0.5 + labelOffset.y,
            };

            if (label.value != "") {
              const boldPrefix = "bold ";

              context.textAlign = labelOffset.x > 0 ? "start" : "end";
              context.textBaseline = "middle";
              context.font = boldPrefix + context.font;

              context.fillStyle = color.toCssColor(0.83);
              context.fillText(label.value, labelPosition.x, labelPosition.y);

              // restore defaults
              context.textAlign = "start";
              context.textBaseline = "alphabetic";
              context.font = context.font.substr(boldPrefix.length);
            }
          });
        },
      },
    ]),
};
