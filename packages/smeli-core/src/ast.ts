import { Scope, Binding } from "./scope";
import {
  TypedValue,
  NumberValue,
  TypeTraits,
  TypeChecker,
  TypeDefinition
} from "./types";

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

export class ScopeExpression implements Expression {
  statements: Statement[];
  typeIdentifier: Identifier | null;
  scope: Scope;

  constructor(
    statements: Statement[],
    typeIdentifier: Identifier | null,
    scope: Scope
  ) {
    this.statements = statements;
    this.typeIdentifier = typeIdentifier;
    this.scope = scope;
  }

  getChildScope() {
    return this.scope;
  }

  evaluate() {
    if (this.typeIdentifier) {
      const typeValue = this.typeIdentifier.evaluate();
      const type = TypeChecker.as<TypeTraits>(typeValue, TypeDefinition);
      if (!type.__bind__) {
        throw new Error(
          `Type ${type.__name__()} doesn't have the __bind__ trait`
        );
      }

      const value = type.__bind__(this.scope);
      return value;
    }
    return this.scope;
  }
}

export class FunctionCall implements Expression {
  identifier: Identifier;
  args: Expression[];

  constructor(identifier: Identifier, args: Expression[]) {
    this.identifier = identifier;
    this.args = args;
  }

  getChildScope() {
    return null;
  }

  evaluate() {
    const functionValue = this.identifier.evaluate();
    const functionType = functionValue.type();

    if (!functionType.__call__) {
      throw new Error(`${this.identifier.name} is not a function`);
    }

    return functionType.__call__(
      functionValue,
      this.args.map(arg => arg.evaluate())
    );
  }
}

export type BinaryOperatorType = "__add__" | "__sub__";

export class BinaryOperator implements Expression {
  operatorName: BinaryOperatorType;
  lhs: Expression;
  rhs: Expression;

  constructor(
    operatorName: BinaryOperatorType,
    lhs: Expression,
    rhs: Expression
  ) {
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
      throw new Error(
        `Operands must have the same type for operator ${this.operatorName}`
      );
    }

    const operator = ltype[this.operatorName];

    if (!operator) {
      throw new Error(
        `Operator ${this.operatorName} not defined for type ${ltype.__name__()}`
      );
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

    this.binding = this.scope.bind(
      "commentLine",
      new Literal(new NumberValue(this.line))
    );
  }

  unbind() {
    if (!this.binding) {
      throw new Error("Comment already unbound");
    }

    this.scope.unbind(this.binding);
    this.binding = null;
  }
}
