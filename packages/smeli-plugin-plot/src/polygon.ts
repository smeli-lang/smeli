import { BoolValue, NumberValue, Scope, Vec2, Vec3 } from "@smeli/core";

import { evaluateTheme } from "@smeli/plugin-ui";

import { PlotItem } from "./types";

export const polygon = {
  name: "polygon",
  evaluate: (parentScope: Scope) => {
    const scope = new Scope(parentScope);
    scope.push([
      {
        name: "point0",
        evaluate: () => new Vec2(-1.0, 0.3),
      },
      {
        name: "point1",
        evaluate: () => new Vec2(0.4, 0.2),
      },
      {
        name: "point2",
        evaluate: () => new Vec2(-0.2, -0.9),
      },
      {
        name: "point3",
        evaluate: () => new NumberValue(0),
      },
      {
        name: "point4",
        evaluate: () => new NumberValue(0),
      },
      {
        name: "point5",
        evaluate: () => new NumberValue(0),
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
          const points: Vec2[] = [];
          for (let i = 0; i < 6; i++) {
            const point = scope.evaluate("point" + i);
            if (point.is(Vec2)) {
              points.push(point);
            }
          }

          const color = scope.evaluate("color").as(Vec3);
          const fill = scope.evaluate("fill").as(BoolValue);

          return new PlotItem(({ context, viewport }) => {
            const pixelPoints = points.map((point) =>
              viewport.toPixels(point.x, point.y)
            );

            context.fillStyle = color.toCssColor(1.0);

            for (const { x, y } of pixelPoints) {
              context.beginPath();
              context.arc(x, y, 4, 0, 2.0 * Math.PI);
              context.fill();
            }

            context.strokeStyle = color.toCssColor(0.83);
            context.fillStyle = color.toCssColor(0.6);
            context.lineWidth = 2;

            context.beginPath();
            context.moveTo(pixelPoints[0].x, pixelPoints[0].y);
            for (const { x, y } of pixelPoints.slice(1)) {
              context.lineTo(x, y);
            }
            context.lineTo(pixelPoints[0].x, pixelPoints[0].y);

            context.stroke();

            if (fill.value) {
              context.fill();
            }
          });
        },
      },
    ]);

    return scope;
  },
};
