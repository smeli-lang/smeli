import { Value } from "./ast";

type TypeTraits<T> = {
  new: () => T;
  operators: {
    "+": (lhs: T, rhs: T) => T;
  };
};

interface ScopeType {
  define(): any;

  evaluate(): Value;
}
