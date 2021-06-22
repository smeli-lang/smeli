import {
  createChildScope,
  evaluate,
  StringValue,
  Vec2,
  Vec3,
} from "@smeli/core";

import { evaluateTheme } from "@smeli/plugin-ui";

import { PlotItem } from "./types";

export const label = {
  name: "label",
  evaluate: () =>
    createChildScope([
      {
        name: "position",
        evaluate: () => new Vec2(0.0, 0.0),
      },
      {
        name: "text",
        evaluate: () => new StringValue(""),
      },
      {
        name: "color",
        evaluate: () => evaluateTheme().colors.primary,
      },
      {
        name: "#plot:item",
        evaluate: () => {
          const position = evaluate("position").as(Vec2);
          const text = evaluate("text").as(StringValue);
          const color = evaluate("color").as(Vec3);

          return new PlotItem(({ canvas, context, viewport }) => {
            const pixelPosition = viewport.toPixels(position.x, position.y);

            context.textAlign = "center";
            context.textBaseline = "middle";

            context.fillStyle = color.toCssColor(0.83);
            context.fillText(text.value, pixelPosition.x, pixelPosition.y);

            // restore defaults
            context.textAlign = "start";
            context.textBaseline = "alphabetic";
          });
        },
      },
    ]),
};
