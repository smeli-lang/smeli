import { TypedValue } from "./value";

export class NumberValue extends TypedValue {
  static readonly typeName = "number";

  readonly value: number;

  constructor(value: number) {
    super();

    this.value = value;
  }

  __add__(rhs: TypedValue): TypedValue {
    return new NumberValue(this.value + rhs.as(NumberValue).value);
  }

  __sub__(rhs: TypedValue): TypedValue {
    return new NumberValue(this.value - rhs.as(NumberValue).value);
  }

  __mul__(rhs: TypedValue): TypedValue {
    return new NumberValue(this.value * rhs.as(NumberValue).value);
  }

  __div__(rhs: TypedValue): TypedValue {
    return new NumberValue(this.value / rhs.as(NumberValue).value);
  }

  __str__() {
    return this.value.toString();
  }
}
