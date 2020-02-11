import { Identifier, NumberLiteral } from "./ast";
import Scope from "./scope";

test("NumberLiteral: stores number", () => {
  const number = new NumberLiteral(42);
  expect(number.value).toBe(42);
});

test("NumberLiteral: evaluates to its value", () => {
  const number = new NumberLiteral(42);
  expect(number.evaluate()).toEqual({
    type: "number",
    value: 42
  });
});

test("Identifier: stores number", () => {
  const scope = new Scope();
  const id = new Identifier("variableName", scope);
  expect(id.name).toBe("variableName");
  expect(id.scope).toBe(scope);
});
