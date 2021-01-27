import { TypedValue } from "./value";
import { Overload, OverloadedFunction } from "./overload";
import { Binding, Scope } from "../scope";
import { currentEvaluationContext, evaluate } from "../cache";
import { Evaluator } from "../evaluation";

export class NativeFunction extends TypedValue {
  static typeName = "native_function";

  parentScope: Scope;
  overloadedFunction: OverloadedFunction;

  constructor(parentScope: Scope, overloadedFunction: OverloadedFunction) {
    super();

    this.parentScope = parentScope;
    this.overloadedFunction = overloadedFunction;
  }

  __call_site__(args: Evaluator[]): Evaluator {
    return () => {
      // evaluate arguments at the call site
      const argValues = args.map((arg) => evaluate(arg));

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
    evaluate: () => {
      const parentScope = currentEvaluationContext().as(Scope);
      return new NativeFunction(parentScope, overloadedFunction);
    },
  };

  return binding;
}
