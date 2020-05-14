import {
  traverse,
  BinaryOperator,
  Binding,
  Expression,
  ExpressionType,
  ExpressionValue,
  FunctionCall,
  Identifier,
  LambdaExpression,
  Literal,
  NativeFunction,
  Scope,
  StringValue,
  Visitor,
} from "@smeli/core";

const texSymbols: { [key: string]: string } = {
  alpha: "\\alpha",
  Alpha: "\\Alpha",
  theta: "\\theta",
  Theta: "\\Theta",
  omega: "\\omega",
  Omega: "\\Omega",
};

const texOperators: { [key: string]: string } = {
  __add__: "+",
  __sub__: "-",
  __mul__: "*",
};

const visitor: Visitor<string> = new Map();

visitor.set(Literal, (literal: Literal) => {
  const type = literal.value.type();
  if (type.__str__) {
    return type.__str__(literal.value);
  }

  throw new Error("Unimplemented literal transpilation to TeX");
});

visitor.set(Identifier, (identifier: Identifier) => {
  const name = identifier.name;

  // automatically convert some symbol names
  // to their TeX equivalent (greek letters, etc.)
  return texSymbols[name] || name;
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

  return lhs + " " + texOperators[operator.operatorName] + " " + rhs;
});

// transform a Smeli AST into a TEX expression
function transpileExpression(value: ExpressionValue): string {
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
      parameterNames.map((name) => texSymbols[name] || name).join(", ") +
      ") = " +
      traverse(lambda.body, visitor)
    );
  } else {
    return value.name + " = " + traverse(value.expression, visitor);
  }
}

export const transpile: Binding = {
  name: "transpile",
  evaluate: (parentScope: Scope) =>
    new NativeFunction(
      parentScope,
      [ExpressionType],
      (expression: ExpressionValue): StringValue => {
        const transpiledTexCode = transpileExpression(expression);
        return new StringValue(transpiledTexCode);
      }
    ),
};
