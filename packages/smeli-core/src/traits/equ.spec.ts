import { BoolValue, NumberValue } from "../types";
import { EquTrait } from "./equ";

test("equ(number, number)", () => {
  const a = new NumberValue(10.0);
  const b = new NumberValue(-12);

  const result = EquTrait.call(a, b).as(BoolValue);
  expect(result.value).toBe(false);
});

test("equ(number, number) with equal numbers", () => {
  const a = new NumberValue(10.0);
  const b = new NumberValue(10.0);

  const result = EquTrait.call(a, b).as(BoolValue);
  expect(result.value).toBe(true);
});
