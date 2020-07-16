import {
  traverse,
  BinaryOperator,
  Binding,
  Expression,
  ExpressionValue,
  FunctionCall,
  Identifier,
  LambdaExpression,
  Literal,
  NativeFunction,
  Scope,
  StringValue,
  Visitor,
  Vec2,
} from "@smeli/core";

const texSymbols: { [key: string]: string } = {
  alpha: "\\alpha",
  Alpha: "A",
  beta: "\\beta",
  Beta: "B",
  gamma: "\\gamma",
  Gamma: "\\Gamma",
  delta: "\\delta",
  Delta: "\\Delta",
  epsilon: "\\epsilon",
  Epsilon: "E",
  zeta: "\\zeta",
  Zeta: "Z",
  eta: "\\eta",
  Eta: "H",
  theta: "\\theta",
  Theta: "\\Theta",
  iota: "\\iota",
  Iota: "I",
  kappa: "\\kappa",
  Kappa: "K",
  lambda: "\\lambda",
  Lambda: "\\Lambda",
  mu: "\\mu",
  Mu: "M",
  nu: "\\nu",
  Nu: "N",
  xi: "\\xi",
  Xi: "\\Xi",
  pi: "\\pi",
  Pi: "\\Pi",
  rho: "\\rho",
  Rho: "P",
  sigma: "\\sigma",
  Sigma: "\\Sigma",
  tau: "\\tau",
  Tau: "T",
  upsilon: "\\upsilon",
  Upsilon: "\\Upsilon",
  phi: "\\phi",
  Phi: "\\Phi",
  chi: "\\chi",
  Chi: "X",
  psi: "\\psi",
  Psi: "\\Psi",
  omega: "\\omega",
  Omega: "\\Omega",
};

const texOperators: { [key: string]: string } = {
  __add__: "+",
  __sub__: "-",
  __mul__: "\\times",
};

const visitor: Visitor<string> = new Map();

visitor.set(Literal, (literal: Literal) => {
  const value = literal.value;

  // special cases
  if (value.is(Vec2)) {
    return `\\[ \\left( \\begin{array}{c}
        ${value.x} \\\\
        ${value.y} \\\\
      \\end{array} \\right) \\]`;
  }

  if (value.__str__) {
    // generic fallback
    return value.__str__();
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
  return (
    parameterNames.join(", ") +
    " \\Rightarrow " +
    traverse(lambda.body, visitor)
  );
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
      [ExpressionValue],
      (expression: ExpressionValue): StringValue => {
        const transpiledTexCode = transpileExpression(expression);
        return new StringValue(transpiledTexCode);
      }
    ),
};
