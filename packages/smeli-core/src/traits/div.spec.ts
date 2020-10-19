import { NumberValue, Vec2 } from "../types";
import { DivTrait } from "./div";

test("div(number, number)", () => {
  const v1 = new NumberValue(-5.0);
  const v2 = new NumberValue(2.0);

  const v3 = DivTrait.call(v1, v2).as(NumberValue);
  expect(v3.value).toBe(-2.5);
});

test("div(vec2, vec2)", () => {
  const v1 = new Vec2(6.0, 5.0);
  const v2 = new Vec2(3.0, -5.0);

  const v3 = DivTrait.call(v1, v2).as(Vec2);
  expect(v3.x).toBe(2.0);
  expect(v3.y).toBe(-1.0);
});

test("div(Vec2, NumberValue)", () => {
  const v1 = new Vec2(9.0, 3.0);
  const value = new NumberValue(-3.0);

  const v3 = DivTrait.call(v1, value).as(Vec2);
  expect(v3.x).toBe(-3.0);
  expect(v3.y).toBe(-1.0);
});
