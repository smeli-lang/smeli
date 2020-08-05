import {
  NumberValue,
  Scope,
  StringValue,
  TypedValue,
  Vec2,
  Vec3,
} from "@smeli/core";

import { DomNode } from "./types";
import { evaluateUiStyles } from "./styles";

const vertexShaderCode = `
  uniform vec2 resolution;
  attribute vec2 position;
  varying vec2 uv;

  void main()
  {
      uv = position;
      uv.x *= resolution.x / resolution.y;
      gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const defaultFragmentShaderCode = `
  precision mediump float;

  uniform float time; // seconds
  varying vec2 uv;

  void main()
  {
    gl_FragColor = vec4(uv, sin(time), 1.0);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, code: string) {
  const shader = gl.createShader(type) as WebGLShader;

  gl.shaderSource(shader, code);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader);
    throw new Error(`Failed to compile shader: ${error}`);
  }

  return shader;
}

function compileProgram(
  gl: WebGLRenderingContext,
  vertexCode: string,
  fragmentCode: string
) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexCode);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentCode);

  const program = gl.createProgram() as WebGLProgram;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const error = gl.getProgramInfoLog(program);
    throw new Error(`Shader link failed: ${error}`);
  }

  return program;
}

function redraw(
  canvas: HTMLCanvasElement,
  gl: WebGLRenderingContext,
  vbo: WebGLBuffer,
  program: WebGLProgram,
  uniforms: { [key: string]: TypedValue }
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

  uniforms["resolution"] = new Vec2(width, height);

  gl.clearColor(1.0, 1.0, 0.0, 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.viewport(0, 0, width, height);

  gl.useProgram(program);

  for (const [name, value] of Object.entries(uniforms)) {
    const location = gl.getUniformLocation(program, name);
    if (location !== null) {
      if (value.is(NumberValue)) {
        gl.uniform1f(location, value.value);
      } else if (value.is(Vec2)) {
        gl.uniform2f(location, value.x, value.y);
      } else if (value.is(Vec3)) {
        gl.uniform3f(location, value.x, value.y, value.z);
      }
    }
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

export const shader = {
  name: "shader",
  evaluate: (parentScope: Scope) => {
    const scope = new Scope(parentScope);
    scope.push([
      {
        name: "code",
        evaluate: (scope: Scope) => new StringValue(defaultFragmentShaderCode),
      },
      {
        name: "#ui:node",
        evaluate: (scope: Scope) => {
          const styles = evaluateUiStyles(scope);
          const code = scope.evaluate("code").as(StringValue);

          const container = document.createElement("div");
          container.className = "container " + styles.shader;

          const canvas = document.createElement("canvas");
          container.appendChild(canvas);

          const gl = canvas.getContext("webgl", {
            alpha: true,
          }) as WebGLRenderingContext;

          const result = scope.evaluate(() => new DomNode(container));

          const program = compileProgram(gl, vertexShaderCode, code.value);

          const quadVertices = [-1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0];
          const vbo = gl.createBuffer() as WebGLBuffer;
          gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
          gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(quadVertices),
            gl.STATIC_DRAW
          );

          // cache DOM element
          return (scope: Scope) => {
            const time = scope.evaluate("time");

            // redraw next frame (ensures correct layout, aspect ratio, etc.)
            requestAnimationFrame(() =>
              redraw(canvas, gl, vbo, program, { time })
            );

            return result;
          };
        },
      },
    ]);

    return scope;
  },
};
