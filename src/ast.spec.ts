import { Identifier, NumberLiteral } from "./ast";

test("NumberLiteral: stores number", () => {
  const number = new NumberLiteral(42);
  expect(number.value).toBe(42);
});

test("Identifier: stores number", () => {
  const id = new Identifier("variableName");
  expect(id.name).toBe("variableName");
});
