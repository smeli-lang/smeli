import { Binding, Scope, ScopeType } from "./scope";
import {
  Lambda,
  TypedValue,
  TypeChecker,
  StringValue,
  StringType,
  ExpressionValue,
} from "./types";

export type ParameterList = { [key: string]: TypedValue };

export interface Expression {
  evaluate(scope: Scope): TypedValue;
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
      const prefix = this.prefixExpression.evaluate(parentScope);
      prefixScope = TypeChecker.as<Scope>(prefix, ScopeType);
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
    const functionType = functionValue.type();

    if (!functionType.__signature__ || !functionType.__call__) {
      throw new Error(`${this.identifier.name} is not a function`);
    }

    const signature = functionType.__signature__(functionValue);

    if (signature.arguments.length !== this.args.length) {
      throw new Error(
        `${this.identifier.name}: argument mismatch, expected ${signature.arguments.length} but got ${this.args.length}`
      );
    }

    const evaluationScope = scope.evaluate(
      () => new Scope(signature.parentScope)
    ) as Scope;
    signature.arguments.map((name, index) =>
      evaluationScope.push({
        name,
        evaluate: () => this.args[index].evaluate(scope),
      })
    );

    const result = functionType.__call__(functionValue, evaluationScope);

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
  isMarker: boolean;
  binding: Binding | Binding[];
}

export class BindingDefinition implements Statement {
  line: number;
  isMarker: boolean = false;
  binding: Binding;

  identifier: Identifier;
  expression: Expression;

  constructor(line: number, identifier: Identifier, expression: Expression) {
    this.line = line;
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
  isMarker: boolean;
  binding: Binding;

  headingLevel: number;
  text: string;

  constructor(
    line: number,
    isMarker: boolean,
    headingLevel: number,
    text: string
  ) {
    this.line = line;
    this.isMarker = isMarker;

    this.headingLevel = headingLevel;
    this.text = text;

    const cssClass = headingLevel === 1 ? "important" : "normal";
    const html = `<h${headingLevel} class=${cssClass}>${text}</h${headingLevel}>`;

    this.binding = {
      name: "#outline",
      evaluate: (scope: Scope) => {
        const previous = scope.evaluate("#outline", StringType) as StringValue;
        return new StringValue(previous.value + html);
      },
    };
  }
}
