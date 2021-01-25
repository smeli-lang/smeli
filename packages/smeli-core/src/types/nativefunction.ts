import { TypedValue } from "./value";
import { Overload, OverloadedFunction } from "./overload";
import { Binding, Evaluator, Scope } from "../scope";

export class NativeFunction extends TypedValue {
  static typeName = "native_function";

  parentScope: Scope;
  overloadedFunction: OverloadedFunction;

  constructor(parentScope: Scope, overloadedFunction: OverloadedFunction) {
    super();

    this.parentScope = parentScope;
    this.overloadedFunction = overloadedFunction;
  }

  __call_site__(scope: Scope, args: Evaluator[]): Evaluator {
    return (scope: Scope) => {
      // evaluate arguments at the call site
      const argValues = args.map((arg) => scope.evaluate(arg));

      // call the native evaluator
      return this.overloadedFunction.call(...argValues);
    };
  }

  makeTransientEvaluator(): (...args: TypedValue[]) => TypedValue {
    return (...args: TypedValue[]) => this.overloadedFunction.call(...args);
  }
}

export function nativeBinding(name: string, overloads: Overload[]): Binding {
  const overloadedFunction = new OverloadedFunction(name);
  overloads.forEach((overload) => overloadedFunction.implement(overload));

  const binding: Binding = {
    name,
    evaluate: (parentScope: Scope) =>
      new NativeFunction(parentScope, overloadedFunction),
  };

  return binding;
}
