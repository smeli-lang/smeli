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

const vec2 = nativeBinding("vec2", [
  {
    argumentTypes: [NumberValue, NumberValue],
    returnType: Vec2,
    call: (x: NumberValue, y: NumberValue) => new Vec2(x.value, y.value),
  },
]);

const vec3 = nativeBinding("vec3", [
  {
    argumentTypes: [NumberValue, NumberValue, NumberValue],
    returnType: Vec3,
    call: (x: NumberValue, y: NumberValue, z: NumberValue) =>
      new Vec3(x.value, y.value, z.value),
  },
]);

class Timer extends TypedValue {
  static typeName = "timer";

  private binding: Binding;
  private intervalId: any;

  constructor(scope: Scope) {
    super();

    this.binding = {
      name: "#time",
      evaluate: () => new NumberValue(Date.now() * 0.001),
    };

    scope.push(this.binding);

    this.intervalId = setInterval(() => {
      scope.pop(this.binding);
      scope.push(this.binding);
    }, 5) as any;
  }

  dispose() {
    clearInterval(this.intervalId);
  }
}

const time: Binding = {
  name: "time",
  evaluate: (scope: Scope) => {
    // the timer will rebind the private #time value regularly
    const timer = scope.evaluate((scope: Scope) => new Timer(scope));

    // forward the changing time value
    return (scope: Scope) => scope.evaluate("#time");
  },
};

export const builtins: Binding[] = [
  animate,
  cos,
  min,
  max,
  outline,
  sin,
  str,
  time,
  vec2,
  vec3,
];
