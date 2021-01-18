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

const animate: Binding = {
  name: "animate",
  evaluate: (parentScope: Scope) =>
    new Lambda(parentScope, ["start", "end", "duration"], (scope: Scope) => {
      const duration = scope.evaluate("duration").as(NumberValue).value;
      let finished = false;
      let startTime: number | null = null;

      return (scope: Scope) => {
        const endValue = scope.evaluate("end");

        // stop evaluating when animation is over
        if (finished) {
          return endValue;
        }

        const startValue = scope.evaluate("start");

        const currentTime = scope.evaluate("time").as(NumberValue).value;
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
    }),
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
]);

export const builtins: Binding[] = [
  animate,
  ceil,
  cos,
  floor,
  min,
  max,
  mod,
  outline,
  sin,
  smoothstep,
  step,
  str,
  tan,
  vec2,
  vec3,
];
