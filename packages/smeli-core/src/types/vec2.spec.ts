import { Vec2 } from "./vec2";

test("type name", () => {
  expect(Vec2.typeName).toBe("vec2");
});

test("constructor", () => {
  const vec = new Vec2(7.0, 12.4);
  expect(vec.x).toBe(7.0);
  expect(vec.y).toBe(12.4);
});
