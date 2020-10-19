import { TypedValue } from "./value";

export class NumberValue extends TypedValue {
  static readonly typeName = "number";

  readonly value: number;

  constructor(value: number) {
    super();

    this.value = value;
  }
}
