import {
  createChildScope,
  BoolValue,
  evaluate,
  StringValue,
  Vec2,
  Vec3,
} from "@smeli/core";

import { evaluateTheme } from "@smeli/plugin-ui";

import { PlotItem } from "./types";

export const point = {
  name: "point",
  evaluate: () =>
    createChildScope([
      {
        name: "position",
        evaluate: () => new Vec2(0.0, 0.0),
      },
      {
        name: "color",
        evaluate: () => evaluateTheme().colors.primary,
      },
      {
        name: "guides",
        evaluate: () => new BoolValue(false),
      },
      {
        name: "label",
        evaluate: () => new StringValue(""),
      },
      {
        name: "#plot:item",
        evaluate: () => {
          const position = evaluate("position").as(Vec2);
          const color = evaluate("color").as(Vec3);
          const guides = evaluate("guides").as(BoolValue);
          const label = evaluate("label").as(StringValue);

          return new PlotItem(({ canvas, context, viewport }) => {
            const pixelPosition = viewport.toPixels(position.x, position.y);

            context.fillStyle = color.toCssColor(1.0);
            context.beginPath();
            context.arc(pixelPosition.x, pixelPosition.y, 4, 0, 2.0 * Math.PI);
            context.fill();

            if (guides.value) {
              context.strokeStyle = color.toCssColor(0.6);
              context.lineWidth = 1;

              // x = pointX
              context.beginPath();
              context.moveTo(pixelPosition.x, 0);
              context.lineTo(pixelPosition.x, canvas.height);
              context.stroke();

              // y = pointY
              context.beginPath();
              context.moveTo(0, pixelPosition.y);
              context.lineTo(canvas.width, pixelPosition.y);
              context.stroke();
            }

            if (label.value != "") {
              context.textAlign = "end";

              context.fillStyle = color.toCssColor(0.83);
              context.fillText(
                label.value,
                pixelPosition.x - 4,
                pixelPosition.y - 4
              );

              context.textAlign = "start";
            }
          });
        },
      },
    ]),
};
