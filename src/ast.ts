import Scope, { Binding } from "./scope";
import {TypedValue, NumberValue} from './types';

export interface Expression {
  // some expression have a child scope, like blocks
  getChildScope(): Scope | null;

  evaluate(): TypedValue;
}

export class Literal implements Expression {
  value: TypedValue;

  constructor(value: TypedValue) {
    this.value = value;
  }

  getChildScope() {
    return null;
  }

  evaluate() {
    return this.value;
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

  getChildScope() {
    // identifiers only reference their scope to resolve
    // the names at evaluation time, but they don't own them
    return null;
  }

  evaluate() {
    const scope = this.resolveScope();
    const binding = scope.lookup(this.name);
    if (!binding) {
      throw new Error("Undefined symbol: " + this.name);
    }

    return binding.expression.evaluate();
  }

  resolveScope() {
    let scope = this.scope;
    this.scopeNames.forEach(scopeName => {
      const binding = scope.lookup(scopeName);
      if (!binding) {
        throw new Error("Undefined symbol: " + scopeName);
      }

      const childScope = binding.expression.getChildScope();
      if (!childScope) {
        throw new Error(`${scopeName} is not a block`);
      }

      scope = childScope;
    });

    return scope;
  }
}

export class Block implements Expression {
  statements: Statement[];
  scope: Scope;

  constructor(statements: Statement[], scope: Scope) {
    this.statements = statements;
    this.scope = scope;
  }

  getChildScope() {
    return this.scope;
  }

  evaluate() {
    return this.scope;
  }
}

export class BinaryOperator implements Expression {
  operatorName: string;
  lhs: Expression;
  rhs: Expression;

  constructor(operatorName: string, lhs: Expression, rhs: Expression) {
    this.operatorName = operatorName;
    this.lhs = lhs;
    this.rhs = rhs;
  }

  getChildScope() {
    return null;
  }

  evaluate() {
    const lvalue = this.lhs.evaluate();
    const rvalue = this.rhs.evaluate();

    const ltype = lvalue.type();
    const rtype = rvalue.type();

    if (ltype !== rtype) {
      throw new Error(`Operands must have the same type for operator ${this.operatorName}`);
    }

    const operator = ltype.__add__;

    if (!operator) {
      throw new Error(`Operator ${this.operatorName} not defined for type ${ltype}`);
    }

    return operator(lvalue, rvalue);
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
  bindingScope: Scope | null;

  constructor(line: number, identifier: Identifier, scope: Scope) {
    this.line = line;
    this.identifier = identifier;
    this.scope = scope;

    this.binding = null;
    this.bindingScope = null;
  }

  bind() {
    if (this.binding) {
      throw new Error("Assignment already bound");
    }

    if (!this.expression) {
      throw new Error("Cannot bind assignment: invalid expression");
    }

    this.bindingScope = this.identifier.resolveScope();
    this.binding = this.bindingScope.bind(
      this.identifier.name,
      this.expression
    );
  }

  unbind() {
    if (!this.binding) {
      throw new Error("Assignment already unbound");
    }

    this.bindingScope?.unbind(this.binding);
    this.binding = null;
    this.bindingScope = null;
  }
}

export class Comment implements Statement {
  line: number;
  markerLevel: number;
  text: string;
  scope: Scope;

  binding: Binding | null = null;

  constructor(line: number, text: string, markerLevel: number, scope: Scope) {
    this.line = line;
    this.markerLevel = markerLevel;
    this.text = text;
    this.scope = scope;
  }

  bind() {
    if (this.binding) {
      throw new Error("Comment already bound");
    }

    this.binding = this.scope.bind("commentLine", new Literal(new NumberValue(this.line)));
  }

  unbind() {
    if (!this.binding) {
      throw new Error("Comment already unbound");
    }

    this.scope.unbind(this.binding);
    this.binding = null;
  }
}
