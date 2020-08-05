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

class GLDrawContext extends TypedValue {
  static typeName = "gl_draw_context";

  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;

  program: WebGLProgram | null = null;
  vbo: WebGLBuffer | null = null;

  disposed: boolean = false;

  constructor() {
    super();

    this.canvas = document.createElement("canvas");

    this.gl = this.canvas.getContext("webgl", {
      premultipliedAlpha: false,
    }) as WebGLRenderingContext;
  }

  loadShader(type: number, code: string) {
    if (this.program === null) {
      throw new Error(
        "Internal error: shader program should exist at this point"
      );
    }

    const shader = this.gl.createShader(type) as WebGLShader;

    this.gl.shaderSource(shader, code);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const error = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`Failed to compile shader: ${error}`);
    }

    this.gl.attachShader(this.program, shader);

    // tag the shader for deletion when the program goes away
    // (it will remain live as long as it is attached)
    this.gl.deleteShader(shader);

    return shader;
  }

  loadProgram(vertexCode: string, fragmentCode: string) {
    // unload previously loaded program
    if (this.program !== null) {
      this.gl.deleteProgram(this.program);
      this.program = null;
    }

    this.program = this.gl.createProgram() as WebGLProgram;

    this.loadShader(this.gl.VERTEX_SHADER, vertexCode);
    this.loadShader(this.gl.FRAGMENT_SHADER, fragmentCode);

    this.gl.linkProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      const error = this.gl.getProgramInfoLog(this.program);
      this.gl.deleteProgram(this.program);
      throw new Error(`Shader link failed: ${error}`);
    }

    this.gl.bindAttribLocation(this.program, 0, "position");
  }

  loadGeometry(data: number[]) {
    if (this.vbo !== null) {
      this.gl.deleteBuffer(this.vbo);
      this.vbo = null;
    }

    this.vbo = this.gl.createBuffer() as WebGLBuffer;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(data),
      this.gl.STATIC_DRAW
    );
  }

  dispose() {
    if (this.program) {
      this.gl.deleteProgram(this.program);
      this.program = null;
    }

    if (this.vbo !== null) {
      this.gl.deleteBuffer(this.vbo);
      this.vbo = null;
    }

    this.disposed = true;
  }
}

function redraw(
  context: GLDrawContext,
  uniforms: { [key: string]: TypedValue }
) {
  // this function is one frame late
  if (context.disposed) {
    return;
  }

  const canvas = context.canvas;
  const gl = context.gl;

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

  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.viewport(0, 0, width, height);

  gl.useProgram(context.program);

  for (const [name, value] of Object.entries(uniforms)) {
    const location = gl.getUniformLocation(
      context.program as WebGLProgram,
      name
    );
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

  gl.bindBuffer(gl.ARRAY_BUFFER, context.vbo);
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
        name: "#gl:context",
        evaluate: (scope: Scope) => new GLDrawContext(),
      },
      {
        name: "#ui:node",
        evaluate: (scope: Scope) => {
          const styles = evaluateUiStyles(scope);

          const container = document.createElement("div");
          container.className = "container " + styles.shader;

          const context = scope.evaluate("#gl:context").as(GLDrawContext);
          container.appendChild(context.canvas);

          const result = scope.evaluate(() => new DomNode(container));

          const quadVertices = [-1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0];
          context.loadGeometry(quadVertices);

          const startTime = new NumberValue(Date.now() * 0.001);

          // cache DOM element and GL context
          return (scope: Scope) => {
            const code = scope.evaluate("code").as(StringValue);
            context.loadProgram(vertexShaderCode, code.value);

            // cache compiled code
            return (scope: Scope) => {
              const time = scope
                .evaluate("time")
                .as(NumberValue)
                .__sub__(startTime);

              // redraw next frame (ensures correct layout, aspect ratio, etc.)
              requestAnimationFrame(() => redraw(context, { time }));

              return result;
            };
          };
        },
      },
    ]);

    return scope;
  },
};
