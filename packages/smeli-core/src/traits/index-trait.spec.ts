import { NumberValue, StringValue, Vec2, Vec3 } from "../types";
import { Scope } from "../scope";
import { IndexTrait } from "./index-trait";

test("index(vec2, string)", () => {
  const vec = new Vec2(10.0, 42.0);
  const member = new StringValue("x");

  const result = IndexTrait.call(vec, member).as(NumberValue);
  expect(result.value).toBe(10.0);
});

test("index(vec2, string) w/ swizzling", () => {
  const vec = new Vec2(10.0, 42.0);
  const member = new StringValue("yxx");

  const result = IndexTrait.call(vec, member).as(Vec3);
  expect(result).toEqual(new Vec3(42.0, 10.0, 10.0));
});

test("index(vec2, string) w/ wrong member", () => {
  const vec = new Vec2(10.0, 42.0);
  const member = new StringValue("z");

  expect(() => IndexTrait.call(vec, member)).toThrowError();
});

test("index(vec2, string) w/ too many outputs", () => {
  const vec = new Vec2(10.0, 42.0);
  const member = new StringValue("xyxyxy"); // can't output a Vec6

  expect(() => IndexTrait.call(vec, member)).toThrowError();
});

test("index(vec3, string)", () => {
  const vec = new Vec3(10.0, 42.0, -12.0);
  const member = new StringValue("z");

  const result = IndexTrait.call(vec, member).as(NumberValue);
  expect(result.value).toBe(-12.0);
});

test("index(vec3, string) w/ swizzling", () => {
  const vec = new Vec3(10.0, 42.0, -12.0);
  const member = new StringValue("zx");

  const result = IndexTrait.call(vec, member).as(Vec2);
  expect(result).toEqual(new Vec2(-12.0, 10.0));
});

test("index(vec3, string) w/ wrong member", () => {
  const vec = new Vec3(10.0, 42.0, -12.0);
  const member = new StringValue("w");

  expect(() => IndexTrait.call(vec, member)).toThrowError();
});

test("index(scope, string)", () => {
  const scope = new Scope();
  const binding = {
    name: "a",
    evaluate: () => new NumberValue(42),
  };

  scope.push(binding);

  const member = new StringValue("a");

  const result = IndexTrait.call(scope, member).as(NumberValue);
  expect(result.value).toBe(42);

  scope.pop(binding);
  expect(() => IndexTrait.call(scope, member)).toThrowError();

  scope.dispose();
});
