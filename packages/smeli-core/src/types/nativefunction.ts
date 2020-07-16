import { TypedConstructor, TypedValue } from "./value";
import { Scope, Evaluator } from "../scope";

export class NativeFunction extends TypedValue {
  static typeName = "native_function";

  parentScope: Scope;
  argumentTypes: TypedConstructor<TypedValue>[];
  compute: (...args: any[]) => TypedValue;

  constructor(
    parentScope: Scope,
    argumentTypes: TypedConstructor<TypedValue>[],
    compute: (...args: any[]) => TypedValue
  ) {
    super();

    this.parentScope = parentScope;
    this.argumentTypes = argumentTypes;
    this.compute = compute;
  }

  __call_site__(scope: Scope, args: Evaluator[]): Evaluator {
    // simple signature check (length only)
    if (this.argumentTypes.length !== args.length) {
      throw new Error(
        `Mismatched number of arguments, expected ${this.argumentTypes.length} but got ${args.length}`
      );
    }

    return (scope: Scope) => {
      // evaluate arguments at the call site
      const argValues = this.argumentTypes.map((type, index) =>
        scope.transient(args[index]).as(type)
      );

      // call the native evaluator
      return this.compute(...argValues);
    };
  }
}
