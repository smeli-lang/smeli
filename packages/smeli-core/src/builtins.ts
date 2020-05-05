import { NativeFunction, NumberType, NumberValue, StringValue } from "./types";
import { Binding, Scope } from "./scope";

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

// this is a hack; it won't work once caching is fully implemented
const time: Binding = {
  name: "time",
  evaluate: () => new NumberValue(Date.now() * 0.001),
};

/*const timer: Binding = {
  name: "timer",
  evaluate: (parentScope: Scope) => {
    const scope = new Scope(parentScope);
    scope.push([
      {
        name: "time",
        evaluate: () => new NumberValue(0)
      },
      {
        name: "#update",
        evaluate: scope => {
          let binding: Binding | null = null;
          setInterval(() => {
            if (binding) {
              scope.pop(binding);
              binding = null;
            }

            binding = {
              name: "time",
              evaluate: () => new NumberValue(Date.now())
            };
            scope.push(binding);
          }, 10);

          return new NumberValue(0);
        }
      }
    ]);

    return scope;
  }
};*/

export const builtins: Binding[] = [max, outline, sin, time];
