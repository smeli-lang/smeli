import { AnyType, NumberValue, StringValue, TypedValue, Vec2, Vec3 } from "../types";
import { Scope } from "../scope";
import { argumentCount, argumentType, defineTrait } from "./validation";

export const IndexTrait = defineTrait("index", [
  argumentCount(2),
  argumentType(1, StringValue),
]);

function arrayToVectorType(values: number[]): TypedValue {
  switch (values.length) {
    case 1: return new NumberValue(values[0]);
    case 2: return new Vec2(values[0], values[1]);
    case 3: return new Vec3(values[0], values[1], values[2]);
  }

  throw new Error("Exceeded maximum vector swizzling size");
}

IndexTrait.implement({
  argumentTypes: [Vec2, StringValue],
  returnType: AnyType,
  call: (vec: Vec2, members: StringValue) => {
    const values = vec.swizzle(members.value);
    return arrayToVectorType(values);
  }
})

IndexTrait.implement({
  argumentTypes: [Vec3, StringValue],
  returnType: AnyType,
  call: (vec: Vec3, members: StringValue) => {
    const values = vec.swizzle(members.value);
    return arrayToVectorType(values);
  }
})

IndexTrait.implement({
  argumentTypes: [Scope, StringValue],
  returnType: AnyType,
  call: (scope: Scope, name: StringValue) => scope.evaluate(name.value),
})
