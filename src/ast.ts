import Binding from "./binding";
import Scope from "./scope";

export type Value = {
  type: string;
  value: any;
};

export interface Expression {
  evaluate(scope: Scope): Value;
}

export class NumberLiteral implements Expression {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  evaluate(scope: Scope) {
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

  evaluate(scope: Scope) {
    const binding = scope.lookup(this.name);
    if (!binding) {
      throw new Error("Undefined symbol: " + this.name);
    }

    return binding.evaluate();
  }
}

export class OperatorAdd implements Expression {
  lhs: Expression;
  rhs: Expression;

  constructor(lhs: Expression, rhs: Expression) {
    this.lhs = lhs;
    this.rhs = rhs;
  }

  evaluate(scope: Scope) {
    const lvalue = this.lhs.evaluate(scope);
    const rvalue = this.rhs.evaluate(scope);

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

  evaluate(scope: Scope) {
    const lvalue = this.lhs.evaluate(scope);
    const rvalue = this.rhs.evaluate(scope);

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

  bind(scope: Scope): void;
  unbind(scope: Scope): void;
}

export class Assignment implements Statement {
  line: number;
  identifier: Identifier;
  expression: Expression;
  binding: Binding | null;

  constructor(line: number, identifier: Identifier, expression: Expression) {
    this.line = line;
    this.identifier = identifier;
    this.expression = expression;
    this.binding = null;
  }

  bind(scope: Scope) {
    if (this.binding) {
      throw new Error("Assignment already bound");
    }

    this.binding = new Binding(scope, this.identifier.name, this.expression);
  }

  unbind(scope: Scope) {
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
  binding: Binding | null;

  constructor(line: number, text: string) {
    this.line = line;
    this.text = text;
    this.binding = null;
  }

  bind(scope: Scope) {
    if (this.binding) {
      throw new Error("Block delimiter already bound");
    }

    this.binding = new Binding(
      scope,
      "blockLine",
      new NumberLiteral(this.line)
    );
  }

  unbind(scope: Scope) {
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
