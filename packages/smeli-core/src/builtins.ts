import {
  TypedValue,
  NumberType,
  TypeChecker,
  NumberValue,
  FunctionValue
} from "./types";
import { Binding } from "./scope";

function max(args: TypedValue[]): TypedValue {
  const result = Math.max(
    ...args.map(arg => {
      const numberValue = TypeChecker.as<NumberValue>(arg, NumberType);
      return numberValue.value;
    })
  );
  return new NumberValue(result);
}

export const builtins: Binding[] = [
  {
    name: "max",
    evaluate: () => new FunctionValue(max)
  }
];
