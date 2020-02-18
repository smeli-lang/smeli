import {TypedScope} from './types';

export default class Builtins implements TypedScope {
  type() {
    return Builtins;
  }

  scope() {
    return {
      bindings: {
        builtinValue: 42
      }
    }
  }

  static __new__() {
    return new Builtins();
  }
}
