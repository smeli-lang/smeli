import {
  Scope,
  // TypedValue,
  // FunctionType,
  // FunctionValue,
  // NumberValue,
  // Binding,
} from "@smeli/core";
import { DomNode } from "./types";
import { evaluateStyles } from "./styles";

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
        name: "#node",
        evaluate: (scope: Scope) => {
          const styles = evaluateStyles(scope);
          const canvas = document.createElement("canvas");
          canvas.className = styles.plot;

          const width = 800; //canvas.clientWidth;
          const height = 800; //canvas.clientHeight;

          canvas.width = width;
          canvas.height = height;

          const viewport = [-2, -3, 7, 4]; // xmin, ymin, xmax, ymax
          const viewportWidth = viewport[2] - viewport[0];
          const viewportHeight = viewport[3] - viewport[1];

          const context = canvas.getContext("2d") as CanvasRenderingContext2D;

          // transform to viewport space
          context.scale(width / viewportWidth, -height / viewportHeight);
          context.translate(-viewport[0], viewport[1] - 1);

          // origin
          context.fillStyle = "rgba(0, 0, 0, 0.83)";
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
          for (
            let y = Math.ceil(viewport[1]);
            y < Math.floor(viewport[3]);
            y += 1
          ) {
            context.beginPath();
            context.moveTo(viewport[0], y);
            context.lineTo(viewport[2], y);
            context.stroke();
          }

          // vertical grid
          context.lineWidth = viewportWidth / width;
          for (
            let x = Math.ceil(viewport[0]);
            x < Math.floor(viewport[2]);
            x += 1
          ) {
            context.beginPath();
            context.moveTo(x, viewport[1]);
            context.lineTo(x, viewport[3]);
            context.stroke();
          }

          // function
          /*const functionValue = scope.evaluate(
            "function",
            FunctionType
          ) as FunctionValue;

          const evaluationScope = new Scope(functionValue.parentScope);

          function evaluateFunction(x: number) {
            const arg: Binding = {
              name: "0",
              evaluate: () => new NumberValue(x),
            };
            evaluationScope.push(arg);
            const result = FunctionType.__call__
              ? (FunctionType.__call__(
                  functionValue,
                  evaluationScope
                ) as NumberValue)
              : new NumberValue(0);
            evaluationScope.pop(arg);

            return result;
          }

          context.lineWidth = (4 * viewportWidth) / width;
          context.strokeStyle = "rgba(64, 150, 80, 0.83)";

          const step = (2 * viewportWidth) / width;
          context.beginPath();
          context.moveTo(viewport[0], evaluateFunction(viewport[0]).value);
          for (let x = viewport[0] + step; x <= viewport[2]; x += step) {
            context.lineTo(x, evaluateFunction(x).value);
          }
          context.stroke();

          evaluationScope.dispose();*/

          return new DomNode(canvas);
        },
      },
    ]);

    return scope;
  },
};
