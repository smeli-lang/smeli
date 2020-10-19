import { NumberValue, Vec2 } from "../types";
import { AddTrait } from "./add";

test("add(number, number)", () => {
  const v1 = new NumberValue(10.0);
  const v2 = new NumberValue(-12);

  const v3 = AddTrait.call(v1, v2).as(NumberValue);
  expect(v3.value).toBe(-2.0);
});
  
test("add(vec2, vec2)", () => {
  const v1 = new Vec2(2.0, 3.0);
  const v2 = new Vec2(12.0, -5.0);

  const v3 = AddTrait.call(v1, v2).as(Vec2);
  expect(v3.x).toBe(14.0);
  expect(v3.y).toBe(-2.0);
});
  
test("add(vec2, number)", () => {
  const v1 = new Vec2(2.0, 3.0);
  const value = new NumberValue(42);

  const v3 = AddTrait.call(v1, value).as(Vec2);
  expect(v3.x).toBe(44.0);
  expect(v3.y).toBe(45.0);
});
