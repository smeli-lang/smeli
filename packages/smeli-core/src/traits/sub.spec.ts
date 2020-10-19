import { NumberValue, Vec2 } from "../types";
import { SubTrait } from "./sub";

test("sub(number, number)", () => {
  const v1 = new NumberValue(10.0);
  const v2 = new NumberValue(-12);

  const v3 = SubTrait.call(v1, v2).as(NumberValue);
  expect(v3.value).toBe(22.0);
});

test("sub(vec2, vec2)", () => {
  const v1 = new Vec2(2.0, 3.0);
  const v2 = new Vec2(12.0, -5.0);

  const v3 = SubTrait.call(v1, v2).as(Vec2);
  expect(v3.x).toBe(-10.0);
  expect(v3.y).toBe(8.0);
});
