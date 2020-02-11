import Scope from "./scope";
import { Expression } from "./ast";

export default class Binding {
  scope: Scope;
  name: string;
  expression: Expression;
  previousBinding: Binding | null;

  constructor(scope: Scope, name: string, expression: Expression) {
    this.scope = scope;
    this.name = name;
    this.expression = expression;

    this.previousBinding = this.scope.bind(this.name, this);
  }

  dispose() {
    this.scope.bind(this.name, this.previousBinding);
  }

  evaluate() {
    // caching will happen here

    return this.expression.evaluate();
  }
}
