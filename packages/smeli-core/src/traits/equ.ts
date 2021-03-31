import { BoolValue, NumberValue } from "../types";
import { argumentCount, defineTrait, returnType } from "./validation";

export const EquTrait = defineTrait("equ", [
  argumentCount(2),
  returnType(BoolValue),
]);

EquTrait.implement({
  argumentTypes: [NumberValue, NumberValue],
  returnType: BoolValue,
  call: (lhs: NumberValue, rhs: NumberValue) =>
    new BoolValue(lhs.value == rhs.value),
});
