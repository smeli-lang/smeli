import {
  createChildScope,
  NumberValue,
  Scope,
  ScopeOverride,
  StringValue,
  TypedValue,
  Vec2,
  Vec3,
  TypedConstructor,
  evaluate,
  currentEvaluationContext,
} from "@smeli/core";

import { DomNode } from "./types";
import { evaluateUiStyles } from "./styles";

// temporary polyfill until Observers are added to the
// official DOM declarations
declare class ResizeObserver {
  constructor(callback: Function);
}
const vertexShaderCode = `
  uniform vec2 resolution;
  attribute vec2 position;
  varying vec2 uv;

  void main()
  {
      uv = position;

      if (resolution.x > resolution.y)
      {
        uv.x *= resolution.x / resolution.y;
      }
      else
      {
        uv.y *= resolution.y / resolution.x;
      }
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

  uniformInfo: {
    name: string;
    location: WebGLUniformLocation;
    type: TypedConstructor<TypedValue>;
  }[] = [];

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

    // extract uniform locations and types
    const uniformCount = this.gl.getProgramParameter(
      this.program,
      this.gl.ACTIVE_UNIFORMS
    );

    const uniformTypes = new Map<GLenum, TypedConstructor<TypedValue>>();
    uniformTypes.set(this.gl.FLOAT, NumberValue);
    uniformTypes.set(this.gl.FLOAT_VEC2, Vec2);
    uniformTypes.set(this.gl.FLOAT_VEC3, Vec3);

    for (let i = 0; i < uniformCount; i++) {
      const info = this.gl.getActiveUniform(this.program, i) as WebGLActiveInfo;

      if (!uniformTypes.has(info.type)) {
        throw new Error("Unsupported uniform type: " + info.type);
      }

      this.uniformInfo.push({
        name: info.name,
        location: this.gl.getUniformLocation(
          this.program,
          info.name
        ) as WebGLUniformLocation,
        type: uniformTypes.get(info.type) as TypedConstructor<TypedValue>,
      });
    }
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
  }
}

function redraw(
  context: GLDrawContext,
  pixelSize: Vec2,
  uniforms: {
    name: string;
    location: WebGLUniformLocation;
    value: TypedValue;
  }[]
) {
  const gl = context.gl;

  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.viewport(0, 0, pixelSize.x, pixelSize.y);

  gl.useProgram(context.program);

  for (const { name, location, value } of uniforms) {
    if (value.is(NumberValue)) {
      gl.uniform1f(location, value.value);
    } else if (value.is(Vec2)) {
      gl.uniform2f(location, value.x, value.y);
    } else if (value.is(Vec3)) {
      gl.uniform3f(location, value.x, value.y, value.z);
    }
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, context.vbo);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

export const shader = {
  name: "shader",
  evaluate: () =>
    createChildScope([
      {
        name: "code",
        evaluate: () => new StringValue(defaultFragmentShaderCode),
      },
      {
        name: "uniforms",
        evaluate: () => createChildScope(),
      },
      {
        name: "#gl:context",
        evaluate: () => new GLDrawContext(),
      },
      {
        name: "#gl:start_time",
        evaluate: () => new NumberValue(Date.now() * 0.001),
      },
      {
        name: "#pixel_size",
        evaluate: () => new Vec2(0.0, 0.0),
      },
      {
        name: "#ui:node",
        evaluate: () => {
          const styles = evaluateUiStyles();

          const container = document.createElement("div");
          container.className = "container " + styles.shader;

          const context = evaluate("#gl:context").as(GLDrawContext);
          container.appendChild(context.canvas);

          const scope = currentEvaluationContext().as(Scope);
          const pixelSizeOverride = new ScopeOverride(scope, "#pixel_size");
          const resizeObserver = new ResizeObserver((entries: any) => {
            // use only the latest update
            const entry = entries[entries.length - 1];
            const { width, height } = entry.contentRect;
            pixelSizeOverride.bind(() => new Vec2(width, height));
          });

          const result = new DomNode(container, {}, [resizeObserver]);

          const quadVertices = [-1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0];
          context.loadGeometry(quadVertices);

          // cache DOM element and GL context
          return () => {
            const code = evaluate("code").as(StringValue);
            context.loadProgram(vertexShaderCode, code.value);

            const uniformScope = evaluate("uniforms").as(Scope);

            // cache compiled code
            return () => {
              // actual pixel size of the canvas
              const pixelSize = evaluate("#pixel_size").as(Vec2);
              if (pixelSize.x === 0 || pixelSize.y === 0) {
                return result;
              }
              context.canvas.width = pixelSize.x;
              context.canvas.height = pixelSize.y;

              const uniforms = context.uniformInfo.map((info) => {
                const value =
                  info.name === "resolution"
                    ? pixelSize
                    : evaluate(info.name, uniformScope).as(info.type);

                return {
                  name: info.name,
                  location: info.location,
                  value,
                };
              });

              redraw(context, pixelSize, uniforms);

              return result;
            };
          };
        },
      },
    ]),
};
