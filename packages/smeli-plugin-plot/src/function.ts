import {
  evaluate,
  Lambda,
  NativeFunction,
  NumberValue,
  Scope,
  Vec3,
} from "@smeli/core";

import { evaluateTheme } from "@smeli/plugin-ui";

import { PlotItem } from "./types";

export const functionItem = {
  name: "function",
  evaluate: (parentScope: Scope) => {
    const scope = new Scope(parentScope);
    scope.push([
      {
        name: "function",
        evaluate: (scope: Scope) => evaluate("sin"),
      },
      {
        name: "color",
        evaluate: (scope: Scope) => evaluateTheme(scope).colors.primary,
      },
      {
        name: "#plot:item",
        evaluate: (scope: Scope) => {
          const functionValue = evaluate("function");

          if (!functionValue.is(Lambda) && !functionValue.is(NativeFunction)) {
            throw new Error(`"function" is not a function`);
          }

          const transientEvaluator = functionValue.makeTransientEvaluator();

          // cache evaluation function
          return (scope: Scope) => {
            const color = evaluate("color").as(Vec3);

            return new PlotItem(({ context, viewport }) => {
              const resolution = (viewport.pixelSize.x / 2) | 0;
              const step =
                (viewport.bounds[2] - viewport.bounds[0]) / (resolution - 1);

              context.lineWidth = 4;
              context.lineJoin = "round";
              context.strokeStyle = color.toCssColor(0.83);

              context.beginPath();
              for (let i = 0; i < resolution; i++) {
                const x = viewport.bounds[0] + i * step;
                const y = transientEvaluator(new NumberValue(x)).as(NumberValue)
                  .value;
                const pixelPosition = viewport.toPixels(x, y);

                if (i === 0) {
                  context.moveTo(pixelPosition.x, pixelPosition.y);
                } else {
                  context.lineTo(pixelPosition.x, pixelPosition.y);
                }
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
