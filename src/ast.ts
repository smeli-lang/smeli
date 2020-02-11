import Binding from "./binding";
import Scope from "./scope";

export type Value = {
  type: string;
  value: any;
};

export interface Expression {
  evaluate(): Value;
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
  scope: Scope;

  constructor(name: string, scope: Scope) {
    this.name = name;
    this.scope = scope;
  }

  evaluate() {
    const binding = this.scope.lookup(this.name);
    if (!binding) {
      throw new Error("Undefined symbol: " + this.name);
    }

    return binding.evaluate();
  }
}

export class ObjectExpression implements Expression {
  program: Program;
  scope: Scope;

  constructor(program: Program, scope: Scope) {
    this.program = program;
    this.scope = scope;
  }

  evaluate() {
    return {
      type: "object",
     value: this.scope
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

  bind(): void;
  unbind(): void;
}

export class Assignment implements Statement {
  line: number;
  identifier: Identifier;
  expression: Expression;
  scope: Scope;

  binding: Binding | null;

  constructor(
    line: number,
    identifier: Identifier,
    expression: Expression,
    scope: Scope
  ) {
    this.line = line;
    this.identifier = identifier;
    this.expression = expression;
    this.scope = scope;

    this.binding = null;
  }

  bind() {
    if (this.binding) {
      throw new Error("Assignment already bound");
    }

    this.binding = new Binding(
      this.scope,
      this.identifier.name,
      this.expression
    );
  }

  unbind() {
    if (!this.binding) {
      throw new Error("Assignment already unbound");
    }

    this.binding.dispose();
    this.binding = null;
  }
}

export class BlockDelimiter implements Statement {
  line: number;
  text: string;
  scope: Scope;

  binding: Binding | null;

  constructor(line: number, text: string, scope: Scope) {
    this.line = line;
    this.text = text;
    this.scope = scope;

    this.binding = null;
  }

  bind() {
    if (this.binding) {
      throw new Error("Block delimiter already bound");
    }

    this.binding = new Binding(
      this.scope,
      "blockLine",
      new NumberLiteral(this.line)
    );
  }

  unbind() {
    if (!this.binding) {
      throw new Error("Block delimiter already unbound");
    }

    this.binding.dispose();
    this.binding = null;
  }
}

export class Program {
  statements: Statement[];

  constructor(statements: Statement[]) {
    this.statements = statements;
  }
}
