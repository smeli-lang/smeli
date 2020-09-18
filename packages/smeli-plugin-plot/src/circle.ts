import { BoolValue, NumberValue, Scope, Vec2, Vec3 } from "@smeli/core";

import { evaluateTheme } from "@smeli/plugin-ui";

import { Renderer } from "./renderer";
import { PlotItem } from "./types";

export const circle = {
  name: "circle",
  evaluate: (parentScope: Scope) => {
    const scope = new Scope(parentScope);
    scope.push([
      {
        name: "center",
        evaluate: () => new Vec2(0.0, 0.0),
      },
      {
        name: "radius",
        evaluate: () => new NumberValue(1.0),
      },
      {
        name: "slice",
        evaluate: () => new Vec2(0, 2.0 * Math.PI),
      },
      {
        name: "color",
        evaluate: (scope: Scope) => evaluateTheme(scope).colors.primary,
      },
      {
        name: "fill",
        evaluate: () => new BoolValue(true),
      },
      {
        name: "#plot:item",
        evaluate: (scope: Scope) => {
          const center = scope.evaluate("center").as(Vec2);
          const radius = scope.evaluate("radius").as(NumberValue);
          const slice = scope.evaluate("slice").as(Vec2);
          const color = scope.evaluate("color").as(Vec3);
          const fill = scope.evaluate("fill").as(BoolValue);

          return new PlotItem((renderer: Renderer) => {
            renderer.queueDraw((context: CanvasRenderingContext2D) => {
              const pixelCenter = renderer.viewportPositionToPixels(
                center.x,
                center.y
              );

              context.strokeStyle = color.toCssColor(0.83);
              context.lineWidth = 2;

              context.beginPath();
              context.ellipse(
                pixelCenter.x,
                pixelCenter.y,
                radius.value * renderer.pixelTransformX[0],
                -radius.value * renderer.pixelTransformY[0],
                0,
                -slice.y,
                -slice.x
              );

              const twoPi = 2.0 * Math.PI;
              let angleDifference =
                (((slice.y - slice.x) % twoPi) + twoPi) % twoPi;

              if (angleDifference > Math.PI) {
                angleDifference = twoPi - angleDifference;
              }

              const threshold = (1 / 360) * twoPi;
              if (angleDifference >= threshold) {
                context.lineTo(pixelCenter.x, pixelCenter.y);
              }

              context.closePath();

              context.stroke();

              if (fill.value) {
                context.fillStyle = color.toCssColor(0.38);
                context.fill();
              }
            });
          });
        },
      },
    ]);

    return scope;
  },
};
