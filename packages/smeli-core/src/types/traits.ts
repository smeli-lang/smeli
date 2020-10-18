import { TypedConstructor, TypedValue } from "./value";
import { StringValue } from "./string";
import { Overload, OverloadedFunction } from "./overload";

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

const argumentType = (index: number, type: TypedConstructor<TypedValue>) => (traitName: string, overload: Overload) => {
  if (overload.argumentTypes[index] !== type) {
    throw new Error(`Trait '${traitName}' always takes a '${overload.argumentTypes[index].typeName}' argument at position ${index}`);
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

  index: defineTrait("index", [
    argumentCount(2),
    argumentType(1, StringValue),
  ]),

  str: defineTrait("str", [
    argumentCount(1),
    returnType(StringValue),
  ]),
}
