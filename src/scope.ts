import { Expression } from "./ast";

export default class Scope {
  bindings: Map<string, Expression>;

  constructor() {
    this.bindings = new Map();
  }

  bindSymbol(name: string, expression: Expression) {
    this.bindings.set(name, expression);
  }

  evaluate(name: string) {
    const expression = this.bindings.get(name);
    if (!expression) {
      throw new Error("Undefined symbol: " + name);
    }

    return expression.evaluate();
  }
}
