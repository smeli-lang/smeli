export type TypeTraits = {
  // typed scope constructor
  "constructor"?: Function;

  // 
  //"call"?: Function;

  // binary operators
  "operator_+"?: (lhs: any, rhs: any) => any;
  "operator_-"?: (lhs: any, rhs: any) => any;
}

export type TypeDefinition = {
  traits: TypeTraits;
}

export interface ScopeType {
  define(): any;
}

// extensions for built-in js types
const numberType: TypeDefinition = {
  traits: {
    "operator_+": (lhs: number, rhs: number) => lhs + rhs,
    "operator_-": (lhs: number, rhs: number) => lhs - rhs,
  }
}

Object.defineProperty(Number.prototype, "__smeli_type__", numberType);

export type TypedValue = {
  "__smeli_type__": TypeDefinition;
}

export interface Number extends TypedValue {}
