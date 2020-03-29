import {
  TypedValue,
  NumberType,
  TypeChecker,
  NumberValue,
  FunctionValue
} from "./types";
import { Binding, Scope } from "./scope";

function max(args: TypedValue[]): TypedValue {
  const result = Math.max(
    ...args.map(arg => {
      const numberValue = TypeChecker.as<NumberValue>(arg, NumberType);
      return numberValue.value;
    })
  );
  return new NumberValue(result);
}

const timer = {
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
};

export const builtins: Binding[] = [
  {
    name: "max",
    evaluate: () => new FunctionValue(max)
  },
  timer
];
