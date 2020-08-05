import { Scope, StringValue } from "@smeli/core";

import { DomNode } from "./types";
import { evaluateUiStyles } from "./styles";

function redraw(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
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

  gl.clearColor(1.0, 1.0, 0.0, 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

export const shader = {
  name: "shader",
  evaluate: (parentScope: Scope) => {
    const scope = new Scope(parentScope);
    scope.push([
      {
        name: "code",
        evaluate: (scope: Scope) => new StringValue(""),
      },
      {
        name: "#ui:node",
        evaluate: (scope: Scope) => {
          const styles = evaluateUiStyles(scope);

          const container = document.createElement("div");
          container.className = "container " + styles.shader;

          const canvas = document.createElement("canvas");
          container.appendChild(canvas);

          const gl = canvas.getContext("webgl", {
            alpha: true,
          }) as WebGLRenderingContext;

          const result = scope.evaluate(() => new DomNode(container));

          // cache DOM element
          return (scope: Scope) => {
            // redraw next frame (ensures correct layout, aspect ratio, etc.)
            requestAnimationFrame(() => redraw(canvas, gl));

            return result;
          };
        },
      },
    ]);

    return scope;
  },
};
