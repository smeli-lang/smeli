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
  const x = TypeChecker.as<NumberValue>(args[0], NumberType);
  const y = TypeChecker.as<NumberValue>(args[1], NumberType);

  const result = Math.max(x.value, y.value);
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
