import { Binding, Evaluator, Scope } from "./scope";
import {
  ExpressionValue,
  Lambda,
  NativeFunction,
  TypedValue,
  StringValue,
} from "./types";

export type ParameterList = { [key: string]: TypedValue };

export interface Expression {
  evaluate: Evaluator;
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
      scope = scope.evaluate(this.scopeNames[i]).as(Scope);
    }

    if (this.name[0] === "&") {
      // return expression AST instead of the evaluated result
      const symbolName = this.name.substr(1);
      return new ExpressionValue(symbolName, scope.ast(symbolName));
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
      prefixScope = this.prefixExpression.evaluate(parentScope).as(Scope);
    }

    const scope = new Scope(parentScope, prefixScope);
    this.statements.forEach((statement) => scope.push(statement.binding));

    return scope;
  }
}

export class LambdaExpression implements Expression {
  args: Identifier[];
  body: Expression;

  constructor(args: Identifier[], body: Expression) {
    this.args = args;
    this.body = body;
  }

  evaluate(parentScope: Scope) {
    const argumentNames = this.args.map((id) => id.name);
    return new Lambda(parentScope, argumentNames, (scope: Scope) =>
      this.body.evaluate(scope)
    );
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
    const functionValue = scope.evaluate((scope: Scope) =>
      this.identifier.evaluate(scope)
    );

    if (!functionValue.is(Lambda) && !functionValue.is(NativeFunction)) {
      throw new Error(`${this.identifier.name} is not a function`);
    }

    const argumentEvaluators = this.args.map((expression) => () =>
      expression.evaluate(scope)
    );
    const resultEvaluator = functionValue.__call_site__(
      scope,
      argumentEvaluators
    );

    // cache evaluation scope
    return resultEvaluator;
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
    const lvalue = scope.transient((scope: Scope) => this.lhs.evaluate(scope));
    const rvalue = scope.transient((scope: Scope) => this.rhs.evaluate(scope));

    if (!(this.operatorName in lvalue)) {
      throw new Error(
        `Operator ${this.operatorName} not defined for type ${
          lvalue.type().typeName
        }`
      );
    }

    return (lvalue[this.operatorName] as (rhs: TypedValue) => TypedValue)(
      rvalue
    );
  }
}

export interface Statement {
  line: number;
  startOffset: number;
  isMarker: boolean;
  binding: Binding | Binding[];
}

export class BindingDefinition implements Statement {
  line: number;
  startOffset: number;
  isMarker: boolean = false;
  binding: Binding;

  identifier: Identifier;
  expression: Expression;

  constructor(
    line: number,
    startOffset: number,
    identifier: Identifier,
    expression: Expression
  ) {
    this.line = line;
    this.startOffset = startOffset;
    this.identifier = identifier;
    this.expression = expression;

    this.binding = {
      name: identifier.name,
      evaluate: (scope) => expression.evaluate(scope),
      ast: this.expression,
    };
  }
}

export class Comment implements Statement {
  line: number;
  startOffset: number;
  isMarker: boolean;
  binding: Binding;

  headingLevel: number;
  text: string;

  constructor(
    line: number,
    startOffset: number,
    isMarker: boolean,
    headingLevel: number,
    text: string
  ) {
    this.line = line;
    this.startOffset = startOffset;
    this.isMarker = isMarker;

    this.headingLevel = headingLevel;
    this.text = text;

    const cssClass = headingLevel === 1 ? "important" : "normal";
    const html = `<h${headingLevel} class=${cssClass}>${text}</h${headingLevel}>`;

    this.binding = {
      name: "#outline",
      evaluate: (scope: Scope) => {
        const previous = scope.evaluate("#outline").as(StringValue);
        return new StringValue(previous.value + html);
      },
    };
  }
}

export type Visitor<T> = Map<object, (expression: any, context?: any) => T>;

export function traverse<T>(
  expression: Expression,
  visitor: Visitor<T>,
  context?: any
): T {
  const constructor = expression.constructor;
  if (!visitor.has(constructor)) {
    throw new Error(`Cannot transpile this expression to TeX`);
  }

  const callback = visitor.get(constructor);
  return (callback as any)(expression, context);
}
