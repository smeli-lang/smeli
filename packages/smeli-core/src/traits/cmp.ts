import { BoolValue, NumberValue } from "../types";
import { argumentCount, defineTrait, returnType } from "./validation";

export const CmpTrait = defineTrait("cmp", [
  argumentCount(2),
  returnType(BoolValue),
]);

CmpTrait.implement({
  argumentTypes: [NumberValue, NumberValue],
  returnType: BoolValue,
  call: (lhs: NumberValue, rhs: NumberValue) =>
    new BoolValue(lhs.value < rhs.value),
});
