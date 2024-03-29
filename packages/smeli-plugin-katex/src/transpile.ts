import {
  AddTrait,
  traverse,
  BinaryOperator,
  DivTrait,
  Expression,
  ExpressionValue,
  FunctionCall,
  Identifier,
  LambdaExpression,
  Literal,
  MulTrait,
  OverloadedFunction,
  StringValue,
  SubTrait,
  StrTrait,
  Visitor,
  Vec2,
  nativeBinding,
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

const texOperators = new Map<OverloadedFunction, string>();
texOperators.set(AddTrait, "+");
texOperators.set(SubTrait, "-");
texOperators.set(MulTrait, "\\times");

type FunctionRenderer = (name: string, args: string[]) => string;

const texFunctions = new Map<string, FunctionRenderer>();

texFunctions.set(
  "abs",
  (name: string, args: string[]) => `\\left| ${args.join(", ")} \\right|`
);

texFunctions.set(
  "ceil",
  (name: string, args: string[]) =>
    `\\left\\lceil ${args.join(", ")} \\right\\rceil`
);

texFunctions.set(
  "dot",
  (name: string, args: string[]) => `${args[0]} \\cdot ${args[1]}`
);

texFunctions.set(
  "exp",
  (name: string, args: string[]) => `e^{${args.join(", ")}}`
);

texFunctions.set(
  "floor",
  (name: string, args: string[]) =>
    `\\left\\lfloor ${args.join(", ")} \\right\\rfloor`
);

texFunctions.set(
  "length",
  (name: string, args: string[]) =>
    `\\left\\Vert ${args.join(", ")} \\right\\Vert`
);

texFunctions.set(
  "pow",
  (name: string, args: string[]) => `{${args[0]}}^{${args[1]}}`
);

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

  return StrTrait.call(value).as(StringValue).value;
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

  const renderer = texFunctions.get(name);
  if (renderer) {
    return renderer(name, args);
  }

  return name + "(" + args.join(", ") + ")";
});

visitor.set(BinaryOperator, (operator: BinaryOperator) => {
  const lhs = traverse(operator.lhs, visitor);
  const rhs = traverse(operator.rhs, visitor);

  // turn division into a fraction
  if (operator.trait === DivTrait) {
    return "\\frac{" + lhs + "}{" + rhs + "}";
  }

  return lhs + " " + texOperators.get(operator.trait) + " " + rhs;
});

// transform a Smeli AST into a TEX expression
function transpileExpression(value: ExpressionValue): string {
  const name = texSymbols[value.name] || value.name;

  // if the root of the expression is a lambda, transform it to
  // the f(x) form as we have the function name here
  if (value.expression.constructor === LambdaExpression) {
    const lambda = value.expression as LambdaExpression;
    const parameterNames = lambda.args.map(
      (identifier: Identifier) => identifier.name
    );
    return (
      name +
      "(" +
      parameterNames.map((name) => texSymbols[name] || name).join(", ") +
      ") = " +
      traverse(lambda.body, visitor)
    );
  } else {
    return name + " = " + traverse(value.expression, visitor);
  }
}

export const transpile = nativeBinding("transpile", [
  {
    argumentTypes: [ExpressionValue],
    returnType: StringValue,
    call: (expression: ExpressionValue): StringValue => {
      const transpiledTexCode = transpileExpression(expression);
      return new StringValue(transpiledTexCode);
    },
  },
]);
