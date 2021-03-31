import { OverloadedFunction, TypedValue, StringValue } from "./types";

export type ParameterList = { [key: string]: TypedValue };

export interface Expression {}

export class Literal implements Expression {
  value: TypedValue;

  constructor(value: TypedValue) {
    this.value = value;
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
}

export class ScopeExpression implements Expression {
  statements: Statement[];
  prefixExpression: Identifier | null;

  constructor(statements: Statement[], prefixExpression: Identifier | null) {
    this.statements = statements;
    this.prefixExpression = prefixExpression;
  }
}

export class LambdaExpression implements Expression {
  args: Identifier[];
  body: Expression;

  constructor(args: Identifier[], body: Expression) {
    this.args = args;
    this.body = body;
  }
}

export class FunctionCall implements Expression {
  identifier: Identifier;
  args: Expression[];

  constructor(identifier: Identifier, args: Expression[]) {
    this.identifier = identifier;
    this.args = args;
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
}

export class ConditionalExpression implements Expression {
  condition: Expression;
  trueCase: Expression;
  falseCase: Expression;

  constructor(
    condition: Expression,
    trueCase: Expression,
    falseCase: Expression
  ) {
    this.condition = condition;
    this.trueCase = trueCase;
    this.falseCase = falseCase;
  }
}

export interface Statement {
  line: number;
  startOffset: number;
  isMarker: boolean;
}

export class BindingDefinition implements Statement {
  line: number;
  startOffset: number;
  isMarker: boolean = false;

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
  }
}

export class Comment implements Statement {
  line: number;
  startOffset: number;
  isMarker: boolean;

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
  }
}

export type Visitor<T> = Map<object, (expression: any, context?: any) => T>;

export function traverse<T>(
  expression: Expression | Statement,
  visitor: Visitor<T>,
  context?: any
): T {
  const constructor = expression.constructor;
  if (!visitor.has(constructor)) {
    throw new Error(
      `Failed to traverse AST, no matching constructor found in the given visitor`
    );
  }

  const callback = visitor.get(constructor);
  return (callback as any)(expression, context);
}
