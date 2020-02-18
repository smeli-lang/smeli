export type TypeTraits = {
  // typed scope constructor
  constructor?: Function;

  //
  //"call"?: Function;

  // binary operators
  "operator_+"?: (lhs: any, rhs: any) => any;
  "operator_-"?: (lhs: any, rhs: any) => any;
};

export type TypeDefinition = {
  traits: TypeTraits;
};

export interface ScopeType {
  define(): any;
}

// extensions for built-in js types
const numberType: TypeDefinition = {
  traits: {
    "operator_+": (lhs: number, rhs: number) => lhs + rhs,
    "operator_-": (lhs: number, rhs: number) => lhs - rhs
  }
};

export type TypedValue = {
  type: TypeDefinition;
  value: any;
};

export interface Number extends TypedValue {}

class Vec2 implements ScopeType {
  values: [number, number];

  constructor() {
    this.values = [0, 0];
  }

  define() {
    return {
      bindings: {
        x: 0,
        y: 0
      }
    };
  }
}

const vec2Type: TypeDefinition = {
  traits: {
    constructor: Vec2
  }
};
