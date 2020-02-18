import {TypedScope, TypeDefinition, TypeChecker, NumberValue, TypedValue} from './types';

const max: TypeDefinition = {
  __call__: (args) => {
    const x = TypeChecker.as<NumberValue>(args[0], NumberValue);
    const y = TypeChecker.as<NumberValue>(args[1], NumberValue);

    const result = Math.max(x.value, y.value);
    return new NumberValue(result);
  }
}

export default class Builtins implements TypedValue {
  type() {
    return Builtins;
  }

  scope() {
    return {
      builtinValue: 42,
      max,
    }
  }

  static __new__() {
    return new Builtins();
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
