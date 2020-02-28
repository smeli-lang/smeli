import { Identifier, Literal } from "./ast";
import { Scope } from "./scope";
import { NumberValue } from "./types";

test("NumberLiteral: evaluates to its value", () => {
  const number = new Literal(new NumberValue(42));
  expect(number.evaluate()).toEqual(new NumberValue(42));
});

test("Identifier: stores scope", () => {
  const scope = new Scope();
  const id = new Identifier(["variableName"], scope);
  expect(id.name).toBe("variableName");
  expect(id.scope).toBe(scope);
});
