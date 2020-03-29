import { Literal } from "./ast";
import { Scope } from "./scope";
import { NumberValue } from "./types";

test("NumberLiteral: evaluates to its value", () => {
  const number = new Literal(new NumberValue(42));
  expect(number.evaluate(new Scope())).toEqual(new NumberValue(42));
});
