import {
  NativeFunction,
  NumberType,
  NumberValue,
  StringValue,
  TypeTraits,
  TypedValue,
  Vec2,
} from "./types";
import { Binding, Scope } from "./scope";

const min: Binding = {
  name: "min",
  evaluate: (parentScope: Scope) =>
    new NativeFunction(
      parentScope,
      [NumberType, NumberType],
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
      [NumberType, NumberType],
      (lhs: NumberValue, rhs: NumberValue): NumberValue => {
        const result = Math.max(lhs.value, rhs.value);
        return new NumberValue(result);
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
      [NumberType],
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
      [NumberType, NumberType],
      (x: NumberValue, y: NumberValue): Vec2 => {
        const result = new Vec2(x.value, y.value);
        return result;
      }
    ),
};

class Timer implements TypedValue {
  private binding: Binding;
  private intervalId: any;

  constructor(scope: Scope) {
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

  type() {
    return TimerType;
  }
}

const TimerType: TypeTraits = {
  __name__: () => "timer",
};

const time: Binding = {
  name: "time",
  evaluate: (scope: Scope) => {
    // the timer will rebind the private #time value regularly
    const timer = scope.evaluate((scope: Scope) => new Timer(scope));

    // forward the changing time value
    return (scope: Scope) => scope.evaluate("#time");
  },
};

export const builtins: Binding[] = [min, max, outline, sin, time];
