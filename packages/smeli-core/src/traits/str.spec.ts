import { BoolValue, NumberValue, StringValue, Vec2 } from "../types";
import { StrTrait } from "./str";

test("str(bool)", () => {
  const value = new BoolValue(true);
  const str = StrTrait.call(value).as(StringValue);
  expect(str.value).toBe("true");
});

test("str(Vec2)", () => {
  const value = new Vec2(2.0, 3.0);
  const str = StrTrait.call(value).as(StringValue);
  expect(str.value).toBe("vec2(2, 3)");
});
