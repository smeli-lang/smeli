import { Overload, OverloadedFunction } from "../overload";
import { StringValue } from "./string";
import { TypedConstructor, TypedValue } from "./value";

type Validator = (traitName: string, overload: Overload) => void;

const validate = (traitName: string, validators: Validator[]) => {
  return (overload: Overload) => {
    for (const validator of validators) {
      validator(traitName, overload);
    }
  }
}

const argumentCount = (count: number) => (traitName: string, overload: Overload) => {
  if (overload.argumentTypes.length !== count) {
    throw new Error(`Trait '${traitName}' always takes ${count} arguments`);
  }
}

const returnType = (type: TypedConstructor<TypedValue>) => (traitName: string, overload: Overload) => {
  if (overload.returnType !== type) {
    throw new Error(`Trait '${traitName}' must return a value of type '${type.typeName}'`);
  }
}

function defineTrait(name: string, validators: Validator[]) {
  return new OverloadedFunction(name + " trait", validate(name, validators));
}

export const traits = {
  add: defineTrait("add", [
    argumentCount(2),
  ]),

  sub: defineTrait("sub", [
    argumentCount(2),
  ]),

  mul: defineTrait("mul", [
    argumentCount(2),
  ]),

  div: defineTrait("div", [
    argumentCount(2),
  ]),

  str: defineTrait("str", [
    argumentCount(1),
    returnType(StringValue),
  ]),
}
