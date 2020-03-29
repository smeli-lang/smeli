import { Binding, Scope, ScopeType } from "./scope";
import { TypedValue, NumberValue, TypeChecker, FunctionValue } from "./types";

export type ParameterList = { [key: string]: TypedValue };

export interface Expression {
  evaluate(scope: Scope): TypedValue;
  invalidate?(value: TypedValue): void;
}

export class Literal implements Expression {
  value: TypedValue;

  constructor(value: TypedValue) {
    this.value = value;
  }

  evaluate(scope: Scope) {
    return this.value;
  }
}

export class Identifier implements Expression {
  scopeNames: string[];
  name: string;

  constructor(names: string[]) {
    this.scopeNames = names.slice(0, names.length - 1);
    this.name = names[names.length - 1];
  }

  evaluate(scope: Scope) {
    for (let i = 0; i < this.scopeNames.length; i++) {
      const next = scope.evaluate(this.scopeNames[i]);
      scope = TypeChecker.as<Scope>(next, ScopeType);
    }

    return scope.evaluate(this.name);
  }
}

export class ScopeExpression implements Expression {
  statements: Statement[];
  prefixExpression: Identifier | null;

  constructor(statements: Statement[], typeIdentifier: Identifier | null) {
    this.statements = statements;
    this.prefixExpression = typeIdentifier;
  }

  evaluate(parentScope: Scope) {
    let prefixScope = null;
    if (this.prefixExpression) {
      const prefix = this.prefixExpression.evaluate(parentScope);
      prefixScope = TypeChecker.as<Scope>(prefix, ScopeType);
    }

    const scope = new Scope(parentScope, prefixScope);
    this.statements.forEach(statement => scope.push(statement.binding));

    return scope;
  }

  invalidate(value: TypedValue) {
    const scope = value as Scope;
    scope.dispose();
  }
}

export class LambdaExpression implements Expression {
  args: Identifier[];
  body: Expression;

  constructor(args: Identifier[], body: Expression) {
    this.args = args;
    this.body = body;
  }

  evaluate(scope: Scope) {
    return new FunctionValue(scope => {
      // remap positional arguments to names
      this.args.forEach((identifier, index) => {
        scope.push({
          name: identifier.name,
          evaluate: scope => scope.evaluate(index.toString())
        });
      });
      return this.body.evaluate(scope);
    });
  }
}

export class FunctionCall implements Expression {
  identifier: Identifier;
  args: Expression[];

  constructor(identifier: Identifier, args: Expression[]) {
    this.identifier = identifier;
    this.args = args;
  }

  evaluate(scope: Scope) {
    const functionValue = this.identifier.evaluate(scope);
    const functionType = functionValue.type();

    if (!functionType.__call__) {
      throw new Error(`${this.identifier.name} is not a function`);
    }

    const evaluationScope = new Scope(scope);
    this.args.map((arg, index) =>
      evaluationScope.push({
        name: index.toString(),
        evaluate: () => arg.evaluate(scope)
      })
    );

    const result = functionType.__call__(functionValue, evaluationScope);

    evaluationScope.dispose();

    return result;
  }
}

export type BinaryOperatorType = "__add__" | "__sub__" | "__mul__" | "__div__";

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

  evaluate(scope: Scope) {
    const lvalue = this.lhs.evaluate(scope);
    const rvalue = this.rhs.evaluate(scope);

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
  binding: Binding | Binding[];
}

export class BindingDefinition implements Statement {
  line: number;
  markerLevel: number = 0;
  binding: Binding;

  identifier: Identifier;
  expression: Expression;

  constructor(line: number, identifier: Identifier, expression: Expression) {
    this.line = line;
    this.identifier = identifier;
    this.expression = expression;

    this.binding = {
      name: identifier.name,
      evaluate: scope => expression.evaluate(scope)
    };

    if (expression.invalidate) {
      // somehow the compiler refused to acknoledge the check here
      this.binding.invalidate = value => (expression.invalidate as any)(value);
    }
  }
}

export class Comment implements Statement {
  line: number;
  markerLevel: number;
  text: string;

  binding: Binding;

  constructor(line: number, text: string, markerLevel: number) {
    this.line = line;
    this.text = text;
    this.markerLevel = markerLevel;

    this.binding = {
      name: "commentLine",
      evaluate: () => new NumberValue(this.line)
    };
  }
}
