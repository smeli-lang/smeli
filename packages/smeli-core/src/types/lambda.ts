import { TypedValue } from "./value";
import { Scope, Evaluator } from "../scope";

export class Lambda extends TypedValue {
  static typeName = "lambda";

  parentScope: Scope;
  argumentNames: string[];
  evaluate: Evaluator;

  constructor(
    parentScope: Scope,
    argumentNames: string[],
    evaluate: Evaluator
  ) {
    super();

    this.parentScope = parentScope;
    this.argumentNames = argumentNames;
    this.evaluate = evaluate;
  }

  __call_site__(scope: Scope, args: Evaluator[]): Evaluator {
    // simple signature check (length only)
    if (this.argumentNames.length !== args.length) {
      throw new Error(
        `Argument mismatch, expected ${this.argumentNames.length} but got ${args.length}`
      );
    }

    // the evaluation scope is child to the closure parent scope
    // to keep the correct resolution for unbound symbols
    const evaluationScope = scope
      .evaluate(() => new Scope(this.parentScope))
      .as(Scope);

    // arguments are evaluated against the calling scope
    this.argumentNames.forEach((name, index) => {
      evaluationScope.push({
        name,
        evaluate: () => args[index](scope),
      });
    });

    // closure expression is evaluated against its evaluation scope
    return () => this.evaluate(evaluationScope);
  }

  __str__() {
    return `lambda(${this.argumentNames.join(", ")})`;
  }
}
