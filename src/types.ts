import {ScopeDefinition} from './scope'

export interface TypedValue {
  type(): TypeDefinition;
}

export interface TypedScope extends TypedValue {
  scope(): ScopeDefinition;
}

export interface TypeDefinition {

  __new__?(): TypedValue;
  __call__?(args: TypedValue[]): TypedValue;

  __add__?(lhs: TypedValue, rhs: TypedValue): TypedValue;
  __sub__?(lhs: TypedValue, rhs: TypedValue): TypedValue;
};

export class NumberValue implements TypedValue {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  type() {
    return NumberValue;
  }

  static __add__(lhs: NumberValue, rhs: NumberValue) {
    return new NumberValue(lhs.value + rhs.value);
  }

  static __sub__(lhs: NumberValue, rhs: NumberValue) {
    return new NumberValue(lhs.value + rhs.value);
  }
}

export class TypeChecker {
  static as<T>(value: TypedValue, type: TypeDefinition): T {
    if (value.type() !== type) {
      throw new Error(`Type mismatch: expected ${type} but found ${value.type()}`);
    }

    return value as any as T;
  }
}
