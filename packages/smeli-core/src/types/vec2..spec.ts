import { NumberValue } from "./index";
import { Vec2 } from "./vec2";
import { StringValue } from "./string";

test("Vec2: type name", () => {
  expect(Vec2.typeName).toBe("vec2");
});

test("Vec2: __add__(Vec2)", () => {
  const v1 = new Vec2(2.0, 3.0);
  const v2 = new Vec2(12.0, -5.0);

  const v3 = v1.__add__(v2).as(Vec2);
  expect(v3.x).toBe(14.0);
  expect(v3.y).toBe(-2.0);
});

test("Vec2: __add__(NumberValue) fails", () => {
  const v1 = new Vec2(2.0, 3.0);
  const value = new NumberValue(42);

  expect(() => v1.__add__(value)).toThrow();
});

test("Vec2: __sub__(Vec2)", () => {
  const v1 = new Vec2(2.0, 3.0);
  const v2 = new Vec2(12.0, -5.0);

  const v3 = v1.__sub__(v2).as(Vec2);
  expect(v3.x).toBe(-10.0);
  expect(v3.y).toBe(8.0);
});

test("Vec2: __mul__(NumberValue)", () => {
  const v1 = new Vec2(2.0, 3.0);
  const value = new NumberValue(-3.0);

  const v3 = v1.__mul__(value).as(Vec2);
  expect(v3.x).toBe(-6.0);
  expect(v3.y).toBe(-9.0);
});

test("Vec2: __div__(NumberValue)", () => {
  const v1 = new Vec2(2.0, 3.0);
  const value = new NumberValue(-3.0);

  const v3 = v1.__div__(value).as(Vec2);
  expect(v3.x).toBeCloseTo(-2.0 / 3.0);
  expect(v3.y).toBeCloseTo(-1.0);
});

test("Vec2: __str__()", () => {
  const v1 = new Vec2(2.0, 3.0);

  const stringified = v1.__str__();
  expect(stringified).toBe("vec2(2, 3)");
});
