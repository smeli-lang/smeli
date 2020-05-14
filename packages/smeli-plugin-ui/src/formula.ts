import katex from "katex";

import {
  traverse,
  BinaryOperator,
  Expression,
  ExpressionType,
  ExpressionValue,
  FunctionCall,
  Identifier,
  LambdaExpression,
  Literal,
  Scope,
  StringValue,
  StringType,
  Visitor,
} from "@smeli/core";

import { DomNode } from "./types";
import { evaluateStyles } from "./styles";

const visitor: Visitor<string> = new Map();

visitor.set(Literal, (literal: Literal) => {
  const type = literal.value.type();
  if (type.__str__) {
    return type.__str__(literal.value);
  }

  throw new Error("Unimplemented literal transpilation to TeX");
});

visitor.set(Identifier, (identifier: Identifier) => {
  return identifier.name;
});

visitor.set(LambdaExpression, (lambda: LambdaExpression) => {
  const parameterNames = lambda.args.map(
    (identifier: Identifier) => identifier.name
  );
  return parameterNames.join(", ") + " => " + traverse(lambda.body, visitor);
});

visitor.set(FunctionCall, (functionCall: FunctionCall) => {
  const name = traverse(functionCall.identifier, visitor);
  const args = functionCall.args.map((expression: Expression) =>
    traverse(expression, visitor)
  );
  return name + "(" + args.join(", ") + ")";
});

visitor.set(BinaryOperator, (operator: BinaryOperator) => {
  const lhs = traverse(operator.lhs, visitor);
  const rhs = traverse(operator.rhs, visitor);

  // turn division into a fraction
  if (operator.operatorName === "__div__") {
    return "\\frac{" + lhs + "}{" + rhs + "}";
  }

  const texOperators = {
    __add__: "+",
    __sub__: "-",
    __mul__: "*",
  };

  return lhs + " " + texOperators[operator.operatorName] + " " + rhs;
});

// transform a Smeli AST into a TEX expression
function transpile(value: ExpressionValue): string {
  // if the root of the expression is a lambda, transform it to
  // the f(x) form as we have the function name here
  if (value.expression.constructor === LambdaExpression) {
    const lambda = value.expression as LambdaExpression;
    const parameterNames = lambda.args.map(
      (identifier: Identifier) => identifier.name
    );
    return (
      value.name +
      "(" +
      parameterNames.join(", ") +
      ") = " +
      traverse(lambda.body, visitor)
    );
  } else {
    return value.name + " = " + traverse(value.expression, visitor);
  }
}

export const formula = {
  name: "formula",
  evaluate: (parentScope: Scope) => {
    const scope = new Scope(parentScope);
    scope.push([
      {
        name: "tex",
        evaluate: () => new StringValue("l = \\sqrt(x^2 + y^2)"),
      },
      {
        name: "#ui:node",
        evaluate: (scope: Scope) => {
          const styles = evaluateStyles(scope);

          const tex = scope.evaluate("tex");
          let code = "";
          switch (tex.type()) {
            case StringType:
              code = (tex as StringValue).value;
              break;
            case ExpressionType:
              const expression = tex as ExpressionValue;
              code = transpile(expression);
              break;
          }

          const element = document.createElement("div");
          element.className = styles.formula + " " + styles.text;

          katex.render(code, element);

          const katexRoot = element.querySelector(".katex") as HTMLElement;
          katexRoot.className += " important";

          return new DomNode(element);
        },
      },
    ]);

    return scope;
  },
};
