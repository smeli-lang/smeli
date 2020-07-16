import { TypedValue } from "./value";

export class StringValue extends TypedValue {
  static typeName = "string";

  value: string;

  constructor(value: string) {
    super();
    this.value = value;
  }

  __add__(rhs: TypedValue): TypedValue {
    return new StringValue(this.value + rhs.as(StringValue).value);
  }

  __str__() {
    return this.value;
  }
}
