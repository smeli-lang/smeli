import {
  TypeDefinition,
  TypeChecker,
  NumberValue,
  TypedValue,
  FunctionValue,
  NumberType,
  TypeTraits,
  FunctionType
} from "./types";
import Scope from "./scope";

/*class Hello extends TypeDefinition {
  node: HTMLDivElement;
  scope: Scope;

  constructor() {
    super();
    this.node = document.createElement("div") as HTMLDivElement;
    this.scope = new Scope(null, {
      world: 42,
      // world: {
      //   value: 42,
      //   watch: {( world }: any) => (this.node.innerText = world.value)
      // }
    });
  }

  static __new__() {
    return new Hello();
  }
}*/

class Hello implements TypedValue {
  scope: Scope;

  constructor(scope: Scope) {
    this.scope = scope;

    scope.bind("value", 42);
  }

  type() {
    return HelloType;
  }
}

const HelloType: TypeTraits = {
  __name__: () => "hello",
  __new__: (scope: Scope) => new Hello(scope),

  type: () => TypeDefinition
};

function max(args: TypedValue[]): TypedValue {
  const result = Math.max(
    ...args.map(arg => {
      const numberValue = TypeChecker.as<NumberValue>(arg, NumberType);
      return numberValue.value;
    })
  );
  return new NumberValue(result);
}

export default class Builtins implements TypedValue {
  scope: Scope;

  constructor(scope: Scope) {
    this.scope = scope;

    scope.bind("number", NumberType);
    scope.bind("closure", FunctionType);
    scope.bind("hello", HelloType);
    scope.bind("max", new FunctionValue(max));
  }

  type() {
    return BuiltinsType;
  }
}

export const BuiltinsType: TypeTraits = {
  __name__: () => "builtins",
  __new__: (scope: Scope) => new Builtins(scope),

  __scope__: (self: Builtins) => self.scope,

  type: () => TypeDefinition
};
