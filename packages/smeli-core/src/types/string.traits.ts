import { traits } from "./traits";
import { StringValue } from "./string";

traits.add.implement({
  argumentTypes: [StringValue],
  returnType: StringValue,
  call: (lhs: StringValue, rhs: StringValue) => new StringValue(lhs.value + rhs.value),
});

traits.str.implement({
  argumentTypes: [StringValue],
  returnType: StringValue,
  call: (value: StringValue) => value,
});
