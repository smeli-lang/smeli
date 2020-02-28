import {
  TypedScope,
  TypeDefinition,
  TypeChecker,
  NumberValue,
  TypedValue,
  FunctionValue,
  NumberType,
  TypeTraits
} from "./types";

export function max(args: TypedValue[]): TypedValue {
  const result = Math.max(
    ...args.map(arg => {
      const numberValue = TypeChecker.as<NumberValue>(arg, NumberType);
      return numberValue.value;
    })
  );
  return new NumberValue(result);
}

export default class Builtins implements TypedScope {
  scope() {
    return {
      builtinValue: 42,
      max: new FunctionValue(max)
    };
  }

  type() {
    return BuiltinsType;
  }
}

export const BuiltinsType: TypeTraits = {
  __name__: () => "builtins",
  __new__: () => new Builtins(),

  //__bind__: (self: Builtins, )

  type: () => TypeDefinition
};
