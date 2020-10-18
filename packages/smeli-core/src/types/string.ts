import { TypedValue } from "./value";

export class StringValue extends TypedValue {
  static typeName = "string";

  value: string;

  constructor(value: string) {
    super();
    this.value = value;
  }
}
