import Binding from "./binding";
import Scope from "./scope";
import { removeAllListeners } from "cluster";

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
  scopeNames: string[];
  name: string;

  scope: Scope;

  constructor(names: string[], scope: Scope) {
    this.scopeNames = names.slice(0, names.length - 1);
    this.name = names[names.length - 1];
    this.scope = scope;
  }

  resolveScope() {
    let scope = this.scope;
    this.scopeNames.forEach(scopeName => {
      const binding = scope.lookup(scopeName);
      if (!binding) {
        throw new Error("Undefined symbol: " + scopeName);
      }

      const scopeValue = binding.evaluate();
      if (scopeValue.type !== "block") {
        throw new Error(`${scopeName} is not a block`);
      }

      scope = scopeValue.value;
    });

    return scope;
  }

  evaluate() {
    const scope = this.resolveScope();
    const binding = scope.lookup(this.name);
    if (!binding) {
      throw new Error("Undefined symbol: " + this.name);
    }

    return binding.evaluate();
  }
}

export class Block implements Expression {
  statements: Statement[];
  scope: Scope;

  constructor(statements: Statement[], scope: Scope) {
    this.statements = statements;
    this.scope = scope;
  }

  evaluate() {
    return {
      type: "block",
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
  markerLevel: number;

  bind(): void;
  unbind(): void;
}

export class Assignment implements Statement {
  line: number;
  markerLevel: number = 0;
  identifier: Identifier;
  expression: Expression | null = null;
  scope: Scope;

  binding: Binding | null;

  constructor(line: number, identifier: Identifier, scope: Scope) {
    this.line = line;
    this.identifier = identifier;
    this.scope = scope;

    this.binding = null;
  }

  bind() {
    if (this.binding) {
      throw new Error("Assignment already bound");
    }

    if (!this.expression) {
      throw new Error("Cannot bind assignment: invalid expression");
    }

    const scope = this.identifier.resolveScope();

    this.binding = new Binding(scope, this.identifier.name, this.expression);
  }

  unbind() {
    if (!this.binding) {
      throw new Error("Assignment already unbound");
    }

    this.binding.dispose();
    this.binding = null;
  }
}

export class Comment implements Statement {
  line: number;
  markerLevel: number;
  text: string;
  scope: Scope;

  binding: Binding | null;

  constructor(line: number, text: string, markerLevel: number, scope: Scope) {
    this.line = line;
    this.markerLevel = markerLevel;
    this.text = text;
    this.scope = scope;

    this.binding = null;
  }

  bind() {
    if (this.binding) {
      throw new Error("Comment already bound");
    }

    this.binding = new Binding(
      this.scope,
      "commentLine",
      new NumberLiteral(this.line)
    );
  }

  unbind() {
    if (!this.binding) {
      throw new Error("Comment already unbound");
    }

    this.binding.dispose();
    this.binding = null;
  }
}
