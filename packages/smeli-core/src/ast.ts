import { Binding, Evaluator, Scope } from "./scope";
import {
  ExpressionValue,
  Lambda,
  NativeFunction,
  OverloadedFunction,
  TypedValue,
  StringValue,
} from "./types";
import { IndexTrait } from "./traits";

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
  scopeNames: StringValue[];
  name: string;
  nameValue: StringValue;

  constructor(names: string[]) {
    this.scopeNames = names
      .slice(0, names.length - 1)
      .map((name) => new StringValue(name));
    this.name = names[names.length - 1];
    this.nameValue = new StringValue(this.name);
  }

  evaluate(scope: Scope) {
    let container: TypedValue = scope;
    for (let i = 0; i < this.scopeNames.length; i++) {
      container = IndexTrait.call(container, this.scopeNames[i]);
    }

    if (this.name[0] === "&") {
      // return expression AST instead of the evaluated result
      const symbolName = this.name.substr(1);
      return new ExpressionValue(
        symbolName,
        container.as(Scope).ast(symbolName)
      );
    }

    return IndexTrait.call(container, this.nameValue);
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

export class BinaryOperator implements Expression {
  trait: OverloadedFunction;
  lhs: Expression;
  rhs: Expression;

  constructor(trait: OverloadedFunction, lhs: Expression, rhs: Expression) {
    this.trait = trait;
    this.lhs = lhs;
    this.rhs = rhs;
  }

  evaluate(scope: Scope) {
    const lvalue = scope.transient((scope: Scope) => this.lhs.evaluate(scope));
    const rvalue = scope.transient((scope: Scope) => this.rhs.evaluate(scope));

    return this.trait.call(lvalue, rvalue);
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
        if (headingLevel === 1 && this.text !== "") {
          return new StringValue(html);
        }

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
