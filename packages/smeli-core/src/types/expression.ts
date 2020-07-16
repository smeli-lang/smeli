import { TypedValue } from "./value";
import { Expression } from "../ast";

export class ExpressionValue extends TypedValue {
  static typeName = "expression";

  name: string;
  expression: Expression;

  constructor(name: string, expression: Expression) {
    super();

    this.name = name;
    this.expression = expression;
  }
}
