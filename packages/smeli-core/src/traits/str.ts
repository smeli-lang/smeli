import { BoolValue, Lambda, NumberValue, StringValue, Vec2, Vec3 } from "../types";
import { argumentCount, defineTrait, returnType } from "./validation";

export const StrTrait = defineTrait("str", [
  argumentCount(1),
  returnType(StringValue),
]);

StrTrait.implement({
  argumentTypes: [BoolValue],
  returnType: StringValue,
  call: (value: BoolValue) => new StringValue(value.value ? "true" : "false"),
})

StrTrait.implement({
  argumentTypes: [Lambda],
  returnType: StringValue,
  call: (lambda: Lambda) => new StringValue(`lambda(${lambda.argumentNames.join(", ")})`),
})

StrTrait.implement({
  argumentTypes: [NumberValue],
  returnType: StringValue,
  call: (number: NumberValue) => new StringValue(number.value.toString()),
});

StrTrait.implement({
  argumentTypes: [StringValue],
  returnType: StringValue,
  call: (value: StringValue) => value,
});

StrTrait.implement({
  argumentTypes: [Vec2],
  returnType: StringValue,
  call: (vec: Vec2) => new StringValue(`vec2(${vec.x}, ${vec.y})`),
});

StrTrait.implement({
  argumentTypes: [Vec3],
  returnType: StringValue,
  call: (vec: Vec3) => new StringValue(`vec3(${vec.x}, ${vec.y}, ${vec.z})`),
});
