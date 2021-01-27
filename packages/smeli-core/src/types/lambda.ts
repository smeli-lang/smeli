import { TypedValue } from "./value";
import { Scope } from "../scope";
import { currentEvaluationContext, evaluate } from "../cache";
import { Evaluator } from "../evaluation";

export class Lambda extends TypedValue {
  static typeName = "lambda";

  parentScope: Scope;
  argumentNames: string[];
  evaluator: Evaluator;

  constructor(
    parentScope: Scope,
    argumentNames: string[],
    evaluator: Evaluator
  ) {
    super();

    this.parentScope = parentScope;
    this.argumentNames = argumentNames;
    this.evaluator = evaluator;
  }

  __call_site__(args: Evaluator[]): Evaluator {
    // simple signature check (length only)
    if (this.argumentNames.length !== args.length) {
      throw new Error(
        `Argument mismatch, expected ${this.argumentNames.length} but got ${args.length}`
      );
    }

    // the evaluation scope is child to the closure parent scope
    // to keep the correct resolution for unbound symbols
    const evaluationScope = new Scope(this.parentScope);

    // arguments are evaluated against the calling scope
    const callingScope = currentEvaluationContext().as(Scope);
    this.argumentNames.forEach((name, index) => {
      const argumentEvaluator = () => evaluate(args[index], callingScope);
      evaluationScope.push({
        name,
        evaluate: argumentEvaluator,
      });
    });

    // closure expression is evaluated against its evaluation scope
    return () => evaluate(this.evaluator, evaluationScope);
  }

  makeTransientEvaluator(): (...args: TypedValue[]) => TypedValue {
    // the evaluation scope is child to the closure parent scope
    // to keep the correct resolution for unbound symbols
    const evaluationScope = new Scope(this.parentScope);

    return (...args: TypedValue[]) => {
      if (this.argumentNames.length !== args.length) {
        throw new Error(
          `Argument mismatch, expected ${this.argumentNames.length} but got ${args.length}`
        );
      }

      const transients: { [key: string]: TypedValue } = {};
      this.argumentNames.forEach((name, index) => {
        transients[name] = args[index];
      });

      return evaluate(this.evaluator, evaluationScope, false, transients);
    };
  }
}
