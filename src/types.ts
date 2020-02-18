export interface TypedValue {
  type(): TypeDefinition;
}

export interface TypedScope extends TypedValue {
  scope(): ScopeDefinition;
}

export interface TypeDefinition {
  __new__?(): TypedValue;

  __add__?(lhs: TypedValue, rhs: TypedValue): TypedValue;
  __sub__?(lhs: TypedValue, rhs: TypedValue): TypedValue;
};

export type ScopeDefinition = {
  bindings: {
    [name: string]: BindingDefinition
  }
};

export type LiteralType = number | string | Function;

export type BindingDefinition = LiteralType;

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

/*class Vec2 implements TypedScope {
  values: [number, number];

  constructor() {
    this.values = [0, 0];
  }

  type() {
    return Vec2;
  }

  scope() {
    return {
      bindings: {
        x: 0,
        y: 0
      }
    };
  }

  static __new__() {
    return new Vec2();
  }

  static __add__(lhs: Vec2, rhs: Vec2) {
    return new NumberValue(lhs.value + rhs.value);
  }
}*/
