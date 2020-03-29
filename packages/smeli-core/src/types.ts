import { Scope } from "./scope";

export interface TypedValue {
  type(): TypeTraits;
}

export interface TypeTraits {
  __name__(): string;

  __call__?(self: TypedValue, scope: Scope): TypedValue;

  __add__?(lhs: TypedValue, rhs: TypedValue): TypedValue;
  __sub__?(lhs: TypedValue, rhs: TypedValue): TypedValue;
  __mul__?(lhs: TypedValue, rhs: TypedValue): TypedValue;
  __div__?(lhs: TypedValue, rhs: TypedValue): TypedValue;

  __str__?(self: TypedValue): string;
}

export class TypeChecker {
  static as<T extends TypedValue>(value: TypedValue, type: TypeTraits): T {
    if (value.type() !== type) {
      throw new Error(
        `Type mismatch: expected ${type.__name__()} but found ${value
          .type()
          .__name__()}`
      );
    }

    return (value as any) as T;
  }
}

export class NumberValue implements TypedValue {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  type() {
    return NumberType;
  }
}

export const NumberType: TypeTraits = {
  __name__: () => "number",
  __add__: (lhs: NumberValue, rhs: NumberValue) =>
    new NumberValue(lhs.value + rhs.value),
  __sub__: (lhs: NumberValue, rhs: NumberValue) =>
    new NumberValue(lhs.value - rhs.value),
  __mul__: (lhs: NumberValue, rhs: NumberValue) =>
    new NumberValue(lhs.value * rhs.value),
  __div__: (lhs: NumberValue, rhs: NumberValue) =>
    new NumberValue(lhs.value / rhs.value),
  __str__: (self: NumberValue) => self.value.toString()
};

type ClosureType = (scope: Scope) => TypedValue;

export class FunctionValue implements TypedValue {
  closure: ClosureType;

  constructor(closure: ClosureType) {
    this.closure = closure;
  }

  type() {
    return FunctionType;
  }
}

export const FunctionType: TypeTraits = {
  __name__: () => "closure",
  __call__: (self: FunctionValue, scope: Scope) => self.closure(scope),
  __str__: (self: FunctionValue) => "() => ()" // replace with signature when implemented
};
