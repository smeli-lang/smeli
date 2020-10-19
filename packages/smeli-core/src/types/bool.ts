import { TypedValue } from "./value";

export class BoolValue extends TypedValue {
  static typeName = "bool";

  value: boolean;

  constructor(value: boolean) {
    super();
    this.value = value;
  }
}
