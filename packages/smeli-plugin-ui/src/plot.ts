import { Scope, TypedValue } from "@smeli/core";
import { DomNode } from "./types";
import { evaluateStyles } from "./styles";

export const plot = {
  name: "plot",
  evaluate: (parentScope: Scope) => {
    const scope = new Scope(parentScope);
    scope.push({
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
        context.fillStyle = "rgba(64, 150, 80, 0.83)";
        context.strokeStyle = "rgba(0, 0, 0, 0.6)";

        // transform to viewport space
        context.scale(width / viewportWidth, -height / viewportHeight);
        context.translate(-viewport[0], viewport[1] - 1);

        // unit square
        context.fillRect(-1, -1, 2, 2);

        // horizontal grid
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
        context.lineWidth = (4 * viewportWidth) / width;
        context.strokeStyle = "rgba(64, 150, 80, 0.83)";

        const fn = (x: number) => Math.sin(x);
        const step = (2 * viewportWidth) / width;
        context.beginPath();
        context.moveTo(viewport[0], fn(viewport[0]));
        for (let x = viewport[0] + step; x <= viewport[2]; x += step) {
          context.lineTo(x, fn(x));
        }
        context.stroke();

        return new DomNode(canvas);
      },
    });

    return scope;
  },
  invalidate: (value: TypedValue) => (value as Scope).dispose(),
};
