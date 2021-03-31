import { BoolValue, NumberValue } from "../types";
import { CmpTrait } from "./cmp";

test("cmp(number, number)", () => {
  const a = new NumberValue(10.0);
  const b = new NumberValue(-12);

  const result = CmpTrait.call(a, b).as(BoolValue);
  expect(result.value).toBe(false);
});

test("cmp(number, number) with equal numbers", () => {
  const a = new NumberValue(10.0);
  const b = new NumberValue(10.0);

  const result = CmpTrait.call(a, b).as(BoolValue);
  expect(result.value).toBe(false);
});
