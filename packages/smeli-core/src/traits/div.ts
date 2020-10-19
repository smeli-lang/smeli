import { NumberValue, StringValue, Vec2, Vec3 } from "../types";
import { argumentCount, defineTrait } from "./validation";

export const DivTrait = defineTrait("div", [argumentCount(2)]);

DivTrait.implement({
  argumentTypes: [NumberValue, NumberValue],
  returnType: StringValue,
  call: (lhs: NumberValue, rhs: NumberValue) =>
    new NumberValue(lhs.value / rhs.value),
});

DivTrait.implement({
  argumentTypes: [Vec2, Vec2],
  returnType: Vec2,
  call(lhs: Vec2, rhs: Vec2): Vec2 {
    return new Vec2(lhs.x / rhs.x, lhs.y / rhs.y);
  },
});

DivTrait.implement({
  argumentTypes: [NumberValue, Vec2],
  returnType: Vec2,
  call(lhs: NumberValue, rhs: Vec2): Vec2 {
    return new Vec2(lhs.value / rhs.x, lhs.value / rhs.y);
  },
});

DivTrait.implement({
  argumentTypes: [Vec2, NumberValue],
  returnType: Vec2,
  call(lhs: Vec2, rhs: NumberValue): Vec2 {
    return new Vec2(lhs.x / rhs.value, lhs.y / rhs.value);
  },
});

DivTrait.implement({
  argumentTypes: [Vec3, Vec3],
  returnType: Vec3,
  call(lhs: Vec3, rhs: Vec3): Vec3 {
    return new Vec3(lhs.x / rhs.x, lhs.y / rhs.y, lhs.z / rhs.y);
  },
});

DivTrait.implement({
  argumentTypes: [NumberValue, Vec3],
  returnType: Vec3,
  call(lhs: NumberValue, rhs: Vec3): Vec3 {
    return new Vec3(lhs.value / rhs.x, lhs.value / rhs.y, lhs.value / rhs.z);
  },
});

DivTrait.implement({
  argumentTypes: [Vec3, NumberValue],
  returnType: Vec3,
  call(lhs: Vec3, rhs: NumberValue): Vec3 {
    return new Vec3(lhs.x / rhs.value, lhs.y / rhs.value, lhs.z / rhs.value);
  },
});
