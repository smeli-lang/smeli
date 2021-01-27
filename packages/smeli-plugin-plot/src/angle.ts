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

export const angle = {
  name: "angle",
  evaluate: () =>
    createChildScope([
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
        name: "right",
        evaluate: () => new BoolValue(false),
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
          const points: Vec2[] = [];
          for (let i = 0; i < 3; i++) {
            const point = evaluate("point" + i).as(Vec2);
            points.push(point);
          }
          const right = evaluate("right").as(BoolValue);

          const color = evaluate("color").as(Vec3);
          const label = evaluate("label").as(StringValue);

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
            context.fillStyle = color.toCssColor(0.38);
            context.lineWidth = 2;

            if (right.value) {
              const corners = [
                {
                  x: pixelPoints[1].x + edge0.x * 0.2,
                  y: pixelPoints[1].y + edge0.y * 0.2,
                },
                {
                  x: pixelPoints[1].x + (edge0.x + edge1.x) * 0.2,
                  y: pixelPoints[1].y + (edge0.y + edge1.y) * 0.2,
                },
                {
                  x: pixelPoints[1].x + edge1.x * 0.2,
                  y: pixelPoints[1].y + edge1.y * 0.2,
                },
              ];

              context.beginPath();
              context.moveTo(pixelPoints[1].x, pixelPoints[1].y);
              for (const corner of corners) {
                context.lineTo(corner.x, corner.y);
              }
              context.closePath();
            } else {
              context.setLineDash([4, 4]);

              context.beginPath();
              context.arc(
                pixelPoints[1].x,
                pixelPoints[1].y,
                32,
                startAngle,
                endAngle
              );
              context.stroke();

              context.setLineDash([]);

              context.lineTo(pixelPoints[1].x, pixelPoints[1].y);
              context.closePath();
            }

            context.fill();

            context.strokeStyle = color.toCssColor(0.6);
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
    ]),
};
