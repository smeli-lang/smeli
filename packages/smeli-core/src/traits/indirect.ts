import { BoolValue, NumberValue } from "../types";
import { CmpTrait } from "./cmp";
import { EquTrait } from "./equ";
import { argumentCount, defineTrait, returnType } from "./validation";

// lower than
export const CmpLtTrait = defineTrait("cmp_lt", [
  argumentCount(2),
  returnType(BoolValue),
]);

// greater than
export const CmpGtTrait = defineTrait("cmp_gt", [
  argumentCount(2),
  returnType(BoolValue),
]);

// lower or equal
export const CmpLeTrait = defineTrait("cmp_le", [
  argumentCount(2),
  returnType(BoolValue),
]);

// greater or equal
export const CmpGeTrait = defineTrait("cmp_ge", [
  argumentCount(2),
  returnType(BoolValue),
]);

// not equal
export const CmpNeTrait = defineTrait("cmp_ne", [
  argumentCount(2),
  returnType(BoolValue),
]);

CmpLtTrait.implement({
  argumentTypes: [NumberValue, NumberValue],
  returnType: BoolValue,
  call: (lhs: NumberValue, rhs: NumberValue) => CmpTrait.call(lhs, rhs),
});

CmpGtTrait.implement({
  argumentTypes: [NumberValue, NumberValue],
  returnType: BoolValue,
  call: (lhs: NumberValue, rhs: NumberValue) => CmpTrait.call(rhs, lhs),
});

CmpLeTrait.implement({
  argumentTypes: [NumberValue, NumberValue],
  returnType: BoolValue,
  call: (lhs: NumberValue, rhs: NumberValue) =>
    new BoolValue(!CmpTrait.call(rhs, lhs).as(BoolValue).value),
});

CmpGeTrait.implement({
  argumentTypes: [NumberValue, NumberValue],
  returnType: BoolValue,
  call: (lhs: NumberValue, rhs: NumberValue) =>
    new BoolValue(!CmpTrait.call(lhs, rhs).as(BoolValue).value),
});

CmpNeTrait.implement({
  argumentTypes: [NumberValue, NumberValue],
  returnType: BoolValue,
  call: (lhs: NumberValue, rhs: NumberValue) =>
    new BoolValue(!EquTrait.call(lhs, rhs).as(BoolValue).value),
});
