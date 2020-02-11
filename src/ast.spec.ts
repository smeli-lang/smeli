import { Identifier, NumberLiteral } from "./ast";
import Scope from "./scope";

test("NumberLiteral: stores number", () => {
  const number = new NumberLiteral(42);
  expect(number.value).toBe(42);
});

test("NumberLiteral: evaluates to its value", () => {
  const number = new NumberLiteral(42);
  const scope = new Scope();
  expect(number.evaluate(scope)).toEqual({
    type: "number",
    value: 42
  });
});

test("Identifier: stores number", () => {
  const id = new Identifier("variableName");
  expect(id.name).toBe("variableName");
});
