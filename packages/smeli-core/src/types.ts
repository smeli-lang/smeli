import { Scope, Evaluator } from "./scope";
import { Expression } from "./ast";

export interface TypedValue {
  type(): TypeTraits;
  dispose?(): void;
}

export interface TypeTraits {
  __name__(): string;

  __call_site__?(self: TypedValue, scope: Scope, args: Evaluator[]): Evaluator;

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

  __call_site__(
    self: NativeFunction,
    scope: Scope,
    args: Evaluator[]
  ): Evaluator {
    // simple signature check (length only)
    if (self.argumentTypes.length !== args.length) {
      throw new Error(
        `Argument mismatch, expected ${self.argumentTypes.length} but got ${args.length}`
      );
    }

    return (scope: Scope) => {
      // evaluate arguments at the call site
      const argValues = self.argumentTypes.map((type, index) =>
        scope.transient(args[index], type)
      );

      // call the native evaluator
      return self.compute(...argValues);
    };
  },
};

export class Lambda implements TypedValue {
  parentScope: Scope;
  argumentNames: string[];
  evaluate: Evaluator;

  constructor(
    parentScope: Scope,
    argumentNames: string[],
    evaluate: Evaluator
  ) {
    this.parentScope = parentScope;
    this.argumentNames = argumentNames;
    this.evaluate = evaluate;
  }

  type() {
    return LambdaType;
  }
}

export const LambdaType: TypeTraits = {
  __name__: () => "lambda",

  __call_site__(self: Lambda, scope: Scope, args: Evaluator[]): Evaluator {
    // simple signature check (length only)
    if (self.argumentNames.length !== args.length) {
      throw new Error(
        `Argument mismatch, expected ${self.argumentNames.length} but got ${args.length}`
      );
    }

    // the evaluation scope is child to the closure parent scope
    // to keep the correct resolution for unbound symbols
    const evaluationScope = scope.evaluate(
      () => new Scope(self.parentScope)
    ) as Scope;

    // arguments are evaluated against the calling scope
    self.argumentNames.forEach((name, index) => {
      evaluationScope.push({
        name,
        evaluate: () => args[index](scope),
      });
    });

    // closure expression is evaluated against its evaluation scope
    return () => self.evaluate(evaluationScope);
  },

  __str__: (self: Lambda) => `lambda(${self.argumentNames.join(", ")})`,
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
