import {
  BinaryOperator,
  BindingDefinition,
  Comment,
  Expression,
  FunctionCall,
  Identifier,
  LambdaExpression,
  Literal,
  ScopeExpression,
  Statement,
  traverse,
  Visitor,
} from "./ast";
import { AddTrait, DivTrait, MulTrait, StrTrait, SubTrait } from "./traits";
import { ExpressionValue, OverloadedFunction, StringValue } from "./types";

const visitor: Visitor<string> = new Map();

visitor.set(Literal, (literal: Literal) => {
  const value = literal.value;
  return StrTrait.call(value).as(StringValue).value;
});

visitor.set(Identifier, (identifier: Identifier) => {
  const allNames = [...identifier.scopeNames, identifier.name];
  return allNames.join(".");
});

visitor.set(ScopeExpression, (scopeExpression: ScopeExpression) => {
  const statements = scopeExpression.statements.map(stringify);

  let prefix = "";
  if (scopeExpression.prefixExpression) {
    prefix = stringify(scopeExpression.prefixExpression) + " ";
  }

  return `${prefix}{\n${statements.join("\n")}\n}`;
});

visitor.set(LambdaExpression, (lambda: LambdaExpression) => {
  const args = lambda.args.map((arg) => stringify(arg));
  const body = stringify(lambda.body);

  return `${args.join(", ")} => ${body}`;
});

visitor.set(FunctionCall, (functionCall: FunctionCall) => {
  const id = stringify(functionCall.identifier);
  const args = functionCall.args.map(stringify);

  return `${id}(${args.join(", ")})`;
});

visitor.set(BindingDefinition, (bindingDefinition: BindingDefinition) => {
  const name = bindingDefinition.identifier.name;
  const expression = stringify(bindingDefinition.expression);

  return `${name}: ${expression}\n`;
});

visitor.set(Comment, (comment: Comment) => {
  const heading = "#".repeat(comment.headingLevel);
  const marker = comment.isMarker ? ">" : "";
  return `${heading}${marker} ${comment.text}\n`;
});

const operatorSymbols = new Map<OverloadedFunction, string>();
operatorSymbols.set(AddTrait, "+");
operatorSymbols.set(SubTrait, "-");
operatorSymbols.set(MulTrait, "*");
operatorSymbols.set(DivTrait, "/");

visitor.set(BinaryOperator, (operator: BinaryOperator) => {
  const lhs = stringify(operator.lhs);
  const rhs = stringify(operator.rhs);

  const operatorSymbol = operatorSymbols.get(operator.trait);

  return `${lhs} ${operatorSymbol} ${rhs}`;
});

export function stringify(ast: Expression | Statement): string {
  return traverse(ast, visitor);
}

StrTrait.implement({
  argumentTypes: [ExpressionValue],
  returnType: StringValue,
  call: (value: ExpressionValue) =>
    new StringValue(stringify(value.expression)),
});
