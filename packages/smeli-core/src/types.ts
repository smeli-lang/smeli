import { Scope } from "./scope";
import { Expression } from "./ast";

export interface TypedValue {
  type(): TypeTraits;
  dispose?(): void;
}

export interface TypeTraits {
  __name__(): string;

  __signature__?(self: TypedValue): FunctionSignature;
  __call__?(self: TypedValue, scope: Scope): TypedValue;

  __add__?(lhs: TypedValue, rhs: TypedValue): TypedValue;
  __sub__?(lhs: TypedValue, rhs: TypedValue): TypedValue;
  __mul__?(lhs: TypedValue, rhs: TypedValue): TypedValue;
  __div__?(lhs: TypedValue, rhs: TypedValue): TypedValue;

  __str__?(self: TypedValue): string;
}

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
  __mul__: (lhs: NumberValue, rhs: NumberValue) =>
    new NumberValue(lhs.value * rhs.value),
  __div__: (lhs: NumberValue, rhs: NumberValue) =>
    new NumberValue(lhs.value / rhs.value),
  __str__: (self: NumberValue) => self.value.toString(),
};

export class StringValue implements TypedValue {
  value: string;

  constructor(value: string) {
    this.value = value;
  }

  type() {
    return StringType;
  }
}

export const StringType: TypeTraits = {
  __name__: () => "string",
  __add__: (lhs: StringValue, rhs: StringValue) =>
    new StringValue(lhs.value + rhs.value),
  __str__: (self: StringValue) => self.value,
};

export type FunctionSignature = {
  parentScope: Scope;
  arguments: string[];
};

export class NativeFunction implements TypedValue {
  parentScope: Scope;
  argumentTypes: TypeTraits[];
  compute: (...args: any[]) => TypedValue;

  constructor(
    parentScope: Scope,
    argumentTypes: TypeTraits[],
    compute: (...args: any[]) => TypedValue
  ) {
    this.parentScope = parentScope;
    this.argumentTypes = argumentTypes;
    this.compute = compute;
  }

  type() {
    return NativeFunctionType;
  }
}

export const NativeFunctionType: TypeTraits = {
  __name__: () => "native_function",

  __signature__: (self: NativeFunction) => ({
    parentScope: self.parentScope,

    // remap positional arguments to numeric names
    arguments: self.argumentTypes.map((_, index) => index.toString()),
  }),

  __call__: (self: NativeFunction, scope: Scope) => {
    const args = self.argumentTypes.map((type, index) =>
      scope.evaluate(index.toString(), type)
    );
    return self.compute(...args);
  },
};

export class Lambda implements TypedValue {
  signature: FunctionSignature;
  evaluate: (scope: Scope) => TypedValue;

  constructor(
    parentScope: Scope,
    argumentNames: string[],
    evaluate: (scope: Scope) => TypedValue
  ) {
    this.signature = {
      parentScope,
      arguments: argumentNames,
    };
    this.evaluate = evaluate;
  }

  type() {
    return LambdaType;
  }
}

export const LambdaType: TypeTraits = {
  __name__: () => "lambda",
  __signature__: (self: Lambda) => self.signature,
  __call__: (self: Lambda, scope: Scope) => self.evaluate(scope),
  __str__: (self: Lambda) => `lambda(${self.signature.arguments.join(", ")})`,
};

export class ExpressionValue implements TypedValue {
  name: string;
  expression: Expression;

  constructor(name: string, expression: Expression) {
    this.name = name;
    this.expression = expression;
  }

  type() {
    return ExpressionType;
  }
}

export const ExpressionType: TypeTraits = {
  __name__: () => "expression",
};
