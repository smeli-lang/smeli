import { NumberValue, Vec2 } from "../types";
import { MulTrait } from "./mul";

test("mul(number, number)", () => {
  const v1 = new NumberValue(5.0);
  const v2 = new NumberValue(-3.4);

  const v3 = MulTrait.call(v1, v2).as(NumberValue);
  expect(v3.value).toBe(-17.0);
});
  
test("mul(vec2, vec2)", () => {
  const v1 = new Vec2(2.0, 3.0);
  const v2 = new Vec2(12.0, -5.0);

  const v3 = MulTrait.call(v1, v2).as(Vec2);
  expect(v3.x).toBe(24.0);
  expect(v3.y).toBe(-15.0);
});

test("mul(Vec2, NumberValue)", () => {
  const v1 = new Vec2(2.0, 3.0);
  const value = new NumberValue(-3.0);

  const v3 = MulTrait.call(v1, value).as(Vec2);
  expect(v3.x).toBe(-6.0);
  expect(v3.y).toBe(-9.0);
});
