import {
  NativeFunction,
  NumberValue,
  StringValue,
  TypedValue,
  Vec2,
  Vec3,
} from "./types";
import { Binding, Scope } from "./scope";

const cos: Binding = {
  name: "cos",
  evaluate: (parentScope: Scope) =>
    new NativeFunction(
      parentScope,
      [NumberValue],
      (x: NumberValue): NumberValue => {
        const result = Math.cos(x.value);
        return new NumberValue(result);
      }
    ),
};

const min: Binding = {
  name: "min",
  evaluate: (parentScope: Scope) =>
    new NativeFunction(
      parentScope,
      [NumberValue, NumberValue],
      (lhs: NumberValue, rhs: NumberValue): NumberValue => {
        const result = Math.min(lhs.value, rhs.value);
        return new NumberValue(result);
      }
    ),
};

const max: Binding = {
  name: "max",
  evaluate: (parentScope: Scope) =>
    new NativeFunction(
      parentScope,
      [NumberValue, NumberValue],
      (lhs: NumberValue, rhs: NumberValue): NumberValue => {
        const result = Math.max(lhs.value, rhs.value);
        return new NumberValue(result);
      }
    ),
};

const str: Binding = {
  name: "str",
  evaluate: (parentScope: Scope) =>
    new NativeFunction(
      parentScope,
      // should be an "any" type here
      [NumberValue],
      (value: TypedValue): StringValue => {
        if (!value.__str__) {
          throw new Error(
            `Type '${value.type().typeName}' doesn't have the __str__ trait`
          );
        }
        const result = value.__str__();
        return new StringValue(result);
      }
    ),
};

const outline: Binding = {
  name: "#outline",
  evaluate: () => new StringValue(""),
};

const sin: Binding = {
  name: "sin",
  evaluate: (parentScope: Scope) =>
    new NativeFunction(
      parentScope,
      [NumberValue],
      (x: NumberValue): NumberValue => {
        const result = Math.sin(x.value);
        return new NumberValue(result);
      }
    ),
};

const vec2: Binding = {
  name: "vec2",
  evaluate: (parentScope: Scope) =>
    new NativeFunction(
      parentScope,
      [NumberValue, NumberValue],
      (x: NumberValue, y: NumberValue): Vec2 => {
        const result = new Vec2(x.value, y.value);
        return result;
      }
    ),
};

const vec3: Binding = {
  name: "vec3",
  evaluate: (parentScope: Scope) =>
    new NativeFunction(
      parentScope,
      [NumberValue, NumberValue, NumberValue],
      (x: NumberValue, y: NumberValue, z: NumberValue): Vec3 => {
        const result = new Vec3(x.value, y.value, z.value);
        return result;
      }
    ),
};

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
