import {
  TypedValue,
  NumberType,
  TypeChecker,
  NumberValue,
  FunctionValue
} from "./types";
import { Binding, Scope } from "./scope";

const max: Binding = {
  name: "max",
  evaluate: () =>
    new FunctionValue((scope: Scope) => {
      const x = scope.evaluate("0", NumberType) as NumberValue;
      const y = scope.evaluate("1", NumberType) as NumberValue;
      const result = Math.max(x.value, y.value);
      return new NumberValue(result);
    })
};

const sin: Binding = {
  name: "sin",
  evaluate: () =>
    new FunctionValue((scope: Scope) => {
      const x = scope.evaluate("0", NumberType) as NumberValue;
      const result = Math.sin(x.value);
      return new NumberValue(result);
    })
};

// this is a hack; it won't work once caching is fully implemented
const time: Binding = {
  name: "time",
  evaluate: () => new NumberValue(Date.now() * 0.001)
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

export const builtins: Binding[] = [max, sin, time];
