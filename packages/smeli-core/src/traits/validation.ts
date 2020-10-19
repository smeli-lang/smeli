import {
  Overload,
  OverloadedFunction,
  TypedConstructor,
  TypedValue,
} from "../types";

type Validator = (traitName: string, overload: Overload) => void;

const validate = (traitName: string, validators: Validator[]) => {
  return (overload: Overload) => {
    for (const validator of validators) {
      validator(traitName, overload);
    }
  };
};

export const argumentCount = (count: number) => (
  traitName: string,
  overload: Overload
) => {
  if (overload.argumentTypes.length !== count) {
    throw new Error(`Trait '${traitName}' always takes ${count} arguments`);
  }
};

export const argumentType = (
  index: number,
  type: TypedConstructor<TypedValue>
) => (traitName: string, overload: Overload) => {
  if (overload.argumentTypes[index] !== type) {
    throw new Error(
      `Trait '${traitName}' always takes a '${overload.argumentTypes[index].typeName}' argument at position ${index}`
    );
  }
};

export const returnType = (type: TypedConstructor<TypedValue>) => (
  traitName: string,
  overload: Overload
) => {
  if (overload.returnType !== type) {
    throw new Error(
      `Trait '${traitName}' must return a value of type '${type.typeName}'`
    );
  }
};

export function defineTrait(name: string, validators: Validator[]) {
  return new OverloadedFunction(name + " trait", validate(name, validators));
}
