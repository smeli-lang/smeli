import { NumberLiteral } from "./ast";

test("NumberLiteral: stores number", () => {
  const number = new NumberLiteral(42);
  expect(number.value).toBe(42);
});
