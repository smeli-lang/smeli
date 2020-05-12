import { NumberValue, Scope, NumberType, Evaluator } from "@smeli/core";
import { DomNode } from "./types";
import { evaluateStyles } from "./styles";

function redraw(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  viewport: number[],
  dataPoints: number[]
) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

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
  context.scale(width / viewportWidth, -height / viewportHeight);
  context.translate(-viewport[0], viewport[1] - 1);

  // origin
  context.fillStyle = "rgb(0, 0, 0)";
  context.beginPath();
  context.arc(0, 0, 0.1, 0, 2.0 * Math.PI);
  context.fill();

  context.strokeStyle = "rgba(0, 0, 0, 0.87)";

  // x = 0
  if (viewport[0] <= 0 && viewport[2] >= 0) {
    context.lineWidth = (2 * viewportWidth) / width;
    context.beginPath();
    context.moveTo(0, viewport[1]);
    context.lineTo(0, viewport[3]);
    context.stroke();
  }

  // y = 0
  if (viewport[1] <= 0 && viewport[3] >= 0) {
    context.lineWidth = (2 * viewportHeight) / height;
    context.beginPath();
    context.moveTo(viewport[0], 0);
    context.lineTo(viewport[2], 0);
    context.stroke();
  }

  // horizontal grid
  context.strokeStyle = "rgba(0, 0, 0, 0.6)";
  context.lineWidth = viewportHeight / height;
  for (let y = Math.ceil(viewport[1]); y < Math.floor(viewport[3]); y += 1) {
    context.beginPath();
    context.moveTo(viewport[0], y);
    context.lineTo(viewport[2], y);
    context.stroke();
  }

  // vertical grid
  context.lineWidth = viewportWidth / width;
  for (let x = Math.ceil(viewport[0]); x < Math.floor(viewport[2]); x += 1) {
    context.beginPath();
    context.moveTo(x, viewport[1]);
    context.lineTo(x, viewport[3]);
    context.stroke();
  }

  // data points
  context.lineWidth = (8 * viewportWidth) / width;
  context.strokeStyle = "rgba(64, 150, 80, 0.83)";

  const step = viewportWidth / (dataPoints.length - 1);
  context.beginPath();
  context.moveTo(viewport[0], dataPoints[0]);
  for (let i = 0; i < dataPoints.length; i++) {
    const x = viewport[0] + i * step;
    context.lineTo(x, dataPoints[i]);
  }
  context.stroke();
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
        name: "#ui:node",
        evaluate: (scope: Scope) => {
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d") as CanvasRenderingContext2D;

          const styles = evaluateStyles(scope);
          canvas.className = styles.plot;

          const result = scope.evaluate(() => new DomNode(canvas));

          // cache DOM element
          return (scope: Scope) => {
            const functionValue = scope.evaluate("function");
            const functionType = functionValue.type();

            if (!functionType.__call_site__) {
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
                const callSiteEvaluator = (functionType.__call_site__ as any)(
                  functionValue,
                  scope,
                  [() => argumentValue]
                );

                evaluators.push(callSiteEvaluator);
              }

              // cache evaluation scopes
              return (scope: Scope) => {
                const dataPoints = evaluators.map((evaluator) => {
                  const value = scope.transient(
                    evaluator,
                    NumberType
                  ) as NumberValue;
                  return value.value;
                });

                // redraw next frame
                requestAnimationFrame(() =>
                  redraw(canvas, context, viewport, dataPoints)
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
