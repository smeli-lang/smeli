import {
  AnyType,
  Lambda,
  nativeBinding,
  NumberValue,
  StringValue,
  TypedValue,
  Vec2,
  Vec3,
} from "./types";
import { AddTrait, MulTrait, StrTrait } from "./traits";
import { Binding, Scope } from "./scope";
import { currentEvaluationContext, evaluate } from "./cache";

const abs = nativeBinding("abs", [
  {
    argumentTypes: [NumberValue],
    returnType: NumberValue,
    call: (x: NumberValue): NumberValue => {
      const result = Math.abs(x.value);
      return new NumberValue(result);
    },
  },
]);

const animate: Binding = {
  name: "animate",
  evaluate: () => {
    const parentScope = currentEvaluationContext().as(Scope);
    return new Lambda(parentScope, ["start", "end", "duration"], () => {
      const duration = evaluate("duration").as(NumberValue).value;
      let finished = false;
      let startTime: number | null = null;

      return () => {
        const endValue = evaluate("end");

        // stop evaluating when animation is over
        if (finished) {
          return endValue;
        }

        const startValue = evaluate("start");

        const currentTime = evaluate("time").as(NumberValue).value;
        if (startTime === null) {
          startTime = currentTime;
        }

        let t = (currentTime - startTime) / duration;
        if (t >= 1.0) {
          t = 1.0;
          finished = true;
        }

        const weightedStart = MulTrait.call(
          startValue,
          new NumberValue(1.0 - t)
        );
        const weightedEnd = MulTrait.call(endValue, new NumberValue(t));

        return AddTrait.call(weightedStart, weightedEnd);
      };
    });
  },
};

const ceil = nativeBinding("ceil", [
  {
    argumentTypes: [NumberValue],
    returnType: NumberValue,
    call: (x: NumberValue): NumberValue => {
      const result = Math.ceil(x.value);
      return new NumberValue(result);
    },
  },
]);

const cos = nativeBinding("cos", [
  {
    argumentTypes: [NumberValue],
    returnType: NumberValue,
    call: (x: NumberValue): NumberValue => {
      const result = Math.cos(x.value);
      return new NumberValue(result);
    },
  },
]);

const dot = nativeBinding("dot", [
  {
    argumentTypes: [NumberValue, NumberValue],
    returnType: NumberValue,
    call: (lhs: NumberValue, rhs: NumberValue): NumberValue => {
      const result = lhs.value * rhs.value;
      return new NumberValue(result);
    },
  },
  {
    argumentTypes: [Vec2, Vec2],
    returnType: NumberValue,
    call: (lhs: Vec2, rhs: Vec2): NumberValue => {
      const result = lhs.x * rhs.x + lhs.y * rhs.y;
      return new NumberValue(result);
    },
  },
  {
    argumentTypes: [Vec3, Vec3],
    returnType: NumberValue,
    call: (lhs: Vec3, rhs: Vec3): NumberValue => {
      const result = lhs.x * rhs.x + lhs.y * rhs.y + lhs.z * rhs.z;
      return new NumberValue(result);
    },
  },
]);

const exp = nativeBinding("exp", [
  {
    argumentTypes: [NumberValue],
    returnType: NumberValue,
    call: (v: NumberValue): NumberValue => new NumberValue(Math.exp(v.value)),
  },
  {
    argumentTypes: [Vec2],
    returnType: Vec2,
    call: (v: Vec2): Vec2 => new Vec2(Math.exp(v.x), Math.exp(v.y)),
  },
  {
    argumentTypes: [Vec3],
    returnType: Vec3,
    call: (v: Vec3): Vec3 =>
      new Vec3(Math.exp(v.x), Math.exp(v.y), Math.exp(v.z)),
  },
]);

const floor = nativeBinding("floor", [
  {
    argumentTypes: [NumberValue],
    returnType: NumberValue,
    call: (x: NumberValue): NumberValue => {
      const result = Math.floor(x.value);
      return new NumberValue(result);
    },
  },
]);

const fract = nativeBinding("fract", [
  {
    argumentTypes: [NumberValue],
    returnType: NumberValue,
    call: (x: NumberValue): NumberValue => {
      // apply a double modulo to match GLSL behavior for negative input values
      const result = ((x.value % 1) + 1) % 1;
      return new NumberValue(result);
    },
  },
]);

const length = nativeBinding("length", [
  {
    argumentTypes: [Vec2],
    returnType: NumberValue,
    call: (v: Vec2): NumberValue => {
      const result = Math.sqrt(v.x * v.x + v.y * v.y);
      return new NumberValue(result);
    },
  },
  {
    argumentTypes: [Vec3],
    returnType: NumberValue,
    call: (v: Vec3): NumberValue => {
      const result = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
      return new NumberValue(result);
    },
  },
]);

const log = nativeBinding("log", [
  {
    argumentTypes: [NumberValue],
    returnType: NumberValue,
    call: (v: NumberValue): NumberValue => new NumberValue(Math.log(v.value)),
  },
  {
    argumentTypes: [Vec2],
    returnType: Vec2,
    call: (v: Vec2): Vec2 => new Vec2(Math.log(v.x), Math.log(v.y)),
  },
  {
    argumentTypes: [Vec3],
    returnType: Vec3,
    call: (v: Vec3): Vec3 =>
      new Vec3(Math.log(v.x), Math.log(v.y), Math.log(v.z)),
  },
]);

const min = nativeBinding("min", [
  {
    argumentTypes: [NumberValue, NumberValue],
    returnType: NumberValue,
    call: (lhs: NumberValue, rhs: NumberValue): NumberValue => {
      const result = Math.min(lhs.value, rhs.value);
      return new NumberValue(result);
    },
  },
]);

const max = nativeBinding("max", [
  {
    argumentTypes: [NumberValue, NumberValue],
    returnType: NumberValue,
    call: (lhs: NumberValue, rhs: NumberValue): NumberValue => {
      const result = Math.max(lhs.value, rhs.value);
      return new NumberValue(result);
    },
  },
]);

const mod = nativeBinding("mod", [
  {
    argumentTypes: [NumberValue, NumberValue],
    returnType: NumberValue,
    call: (lhs: NumberValue, rhs: NumberValue): NumberValue => {
      // apply a double modulo to match GLSL behavior for negative input values
      const result = ((lhs.value % rhs.value) + rhs.value) % rhs.value;
      return new NumberValue(result);
    },
  },
]);

const normalize = nativeBinding("normalize", [
  {
    argumentTypes: [Vec2],
    returnType: Vec2,
    call: (v: Vec2): Vec2 => {
      const rcpLength = 1.0 / Math.sqrt(v.x * v.x + v.y * v.y);
      return new Vec2(v.x * rcpLength, v.y * rcpLength);
    },
  },
  {
    argumentTypes: [Vec3],
    returnType: Vec3,
    call: (v: Vec3): Vec3 => {
      const rcpLength = 1.0 / Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
      return new Vec3(v.x * rcpLength, v.y * rcpLength, v.z * rcpLength);
    },
  },
]);

const pow = nativeBinding("pow", [
  {
    argumentTypes: [NumberValue, NumberValue],
    returnType: NumberValue,
    call: (v1: NumberValue, v2: NumberValue): NumberValue =>
      new NumberValue(Math.pow(v1.value, v2.value)),
  },
  {
    argumentTypes: [Vec2, Vec2],
    returnType: Vec2,
    call: (v1: Vec2, v2: Vec2): Vec2 =>
      new Vec2(Math.pow(v1.x, v2.x), Math.pow(v1.y, v2.y)),
  },
  {
    argumentTypes: [Vec3, Vec3],
    returnType: Vec3,
    call: (v1: Vec3, v2: Vec3): Vec3 =>
      new Vec3(
        Math.pow(v1.x, v2.x),
        Math.pow(v1.y, v2.y),
        Math.pow(v1.z, v2.z)
      ),
  },
]);

const str = nativeBinding("str", [
  {
    argumentTypes: [AnyType],
    returnType: StringValue,
    call: (value: TypedValue): StringValue => {
      return StrTrait.call(value).as(StringValue);
    },
  },
]);

const outline: Binding = {
  name: "#outline",
  evaluate: () => new StringValue(""),
};

const sin = nativeBinding("sin", [
  {
    argumentTypes: [NumberValue],
    returnType: NumberValue,
    call: (x: NumberValue): NumberValue => {
      const result = Math.sin(x.value);
      return new NumberValue(result);
    },
  },
]);

const smoothstep = nativeBinding("smoothstep", [
  {
    argumentTypes: [NumberValue, NumberValue, NumberValue],
    returnType: NumberValue,
    call: (
      edge0: NumberValue,
      edge1: NumberValue,
      x: NumberValue
    ): NumberValue => {
      let t = (x.value - edge0.value) / (edge1.value - edge0.value);
      t = Math.max(t, 0.0);
      t = Math.min(t, 1.0);
      const result = t * t * (3 - 2 * t);
      return new NumberValue(result);
    },
  },
]);

const step = nativeBinding("step", [
  {
    argumentTypes: [NumberValue, NumberValue],
    returnType: NumberValue,
    call: (edge: NumberValue, x: NumberValue): NumberValue => {
      const result = x.value < edge.value ? 0 : 1;
      return new NumberValue(result);
    },
  },
]);

const tan = nativeBinding("tan", [
  {
    argumentTypes: [NumberValue],
    returnType: NumberValue,
    call: (x: NumberValue): NumberValue => {
      const result = Math.tan(x.value);
      return new NumberValue(result);
    },
  },
]);

const vec2 = nativeBinding("vec2", [
  {
    argumentTypes: [NumberValue],
    returnType: Vec2,
    call: (xy: NumberValue) => new Vec2(xy.value, xy.value),
  },
  {
    argumentTypes: [NumberValue, NumberValue],
    returnType: Vec2,
    call: (x: NumberValue, y: NumberValue) => new Vec2(x.value, y.value),
  },
]);

const vec3 = nativeBinding("vec3", [
  {
    argumentTypes: [NumberValue],
    returnType: Vec3,
    call: (xyz: NumberValue) => new Vec3(xyz.value, xyz.value, xyz.value),
  },
  {
    argumentTypes: [NumberValue, NumberValue, NumberValue],
    returnType: Vec3,
    call: (x: NumberValue, y: NumberValue, z: NumberValue) =>
      new Vec3(x.value, y.value, z.value),
  },
  {
    argumentTypes: [NumberValue, Vec2],
    returnType: Vec3,
    call: (x: NumberValue, y: Vec2) => new Vec3(x.value, y.x, y.y),
  },
  {
    argumentTypes: [Vec2, NumberValue],
    returnType: Vec3,
    call: (x: Vec2, y: NumberValue) => new Vec3(x.x, x.y, y.value),
  },
]);

export const builtins: Binding[] = [
  abs,
  animate,
  ceil,
  cos,
  dot,
  exp,
  floor,
  fract,
  length,
  log,
  min,
  max,
  mod,
  normalize,
  outline,
  pow,
  sin,
  smoothstep,
  step,
  str,
  tan,
  vec2,
  vec3,
];
