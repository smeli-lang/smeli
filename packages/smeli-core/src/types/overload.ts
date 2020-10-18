import { TypedConstructor, TypedValue } from "./value";

export class AnyType extends TypedValue {
  static typeName = "any";
}

export type Overload = {
  argumentTypes: TypedConstructor<TypedValue>[],
  returnType: TypedConstructor<TypedValue>,
  call: (...args: any[]) => TypedValue,
}

export type ValidateCallback = ((overload: Overload) => void) | null;

export class OverloadedFunction {
  name: string;
  validate: ValidateCallback;
  overloads: Overload[];

  constructor(name: string, validate: ValidateCallback = null) {
    this.name = name;
    this.validate = validate;
    this.overloads = [];
  }

  implement(overload: Overload) {
    if (this.validate) {
      this.validate(overload);
    }

    this.overloads.push(overload);
  }

  call(...args: TypedValue[]): TypedValue {
    const argTypes = args.map(arg => arg.type());
    const match = this.findMatch(argTypes);

    if (!match) {
      const typeNames = argTypes.map(type => type.typeName).join(", ");
      throw new Error(`Cannot call '${this.name}' with argument types (${typeNames})`);
    }

    return match.call(...args);
  }

  findMatch(argTypes: TypedConstructor<TypedValue>[]): Overload | null {
    for (const overload of this.overloads) {
      if (overload.argumentTypes.length !== argTypes.length) {
        continue;
      }

      let matches = 0;
      for (let i = 0; i < argTypes.length; i++) {
        const expectedType = overload.argumentTypes[i];
        if (expectedType === AnyType || argTypes[i] === expectedType) {
          matches++;
        }
      }

      if (matches === argTypes.length) {
        return overload;
      }
    }

    return null;
  }
}
