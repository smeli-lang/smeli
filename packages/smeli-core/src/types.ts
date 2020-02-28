import { ScopeDefinition } from "./scope";

export interface TypedValue {
  type(): TypeTraits;
}

export interface TypedScope extends TypedValue {
  scope(): ScopeDefinition;
}

export interface TypeTraits extends TypedValue {
  __name__(): string;

  __new__?(): TypedValue;
  __call__?(self: TypedValue, args: TypedValue[]): TypedValue;

  __add__?(lhs: TypedValue, rhs: TypedValue): TypedValue;
  __sub__?(lhs: TypedValue, rhs: TypedValue): TypedValue;

  __str__?(self: TypedValue): string;
}

export const TypeDefinition: TypeTraits = {
  __name__: () => "type",
  __str__: (self: TypeTraits) => self.__name__(),

  // this recursive definition is the root metatype of all other types
  type: () => TypeDefinition
};

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
  __str__: (self: NumberValue) => self.value.toString(),

  type: () => TypeDefinition
};

type ClosureType = (args: TypedValue[]) => TypedValue;

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
  __call__: (self: FunctionValue, args: TypedValue[]) => self.closure(args),
  __str__: (self: FunctionValue) => "() => ()", // replace with signature when implemented

  type: () => TypeDefinition
};
