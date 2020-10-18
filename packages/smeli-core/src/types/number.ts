import { StringValue } from "./string";
import { traits } from "./traits";
import { TypedValue } from "./value";

export class NumberValue extends TypedValue {
  static readonly typeName = "number";

  readonly value: number;

  constructor(value: number) {
    super();

    this.value = value;
  }
}

traits.add.implement({
  argumentTypes: [NumberValue, NumberValue],
  returnType: StringValue,
  call: (lhs: NumberValue, rhs: NumberValue) => new NumberValue(lhs.value + rhs.value),
});

traits.sub.implement({
  argumentTypes: [NumberValue, NumberValue],
  returnType: StringValue,
  call: (lhs: NumberValue, rhs: NumberValue) => new NumberValue(lhs.value - rhs.value),
});

traits.mul.implement({
  argumentTypes: [NumberValue, NumberValue],
  returnType: StringValue,
  call: (lhs: NumberValue, rhs: NumberValue) => new NumberValue(lhs.value * rhs.value),
});

traits.div.implement({
  argumentTypes: [NumberValue, NumberValue],
  returnType: StringValue,
  call: (lhs: NumberValue, rhs: NumberValue) => new NumberValue(lhs.value / rhs.value),
});

traits.str.implement({
  argumentTypes: [NumberValue],
  returnType: StringValue,
  call: (number: NumberValue) => new StringValue(number.value.toString()),
});
