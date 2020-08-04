import {
  NumberValue,
  Evaluator,
  Scope,
  Vec2,
  Lambda,
  NativeFunction,
} from "@smeli/core";

import { DomNode } from "./types";
import { evaluateUiStyles } from "./styles";

function redraw(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  viewport: number[],
  dataPoints: number[],
  pointX: number,
  pointY: number
) {
  const container = canvas.parentElement as HTMLElement;
  const width = container.clientWidth;
  const height = container.clientHeight;

  // avoid dividing by zero later; also there's no point
  // drawing in this case
  if (width === 0 || height === 0) {
    return;
  }

  canvas.width = width;
  canvas.height = height;

  const viewportWidth = viewport[2] - viewport[0];
  const viewportHeight = viewport[3] - viewport[1];

  // transform to viewport space
  const scaleX = width / viewportWidth;
  const scaleY = -height / viewportHeight;
  context.translate(-viewport[0] * scaleX, (viewport[1] - 1) * scaleY);

  // horizontal grid
  context.strokeStyle = "rgba(0, 0, 0, 0.6)";
  context.lineWidth = 1;
  for (let y = Math.ceil(viewport[1]); y < Math.floor(viewport[3]); y += 1) {
    context.beginPath();
    context.moveTo(viewport[0] * scaleX, Math.floor(y * scaleY));
    context.lineTo(viewport[2] * scaleX, Math.floor(y * scaleY));
    context.stroke();
  }

  // vertical grid
  context.lineWidth = 1;
  for (let x = Math.ceil(viewport[0]); x < Math.floor(viewport[2]); x += 1) {
    context.beginPath();
    context.moveTo(Math.floor(x * scaleX), viewport[1] * scaleY);
    context.lineTo(Math.floor(x * scaleX), viewport[3] * scaleY);
    context.stroke();
  }

  // data points
  context.lineWidth = 8;
  context.strokeStyle = "rgba(64, 150, 80, 0.83)";

  const step = viewportWidth / (dataPoints.length - 1);
  context.beginPath();
  context.moveTo(viewport[0] * scaleX, dataPoints[0] * scaleY);
  for (let i = 0; i < dataPoints.length; i++) {
    const x = viewport[0] + i * step;
    context.lineTo(x * scaleX, dataPoints[i] * scaleY);
  }
  context.stroke();

  // point of interest
  context.fillStyle = "rgba(64, 150, 80, 0.83)";
  context.strokeStyle = "rgb(128,203,196, 0.83)";

  context.beginPath();
  context.arc(pointX * scaleX, pointY * scaleY, 8, 0, 2.0 * Math.PI);
  context.fill();
  context.stroke();

  // x = pointX
  if (viewport[0] <= pointX && viewport[2] >= pointX) {
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(pointX * scaleX, viewport[1] * scaleY);
    context.lineTo(pointX * scaleX, viewport[3] * scaleY);
    context.stroke();
  }

  // y = pointY
  if (viewport[1] <= pointY && viewport[3] >= pointY) {
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(viewport[0] * scaleX, pointY * scaleY);
    context.lineTo(viewport[2] * scaleX, pointY * scaleY);
    context.stroke();
  }
}

export const plot = {
  name: "plot",
  evaluate: (parentScope: Scope) => {
    const scope = new Scope(parentScope);
    scope.push([
      {
        name: "function",
        evaluate: (scope: Scope) => scope.evaluate("sin"),
      },
      {
        name: "point",
        evaluate: () => new Vec2(0, 0),
      },
      {
        name: "#ui:node",
        evaluate: (scope: Scope) => {
          const styles = evaluateUiStyles(scope);

          const container = document.createElement("div");
          container.className = "container " + styles.plot;

          const canvas = document.createElement("canvas");
          container.appendChild(canvas);

          const context = canvas.getContext("2d") as CanvasRenderingContext2D;

          const result = scope.evaluate(() => new DomNode(container));

          // cache DOM element
          return (scope: Scope) => {
            const functionValue = scope.evaluate("function");

            if (
              !functionValue.is(Lambda) &&
              !functionValue.is(NativeFunction)
            ) {
              throw new Error(`"function" is not a function`);
            }

            // cache evaluation function
            return (scope: Scope) => {
              // viewport parameters
              const viewport = [-2, -3, 7, 4]; // xmin, ymin, xmax, ymax
              const resolution = 256;

              const evaluators: Evaluator[] = [];
              const step = (viewport[2] - viewport[0]) / (resolution - 1);
              for (let i = 0; i < resolution; i++) {
                const input = viewport[0] + i * step;

                const argumentValue = new NumberValue(input);
                const callSiteEvaluator = (functionValue.__call_site__ as any)(
                  scope,
                  [() => argumentValue]
                );

                evaluators.push(callSiteEvaluator);
              }

              // cache evaluation scopes
              return (scope: Scope) => {
                const dataPoints = evaluators.map((evaluator) => {
                  const value = scope.transient(evaluator).as(NumberValue);
                  return value.value;
                });

                const { x, y } = scope.evaluate("point").as(Vec2);

                // redraw next frame (ensures correct layout, aspect ratio, etc.)
                requestAnimationFrame(() =>
                  redraw(canvas, context, viewport, dataPoints, x, y)
                );

                return result;
              };
            };
          };
        },
      },
    ]);

    return scope;
  },
};
