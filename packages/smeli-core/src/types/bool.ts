import { StringValue } from "./string";
import { traits } from "./traits";
import { TypedValue } from "./value";

export class BoolValue extends TypedValue {
  static typeName = "bool";

  value: boolean;

  constructor(value: boolean) {
    super();
    this.value = value;
  }
}

traits.str.implement({
  argumentTypes: [BoolValue],
  returnType: StringValue,
  call: (value: BoolValue) => new StringValue(value.value ? "true" : "false"),
})
