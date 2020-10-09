import { Lambda, NativeFunction, NumberValue, Scope, Vec3 } from "@smeli/core";

import { evaluateTheme } from "@smeli/plugin-ui";

import { PlotItem } from "./types";

export const functionItem = {
  name: "function",
  evaluate: (parentScope: Scope) => {
    const scope = new Scope(parentScope);
    scope.push([
      {
        name: "function",
        evaluate: (scope: Scope) => scope.evaluate("sin"),
      },
      {
        name: "color",
        evaluate: (scope: Scope) => evaluateTheme(scope).colors.primary,
      },
      {
        name: "#plot:item",
        evaluate: (scope: Scope) => {
          const functionValue = scope.evaluate("function");

          if (!functionValue.is(Lambda) && !functionValue.is(NativeFunction)) {
            throw new Error(`"function" is not a function`);
          }

          // cache evaluation function
          return (scope: Scope) => {
            const color = scope.evaluate("color").as(Vec3);

            return new PlotItem(({ context, viewport }) => {
              const resolution = 256;

              const dataPoints: number[] = [];
              const step =
                (viewport.bounds[2] - viewport.bounds[0]) / (resolution - 1);
              for (let i = 0; i < resolution; i++) {
                const input = viewport.bounds[0] + i * step;

                const argumentValue = new NumberValue(input);
                const callSiteEvaluator = (functionValue.__call_site__ as any)(
                  scope,
                  [() => argumentValue]
                );
                const value = scope
                  .transient(callSiteEvaluator)
                  .as(NumberValue);
                dataPoints.push(value.value);
              }

              // data points
              context.lineWidth = 4;
              context.strokeStyle = color.toCssColor(0.83);

              const startY = viewport.toPixels(0, dataPoints[0]).y;
              context.beginPath();
              context.moveTo(0, startY);
              for (let i = 0; i < dataPoints.length; i++) {
                const x = viewport.bounds[0] + i * step;
                const pixelPosition = viewport.toPixels(x, dataPoints[i]);
                context.lineTo(pixelPosition.x, pixelPosition.y);
              }
              context.stroke();
            });
          };
        },
      },
    ]);

    return scope;
  },
};
