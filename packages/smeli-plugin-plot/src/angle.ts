import { Scope, StringValue, Vec2, Vec3 } from "@smeli/core";

import { evaluateTheme } from "@smeli/plugin-ui";

import { PlotItem } from "./types";

export const angle = {
  name: "angle",
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
        name: "color",
        evaluate: (scope: Scope) => evaluateTheme(scope).colors.primary,
      },
      {
        name: "label",
        evaluate: () => new StringValue(""),
      },
      {
        name: "#plot:item",
        evaluate: (scope: Scope) => {
          const points: Vec2[] = [];
          for (let i = 0; i < 3; i++) {
            const point = scope.evaluate("point" + i).as(Vec2);
            points.push(point);
          }

          const color = scope.evaluate("color").as(Vec3);
          const label = scope.evaluate("label").as(StringValue);

          return new PlotItem(({ context, viewport }) => {
            const pixelPoints = points.map((point) =>
              viewport.toPixels(point.x, point.y)
            );

            const edge0 = {
              x: pixelPoints[0].x - pixelPoints[1].x,
              y: pixelPoints[0].y - pixelPoints[1].y,
            };

            const edge1 = {
              x: pixelPoints[2].x - pixelPoints[1].x,
              y: pixelPoints[2].y - pixelPoints[1].y,
            };

            const startAngle = Math.atan2(edge0.y, edge0.x);
            const endAngle = Math.atan2(edge1.y, edge1.x);

            context.strokeStyle = color.toCssColor(0.83);
            context.setLineDash([4, 4]);
            context.lineWidth = 2;

            context.fillStyle = color.toCssColor(0.38);

            context.beginPath();
            context.arc(
              pixelPoints[1].x,
              pixelPoints[1].y,
              32,
              startAngle,
              endAngle
            );
            context.stroke();

            context.lineTo(pixelPoints[1].x, pixelPoints[1].y);
            context.closePath();

            context.fill();

            context.strokeStyle = color.toCssColor(0.6);
            context.setLineDash([]);
            context.lineWidth = 2;

            context.beginPath();
            context.moveTo(pixelPoints[0].x, pixelPoints[0].y);
            for (const { x, y } of pixelPoints.slice(1)) {
              context.lineTo(x, y);
            }

            context.stroke();

            if (label.value !== "") {
              const midAngle =
                startAngle +
                ((endAngle - startAngle + Math.PI * 2.0) % (Math.PI * 2.0)) *
                  0.5;

              const textPosition = {
                x: pixelPoints[1].x + Math.cos(midAngle) * 64,
                y: pixelPoints[1].y + Math.sin(midAngle) * 64,
              };

              context.textAlign = "center";
              context.textBaseline = "middle";
              context.fillStyle = color.toCssColor(0.83);
              context.fillText(label.value, textPosition.x, textPosition.y);

              // restore defaults
              context.textAlign = "start";
              context.textBaseline = "alphabetic";
            }
          });
        },
      },
    ]);

    return scope;
  },
};
