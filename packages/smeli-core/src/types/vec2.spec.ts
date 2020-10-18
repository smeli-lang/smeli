import { NumberValue } from "./number";
import { StringValue } from "./string";
import { traits } from "./traits";
import { Vec2 } from "./vec2";

const { add, sub, mul, div, str } = traits;

test("type name", () => {
  expect(Vec2.typeName).toBe("vec2");
});

test("add(Vec2, Vec2)", () => {
  const v1 = new Vec2(2.0, 3.0);
  const v2 = new Vec2(12.0, -5.0);

  const v3 = add.call(v1, v2).as(Vec2);
  expect(v3.x).toBe(14.0);
  expect(v3.y).toBe(-2.0);
});

test("add(Vec2, NumberValue)", () => {
  const v1 = new Vec2(2.0, 3.0);
  const value = new NumberValue(42);

  const v3 = add.call(v1, value).as(Vec2);
  expect(v3.x).toBe(44.0);
  expect(v3.y).toBe(45.0);
});

test("sub(Vec2, Vec2)", () => {
  const v1 = new Vec2(2.0, 3.0);
  const v2 = new Vec2(12.0, -5.0);

  const v3 = sub.call(v1, v2).as(Vec2);
  expect(v3.x).toBe(-10.0);
  expect(v3.y).toBe(8.0);
});

test("mul(Vec2, NumberValue)", () => {
  const v1 = new Vec2(2.0, 3.0);
  const value = new NumberValue(-3.0);

  const v3 = mul.call(v1, value).as(Vec2);
  expect(v3.x).toBe(-6.0);
  expect(v3.y).toBe(-9.0);
});

test("div(Vec2, NumberValue)", () => {
  const v1 = new Vec2(2.0, 3.0);
  const value = new NumberValue(-3.0);

  const v3 = div.call(v1, value).as(Vec2);
  expect(v3.x).toBeCloseTo(-2.0 / 3.0);
  expect(v3.y).toBeCloseTo(-1.0);
});

test("str(Vec2)", () => {
  const v1 = new Vec2(2.0, 3.0);

  const stringified = str.call(v1).as(StringValue);
  expect(stringified.value).toBe("vec2(2, 3)");
});
