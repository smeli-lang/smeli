import {ScopeType} from './types';

export default class Builtins implements ScopeType {
  define() {
    return {
      bindings: {
        builtinValue: 42
      }
    }
  }
}
