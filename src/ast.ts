export type Value = {
  type: string;
  value: any;
};

export interface Expression {
  evaluate /* scope + error reporting */(): Value;
}

export class NumberLiteral implements Expression {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  evaluate() {
    return {
      type: "number",
      value: this.value
    };
  }
}

export class Identifier implements Expression {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  evaluate() {
    // requires scopes to be implemented
    return {
      type: "notimplemented",
      value: null
    };
  }
}

export class OperatorAdd implements Expression {
  lhs: Expression;
  rhs: Expression;

  constructor(lhs: Expression, rhs: Expression) {
    this.lhs = lhs;
    this.rhs = rhs;
  }

  evaluate() {
    const lvalue = this.lhs.evaluate();
    const rvalue = this.rhs.evaluate();

    if (lvalue.type !== rvalue.type) {
      throw new Error("Operands must have the same type for operator '+'");
    }

    return {
      type: lvalue.type,
      value: lvalue.value + rvalue.value
    };
  }
}

export class OperatorSubtract implements Expression {
  lhs: Expression;
  rhs: Expression;

  constructor(lhs: Expression, rhs: Expression) {
    this.lhs = lhs;
    this.rhs = rhs;
  }

  evaluate() {
    const lvalue = this.lhs.evaluate();
    const rvalue = this.rhs.evaluate();

    if (lvalue.type !== rvalue.type) {
      throw new Error("Operands must have the same type for operator '-'");
    }

    return {
      type: lvalue.type,
      value: lvalue.value - rvalue.value
    };
  }
}

export interface Statement {
  line: number;
}

export class Assignment implements Statement {
  line: number;
  identifier: Identifier;
  expression: Expression;

  constructor(line: number, identifier: Identifier, expression: Expression) {
    this.line = line;
    this.identifier = identifier;
    this.expression = expression;
  }
}

export class BlockDelimiter implements Statement {
  line: number;
  text: string;

  constructor(line: number, text: string) {
    this.line = line;
    this.text = text;
  }
}

export class Program {
  statements: Statement[];

  constructor(statements: Statement[]) {
    this.statements = statements;
  }
}
